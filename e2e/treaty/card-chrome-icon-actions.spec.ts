/**
 * CONSUMER_TREATY slug:
 * `Card chrome labeled ghost Copy/Save instead of IconButton+Tooltip`
 * Sandbox: #card → #sandbox-card-chrome-icon-actions
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG =
  "Card chrome labeled ghost Copy/Save instead of IconButton+Tooltip";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Card head + Select cluster use IconButton+Tooltip`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "card");
  const demo = globalsDemo(page, "card");
  const host = demo.locator("#sandbox-card-chrome-icon-actions");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const copy = host.getByRole("button", { name: "Copy prompt" });
  const folder = host.getByRole("button", { name: "Open output folder" });
  const save = host.getByRole("button", { name: "Save defaults" });
  await expect(copy).toBeVisible();
  await expect(folder).toBeVisible();
  await expect(save).toBeVisible();

  await expect(copy).toHaveClass(/fynns-btn--icon/);
  await expect(folder).toHaveClass(/fynns-btn--icon/);
  await expect(save).toHaveClass(/fynns-btn--icon/);

  await expect(host.locator(".fynns-btn-label")).toHaveCount(0);
  await expect(host.locator(".fynns-select")).toHaveCount(2);
});
