import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppLoadingScreen, type AppLoadingScreenProps } from "./AppLoadingScreen";

let oldTitle: string;
beforeEach(() => {
  oldTitle = document.title;
  document.title = "Sample Person";
  vi.stubGlobal("Image", class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    crossOrigin = "";
    set src(value: string) {
      queueMicrotask(() => value.includes("missing") ? this.onerror?.() : this.onload?.());
    }
  });
});
afterEach(() => {
  document.title = oldTitle;
  document.head.querySelectorAll("[data-test-loading-brand]").forEach(el => el.remove());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function pageIcon(href: string) {
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href;
  link.dataset.testLoadingBrand = "";
  document.head.append(link);
}

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  return {
    render: async (props: Partial<AppLoadingScreenProps> = {}) => {
      await act(async () => {
        root.render(createElement(AppLoadingScreen, { open: true, label: "Starting app", ...props }));
      });
    },
    dispose: () => { act(() => root.unmount()); host.remove(); },
    screen: () => document.querySelector(".fynns-app-loading-screen")!,
  };
}

describe("application startup logo convention", () => {
  it("automatically uses the configured page icon before the initials avatar", async () => {
    pageIcon("/project.svg");
    const view = mount();
    try {
      await view.render();
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("configured");
      expect(view.screen().querySelector(".fynns-app-loading-logo")?.getAttribute("style")).toContain("project.svg");
      expect(view.screen().querySelector(".fynns-avatar")).toBeNull();
      expect(view.screen().querySelector(".fynns-loading-skeleton, .fynns-circular-progress")).toBeNull();
      expect(view.screen().querySelector("[role=status]")?.textContent).toBe("Starting app");
    } finally { view.dispose(); }
  });

  it("an explicitly configured logo takes priority over the page icon", async () => {
    pageIcon("/page.svg");
    const view = mount();
    try {
      await view.render({ logoSrc: "/configured-brand.svg" });
      expect(view.screen().querySelector(".fynns-app-loading-logo")?.getAttribute("style")).toContain("configured-brand.svg");
    } finally { view.dispose(); }
  });

  it("failed configured images advance to the next project icon, then initials", async () => {
    pageIcon("/missing-page.svg");
    pageIcon("/available.svg");
    const view = mount();
    try {
      await view.render({ logoSrc: "/missing-explicit.svg" });
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("configured");
      expect(view.screen().querySelector(".fynns-app-loading-logo")?.getAttribute("style")).toContain("available.svg");
      document.head.querySelectorAll("[data-test-loading-brand]").forEach(el => el.remove());
      await view.render({ logoSrc: "/missing-explicit.svg" });
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("initials");
      expect(view.screen().querySelector(".fynns-avatar-initials")?.textContent).toBe("SP");
    } finally { view.dispose(); }
  });

  it("prefers the configured application-name for the initials fallback", async () => {
    const meta = document.createElement("meta");
    meta.name = "application-name";
    meta.content = "Sample Workspace";
    meta.dataset.testLoadingBrand = "";
    document.head.append(meta);
    const view = mount();
    try {
      await view.render();
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("initials");
      expect(view.screen().querySelector(".fynns-avatar-initials")?.textContent).toBe("SW");
      await view.render({ name: "Local User" });
      expect(view.screen().querySelector(".fynns-avatar-initials")?.textContent).toBe("LU");
    } finally { view.dispose(); }
  });

  it("uses the core mark only when no configured icon or initials identity is available", async () => {
    document.title = "";
    const view = mount();
    try {
      await view.render();
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("core");
      expect(view.screen().querySelector(".fynns-app-loading-logo")?.getAttribute("style")).toContain("data:image/svg+xml");
    } finally { view.dispose(); }
  });

  it("loads manifest icon URLs relative to the configured manifest", async () => {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "https://project.test/assets/app.webmanifest";
    manifest.dataset.testLoadingBrand = "";
    document.head.append(manifest);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, url: manifest.href,
      json: async () => ({ icons: [{ src: "mark.svg" }] }) }));
    const view = mount();
    try {
      await view.render();
      expect(view.screen().getAttribute("data-loading-logo-source")).toBe("configured");
      expect(view.screen().querySelector(".fynns-app-loading-logo")?.getAttribute("style")).toContain("https://project.test/assets/mark.svg");
    } finally { view.dispose(); }
  });

  it("keeps focus and body scroll blocked, then restores both on close", async () => {
    const previous = document.createElement("button");
    document.body.append(previous);
    previous.focus();
    const overflow = document.body.style.overflow;
    const view = mount();
    try {
      await view.render();
      expect(document.activeElement).toBe(view.screen());
      expect(document.body.style.overflow).toBe("hidden");
      const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      window.dispatchEvent(escape);
      expect(escape.defaultPrevented).toBe(true);
      await view.render({ open: false });
      expect(document.querySelector(".fynns-app-loading-screen")).toBeNull();
      expect(document.activeElement).toBe(previous);
      expect(document.body.style.overflow).toBe(overflow);
    } finally { view.dispose(); previous.remove(); }
  });
});
