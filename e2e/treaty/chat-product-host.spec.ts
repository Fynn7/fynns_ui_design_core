/**
 * CONSUMER_TREATY slug: `chat product / session host wrong tree`
 * Live: #layouts-demo-chat-product
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "chat product / session host wrong tree";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: composite host shows New chat, empty sessions, starters, composer`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "chat-product");
  const demo = layoutsDemo(page, "chat-product");
  await expect(demo).toBeVisible();

  await expect(
    demo.getByRole("button", { name: /New chat|新会话/i }),
  ).toBeVisible();
  await expect(demo.getByText(/No conversations|暂无会话/i).first()).toBeVisible();
  await expect(
    demo.getByText(/What can I help with|有什么可以帮你/i).first(),
  ).toBeVisible();
  await expect(
    demo.locator(".sandbox-chat-starters .fynns-surface--soft"),
  ).toHaveClass(/fynns-surface--interactive/);
  await expect(demo.locator(".fynns-chat.sandbox-chat--landing")).toBeVisible();
  await expect(
    demo.locator(".sandbox-chat-empty-composer .fynns-chat-composer-shell"),
  ).toBeVisible();
  // topBar=null must still fill the stage (not leave body in a half-height auto row).
  const bodyBox = await demo
    .locator(".fynns-clipped-nav-shell-body")
    .boundingBox();
  const stageBox = await demo.locator(".sandbox-chat-product-stage").boundingBox();
  expect(bodyBox).toBeTruthy();
  expect(stageBox).toBeTruthy();
  expect(bodyBox!.height).toBeGreaterThan(stageBox!.height * 0.85);
});
