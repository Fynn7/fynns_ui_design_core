import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { BusyRegion, BusyScrim, type BusyIndicator } from "./Busy";
import { Button } from "./Button";
import { LoadingSkeleton } from "./LoadingSkeleton";

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  return { host, root, dispose: () => { act(() => root.unmount()); host.remove(); } };
}

describe("sweep skeleton loading convention", () => {
  it.each<BusyIndicator | undefined>([undefined, "skeleton", "circular", "linear"])(
    "unknown wait uses a skeleton with indicator %s and restores mounted content",
    (indicator) => {
      const { host, root, dispose } = mount();
      try {
        const render = (busy: boolean) => act(() => root.render(createElement(
          BusyRegion, { busy, label: "Loading catalog", indicator },
          createElement("button", null, "Existing item"),
        )));
        render(true);
        const content = host.querySelector("button");
        expect(host.querySelector(".fynns-loading-skeleton")).not.toBeNull();
        expect(host.querySelector(".fynns-circular-progress")).toBeNull();
        expect(host.querySelector("[role=progressbar]")).toBeNull();
        expect(host.querySelectorAll("[role=status]")).toHaveLength(1);
        expect(host.querySelector(".fynns-busy-region-content")?.hasAttribute("inert")).toBe(true);
        render(false);
        expect(host.querySelector("button")).toBe(content);
        expect(host.querySelector(".fynns-loading-skeleton")).toBeNull();
        expect(host.querySelector(".fynns-busy-region-content")?.hasAttribute("inert")).toBe(false);
      } finally { dispose(); }
    },
  );

  it("real progress uses one clamped linear bar and ignores custom skeletons", () => {
    const { host, root, dispose } = mount();
    try {
      act(() => root.render(createElement(BusyRegion, {
        busy: true, label: "Importing", value: 1.2, indicator: "circular",
        skeleton: createElement(LoadingSkeleton, { variant: "block" }),
      })));
      expect(host.querySelectorAll("[role=progressbar]")).toHaveLength(1);
      expect(host.querySelector(".fynns-linear-progress")?.getAttribute("aria-valuenow")).toBe("100");
      expect(host.querySelector(".fynns-loading-skeleton")).toBeNull();
    } finally { dispose(); }
  });

  it("custom placeholders are decorative under a named busy status", () => {
    const { host, root, dispose } = mount();
    try {
      act(() => root.render(createElement(BusyRegion, {
        busy: true, label: "Loading preview",
        skeleton: createElement(LoadingSkeleton, { variant: "block", "aria-hidden": true }),
      })));
      expect(host.querySelector(".fynns-loading-skeleton--block")).not.toBeNull();
      expect(host.querySelectorAll("[role=status]")).toHaveLength(1);
      expect(host.querySelector(".fynns-busy-skeleton")?.getAttribute("aria-hidden")).toBe("true");
    } finally { dispose(); }
  });

  it("fullscreen wait traps focus, restores it, and removes the skeleton on close", () => {
    const { root, dispose } = mount();
    const previous = document.createElement("button");
    document.body.append(previous);
    previous.focus();
    const overflow = document.body.style.overflow;
    try {
      act(() => root.render(createElement(BusyScrim, { open: true, label: "Loading workspace" })));
      const scrim = document.querySelector(".fynns-busy-scrim")!;
      expect(scrim.querySelector(".fynns-loading-skeleton")).not.toBeNull();
      expect(document.activeElement).toBe(scrim);
      expect(document.body.style.overflow).toBe("hidden");
      act(() => root.render(createElement(BusyScrim, { open: false, label: "Loading workspace" })));
      expect(document.querySelector(".fynns-busy-scrim")).toBeNull();
      expect(document.activeElement).toBe(previous);
      expect(document.body.style.overflow).toBe(overflow);
    } finally { dispose(); previous.remove(); }
  });

  it("button loading uses a compact skeleton and preserves disabled/busy semantics", () => {
    const { host, root, dispose } = mount();
    try {
      act(() => root.render(createElement(Button, {
        loading: true, iconOnly: true, "aria-label": "Refresh",
      }, createElement("svg", { "data-test": "action-glyph" }))));
      const button = host.querySelector("button")!;
      expect(button.disabled).toBe(true);
      expect(button.getAttribute("aria-busy")).toBe("true");
      expect(button.querySelector(".fynns-loading-skeleton--compact")).not.toBeNull();
      expect(button.querySelector("svg")).toBeNull();
    } finally { dispose(); }
  });
});
