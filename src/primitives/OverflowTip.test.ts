import { createElement, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { overflowTipText } from "./OverflowTip";

describe("overflowTipText", () => {
  it("returns strings and numbers", () => {
    expect(overflowTipText("hello")).toBe("hello");
    expect(overflowTipText(42)).toBe("42");
  });

  it("unwraps a single text element (mono / consumer span)", () => {
    expect(
      overflowTipText(createElement("span", { className: "mono" }, "model-id")),
    ).toBe("model-id");
  });

  it("unwraps Fragments and nested single-child wrappers", () => {
    expect(overflowTipText(createElement(Fragment, null, "path/a"))).toBe(
      "path/a",
    );
    expect(
      overflowTipText(
        createElement(
          Fragment,
          null,
          createElement("span", { className: "mono" }, "nested"),
        ),
      ),
    ).toBe("nested");
    expect(
      overflowTipText(
        createElement(
          "span",
          null,
          createElement("span", { className: "mono" }, "deep"),
        ),
      ),
    ).toBe("deep");
  });

  it("skips multi-child nodes and uses fallback", () => {
    expect(
      overflowTipText(
        createElement("span", null, "a", createElement("em", null, "b")),
      ),
    ).toBeNull();
    expect(
      overflowTipText(
        createElement("span", null, "a", createElement("em", null, "b")),
        "fallback",
      ),
    ).toBe("fallback");
  });
});
