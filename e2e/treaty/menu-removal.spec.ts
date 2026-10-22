import { expect, test } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "menu");
});

for (const nested of [false, true]) {
  test(`trash removes rows and keeps ${nested ? "nested menus" : "the menu"} open`, async ({ page }) => {
    const demo = page.locator("#sandbox-menu-row-action");
    const trigger = demo.getByRole("button", {
      name: nested ? "Actions menu" : "Session volume menu with row actions", exact: true,
    });
    await trigger.click();
    if (nested) {
      await page.getByRole("menuitem", { name: "Sample volume submenu", exact: true }).press("ArrowRight");
    }
    const menu = page.getByRole("menu", {
      name: nested ? "Sample volume submenu" : "Session volume menu with row actions", exact: true,
    });
    for (const label of ["C", "B", "A"]) {
      const row = menu.getByRole("menuitem", { name: `Volume sample ${label}`, exact: true });
      await row.hover();
      await menu.getByRole("button", { name: `Delete sample volume: Volume sample ${label}`, exact: true }).click();
      await expect(row).toHaveCount(0);
      // Allow hover-close and flyout-exit timers to reveal accidental dismissal.
      await page.waitForTimeout(400);
      await expect(menu).toBeVisible();
      await expect(menu).toHaveAttribute("data-state", "open");
      if (nested) await expect(trigger).toHaveAttribute("aria-expanded", "true");
    }
    await expect(menu.getByText("No sample volumes", { exact: true })).toBeVisible();
    await expect(menu).toBeFocused();
    await menu.press("Escape");
    await expect(menu).not.toBeVisible();
  });
}
