/** CONSUMER_TREATY: completed thinking stays available; trigger width is label-owned. */
import { expect, test } from "@playwright/test";
import {
  globalsDemo,
  openGlobalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test("thinking survives completion and chevron ignores body/answer length", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "thinking", "thinking");
  const demo = globalsDemo(page, "thinking");
  const messages = demo.locator(".fynns-chat-message--assistant");
  await expect(messages).toHaveCount(2);
  const first = messages.nth(0).locator(".fynns-chat-thinking");
  const long = messages.nth(1).locator(".fynns-chat-thinking");

  const firstChevron = await first.locator(".fynns-chat-thinking-chevron").boundingBox();
  const longChevron = await long.locator(".fynns-chat-thinking-chevron").boundingBox();
  expect(firstChevron).toBeTruthy();
  expect(longChevron).toBeTruthy();
  expect(Math.abs(firstChevron!.x - longChevron!.x)).toBeLessThan(2);

  await demo.getByRole("button", { name: "Simulate agent run" }).click();
  await expect(first.locator(".fynns-chat-thinking-trigger")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(first).toHaveAttribute("data-streaming", "true");
  await expect(first).not.toHaveAttribute("data-streaming", "true", {
    timeout: 10_000,
  });
  await expect(first.locator(".fynns-chat-thinking-trigger")).toBeVisible();
  await expect(first.locator(".fynns-chat-thinking-trigger")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await first.locator(".fynns-chat-thinking-trigger").click();
  await expect(first.locator(".fynns-chat-thinking-trigger")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(first.locator(".fynns-chat-thinking-body")).toContainText(
    "Checked naming",
  );
});
