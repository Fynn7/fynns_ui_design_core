import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  configureTooltipSkipDelay,
  isTooltipWarm,
  notifyTooltipClosed,
  notifyTooltipOpened,
  resetTooltipWarmthForTests,
} from "./tooltipWarmth";

beforeEach(() => {
  resetTooltipWarmthForTests();
  configureTooltipSkipDelay(500);
});

afterEach(() => {
  resetTooltipWarmthForTests();
});

describe("tooltipWarmth", () => {
  it("is cold until a tip opens", () => {
    expect(isTooltipWarm(1000)).toBe(false);
  });

  it("stays warm while a tip is open", () => {
    notifyTooltipOpened();
    expect(isTooltipWarm(1000)).toBe(true);
    notifyTooltipClosed(1000);
    expect(isTooltipWarm(1000)).toBe(true); // still inside skip window
    expect(isTooltipWarm(1000 + 499)).toBe(true);
    expect(isTooltipWarm(1000 + 500)).toBe(false);
  });

  it("skips delay for consecutive tips within the skip window", () => {
    notifyTooltipOpened();
    notifyTooltipClosed(2000);
    // Simulate moving to a neighbor immediately.
    expect(isTooltipWarm(2100)).toBe(true);
    notifyTooltipOpened();
    notifyTooltipClosed(2200);
    expect(isTooltipWarm(2600)).toBe(true);
    expect(isTooltipWarm(2701)).toBe(false);
  });

  it("only starts the skip window after the last open tip closes", () => {
    notifyTooltipOpened();
    notifyTooltipOpened();
    notifyTooltipClosed(3000);
    expect(isTooltipWarm(9000)).toBe(true); // still one open
    notifyTooltipClosed(3000);
    expect(isTooltipWarm(3499)).toBe(true);
    expect(isTooltipWarm(3500)).toBe(false);
  });
});
