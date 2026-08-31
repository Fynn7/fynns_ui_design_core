import { describe, expect, it } from "vitest";
import { clampChartPointerTooltipBox } from "./clampChartPointerTooltipBox";

describe("clampChartPointerTooltipBox", () => {
  const tip = { width: 160, height: 120 };
  const host = { width: 637, height: 320 };

  it("centers horizontally when pointer is mid-plot", () => {
    const box = clampChartPointerTooltipBox({ x: 320, y: 160 }, host, tip);
    expect(box.left).toBe(240);
    expect(box.top).toBe(32);
  });

  it("clamps right edge when pointer is near the host end", () => {
    const box = clampChartPointerTooltipBox({ x: 620, y: 160 }, host, tip);
    expect(box.left + tip.width).toBeLessThanOrEqual(host.width - 8);
    expect(box.left).toBe(host.width - 8 - tip.width);
  });

  it("clamps left edge when pointer is near the host start", () => {
    const box = clampChartPointerTooltipBox({ x: 4, y: 160 }, host, tip);
    expect(box.left).toBe(8);
  });

  it("returns integer left/top so remount remasure does not subpixel-chatter", () => {
    const box = clampChartPointerTooltipBox(
      { x: 320.4, y: 160.6 },
      host,
      { width: 161.7, height: 119.3 },
    );
    expect(Number.isInteger(box.left)).toBe(true);
    expect(Number.isInteger(box.top)).toBe(true);
  });

  it("keeps the same left while pointer moves inside a right-edge clamp band", () => {
    const tipWide = { width: 180, height: 120 };
    const a = clampChartPointerTooltipBox({ x: 620, y: 140 }, host, tipWide);
    const b = clampChartPointerTooltipBox({ x: 600, y: 180 }, host, tipWide);
    expect(a.left).toBe(b.left);
    expect(a.left).toBe(host.width - 8 - tipWide.width);
    expect(b.top).not.toBe(a.top);
  });
});
