import { test, expect, type Locator } from "@playwright/test";
import { openGlobalsDemo, globalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

async function rowBounds(skeleton: Locator) {
  return skeleton.evaluate(el => {
    const root = el.getBoundingClientRect();
    const bars = Array.from(el.querySelectorAll(".fynns-loading-skeleton-bar"));
    return {
      height: root.height,
      width: root.width,
      count: bars.length,
      firstY: bars[0].getBoundingClientRect().top - root.top,
      lastBottom: bars.at(-1)!.getBoundingClientRect().bottom - root.top,
      rowHeight: bars[0].getBoundingClientRect().height,
      contained: bars.every(bar => {
        const box = bar.getBoundingClientRect();
        return box.left >= root.left - 1 && box.right <= root.right + 1
          && box.top >= root.top - 1 && box.bottom <= root.bottom + 1;
      }),
    };
  });
}

test("bare Chat cold-start preserves inset and fills tall and short panes with thick text rows", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const demo = globalsDemo(page, "busy-region");
  const stage = demo.locator("#sandbox-loading-chat-pane");
  const region = stage.locator(".fynns-busy-region");
  const skeleton = region.locator(".fynns-loading-skeleton--text");
  await expect(skeleton).toBeVisible();
  await expect.poll(async () => (await rowBounds(skeleton)).count).toBeGreaterThan(12);
  const inset = await region.evaluate(el => {
    const box = el.getBoundingClientRect();
    const body = el.querySelector(".fynns-loading-skeleton")!.getBoundingClientRect();
    return { left: body.left - box.left, top: body.top - box.top,
      right: box.right - body.right, bottom: box.bottom - body.bottom };
  });
  for (const side of Object.values(inset)) expect(side).toBeGreaterThanOrEqual(20);
  let rows = await rowBounds(skeleton);
  expect(rows.rowHeight).toBeGreaterThanOrEqual(20);
  expect(rows.firstY).toBeLessThanOrEqual(1);
  expect(Math.abs(rows.lastBottom - rows.height)).toBeLessThanOrEqual(1);
  expect(rows.contained).toBe(true);
  const tallCount = rows.count;
  await stage.evaluate(el => { (el as HTMLElement).style.height = "300px"; });
  await expect.poll(async () => (await rowBounds(skeleton)).count).toBeLessThan(tallCount);
  rows = await rowBounds(skeleton);
  expect(rows.contained).toBe(true);
  expect(Math.abs(rows.lastBottom - rows.height)).toBeLessThanOrEqual(1);
  await expect(region.locator(".fynns-busy-message, .fynns-circular-progress")).toHaveCount(0);
  await expect(region.getByRole("status", { name: "Loading section" })).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => skeleton.locator(".fynns-loading-skeleton-bar").first()
    .evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await demo.getByRole("button", { name: "Clear fill busy", exact: true }).click();
  await expect(stage.locator(".fynns-chat-thread")).toBeVisible();
  await expect(skeleton).toHaveCount(0);
});

test("ChatThread.empty keeps its own inset and gives the skeleton the remaining thread height", async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const stage = globalsDemo(page, "busy-region").locator("#sandbox-loading-chat-thread");
  const skeleton = stage.locator(".fynns-loading-skeleton--text");
  await expect(skeleton).toBeVisible();
  await expect.poll(async () => (await rowBounds(skeleton)).height).toBeGreaterThan(300);
  const placement = await skeleton.evaluate(el => {
    const pane = el.closest(".fynns-chat-thread")!.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const overlay = el.closest(".fynns-busy-region-overlay")!;
    return { left: box.left - pane.left, right: pane.right - box.right,
      top: box.top - pane.top, inset: parseFloat(getComputedStyle(overlay).paddingLeft) };
  });
  expect(placement.left).toBeGreaterThanOrEqual(20);
  expect(placement.right).toBeGreaterThanOrEqual(20);
  expect(placement.top).toBeGreaterThan(0);
  expect(placement.inset).toBe(0);
  expect((await rowBounds(skeleton)).contained).toBe(true);
  await stage.evaluate(el => { (el as HTMLElement).style.width = "240px"; });
  expect((await rowBounds(skeleton)).contained).toBe(true);
});
