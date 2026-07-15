import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  coversAnchor,
  floatingViewportRect,
  resolveAnchoredPosition,
  resolveFloatingBox,
  type Align,
  type Side,
} from "./Popover";

const MARGIN = 8;
const VW = 1024;
const VH = 768;

function assertBoxInViewport(
  pos: { top: number; left: number; side: Side; align: Align },
  size: { width: number; height: number },
) {
  const box = floatingViewportRect({ top: pos.top, left: pos.left }, pos.side, pos.align, size);
  expect(box.top).toBeGreaterThanOrEqual(MARGIN);
  expect(box.left).toBeGreaterThanOrEqual(MARGIN);
  expect(box.right).toBeLessThanOrEqual(VW - MARGIN);
  expect(box.bottom).toBeLessThanOrEqual(VH - MARGIN);
}

beforeEach(() => {
  vi.stubGlobal("window", { innerWidth: VW, innerHeight: VH });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resolveAnchoredPosition", () => {
  it("keeps a wide top tooltip inside the viewport when the anchor is near the right edge", () => {
    const anchor = new DOMRect(980, 120, 28, 28);
    const size = { width: 280, height: 52 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "top", align: "center" });
    assertBoxInViewport(pos, size);
  });

  it("keeps a tooltip inside the viewport when the anchor is near the left edge", () => {
    const anchor = new DOMRect(12, 120, 28, 28);
    const size = { width: 260, height: 48 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "top", align: "center" });
    assertBoxInViewport(pos, size);
  });

  it("keeps a right-side tooltip inside the viewport when the anchor is near the bottom edge", () => {
    const anchor = new DOMRect(400, 720, 28, 28);
    const size = { width: 220, height: 64 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "right", align: "center" });
    assertBoxInViewport(pos, size);
  });

  it("uses the estimated tooltip width before the floating node is measured", () => {
    const anchor = new DOMRect(990, 120, 28, 28);
    const pos = resolveAnchoredPosition(anchor, null, { side: "top", align: "center" });
    const estimated = { width: Math.min(224, VW * 0.85), height: 48 };
    assertBoxInViewport(pos, estimated);
  });

  it("centers a short tooltip on an icon button", () => {
    const anchor = new DOMRect(500, 100, 36, 36);
    const size = { width: 80, height: 36 };
    const box = resolveFloatingBox(anchor, size, { side: "top", align: "center" });
    const anchorCenterX = anchor.left + anchor.width / 2;
    const bubbleCenterX = box.left + size.width / 2;
    expect(Math.abs(bubbleCenterX - anchorCenterX)).toBeLessThan(1);
    expect(box.align).toBe("center");
  });

  it("keeps caret target aligned when a short tooltip shifts for the viewport edge", () => {
    const anchor = new DOMRect(980, 120, 36, 36);
    const size = { width: 80, height: 36 };
    const box = resolveFloatingBox(anchor, size, { side: "top", align: "center" });
    const anchorCenterX = anchor.left + anchor.width / 2;
    expect(box.left).toBeGreaterThanOrEqual(MARGIN);
    expect(box.left + size.width).toBeLessThanOrEqual(VW - MARGIN);
    expect(anchorCenterX).toBeGreaterThanOrEqual(box.left + 12);
    expect(anchorCenterX).toBeLessThanOrEqual(box.left + size.width - 12);
  });

  it("flips to bottom when preferred top would cover the anchor near the viewport top", () => {
    const anchor = new DOMRect(200, 48, 28, 28);
    const size = { width: 280, height: 52 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "top", align: "center" });
    expect(pos.side).toBe("bottom");

    const box = floatingViewportRect(
      { top: pos.top, left: pos.left },
      pos.side,
      pos.align,
      size,
    );
    expect(box.top).toBeGreaterThanOrEqual(anchor.bottom + 6 - 1);
    expect(
      coversAnchor(box, anchor, pos.side, 6),
    ).toBe(false);
  });

  it("flips to top when preferred bottom would cover the anchor near the viewport bottom", () => {
    const anchor = new DOMRect(200, VH - 48, 28, 28);
    const size = { width: 220, height: 64 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "bottom", align: "center" });
    expect(pos.side).toBe("top");

    const box = floatingViewportRect(
      { top: pos.top, left: pos.left },
      pos.side,
      pos.align,
      size,
    );
    expect(box.bottom).toBeLessThanOrEqual(anchor.top - 6 + 1);
    expect(coversAnchor(box, anchor, pos.side, 6)).toBe(false);
  });
});
