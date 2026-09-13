/**
 * Truncated Card table-meta / chrome string (≥ **0.5.241**): ellipsis + Tooltip
 * (OverflowTip). Sandbox: #sandbox-card-table-meta-ellipsis under #card
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

/** React Tooltip listens via mouseover; bare mouseenter dispatch is unreliable. */
async function showOverflowTip(
  tipTrigger: import("@playwright/test").Locator,
) {
  await tipTrigger.evaluate((el) => {
    el.dispatchEvent(
      new MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  });
}

test("Card table-meta shows ellipsis and Tooltip with full text", async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "card");
  const host = page.locator("#sandbox-card-table-meta-ellipsis");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toBeVisible();

  const tipTrigger = host
    .locator(
      ".fynns-table-meta .fynns-overflow-tip, .fynns-table-meta .fynns-tooltip-trigger",
    )
    .first();
  const label = host.locator(".fynns-table-meta .fynns-overflow-tip-label").first();
  await expect(label).toBeVisible();
  await expect(label).toHaveAttribute("data-overflowing", "true", {
    timeout: 8_000,
  });

  await showOverflowTip(tipTrigger);
  const tip = page.locator(".fynns-tooltip[role='tooltip']");
  await expect(tip).toBeVisible({ timeout: 8_000 });
  await expect(tip).toContainText(/long-branch-name|sample-org/);
});

test("Card string title uses OverflowTip wrapper", async ({ page }) => {
  await openGlobalsDemo(page, "card", "card");
  const demo = globalsDemo(page, "card");
  const host = demo.locator("#sandbox-card-table-meta-ellipsis");
  await host.scrollIntoViewIfNeeded();
  const titleTip = host.locator(".fynns-card-title .fynns-overflow-tip").first();
  await expect(titleTip).toBeVisible();
});
