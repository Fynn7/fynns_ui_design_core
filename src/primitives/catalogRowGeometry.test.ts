import { createElement, Fragment, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  trailingIsPinnedInspectorEnd,
  trailingIsRowAction,
} from "./catalogRowGeometry";

function NamedIcon() {
  return createElement("svg");
}
NamedIcon.displayName = "ChevronRightIcon";

function NamedIconButton(props: { children?: ReactNode }) {
  return createElement("button", { type: "button", ...props });
}
NamedIconButton.displayName = "IconButton";

function NamedButton(props: { children?: ReactNode }) {
  return createElement("button", { type: "button", ...props });
}
NamedButton.displayName = "Button";

function NamedSelect() {
  return createElement("div", { className: "fynns-select" });
}
NamedSelect.displayName = "Select";

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
        createElement("div", { className: "fynns-btn fynns-btn--ghost" }, "x"),
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

describe("trailingIsPinnedInspectorEnd", () => {
  it("is false for IconButton-only trailing (overlay reveal)", () => {
    expect(trailingIsPinnedInspectorEnd(createElement(NamedIconButton))).toBe(
      false,
    );
    expect(
      trailingIsPinnedInspectorEnd(
        createElement(
          "div",
          { className: "fynns-control-cluster" },
          createElement(NamedIconButton),
        ),
      ),
    ).toBe(false);
    expect(
      trailingIsPinnedInspectorEnd(
        createElement("span", {
          className: "fynns-btn fynns-btn--icon fynns-btn--ghost",
        }),
      ),
    ).toBe(false);
  });

  it("is true for Select or labeled Button (incl. inside cluster)", () => {
    expect(trailingIsPinnedInspectorEnd(createElement(NamedSelect))).toBe(true);
    expect(trailingIsPinnedInspectorEnd(createElement(NamedButton))).toBe(true);
    expect(
      trailingIsPinnedInspectorEnd(
        createElement(
          "div",
          { className: "fynns-control-cluster" },
          createElement(NamedButton, null, "Assist"),
          createElement(NamedSelect),
        ),
      ),
    ).toBe(true);
    expect(
      trailingIsPinnedInspectorEnd(
        createElement("div", { className: "fynns-btn fynns-btn--tonal" }, "Go"),
      ),
    ).toBe(true);
  });
});
