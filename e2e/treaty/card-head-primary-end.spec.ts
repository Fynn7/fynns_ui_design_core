/**
 * CONSUMER_TREATY slug:
 * `Card head primary IconButton leftmost in control-cluster`
 * Sandbox: #card → #sandbox-card-head-primary-end
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Card head primary IconButton leftmost in control-cluster";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: primary IconButton is LTR last in Card actions`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "primary end");
  const demo = globalsDemo(page, "card");
  const host = demo.locator("#sandbox-card-head-primary-end");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const cluster = host.locator(".fynns-card-actions .fynns-control-cluster");
  await expect(cluster).toBeVisible();

  const buttons = cluster.locator("button.fynns-btn");
  await expect(buttons).toHaveCount(3);

  await expect(buttons.nth(0)).toHaveClass(/fynns-btn--ghost/);
  await expect(buttons.nth(1)).toHaveClass(/fynns-btn--ghost/);
  await expect(buttons.nth(2)).toHaveClass(/fynns-btn--primary/);

  const order = await buttons.evaluateAll((els) =>
    els.map((el) => ({
      aria: el.getAttribute("aria-label"),
      primary: el.classList.contains("fynns-btn--primary"),
    })),
  );
  expect(order[0]?.primary).toBe(false);
  expect(order[1]?.primary).toBe(false);
  expect(order[2]?.primary).toBe(true);
  expect(order[2]?.aria).toMatch(/Pack|打包/);
});
