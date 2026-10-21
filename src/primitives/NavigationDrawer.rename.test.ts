import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavigationDrawer, NavigationDrawerItem } from "./NavigationDrawer";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
  vi.unstubAllGlobals();
});

const labels = {
  title: "Rename document",
  field: "Name",
  cancel: "Cancel",
  save: "Save",
};

function mount(props: Record<string, unknown> = {}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  const onRename = vi.fn();
  const onRenameOpenChange = vi.fn();
  const render = (extra: Record<string, unknown> = {}) => {
    act(() =>
      root.render(
        h(
          NavigationDrawer,
          { variant: "standard", ariaLabel: "Destinations" },
          h(NavigationDrawerItem, {
            label: "Sample document",
            renamable: true,
            renameLabels: labels,
            onRename,
            onRenameOpenChange,
            ...props,
            ...extra,
          }),
        ),
      ),
    );
  };
  render();
  return { host, onRename, onRenameOpenChange, render };
}

function row(host: HTMLElement) {
  return host.querySelector<HTMLButtonElement>(".fynns-nav-drawer-item")!;
}

function dialog() {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

/** The frame keeps the panel mounted while it animates out. */
function renameClosed() {
  const overlay = document.querySelector<HTMLElement>(".fynns-dialog-overlay");
  return overlay?.getAttribute("data-state") === "closing";
}

function doubleClick(target: HTMLElement) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent("dblclick", { bubbles: true, cancelable: true }),
    );
  });
}

describe("NavigationDrawerItem core rename flow", () => {
  it("opens the core rename dialog on double-click with the current label", () => {
    const { host } = mount();
    doubleClick(row(host));
    const panel = dialog();
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain("Rename document");
    const field = panel!.querySelector<HTMLInputElement>("input")!;
    expect(field.value).toBe("Sample document");
    expect(panel!.querySelector(".fynns-btn--primary")).not.toBeNull();
  });

  it("commits the trimmed name and closes the dialog", () => {
    const { host, onRename } = mount();
    doubleClick(row(host));
    const field = dialog()!.querySelector<HTMLInputElement>("input")!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(field, "  Renamed document  ");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const save = Array.from(dialog()!.querySelectorAll("button")).find(
      (el) => el.textContent?.includes("Save"),
    )!;
    act(() => save.click());
    expect(onRename).toHaveBeenCalledExactlyOnceWith("Renamed document");
    expect(renameClosed()).toBe(true);
  });

  it("keeps Save disabled and never commits an empty name", () => {
    const { host, onRename } = mount();
    doubleClick(row(host));
    const field = dialog()!.querySelector<HTMLInputElement>("input")!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(field, "   ");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const save = Array.from(dialog()!.querySelectorAll("button")).find(
      (el) => el.textContent?.includes("Save"),
    ) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    act(() => save.click());
    expect(onRename).not.toHaveBeenCalled();
  });

  it("cancels without committing when the dialog is dismissed", () => {
    const { host, onRename } = mount();
    doubleClick(row(host));
    const cancel = Array.from(dialog()!.querySelectorAll("button")).find(
      (el) => el.textContent?.includes("Cancel"),
    )!;
    act(() => cancel.click());
    expect(onRename).not.toHaveBeenCalled();
    expect(renameClosed()).toBe(true);
  });

  it("opens the rename dialog with F2 on a focused row", () => {
    const { host } = mount();
    act(() => {
      row(host).dispatchEvent(
        new KeyboardEvent("keydown", { key: "F2", bubbles: true, cancelable: true }),
      );
    });
    expect(dialog()).not.toBeNull();
  });

  it("opens the same core dialog from a controlled context-menu entry", () => {
    const { render, onRenameOpenChange } = mount({ renameOpen: false });
    expect(dialog()).toBeNull();
    render({ renameOpen: true });
    const panel = dialog();
    expect(panel).not.toBeNull();
    expect(panel!.querySelector<HTMLInputElement>("input")!.value).toBe(
      "Sample document",
    );
    act(() => {
      const cancel = Array.from(panel!.querySelectorAll("button")).find(
        (el) => el.textContent?.includes("Cancel"),
      )!;
      cancel.click();
    });
    expect(onRenameOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores the gesture when the destination is not renamable", () => {
    const { host } = mount({ renamable: false });
    doubleClick(row(host));
    expect(dialog()).toBeNull();
  });
});
