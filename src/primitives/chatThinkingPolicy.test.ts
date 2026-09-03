import { describe, expect, it } from "vitest";
import {
  displayThinkingOpen,
  formatThoughtDuration,
  formatThoughtSeconds,
  resetThinkingPinsOnStreamStart,
  resolveThinkingLabel,
  resolveThinkingOpen,
} from "./chatThinkingPolicy";

describe("formatThoughtSeconds", () => {
  it("returns 0 for non-positive / non-finite", () => {
    expect(formatThoughtSeconds(0)).toBe(0);
    expect(formatThoughtSeconds(-10)).toBe(0);
    expect(formatThoughtSeconds(Number.NaN)).toBe(0);
  });

  it("rounds to whole seconds with min 1 when ms > 0", () => {
    expect(formatThoughtSeconds(1)).toBe(1);
    expect(formatThoughtSeconds(1499)).toBe(1);
    expect(formatThoughtSeconds(1500)).toBe(2);
    expect(formatThoughtSeconds(4200)).toBe(4);
  });
});

describe("formatThoughtDuration", () => {
  it("falls back to Thinking when no duration", () => {
    expect(formatThoughtDuration(0)).toBe("Thinking");
  });

  it("formats Thought for Ns", () => {
    expect(formatThoughtDuration(4200)).toBe("Thought for 4s");
  });
});

describe("resolveThinkingLabel", () => {
  it("uses streamingLabel while streaming", () => {
    expect(
      resolveThinkingLabel({ streaming: true, streamingLabel: "Searching…" }),
    ).toBe("Searching…");
    expect(resolveThinkingLabel({ streaming: true })).toBe("Thinking");
  });

  it("uses durationLabel / default duration when done with ms", () => {
    expect(
      resolveThinkingLabel({
        streaming: false,
        durationMs: 3000,
        durationLabel: (n) => `Took ${n}s`,
      }),
    ).toBe("Took 3s");
    expect(resolveThinkingLabel({ streaming: false, durationMs: 3000 })).toBe(
      "Thought for 3s",
    );
  });

  it("uses done label when no duration", () => {
    expect(resolveThinkingLabel({ streaming: false, label: "Thought" })).toBe(
      "Thought",
    );
    expect(resolveThinkingLabel({ streaming: false })).toBe("Thinking");
  });
});

describe("resetThinkingPinsOnStreamStart", () => {
  it("clears pins on idle → streaming", () => {
    expect(
      resetThinkingPinsOnStreamStart({
        streaming: true,
        wasStreaming: false,
        userPinnedClosed: true,
        userPinnedOpen: true,
        didAutoCollapse: true,
      }),
    ).toEqual({
      userPinnedClosed: false,
      userPinnedOpen: false,
      didAutoCollapse: false,
    });
  });

  it("keeps pins when streaming continues or idle", () => {
    expect(
      resetThinkingPinsOnStreamStart({
        streaming: true,
        wasStreaming: true,
        userPinnedClosed: true,
        userPinnedOpen: false,
        didAutoCollapse: false,
      }),
    ).toEqual({
      userPinnedClosed: true,
      userPinnedOpen: false,
      didAutoCollapse: false,
    });
  });
});

describe("resolveThinkingOpen", () => {
  it("controlled open wins", () => {
    expect(
      resolveThinkingOpen({
        streaming: true,
        open: false,
        internalOpen: true,
        userPinnedClosed: false,
        userPinnedOpen: false,
        didAutoCollapse: false,
        wasStreaming: false,
      }),
    ).toEqual({ open: false, didAutoCollapse: false });
  });

  it("forces open while streaming unless user pinned closed", () => {
    expect(
      resolveThinkingOpen({
        streaming: true,
        internalOpen: false,
        userPinnedClosed: false,
        userPinnedOpen: false,
        didAutoCollapse: false,
        wasStreaming: false,
      }),
    ).toEqual({ open: true, didAutoCollapse: false });
    expect(
      resolveThinkingOpen({
        streaming: true,
        internalOpen: false,
        userPinnedClosed: true,
        userPinnedOpen: false,
        didAutoCollapse: false,
        wasStreaming: true,
      }),
    ).toEqual({ open: false, didAutoCollapse: false });
  });

  it("auto-collapses once on streaming → done unless userPinnedOpen", () => {
    expect(
      resolveThinkingOpen({
        streaming: false,
        internalOpen: true,
        userPinnedClosed: false,
        userPinnedOpen: false,
        didAutoCollapse: false,
        wasStreaming: true,
      }),
    ).toEqual({ open: false, didAutoCollapse: true });
    expect(
      resolveThinkingOpen({
        streaming: false,
        internalOpen: true,
        userPinnedClosed: false,
        userPinnedOpen: true,
        didAutoCollapse: false,
        wasStreaming: true,
      }),
    ).toEqual({ open: true, didAutoCollapse: false });
  });

  it("keeps internalOpen when idle after collapse", () => {
    expect(
      resolveThinkingOpen({
        streaming: false,
        internalOpen: true,
        userPinnedClosed: false,
        userPinnedOpen: true,
        didAutoCollapse: true,
        wasStreaming: false,
      }),
    ).toEqual({ open: true, didAutoCollapse: true });
  });
});

describe("displayThinkingOpen", () => {
  it("mirrors steady-state policy without reimplementing streaming branch", () => {
    expect(
      displayThinkingOpen({
        streaming: true,
        internalOpen: false,
        userPinnedClosed: false,
      }),
    ).toBe(true);
    expect(
      displayThinkingOpen({
        streaming: true,
        internalOpen: true,
        userPinnedClosed: true,
      }),
    ).toBe(false);
    expect(
      displayThinkingOpen({
        streaming: false,
        open: true,
        internalOpen: false,
        userPinnedClosed: false,
      }),
    ).toBe(true);
    expect(
      displayThinkingOpen({
        streaming: false,
        internalOpen: false,
        userPinnedClosed: false,
      }),
    ).toBe(false);
  });

  it("clears stale pin on idle→streaming before paint when wasStreaming is false", () => {
    expect(
      displayThinkingOpen({
        streaming: true,
        wasStreaming: false,
        internalOpen: false,
        userPinnedClosed: true,
      }),
    ).toBe(true);
  });

  it("does not auto-collapse on streaming→done (effect owns that edge)", () => {
    expect(
      displayThinkingOpen({
        streaming: false,
        internalOpen: true,
        userPinnedClosed: false,
      }),
    ).toBe(true);
  });
});
