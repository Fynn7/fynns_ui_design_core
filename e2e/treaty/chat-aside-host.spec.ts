/**
 * CONSUMER_TREATY slug: `chat aside host wrong tree`
 * Live: #layouts-demo-chat-aside
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "chat aside host wrong tree";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: EndAside hosts same new-chat landing as session host`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "chat-aside");
  const demo = layoutsDemo(page, "chat-aside");
  await expect(demo).toBeVisible();

  await expect(
    demo.getByText(/What can I help with|有什么可以帮你/i).first(),
  ).toBeVisible();
  await expect(
    demo.locator(".fynns-chat-host--fill .sandbox-chat-starters .fynns-surface--soft"),
  ).toHaveClass(/fynns-surface--interactive/);
  await expect(
    demo.locator(
      ".fynns-chat-host--fill .sandbox-chat-empty-composer .fynns-chat-composer-shell",
    ),
  ).toBeVisible();
  await expect(demo.locator(".fynns-chat.sandbox-chat--landing")).toBeVisible();
  await expect(demo.locator(".fynns-end-aside")).toBeVisible();
});
