import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClippedNavShell } from "./ClippedNavShell";
import { NavigationDrawer, NavigationDrawerGroup, NavigationDrawerItem, NavigationDrawerNewChat } from "./NavigationDrawer";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
  vi.unstubAllGlobals();
});

describe("NavigationDrawer modal navigation dismissal", () => {
  it.each([false, true])("runs the action and respects cancellation (%s)", async (cancel) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    mounts.push({ root, host });
    const close = vi.fn();
    const select = vi.fn((event) => {
      event.stopPropagation();
      if (cancel) event.preventDefault();
    });
    act(() => root.render(h(NavigationDrawer, { open: true, onClose: close, ariaLabel: "Modal destinations" },
      h(NavigationDrawerItem, { label: "Select", onClick: select }))));
    await act(async () => {
      (document.querySelector('[aria-label="Modal destinations"] .fynns-nav-drawer-item') as HTMLElement).click();
      await Promise.resolve();
    });
    expect(select).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledTimes(cancel ? 0 : 1);
  });
});

function mount(overlay = true, cancel = false) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  const close = vi.fn();
  const select = vi.fn((event) => {
    event.stopPropagation();
    if (cancel) event.preventDefault();
  });
  const nav = h(NavigationDrawer, {
    variant: "standard", footer: h("button", { onClick: select }, "Settings"),
  },
  h(NavigationDrawerItem, { label: "Destination", onClick: select }),
  h(NavigationDrawerItem, { label: "Disabled", disabled: true, onClick: select }),
  h(NavigationDrawerNewChat, { label: "New chat", onClick: select }),
  h(NavigationDrawerGroup, { label: "Group", children: h("span", null, "Content") }),
  h("button", { "aria-haspopup": "menu" }, "More"),
  h("input", { "aria-label": "Search" }));
  const render = (navKey = "root", navDirection: "forward" | "back" = "forward") => {
    act(() => root.render(h(ClippedNavShell, {
      navMode: "drawer", navKey, navDirection, topBar: null, nav,
      onNavCrowded: close, children: h("main", null, "Canvas"),
    })));
  };
  render();
  (host.querySelector(".fynns-clipped-nav-shell-nav") as HTMLElement).style.position = overlay ? "absolute" : "relative";
  const click = async (selector: string) => {
    await act(async () => {
      (host.querySelector(selector) as HTMLElement).click();
      await Promise.resolve();
    });
  };
  return { host, close, select, render, click };
}

describe("ClippedNavShell overlay navigation dismissal", () => {
  it.each([
    ".fynns-nav-drawer-item", ".fynns-nav-drawer-new-chat-trigger", ".fynns-nav-drawer-footer button",
  ])("dismisses %s after its action even when propagation stops", async (selector) => {
    const { close, select, click } = mount();
    await click(selector);
    expect(select).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(select.mock.invocationCallOrder[0]).toBeLessThan(close.mock.invocationCallOrder[0]);
  });

  it("keeps a docked column open after selection and Back", async () => {
    const { close, click, render } = mount(false);
    await click(".fynns-nav-drawer-item");
    render("catalog");
    render("root", "back");
    expect(close).not.toHaveBeenCalled();
  });

  it("closes on a committed Back and skips the in-column swap", () => {
    const { host, close, render } = mount();
    render("catalog");
    render("root", "back");
    expect(close).toHaveBeenCalledOnce();
    expect(host.querySelector(".fynns-clipped-nav-shell")?.hasAttribute("data-nav-axis")).toBe(false);
  });

  it("keeps cancelled actions open", async () => {
    const { close, click } = mount(true, true);
    await click(".fynns-nav-drawer-item");
    expect(close).not.toHaveBeenCalled();
  });

  it("keeps group, menu, search and disabled controls open", async () => {
    const { close, click } = mount();
    await click(".fynns-nav-drawer-group-trigger");
    await click("[aria-haspopup='menu']");
    await click("input");
    await click("button:disabled");
    expect(close).not.toHaveBeenCalled();
  });

  it("ignores modified link activation", async () => {
    const { host, close } = mount();
    const link = document.createElement("a");
    link.href = "#sample";
    host.querySelector(".fynns-nav-drawer-body")!.appendChild(link);
    await act(async () => {
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
      await Promise.resolve();
    });
    expect(close).not.toHaveBeenCalled();
  });
});
