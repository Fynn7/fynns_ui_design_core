import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  coversAnchor,
  floatingViewportRect,
  resolveAnchoredPosition,
  resolveFloatingBox,
  viewportFloatMaxWidth,
  type Align,
  type Side,
} from "./floatingBox";

const MARGIN = 8;
const VW = 1024;
const VH = 768;

/** Minimal DOMRect for node vitest (stubbing `window` drops the browser global). */
class TestDOMRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  get top() {
    return this.y;
  }
  get left() {
    return this.x;
  }
  get right() {
    return this.x + this.width;
  }
  get bottom() {
    return this.y + this.height;
  }
}

function assertAnchorPointInViewport(
  pos: { top: number; left: number; side: Side; align: Align },
  size: { width: number; height: number },
) {
  const box = floatingViewportRect({ top: pos.top, left: pos.left }, pos.side, pos.align, size);
  expect(box.top).toBeGreaterThanOrEqual(MARGIN);
  expect(box.left).toBeGreaterThanOrEqual(MARGIN);
  expect(box.right).toBeLessThanOrEqual(VW - MARGIN);
  expect(box.bottom).toBeLessThanOrEqual(VH - MARGIN);
}

/** `resolveFloatingBox` already returns the floating box's top-left. */
function assertFloatingBoxInViewport(
  box: { top: number; left: number },
  size: { width: number; height: number },
) {
  expect(box.top).toBeGreaterThanOrEqual(MARGIN);
  expect(box.left).toBeGreaterThanOrEqual(MARGIN);
  expect(box.left + size.width).toBeLessThanOrEqual(VW - MARGIN);
  expect(box.top + size.height).toBeLessThanOrEqual(VH - MARGIN);
}

beforeEach(() => {
  vi.stubGlobal("DOMRect", TestDOMRect);
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
    assertAnchorPointInViewport(pos, size);
  });

  it("keeps a tooltip inside the viewport when the anchor is near the left edge", () => {
    const anchor = new DOMRect(12, 120, 28, 28);
    const size = { width: 260, height: 48 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "top", align: "center" });
    assertAnchorPointInViewport(pos, size);
  });

  it("keeps a right-side tooltip inside the viewport when the anchor is near the bottom edge", () => {
    const anchor = new DOMRect(400, 720, 28, 28);
    const size = { width: 220, height: 64 };
    const pos = resolveAnchoredPosition(anchor, size, { side: "right", align: "center" });
    assertAnchorPointInViewport(pos, size);
  });

  it("uses the estimated tooltip width before the floating node is measured", () => {
    const anchor = new DOMRect(990, 120, 28, 28);
    const pos = resolveAnchoredPosition(anchor, null, { side: "top", align: "center" });
    const estimated = { width: Math.min(224, viewportFloatMaxWidth(VW)), height: 48 };
    assertAnchorPointInViewport(pos, estimated);
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
    expect(coversAnchor(box, anchor, pos.side, 6)).toBe(false);
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

  it("returns top-left box coords for bottom+end so a wide popover stays in the viewport", () => {
    const anchor = new DOMRect(VW - 160, 12, 48, 32);
    const size = { width: 420, height: 120 };
    const box = resolveFloatingBox(anchor, size, { side: "bottom", align: "end", offset: 10 });
    assertFloatingBoxInViewport(box, size);
    expect(box.top).toBeGreaterThanOrEqual(anchor.bottom + 10 - 1);
    expect(box.left).toBeLessThan(anchor.right - size.width / 2);
  });

  it("returns a viewport maxWidth and clamps placement when the tip is wider than the window", () => {
    const anchor = new DOMRect(VW - 40, 120, 28, 28);
    const size = { width: VW + 80, height: 52 };
    const box = resolveFloatingBox(anchor, size, { side: "top", align: "center" });
    expect(box.maxWidth).toBe(VW - MARGIN * 2);
    const placed = { width: box.maxWidth, height: size.height };
    assertFloatingBoxInViewport(box, placed);
  });

  it("keeps a right-edge toolbar tip inside the viewport after maxWidth wrap", () => {
    const anchor = new DOMRect(VW - 80, 200, 67, 30);
    const size = { width: 280, height: 40 };
    const box = resolveFloatingBox(anchor, size, { side: "top", align: "center" });
    const placed = { width: Math.min(size.width, box.maxWidth), height: size.height };
    assertFloatingBoxInViewport(box, placed);
  });
});
