import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DropdownMenu, DropdownMenuRemovableItem } from "./DropdownMenu";
import { ContextMenu } from "./ContextMenu";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
function mount(node: ReturnType<typeof createElement>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  act(() => root.render(node));
}
afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
  document.body.innerHTML = "";
});
function click(element: Element | null) {
  expect(element).not.toBeNull();
  act(() => element?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
}

describe("DropdownMenuRemovableItem", () => {
  for (const contextMenu of [false, true]) {
    it(`removes owned rows while keeping ${contextMenu ? "ContextMenu" : "DropdownMenu"} open and focused`, () => {
      const selected = vi.fn();
      const changed = vi.fn();
      function Demo() {
        const [items, setItems] = useState(["Alpha", "Beta", "Gamma"]);
        const children = items.map((label) => createElement(DropdownMenuRemovableItem, {
          key: label,
          removeLabel: `Remove ${label}`,
          onRemove: () => setItems((current) => current.filter((item) => item !== label)),
          onClick: selected,
          children: label,
        }));
        return contextMenu
          ? createElement(ContextMenu, { open: true, onOpenChange: changed, x: 0, y: 0, children })
          : createElement(DropdownMenu, { trigger: "Samples", open: true, onOpenChange: changed, children });
      }
      mount(createElement(Demo));
      const menu = document.querySelector('[role="menu"]') as HTMLElement;
      click(menu.querySelector('[aria-label="Remove Beta"]'));
      expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
      expect(document.activeElement?.textContent).toBe("Gamma");
      click(menu.querySelector('[aria-label="Remove Gamma"]'));
      expect(document.activeElement?.textContent).toBe("Alpha");
      click(menu.querySelector('[aria-label="Remove Alpha"]'));
      expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(0);
      expect(document.activeElement).toBe(menu);
      expect(menu.getAttribute("data-state")).toBe("open");
      expect(selected).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });
  }

  it("keeps normal row selection and closes the menu", () => {
    const changed = vi.fn();
    const selected = vi.fn();
    const removed = vi.fn();
    mount(createElement(DropdownMenu, {
      trigger: "Samples", open: true, onOpenChange: changed,
      children: createElement(DropdownMenuRemovableItem, {
        removeLabel: "Remove Alpha", onRemove: removed, onClick: selected, children: "Alpha",
      }),
    }));
    click(document.querySelector('[role="menuitem"]'));
    expect(selected).toHaveBeenCalledOnce();
    expect(removed).not.toHaveBeenCalled();
    expect(changed).toHaveBeenCalledWith(false);
  });

  it("provides a sibling trash button and keyboard access with a tooltip", () => {
    mount(createElement(DropdownMenuRemovableItem, {
      removeLabel: "Remove Alpha", onRemove: vi.fn(), children: "Alpha",
    }));
    const row = document.querySelector('[role="menuitem"]') as HTMLElement;
    const trash = document.querySelector('[aria-label="Remove Alpha"]') as HTMLElement;
    expect(row.contains(trash)).toBe(false);
    act(() => {
      row.focus();
      row.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(document.activeElement).toBe(trash);
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe("Remove Alpha");
    act(() => trash.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })));
    expect(document.activeElement).toBe(row);
  });

  it("disables removal independently of selecting the row", () => {
    const removed = vi.fn();
    mount(createElement(DropdownMenuRemovableItem, {
      removeLabel: "Remove Alpha", onRemove: removed, removeDisabled: true, children: "Alpha",
    }));
    const trash = document.querySelector('[aria-label="Remove Alpha"]') as HTMLButtonElement;
    expect(trash.disabled).toBe(true);
    expect((document.querySelector('[role="menuitem"]') as HTMLButtonElement).disabled).toBe(false);
    act(() => trash.click());
    expect(removed).not.toHaveBeenCalled();
  });

  it("moves down from a trash action relative to its row, skipping disabled rows", () => {
    mount(createElement(DropdownMenu, {
      trigger: "Samples", open: true,
      children: ["Alpha", "Beta", "Gamma", "Delta"].map((label) =>
        createElement(DropdownMenuRemovableItem, {
          key: label, children: label, removeLabel: `Remove ${label}`,
          onRemove: vi.fn(), disabled: label === "Gamma",
        })),
    }));
    const trash = document.querySelector('[aria-label="Remove Beta"]') as HTMLElement;
    act(() => {
      trash.focus();
      trash.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(document.activeElement?.textContent).toBe("Delta");
  });
});
