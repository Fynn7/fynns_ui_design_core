import { test, expect } from "@playwright/test";
import { openLayoutsDemo, layoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => resetSandboxSession(page));

test("active chat menu reserves the corner and exports through a keyboard submenu", async ({ page }) => {
  await openLayoutsDemo(page, "chat-product");
  const demo = layoutsDemo(page, "chat-product");
  const more = demo.getByRole("button", { name: "Chat session options", exact: true });
  await expect(more).toBeDisabled();
  await demo.locator("textarea").fill("A sample conversation");
  await demo.locator("textarea").press("Enter");
  await expect(more).toBeEnabled();
  const chatBox = await demo.locator(".fynns-chat").boundingBox();
  const moreBox = await more.boundingBox();
  expect(moreBox!.y - chatBox!.y).toBeCloseTo(16, 0);
  expect(chatBox!.x + chatBox!.width - moreBox!.x - moreBox!.width).toBeCloseTo(16, 0);
  const before = await demo.locator(".fynns-chat-thread").boundingBox();
  await more.focus();
  await more.press("ArrowDown");
  const exportItem = page.getByRole("menuitem", { name: "Export chat as…", exact: true });
  await expect(exportItem).toBeFocused();
  await exportItem.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "Markdown (.md)", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const downloadPromise = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("chat-alpha.json");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(more).toBeFocused();
  expect(await demo.locator(".fynns-chat-thread").boundingBox()).toEqual(before);

  await more.click();
  await exportItem.click();
  await demo.getByRole("button", { name: "Sample session B", exact: true }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await more.click();
  await exportItem.click();
  const nextDownload = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Markdown (.md)", exact: true }).click();
  expect((await nextDownload).suggestedFilename()).toBe("chat-beta.md");
});

test("aside chat uses the same corner shell without covering the message log", async ({ page }) => {
  await openLayoutsDemo(page, "chat-aside");
  const demo = layoutsDemo(page, "chat-aside");
  await demo.locator("textarea").fill("A sample aside conversation");
  await demo.locator("textarea").press("Enter");
  const more = demo.getByRole("button", { name: "Chat session options", exact: true });
  await more.click();
  await page.getByRole("menuitem", { name: "Export chat as…", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "JSON (.json)", exact: true })).toBeVisible();
  const moreBox = await more.boundingBox();
  const threadBox = await demo.locator(".fynns-chat-thread").boundingBox();
  expect(threadBox!.y).toBeGreaterThanOrEqual(moreBox!.y + moreBox!.height);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
});
