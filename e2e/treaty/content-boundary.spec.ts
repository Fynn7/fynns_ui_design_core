import { test, expect } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => { await resetSandboxSession(page); });

for (const theme of ["dark", "light"] as const) {
  test(`${theme}: drawer content starts 24dp below tools in every loading state`, async ({ page }) => {
    await page.setViewportSize({ width: theme === "dark" ? 1280 : 600, height: 900 });
    await openGlobalsDemo(page, "busy-region", "BusyRegion");
    await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
    const demo = globalsDemo(page, "busy-region").locator("#sandbox-loading-content-boundary");
    const tools = demo.locator("#sandbox-loading-content-boundary-tools");
    const boundary = demo.locator(".fynns-nav-drawer-body > .fynns-content-boundary");
    const expected = await demo.evaluate(el =>
      parseFloat(getComputedStyle(el).getPropertyValue("--fynns-layout-content-boundary-gap")) *
      parseFloat(getComputedStyle(document.documentElement).fontSize));

    for (const [name, root] of [
      ["Loading", ".fynns-busy-region"],
      ["Ready", ".fynns-nav-drawer-group"],
      ["Empty", ".fynns-empty-state"],
      ["Error", ".fynns-inline-alert"],
    ] as const) {
      await demo.getByRole("button", { name, exact: true }).click();
      await expect(boundary).toHaveCount(1);
      await expect(boundary).toHaveClass(new RegExp(root.slice(1)));
      const toolBox = await tools.boundingBox();
      const contentBox = await boundary.boundingBox();
      expect(toolBox).not.toBeNull();
      expect(contentBox).not.toBeNull();
      expect(Math.abs(contentBox!.y - (toolBox!.y + toolBox!.height) - expected)).toBeLessThanOrEqual(1);
      if (name === "Loading") {
        const firstBar = boundary.locator(".fynns-loading-skeleton-bar").first();
        await expect(firstBar).toBeVisible();
        const barBox = await firstBar.boundingBox();
        expect(barBox).not.toBeNull();
        expect(barBox!.y - (toolBox!.y + toolBox!.height)).toBeGreaterThanOrEqual(expected - 1);
      }
    }
  });
}
