import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import { TrashIcon } from "./icons";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];

function mount(node: ReturnType<typeof createElement>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  act(() => {
    root.render(node);
  });
  return host;
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => {
      root.unmount();
    });
    host.remove();
  }
  document.body.innerHTML = "";
});

function trailingDelete() {
  return createElement(
    IconButton,
    { variant: "ghost", size: "sm", "aria-label": "Delete imported volume" },
    createElement(TrashIcon),
  );
}

describe("DropdownMenuItem trailing row action", () => {
  it("keeps a plain item as a bare row button", () => {
    const host = mount(createElement(DropdownMenuItem, null, "Visible Human Head"));
    expect(host.querySelector(".fynns-menu-item-host")).toBeNull();
    expect(host.querySelector(".fynns-menu-item-trailing")).toBeNull();
    expect(host.querySelector('[role="menuitem"]')).not.toBeNull();
  });

  it("renders trailing as a sibling host slot, never inside the row button", () => {
    const host = mount(
      createElement(
        DropdownMenuItem,
        { trailing: trailingDelete() },
        "present492x492x442_qvis",
      ),
    );
    const wrap = host.querySelector(".fynns-menu-item-host");
    const item = wrap?.querySelector(":scope > .fynns-menu-item");
    const trailing = wrap?.querySelector(":scope > .fynns-menu-item-trailing");
    const deleteBtn = host.querySelector('[aria-label="Delete imported volume"]');
    expect(wrap).not.toBeNull();
    expect(item).not.toBeNull();
    expect(trailing).not.toBeNull();
    expect(deleteBtn).not.toBeNull();
    expect(item?.contains(deleteBtn)).toBe(false);
    expect(trailing?.contains(deleteBtn)).toBe(true);
    // The row keeps its menuitem role so arrow keys still page every row.
    expect(item?.getAttribute("role")).toBe("menuitem");
  });

  it("clamps a bare md IconButton disk in CSS (no class assertion needed)", () => {
    const host = mount(
      createElement(
        DropdownMenuItem,
        {
          trailing: createElement(
            IconButton,
            { variant: "ghost", "aria-label": "Delete imported volume" },
            createElement(TrashIcon),
          ),
        },
        "present492x492x442_qvis",
      ),
    );
    const deleteBtn = host.querySelector(
      ".fynns-menu-item-trailing .fynns-btn--icon",
    );
    expect(deleteBtn).not.toBeNull();
    expect(deleteBtn?.classList.contains("fynns-btn--sm")).toBe(false);
  });

  it("closes the whole menu when the end action is activated", () => {
    const seen: boolean[] = [];
    const host = mount(
      createElement(DropdownMenu, {
        trigger: "Volume",
        open: true,
        onOpenChange: (next: boolean) => seen.push(next),
        children: createElement(
          DropdownMenuItem,
          { trailing: trailingDelete() },
          "present492x492x442_qvis",
        ),
      }),
    );
    const deleteBtn = document.body.querySelector(
      '[aria-label="Delete imported volume"]',
    );
    expect(deleteBtn).not.toBeNull();
    act(() => {
      deleteBtn?.dispatchEvent(
        new window.MouseEvent("click", { bubbles: true }),
      );
    });
    expect(seen).toEqual([false]);
    expect(host).not.toBeNull();
  });
});
