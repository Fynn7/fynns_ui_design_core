import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { IconButton } from "./IconButton";
import { NavigationDrawerItem } from "./NavigationDrawer";
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
});

describe("NavigationDrawerItem trailing overlay", () => {
  it("keeps count badge inside the destination button", () => {
    const host = mount(
      createElement(NavigationDrawerItem, { label: "Inbox", badge: 3 }),
    );
    const item = host.querySelector(".fynns-nav-drawer-item");
    expect(item).not.toBeNull();
    expect(item?.querySelector(".fynns-nav-drawer-badge")?.textContent).toBe("3");
    expect(host.querySelector(".fynns-nav-drawer-item-host--with-end")).toBeNull();
  });

  it("renders trailing IconButton as a sibling with --with-end host", () => {
    const trailing = createElement(
      IconButton,
      { variant: "ghost", "aria-label": "Delete session" },
      createElement(TrashIcon),
    );
    const host = mount(
      createElement(NavigationDrawerItem, {
        label: "Sample session",
        trailing,
      }),
    );
    const wrap = host.querySelector(".fynns-nav-drawer-item-host--with-end");
    const item = wrap?.querySelector(":scope > .fynns-nav-drawer-item");
    const end = wrap?.querySelector(
      ":scope > .fynns-nav-drawer-item-trailing--end",
    );
    const deleteBtn = host.querySelector('[aria-label="Delete session"]');
    expect(wrap).not.toBeNull();
    expect(item).not.toBeNull();
    expect(end).not.toBeNull();
    expect(deleteBtn).not.toBeNull();
    expect(item?.contains(deleteBtn)).toBe(false);
    expect(end?.contains(deleteBtn)).toBe(true);
  });

  it("promotes IconButton passed as badge into trailing --with-end", () => {
    const badge = createElement(
      IconButton,
      { variant: "ghost", "aria-label": "Delete session" },
      createElement(TrashIcon),
    );
    const host = mount(
      createElement(NavigationDrawerItem, {
        label: "Misused badge",
        badge,
      }),
    );
    const wrap = host.querySelector(".fynns-nav-drawer-item-host--with-end");
    const item = wrap?.querySelector(":scope > .fynns-nav-drawer-item");
    const deleteBtn = host.querySelector('[aria-label="Delete session"]');
    expect(wrap).not.toBeNull();
    expect(item?.querySelector(".fynns-btn")).toBeNull();
    expect(
      wrap
        ?.querySelector(".fynns-nav-drawer-item-trailing--end")
        ?.contains(deleteBtn),
    ).toBe(true);
  });

  it("keeps default (md) IconButton in trailing --with-end (CSS clamps disk)", () => {
    const trailing = createElement(
      IconButton,
      { variant: "ghost", "aria-label": "Delete session" },
      createElement(TrashIcon),
    );
    const host = mount(
      createElement(NavigationDrawerItem, {
        label: "Sample session",
        trailing,
      }),
    );
    const deleteBtn = host.querySelector(
      ".fynns-nav-drawer-item-trailing--end .fynns-btn--icon",
    );
    expect(deleteBtn).not.toBeNull();
    // Recipe prefers size="sm"; bare md still mounts — chrome.css clamps the
    // disk to 32dp so it cannot kiss the 40dp destination pill (≥ 0.5.225).
    expect(deleteBtn?.classList.contains("fynns-btn--sm")).toBe(false);
    expect(deleteBtn?.classList.contains("fynns-btn--icon")).toBe(true);
  });
});
