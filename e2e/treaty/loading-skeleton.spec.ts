import { test, expect } from "@playwright/test";
import { openGlobalsDemo, globalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("content skeleton replaces the upcoming preview at the same bounds without loading copy", async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const demo = globalsDemo(page, "busy-region");
  const region = demo.locator("#sandbox-loading-skeleton .fynns-busy-region");
  const preview = region.locator("[data-loading-target=preview]");
  // Clicking the controls can scroll the page. Compare within the content host,
  // so browser scrolling is not mistaken for a placeholder layout shift.
  const previewBounds = await preview.evaluate(el => {
    const box = el.getBoundingClientRect();
    const host = el.closest(".fynns-busy-region")!.getBoundingClientRect();
    return { x: box.x - host.x, y: box.y - host.y, width: box.width, height: box.height };
  });
  await demo.getByRole("button", { name: "Show busy", exact: true }).click();
  const skeleton = region.locator(".fynns-loading-skeleton--block");
  const bar = skeleton.locator(".fynns-loading-skeleton-bar").first();
  await expect(bar).toBeVisible();
  await expect(skeleton).not.toHaveAttribute("role", "status");
  await expect(region.getByRole("status", { name: "Loading section" })).toHaveCount(1);
  await expect(region.locator(".fynns-busy-message")).toHaveCount(0);
  await expect(region.locator(".fynns-loading-skeleton--text, .fynns-loading-skeleton--compact")).toHaveCount(0);
  await expect(preview).toBeHidden();
  const skeletonBounds = await bar.evaluate(el => {
    const box = el.getBoundingClientRect();
    const host = el.closest(".fynns-busy-region")!.getBoundingClientRect();
    return { x: box.x - host.x, y: box.y - host.y, width: box.width, height: box.height };
  });
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(skeletonBounds[key] - previewBounds[key])).toBeLessThanOrEqual(1);
  }
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
  await expect(region.locator(".fynns-loading-skeleton-bar")).toHaveCount(1);
  await expect(region.locator(".fynns-circular-progress, .fynns-linear-progress")).toHaveCount(0);
  await expect(region.getByRole("status")).toHaveCount(1);

  // Force the same narrow host used by drawer / inspector consumers.
  await region.evaluate(el => { (el as HTMLElement).style.width = "160px"; });
  const contained = await skeleton.evaluate(el => {
    const bounds = el.getBoundingClientRect();
    return Array.from(el.querySelectorAll(".fynns-loading-skeleton-bar")).every(bar =>
      bar.getBoundingClientRect().right <= bounds.right + 1);
  });
  expect(contained).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => bar.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(bar).toBeVisible();
  await demo.getByRole("button", { name: "Clear busy", exact: true }).click();
  await expect(preview).toBeVisible();
  await expect(skeleton).toHaveCount(0);
});

test("legacy button loading restores the archived ring with no compact skeleton", async ({ page }) => {
  await openGlobalsDemo(page, "icon-button", "icon");
  const button = globalsDemo(page, "icon-button")
    .locator("#sandbox-iconbutton-primary-loading .fynns-btn").first();
  await expect(button.locator("[data-loading-appearance=archived-ring]")).toBeVisible();
  await expect(button.locator(".fynns-loading-skeleton")).toHaveCount(0);
  const ring = button.locator(".fynns-loading-spinner-ring");
  const appearance = await ring.evaluate(el => ({
    animation: getComputedStyle(el).animationName,
    border: getComputedStyle(el).borderTopWidth,
  }));
  expect(appearance.animation).toBe("fynns-spin");
  expect(parseFloat(appearance.border)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => ring.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
});
