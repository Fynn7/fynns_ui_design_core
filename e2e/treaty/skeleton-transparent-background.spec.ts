import { test, expect, type Locator } from "@playwright/test";
import { openGlobalsDemo, globalsDemo, resetSandboxSession } from "../helpers/sandbox";

async function expectClearLayer(layer: Locator) {
  await expect(layer).toBeVisible();
  const paint = await layer.evaluate(el => {
    const css = getComputedStyle(el);
    return { background: css.backgroundColor, image: css.backgroundImage, blur: css.backdropFilter };
  });
  expect(paint).toEqual({ background: "rgba(0, 0, 0, 0)", image: "none", blur: "none" });
}

test.beforeEach(async ({ page }) => { await resetSandboxSession(page); });

for (const theme of ["dark", "light"]) {
  test(`${theme}: refresh and cold-start skeletons preserve their host background`, async ({ page }) => {
    await openGlobalsDemo(page, "busy-region", "BusyRegion");
    await page.evaluate(theme => document.documentElement.setAttribute("data-fynns-theme", theme), theme);
    const demo = globalsDemo(page, "busy-region");
    const region = demo.locator("#sandbox-loading-skeleton .fynns-busy-region");
    const preview = region.locator("[data-loading-target=preview]");
    await expect(preview).toBeVisible();
    await demo.getByRole("button", { name: "Show busy", exact: true }).click();
    await expect(preview).toBeHidden();
    await expect(region.locator(".fynns-busy-region-content")).toHaveAttribute("inert", "");
    await expectClearLayer(region.locator(".fynns-busy-region-overlay"));
    await expectClearLayer(region.locator(".fynns-loading-skeleton"));
    await expectClearLayer(demo.locator("#sandbox-loading-chat-pane .fynns-busy-region-overlay"));
    const bar = region.locator(".fynns-loading-skeleton-bar");
    await expect(bar).toBeVisible();
    expect(await bar.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectClearLayer(region.locator(".fynns-busy-region-overlay"));
    await expect(bar).toHaveCSS("animation-name", "none");
    await demo.getByRole("button", { name: "Clear busy", exact: true }).click();
    await expect(preview).toBeVisible();
    await expect(region.locator(".fynns-busy-region-overlay")).toHaveCount(0);
  });

  test(`${theme}: blocking content skeleton has no dimming backdrop`, async ({ page }) => {
    await openGlobalsDemo(page, "busy-scrim", "BusyScrim");
    await page.evaluate(theme => document.documentElement.setAttribute("data-fynns-theme", theme), theme);
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await globalsDemo(page, "busy-scrim").getByRole("button", { name: "Show fullscreen content wait (2s)", exact: true }).click();
    const scrim = page.locator(".fynns-busy-scrim--skeleton");
    await expectClearLayer(scrim);
    await expect(scrim).toBeFocused();
    await expect(scrim).toHaveAttribute("aria-modal", "true");
    await expect(scrim.locator(".fynns-loading-skeleton-bar").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(scrim).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectClearLayer(scrim);
    await page.clock.runFor(2100);
    await expect(scrim).toHaveCount(0);
  });
}
