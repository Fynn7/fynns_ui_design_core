import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatSessionsDrawer, type ChatSessionsDrawerProps } from "./ChatSessionsDrawer";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
const labels = {
  newChat: "New chat", more: "More", rename: "Rename", delete: "Delete",
  deleteAll: "Delete all", sessionMenu: "Session actions", listMenu: "List actions",
  emptyTitle: "No sessions", loading: "Loading sessions", revealMore: "Show more",
};

function mount(overrides: Partial<ChatSessionsDrawerProps> = {}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  const props: ChatSessionsDrawerProps = {
    sessions: [{ id: "toolbar", label: "First" }, { id: "other", label: "Second" }],
    activeSessionId: "toolbar", labels,
    onNewChat: vi.fn(), onSelect: vi.fn(), onRename: vi.fn(), onDelete: vi.fn(), onDeleteAll: vi.fn(),
    ...overrides,
  };
  const update = (next: Partial<ChatSessionsDrawerProps>) => {
    Object.assign(props, next);
    act(() => root.render(createElement(ChatSessionsDrawer, props)));
  };
  update({});
  return { host, props, update };
}

function context(target: Element) {
  act(() => target.dispatchEvent(new MouseEvent("contextmenu", {
    bubbles: true, cancelable: true, clientX: 80, clientY: 120,
  })));
}

function currentMenu() {
  return document.querySelector('[role="menu"][data-state="open"]');
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("ChatSessionsDrawer controlled session data", () => {
  it("routes a right-click on trailing chrome by identity without selecting the row", () => {
    const { host, props } = mount();
    const row = host.querySelector('[data-chat-session-id="other"]')!;
    context(row.parentElement!.querySelector('[aria-haspopup="menu"]:not([data-chat-session-id])')!);
    expect(currentMenu()?.getAttribute("aria-label")).toBe("Session actions");
    const item = Array.from(currentMenu()!.querySelectorAll("button")).find((el) => el.textContent === "Rename")!;
    act(() => item.click());
    expect(props.onRename).toHaveBeenCalledExactlyOnceWith("other");
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("dismisses an open menu when its target disappears from the caller dataset", () => {
    const { host, update } = mount();
    context(host.querySelector('[data-chat-session-id="other"]')!);
    expect(currentMenu()).not.toBeNull();
    update({ sessions: [{ id: "toolbar", label: "First" }] });
    expect(currentMenu()).toBeNull();
  });

  it("dismisses a menu when its target becomes disabled and prevents reopening it", () => {
    const { host, update } = mount();
    context(host.querySelector('[data-chat-session-id="other"]')!);
    update({ sessions: [{ id: "other", label: "Second", disabled: true }] });
    expect(currentMenu()).toBeNull();
    context(host.querySelector('[data-chat-session-id="other"]')!);
    expect(currentMenu()).toBeNull();
  });

  it("keeps toolbar actions separate from a session whose id is toolbar", () => {
    const { host, props } = mount();
    const trigger = host.querySelector<HTMLButtonElement>(".fynns-nav-drawer-new-chat [aria-haspopup=menu]")!;
    act(() => trigger.click());
    expect(currentMenu()?.textContent).toBe("Delete all");
    act(() => currentMenu()!.querySelector<HTMLButtonElement>("button")!.click());
    expect(props.onDeleteAll).toHaveBeenCalledOnce();
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  it("dismisses context menus when the controlled modal is closed", () => {
    const { update } = mount({ variant: "modal", open: true });
    context(document.querySelector('[data-chat-session-id="other"]')!);
    expect(currentMenu()).not.toBeNull();
    update({ open: false });
    expect(currentMenu()).toBeNull();
  });
});
