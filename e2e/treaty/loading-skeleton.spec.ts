import { test, expect } from "@playwright/test";
import { openGlobalsDemo, globalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("unknown waits show a theme-aware sweep skeleton that respects reduced motion", async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const demo = globalsDemo(page, "busy-region");
  const skeleton = demo.locator("#sandbox-loading-skeleton .fynns-loading-skeleton--text").first();
  const bar = skeleton.locator(".fynns-loading-skeleton-bar").first();
  await expect(bar).toBeVisible();
  await expect(skeleton).toHaveAttribute("role", "status");
  await expect.poll(() => bar.evaluate(el => getComputedStyle(el).animationName))
    .toBe("fynns-chat-thinking-shimmer");
  const colors = await bar.evaluate(el => {
    const css = getComputedStyle(el);
    return { base: css.backgroundColor };
  });
  expect(colors.base).not.toBe("rgba(0, 0, 0, 0)");
  await page.evaluate(() => document.documentElement.setAttribute("data-fynns-theme", "light"));
  await expect.poll(() => bar.evaluate(el => getComputedStyle(el).backgroundColor))
    .not.toBe(colors.base);
  await expect(bar).toBeVisible();
  const region = demo.locator("#sandbox-loading-skeleton .fynns-busy-region");
  await expect(region.locator(".fynns-loading-skeleton-bar")).toHaveCount(5);
  await expect(region.locator(".fynns-circular-progress, .fynns-linear-progress")).toHaveCount(0);
  await expect(region.getByRole("status")).toHaveCount(1);

  // Force the same narrow host used by drawer / inspector consumers.
  await skeleton.evaluate(el => { (el as HTMLElement).style.width = "160px"; });
  const contained = await skeleton.evaluate(el => {
    const bounds = el.getBoundingClientRect();
    return Array.from(el.querySelectorAll(".fynns-loading-skeleton-bar")).every(bar =>
      bar.getBoundingClientRect().right <= bounds.right + 1);
  });
  expect(contained).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => bar.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(bar).toBeVisible();
});

test("button loading has rectangular placeholders without rotation", async ({ page }) => {
  await openGlobalsDemo(page, "icon-button", "icon");
  const button = globalsDemo(page, "icon-button")
    .locator("#sandbox-iconbutton-primary-loading .fynns-btn").first();
  const skeleton = button.locator(".fynns-loading-skeleton--compact");
  await expect(skeleton).toBeVisible();
  await expect(skeleton.locator(".fynns-loading-skeleton-bar")).toHaveCount(3);
  expect(await button.locator(".fynns-loading-spinner-ring").evaluate(el => ({
    animation: getComputedStyle(el).animationName,
    border: getComputedStyle(el).borderTopWidth,
  }))).toEqual({ animation: "none", border: "0px" });
});
