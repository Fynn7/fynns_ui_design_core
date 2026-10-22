import { act, createElement } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";
import { resetTooltipWarmthForTests } from "./tooltipWarmth";

let root: Root;
let host: HTMLDivElement;
let portal: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  resetTooltipWarmthForTests();
  host = document.createElement("div");
  portal = document.createElement("div");
  document.body.append(host, portal);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  portal.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  resetTooltipWarmthForTests();
});

function render(expanded = false, insideControl = false, interactive = false) {
  const trigger = createElement("button", {
    key: "trigger", "aria-haspopup": "menu", "aria-expanded": expanded,
  }, "More");
  const tip = createElement(Tooltip, {
    content: "More options", interactive,
    children: insideControl ? "More" : [trigger,
      createPortal(createElement("button", null, "Portaled item"), portal, "item")],
  });
  act(() => root.render(insideControl
    ? createElement("button", { "aria-haspopup": "menu", "aria-expanded": expanded }, tip)
    : tip));
}

function event(el: Element, type: string, relatedTarget: EventTarget | null = null) {
  act(() => {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, relatedTarget }));
  });
}

function advance() { act(() => vi.advanceTimersByTime(1000)); }
const tooltip = () => document.querySelector('[role="tooltip"]');

describe("Tooltip DOM ownership across portals", () => {
  it("ignores pointer entry from a React descendant outside the DOM anchor", () => {
    render();
    event(portal.querySelector("button")!, "mouseover");
    advance();
    expect(tooltip()).toBeNull();
    event(host.querySelector("button")!, "mouseover");
    advance();
    expect(tooltip()?.textContent).toBe("More options");
  });

  it("cancels pending hover when the DOM pointer leaves for a portal", () => {
    render();
    const button = host.querySelector("button")!;
    const item = portal.querySelector("button")!;
    event(button, "mouseover");
    event(button, "mouseout", item);
    event(host.querySelector("span")!, "mouseleave", item);
    event(item, "mouseover", button);
    advance();
    expect(tooltip()).toBeNull();
  });

  for (const insideControl of [false, true]) {
    it(`hides an existing tip when its ${insideControl ? "ancestor" : "child"} popup trigger expands`, async () => {
      render(false, insideControl);
      event(host.querySelector(".fynns-tooltip-trigger")!, "mouseover");
      advance();
      expect(tooltip()).not.toBeNull();
      // An independently controlled child may update without rerendering Tooltip.
      await act(async () => host.querySelector("button")!.setAttribute("aria-expanded", "true"));
      expect(tooltip()).toBeNull();
      event(host.querySelector(".fynns-tooltip-trigger")!, "mouseover");
      advance();
      expect(tooltip()).toBeNull();
      await act(async () => host.querySelector("button")!.setAttribute("aria-expanded", "false"));
      event(host.querySelector(".fynns-tooltip-trigger")!, "mouseover");
      advance();
      expect(tooltip()).not.toBeNull();
    });

    it(`cancels delayed show when its ${insideControl ? "ancestor" : "child"} popup trigger expands`, async () => {
      render(false, insideControl);
      event(host.querySelector(".fynns-tooltip-trigger")!, "mouseover");
      await act(async () => host.querySelector("button")!.setAttribute("aria-expanded", "true"));
      advance();
      expect(tooltip()).toBeNull();
    });
  }

  it("ignores portaled focus/blur while preserving real trigger focus", () => {
    render();
    act(() => host.querySelector("button")!.focus());
    expect(tooltip()).not.toBeNull();
    act(() => portal.querySelector("button")!.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(tooltip()).not.toBeNull();
    act(() => portal.querySelector("button")!.focus());
    expect(tooltip()).toBeNull();
  });

  it("retains the interactive bubble while crossing the DOM gap", () => {
    render(false, false, true);
    event(host.querySelector("button")!, "mouseover");
    advance();
    const bubble = tooltip()!;
    event(host.querySelector("span")!, "mouseleave", bubble);
    event(bubble, "mouseover");
    advance();
    expect(tooltip()).toBe(bubble);
    event(bubble, "mouseout");
    advance();
    expect(tooltip()).toBeNull();
  });
});
