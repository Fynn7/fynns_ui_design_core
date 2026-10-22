import { expect, test } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"]) {
for (const width of [1280, 390]) {
  test(`media and wrapped copy retain content rhythm at ${width}px in ${theme}`, async ({ page }) => {
    await resetSandboxSession(page);
    await page.setViewportSize({ width, height: 900 });
    await openGlobalsDemo(page, "rhythm");
    await page.evaluate(mode => document.documentElement.setAttribute("data-fynns-theme", mode), theme);
    const flow = page.locator("#sandbox-content-rhythm");
    await flow.scrollIntoViewIfNeeded();
    await expect(flow).toBeVisible();
    const metrics = await flow.evaluate(root => {
      const gallery = root.querySelector<HTMLElement>(".fynns-media-gallery")!;
      const figures = [...gallery.querySelectorAll<HTMLElement>("figure")];
      const boxes = figures.map(el => el.getBoundingClientRect());
      const rowTops = [...new Set(boxes.map(box => Math.round(box.top)))].sort((a, b) => a - b);
      const children = [...root.children];
      return {
        captionGaps: figures.map(el => el.querySelector("figcaption")!.getBoundingClientRect().top - el.querySelector("svg")!.getBoundingClientRect().bottom),
        lineRatios: [...root.querySelectorAll("p, figcaption")].map(el => {
          const cs = getComputedStyle(el);
          return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
        }),
        blockGaps: children.slice(1).map((el, i) => el.getBoundingClientRect().top - children[i].getBoundingClientRect().bottom),
        rowGaps: rowTops.slice(1).map((top, i) => top - Math.max(...boxes.filter(box => Math.round(box.top) === rowTops[i]).map(box => box.bottom))),
        columnGaps: boxes.slice(1).flatMap((box, i) => Math.abs(box.top - boxes[i].top) < 1 ? [box.left - boxes[i].right] : []),
        wrapped: [...root.querySelectorAll("p, figcaption")].some(el => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5),
        overflow: gallery.scrollWidth > gallery.clientWidth + 1,
      };
    });
    for (const gap of metrics.captionGaps) expect(gap).toBeCloseTo(8, 1);
    for (const gap of [...metrics.blockGaps, ...metrics.rowGaps, ...metrics.columnGaps]) expect(Math.abs(gap - 16)).toBeLessThan(1);
    for (const ratio of metrics.lineRatios) expect(ratio).toBeCloseTo(1.45, 2);
    expect(metrics.rowGaps.length).toBeGreaterThan(0);
    expect(metrics.wrapped).toBe(true);
    expect(metrics.overflow).toBe(false);
  });
}
}
