import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"]) {
  test(`one editing toolbar, document menu and continuous inspector (${theme})`, async ({ page }) => {
    await resetSandboxSession(page);
    await page.setViewportSize({ width: 1800, height: 1150 });
    await openLayoutsDemo(page, "canvas-workspace");
    await page.evaluate(theme => document.documentElement.setAttribute("data-fynns-theme", theme), theme);
    const demo = page.locator("#sandbox-canvas-workspace");
    const host = demo.locator(".sandbox-canvas-workspace-host");
    const topBar = host.locator(".fynns-top-app-bar");
    await topBar.getByRole("button", { name: "Inspector", exact: true }).click();
    const stage = host.locator(".fynns-workspace-canvas");
    const aside = host.locator(".fynns-end-aside");
    await expect(aside).toBeVisible();
    await expect(host.getByRole("toolbar")).toHaveCount(1);
    await expect(stage.getByRole("toolbar")).toHaveCount(1);
    await expect(stage.getByRole("button", { name: "Arrange nodes" })).toHaveCount(0);
    await expect(stage.getByRole("button", { name: "Export canvas" })).toHaveCount(0);
    await expect.poll(() => host.evaluate(el => {
      const bar = el.querySelector(".fynns-top-app-bar")!.getBoundingClientRect();
      const canvas = el.querySelector(".fynns-workspace-canvas")!.getBoundingClientRect();
      const aside = el.querySelector(".fynns-end-aside")!.getBoundingClientRect();
      return Math.max(Math.abs(aside.top - bar.bottom), Math.abs(canvas.top - bar.bottom), Math.abs(aside.bottom - canvas.bottom));
    })).toBeLessThan(1);
    // Wait for the width morph before comparing the full rectangles across menu changes.
    await expect.poll(() => aside.evaluate(el => getComputedStyle(el).opacity)).toBe("1");
    await expect.poll(() => host.locator(".fynns-end-aside-track").evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(340);
    const before = { stage: await stage.boundingBox(), aside: await aside.boundingBox() };
    const menu = topBar.getByRole("button", { name: "Canvas menu" });
    await expect(menu).toHaveClass(/fynns-btn--ghost/);
    await expect(menu).toHaveText("");
    await menu.focus();
    await page.keyboard.press("Enter");
    const arrange = page.getByRole("menuitem", { name: "Arrange nodes" });
    await expect(arrange).toBeFocused();
    expect({ stage: await stage.boundingBox(), aside: await aside.boundingBox() }).toEqual(before);
    await page.keyboard.press("Enter");
    await expect(host.locator(".sandbox-canvas-scene")).toHaveAttribute("data-arranged", "true");
    await expect(menu).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Export canvas" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    const copy = page.getByRole("menuitem", { name: "Save a copy" });
    await expect(copy).toBeFocused();
    expect({ stage: await stage.boundingBox(), aside: await aside.boundingBox() }).toEqual(before);
    await page.keyboard.press("Enter");
    await expect(page.locator(".fynns-snackbar")).toContainText("Copy saved");
    await expect(menu).toBeFocused();
    await expect(host.getByRole("toolbar")).toHaveCount(1);
    expect({ stage: await stage.boundingBox(), aside: await aside.boundingBox() }).toEqual(before);
  });
}
