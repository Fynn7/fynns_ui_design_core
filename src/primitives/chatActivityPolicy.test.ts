import { describe, expect, it } from "vitest";
import {
  anyPriorIndex,
  initialStepMotion,
  predictStepSettle,
  resolveActivityOpen,
} from "./chatActivityPolicy";

describe("resolveActivityOpen", () => {
  it("controlled open wins", () => {
    expect(
      resolveActivityOpen({
        streaming: true,
        open: false,
        internalOpen: true,
        userPinnedClosed: false,
      }),
    ).toBe(false);
  });

  it("forces open while streaming unless user pinned closed", () => {
    expect(
      resolveActivityOpen({
        streaming: true,
        internalOpen: false,
        userPinnedClosed: false,
      }),
    ).toBe(true);
    // Pin keeps last uncontrolled open (caller sets internalOpen false on pin).
    expect(
      resolveActivityOpen({
        streaming: true,
        internalOpen: false,
        userPinnedClosed: true,
      }),
    ).toBe(false);
  });

  it("keeps internalOpen when idle", () => {
    expect(
      resolveActivityOpen({
        streaming: false,
        internalOpen: false,
        userPinnedClosed: false,
      }),
    ).toBe(false);
    expect(
      resolveActivityOpen({
        streaming: false,
        internalOpen: true,
        userPinnedClosed: true,
      }),
    ).toBe(true);
  });
});

describe("predictStepSettle", () => {
  it("marks newly mounted done as hold", () => {
    const { holdIndices, completeIndices } = predictStepSettle({
      keys: ["a", "b"],
      statuses: ["active", "done"],
      prevKeys: new Set(["a"]),
      prevStatusByKey: new Map([["a", "active"]]),
    });
    expect([...holdIndices]).toEqual([1]);
    expect(completeIndices.size).toBe(0);
  });

  it("marks active→done as complete", () => {
    const { holdIndices, completeIndices } = predictStepSettle({
      keys: ["a"],
      statuses: ["done"],
      prevKeys: new Set(["a"]),
      prevStatusByKey: new Map([["a", "active"]]),
    });
    expect(holdIndices.size).toBe(0);
    expect([...completeIndices]).toEqual([0]);
  });
});

describe("anyPriorIndex", () => {
  it("detects strictly earlier indices", () => {
    expect(anyPriorIndex(new Set([0, 2]), 1)).toBe(true);
    expect(anyPriorIndex(new Set([2]), 1)).toBe(false);
    expect(anyPriorIndex(new Set([1]), 1)).toBe(false);
  });
});

describe("initialStepMotion", () => {
  it("idle snaps open with no motion flags", () => {
    expect(
      initialStepMotion({
        streaming: false,
        status: "done",
        priorWillHold: false,
        priorWillComplete: false,
        prefersReducedMotion: false,
      }),
    ).toEqual({
      holding: false,
      queued: false,
      entering: false,
      expandOpen: true,
    });
  });

  it("queues behind prior settle", () => {
    expect(
      initialStepMotion({
        streaming: true,
        status: "done",
        priorWillHold: true,
        priorWillComplete: false,
        prefersReducedMotion: false,
      }),
    ).toEqual({
      holding: false,
      queued: true,
      entering: false,
      expandOpen: false,
    });
  });

  it("holds instant-done when first in line", () => {
    expect(
      initialStepMotion({
        streaming: true,
        status: "done",
        priorWillHold: false,
        priorWillComplete: false,
        prefersReducedMotion: false,
      }),
    ).toEqual({
      holding: true,
      queued: false,
      entering: true,
      expandOpen: true,
    });
  });

  it("skips enter under reduced motion", () => {
    expect(
      initialStepMotion({
        streaming: true,
        status: "active",
        priorWillHold: false,
        priorWillComplete: false,
        prefersReducedMotion: true,
      }).entering,
    ).toBe(false);
  });
});
