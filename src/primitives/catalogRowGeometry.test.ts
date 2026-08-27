import { createElement, Fragment, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { trailingIsRowAction } from "./catalogRowGeometry";

function NamedIcon() {
  return createElement("svg");
}
NamedIcon.displayName = "ChevronRightIcon";

function NamedIconButton(props: { children?: ReactNode }) {
  return createElement("button", { type: "button", ...props });
}
NamedIconButton.displayName = "IconButton";

function AnonymousWrap(props: { children?: ReactNode }) {
  return createElement(Fragment, null, props.children);
}

describe("trailingIsRowAction", () => {
  it("keeps plain text and numbers inside the row", () => {
    expect(trailingIsRowAction("meta")).toBe(false);
    expect(trailingIsRowAction(42)).toBe(false);
    expect(trailingIsRowAction(null)).toBe(false);
  });

  it("keeps named *Icon glyphs and svg leaves inside", () => {
    expect(trailingIsRowAction(createElement(NamedIcon))).toBe(false);
    expect(
      trailingIsRowAction(createElement("svg", null, createElement("path"))),
    ).toBe(false);
    expect(
      trailingIsRowAction(createElement("span", null, createElement(NamedIcon))),
    ).toBe(false);
  });

  it("forces IconButton / Button / cluster / native button outside", () => {
    expect(trailingIsRowAction(createElement(NamedIconButton))).toBe(true);
    expect(
      trailingIsRowAction(createElement("button", { type: "button" }, "Go")),
    ).toBe(true);
    expect(
      trailingIsRowAction(
        createElement("div", { className: "fynns-control-cluster" }, "x"),
      ),
    ).toBe(true);
    expect(
      trailingIsRowAction(
        createElement("span", { className: "fynns-btn fynns-btn--ghost" }, "x"),
      ),
    ).toBe(true);
  });

  it("unwraps Fragment / anonymous wrappers to inspect children", () => {
    expect(
      trailingIsRowAction(
        createElement(Fragment, null, createElement(NamedIcon)),
      ),
    ).toBe(false);
    expect(
      trailingIsRowAction(
        createElement(AnonymousWrap, null, createElement(NamedIconButton)),
      ),
    ).toBe(true);
  });

  it("treats unknown component names as outside (safe nesting)", () => {
    function Mystery() {
      return createElement("div");
    }
    expect(trailingIsRowAction(createElement(Mystery))).toBe(true);
  });
});
