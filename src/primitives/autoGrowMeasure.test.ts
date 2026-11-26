import { describe, expect, it } from "vitest";
import {
  captureScrollOffsets,
  measureCollapsedHeight,
  measureContentHeight,
} from "./autoGrowMeasure";

function mountField() {
  const scroller = document.createElement("div");
  const field = document.createElement("textarea");
  scroller.append(field);
  document.body.append(scroller);
  return { scroller, field };
}

describe("autoGrow measurement keeps the page still", () => {
  it("restores ancestor scroll offsets that the collapsed probe clamped", () => {
    const { scroller, field } = mountField();
    scroller.scrollTop = 640;

    const measured = measureCollapsedHeight(field, () => {
      // The collapsed probe shrinks the host, so the browser clamps the
      // ancestor offsets while the probe is live.
      scroller.scrollTop = 0;
      return 128;
    });

    expect(measured).toBe(128);
    expect(scroller.scrollTop).toBe(640);
  });

  it("restores the field's own scroll offset and inline height", () => {
    const { scroller, field } = mountField();
    field.style.height = "300px";
    field.scrollTop = 120;
    scroller.scrollTop = 240;

    const measured = measureCollapsedHeight(field, (node) => {
      node.scrollTop = 0;
      scroller.scrollTop = 0;
      return 96;
    });

    expect(measured).toBe(96);
    expect(field.style.height).toBe("300px");
    expect(field.scrollTop).toBe(120);
    expect(scroller.scrollTop).toBe(240);
  });

  it("leaves an unscrolled page untouched", () => {
    const { scroller, field } = mountField();

    const measured = measureCollapsedHeight(field, () => 42);

    expect(measured).toBe(42);
    expect(scroller.scrollTop).toBe(0);
    expect(field.style.height).toBe("");
  });

  it("captures offsets from the field up to the scroll host", () => {
    const { scroller, field } = mountField();
    scroller.scrollTop = 10;
    field.scrollTop = 20;

    const restore = captureScrollOffsets(field);
    scroller.scrollTop = 0;
    field.scrollTop = 0;

    restore();

    expect(scroller.scrollTop).toBe(10);
    expect(field.scrollTop).toBe(20);
  });
});

describe("autoGrow measurement under an IME composition", () => {
  it("never collapses the field while a composition is active", () => {
    const { field } = mountField();
    field.style.height = "300px";

    const measured = measureContentHeight(field, 2, true);

    expect(measured).toBe(field.scrollHeight + 2);
    expect(field.style.height).toBe("300px");
  });

  it("collapses and restores the field when no composition is active", () => {
    const { field } = mountField();
    field.style.height = "300px";

    const measured = measureContentHeight(field, 2, false);

    expect(measured).toBe(field.scrollHeight + 2);
    expect(field.style.height).toBe("300px");
  });
});
