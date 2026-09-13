/**
 * Truncated List run-summary `__grow` model (≥ **0.5.241**): OverflowTip at
 * call site. Sandbox: #sandbox-list-run-summary-narrow under #list
 */
import { test, expect } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test("List run-summary long model shows OverflowTip full text", async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "list");
  const host = page.locator("#sandbox-list-run-summary-narrow");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toBeVisible();

  const grow = host
    .locator(".fynns-control-cluster__grow")
    .filter({ hasText: /long-overflow/ })
    .first();
  await grow.scrollIntoViewIfNeeded();

  const tipTrigger = grow
    .locator(".fynns-overflow-tip, .fynns-tooltip-trigger")
    .first();
  const label = grow.locator(".fynns-overflow-tip-label").first();
  await expect(label).toBeVisible();
  await expect(label).toHaveAttribute("data-overflowing", "true", {
    timeout: 8_000,
  });

  await tipTrigger.evaluate((el) => {
    el.dispatchEvent(
      new MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  });
  const tip = page.locator(".fynns-tooltip[role='tooltip']");
  await expect(tip).toBeVisible({ timeout: 8_000 });
  await expect(tip).toContainText(/long-overflow/);
});
