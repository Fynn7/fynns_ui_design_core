/**
 * CONSUMER_TREATY slug: `NavDrawer footer Avatar initials ignore visible label`
 * AGENTS: footer Avatar name = visible account label (multi-word → AH).
 * Sandbox: #layouts-demo-shell (`Sample user` → `SU`).
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "NavDrawer footer Avatar initials ignore visible label";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Sample user → SU`, async ({ page }) => {
  await openLayoutsDemo(page, "shell");
  const demo = layoutsDemo(page, "shell");
  await expect(demo).toBeVisible();

  const account = demo.locator(".fynns-nav-drawer-footer-account");
  await expect(account).toBeVisible();
  await expect(account.locator(".fynns-nav-drawer-footer-account-label")).toHaveText(
    "Sample user",
  );
  await expect(account.locator(".fynns-avatar")).toHaveText("SU");
  await expect(account.locator(".fynns-avatar")).toHaveAttribute(
    "aria-label",
    "Sample user",
  );
});
