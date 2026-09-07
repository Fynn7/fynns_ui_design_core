/**
 * CONSUMER_TREATY slug: `pane cold-start hang without error surface`
 * Sandbox: #sandbox-pane-load-error under #busy-region
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "pane cold-start hang without error surface";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: fail clears fill and shows InlineAlert + Retry`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "busy-region", "pane-load");
  const host = page.locator("#sandbox-pane-load-error");
  await expect(host).toBeVisible();

  await page
    .getByRole("button", { name: /Simulate pane fail|模拟栏目失败/ })
    .click();

  await expect(host.locator(".fynns-busy-region")).toHaveCount(0);
  await expect(host.locator(".fynns-inline-alert")).toBeVisible();
  await expect(
    host.getByRole("button", { name: /Retry|重试/ }),
  ).toBeVisible();
});

test(`${SLUG}: cold shows BusyRegion fill`, async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "pane-load");
  const host = page.locator("#sandbox-pane-load-error");
  await expect(host).toBeVisible();

  await page
    .getByRole("button", { name: /Simulate pane hang|模拟栏目挂起/ })
    .click();

  await expect(host.locator(".fynns-busy-region")).toBeVisible();
});

test(`${SLUG}: busy-region demo still mounts`, async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "pane-load");
  await expect(globalsDemo(page, "busy-region")).toBeVisible();
});
