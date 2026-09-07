/**
 * CONSUMER_TREATY slug: `runBusyTask hang forever (no timeout/signal)`
 * Sandbox: #sandbox-busy-task-timeout under #busy-paint
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "runBusyTask hang forever (no timeout/signal)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: timeoutMs clears BusyScrim after hang`, async ({ page }) => {
  await openGlobalsDemo(page, "busy-paint", "timeout");
  const host = page.locator("#sandbox-busy-task-timeout");
  await expect(host).toBeVisible();

  await host.getByRole("button", { name: /timeoutMs clears hang|timeoutMs 清挂起/ }).click();

  const scrim = page.locator(".fynns-busy-scrim");
  await expect(scrim).toBeVisible({ timeout: 2000 });
  await expect(scrim).toBeHidden({ timeout: 5000 });
  await expect(host.locator(".fynns-table-meta")).toContainText(/timeout/);
});

test(`${SLUG}: busy-paint demo still mounts`, async ({ page }) => {
  await openGlobalsDemo(page, "busy-paint", "timeout");
  await expect(globalsDemo(page, "busy-paint")).toBeVisible();
});
