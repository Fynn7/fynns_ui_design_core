import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readRemPx, resolveLengthPx } from "./layoutMeasure";

type HostStub = {
  clientWidth: number;
  getBoundingClientRect: () => { width: number };
};

function makeHost(fontSizePx: number, widthPx: number): Element {
  const host = {
    clientWidth: widthPx,
    getBoundingClientRect: () => ({ width: widthPx }),
  } as HostStub;
  vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
    () => ({ fontSize: `${fontSizePx}px` }) as CSSStyleDeclaration,
  );
  return host as unknown as Element;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveLengthPx", () => {
  it("parses px", () => {
    const host = makeHost(16, 400);
    expect(resolveLengthPx(host, "24px")).toBe(24);
    expect(resolveLengthPx(host, " 12.5px ")).toBe(12.5);
  });

  it("parses rem against host font-size", () => {
    const host = makeHost(20, 400);
    expect(resolveLengthPx(host, "2rem")).toBe(40);
  });

  it("parses % against host width", () => {
    const host = makeHost(16, 200);
    expect(resolveLengthPx(host, "50%")).toBe(100);
  });

  it("resolves clamp(min, preferred, max)", () => {
    const host = makeHost(16, 400);
    expect(resolveLengthPx(host, "clamp(10px, 50%, 100px)")).toBe(100);
    expect(resolveLengthPx(host, "clamp(10px, 5%, 100px)")).toBe(20);
    expect(resolveLengthPx(host, "clamp(50px, 5%, 100px)")).toBe(50);
  });

  it("returns 0 for empty / invalid px", () => {
    const host = makeHost(16, 400);
    expect(resolveLengthPx(host, "")).toBe(0);
    expect(resolveLengthPx(host, "px")).toBe(0);
  });
});

describe("readRemPx", () => {
  it("multiplies rem by host font-size", () => {
    const host = makeHost(18, 300);
    expect(readRemPx(host, 2)).toBe(36);
  });
});
