import { expect, test } from "@playwright/test";
import {
  globalsDemo,
  openGlobalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test("focusing a control inside a collapsed message reveals it", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat", "chat");
  const message = globalsDemo(page, "chat")
    .locator(".fynns-chat-message--assistant")
    .filter({ has: page.locator(".fynns-chat-message-collapse-toggle") })
    .first();
  const toggle = message.locator(".fynns-chat-message-collapse-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await message.locator(".fynns-code-block-copy button").first().focus();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(message.locator(".fynns-chat-message-body")).not.toHaveClass(
    /fynns-chat-message-body--collapsed/,
  );
});
