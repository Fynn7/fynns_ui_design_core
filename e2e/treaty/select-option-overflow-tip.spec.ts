/**
 * Truncated Select option (≥ **0.5.240**): ellipsis + Tooltip (OverflowTip).
 * Sandbox: #select narrow host
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test("Select long option shows ellipsis and Tooltip with full text", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  const narrow = demo.locator(".sandbox-select-narrow-host .fynns-select").first();
  await narrow.scrollIntoViewIfNeeded();
  await narrow.locator("button.fynns-select-trigger").first().click();
  await expect(narrow).toHaveAttribute("data-expanded", "true");

  const longOpt = page
    .locator(".fynns-select-menu[role='listbox'] [role='option']")
    .filter({ hasText: /sample-workspace|示例工作区/ })
    .first();
  await expect(longOpt).toBeVisible();

  const tipTrigger = longOpt.locator(".fynns-overflow-tip, .fynns-tooltip-trigger").first();
  await expect(tipTrigger).toBeVisible();

  const label = longOpt.locator(".fynns-overflow-tip-label").first();
  await expect(async () => {
    const overflow = await label.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(overflow).toBe(true);
  }).toPass({ timeout: 5_000 });

  await tipTrigger.hover();
  const tip = page.locator(".fynns-tooltip[role='tooltip']");
  await expect(tip).toBeVisible({ timeout: 5_000 });
  await expect(tip).toContainText(/sample-workspace|示例工作区/);
});
