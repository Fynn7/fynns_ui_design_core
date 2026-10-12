import { test, expect } from "@playwright/test";
import { layoutsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => resetSandboxSession(page));

test("chat menu hover and nested export never reactivate the More tooltip", async ({ page }) => {
  await openLayoutsDemo(page, "chat-product");
  const demo = layoutsDemo(page, "chat-product");
  await demo.locator("textarea").fill("Sample conversation");
  await demo.locator("textarea").press("Enter");
  const more = demo.getByRole("button", { name: "Chat session options", exact: true });
  const triggerTip = page.getByRole("tooltip").filter({ hasText: /^Chat session options$/ });
  await more.hover();
  await expect(triggerTip).toBeVisible();
  await more.click();
  await expect(page.getByRole("menu")).toBeVisible();
  // Opening the menu hides even a warm/focused tooltip before moving the pointer.
  await expect(triggerTip).toHaveCount(0);
  await page.mouse.move(0, 0);
  const exportItem = page.getByRole("menuitem", { name: "Export chat as…", exact: true });
  await exportItem.hover();
  const markdown = page.getByRole("menuitem", { name: "Markdown (.md)", exact: true });
  await expect(markdown).toBeVisible();
  await markdown.hover();
  await page.waitForTimeout(800);
  await expect(triggerTip).toHaveCount(0);
  await page.mouse.move(0, 0);
  const archive = page.getByRole("menuitem", { name: "Archive chat", exact: true });
  await archive.hover();
  await page.waitForTimeout(800);
  await expect(triggerTip).toHaveCount(0);
  await more.hover();
  await page.waitForTimeout(800);
  await expect(triggerTip).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.mouse.move(0, 0);
  await more.hover();
  await expect(triggerTip).toBeVisible();
});

test("a clipped menu row keeps its own tooltip independent of the More trigger", async ({ page }) => {
  await openLayoutsDemo(page, "chat-product");
  const demo = layoutsDemo(page, "chat-product");
  await demo.locator("textarea").fill("Sample conversation");
  await demo.locator("textarea").press("Enter");
  await demo.getByRole("button", { name: "Chat session options", exact: true }).click();
  const archive = page.getByRole("menuitem", { name: "Archive chat", exact: true });
  const label = archive.locator(".fynns-overflow-tip-label");
  // Reproduce a clipped consumer label without changing the sandbox recipe.
  await label.evaluate((el: HTMLElement) => { el.style.maxWidth = "40px"; });
  await expect(label).toHaveAttribute("data-overflowing", "true");
  await page.mouse.move(0, 0);
  await label.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Archive chat");
  await page.waitForTimeout(800);
  await expect(page.getByRole("tooltip")).toHaveCount(1);
  await expect(page.getByRole("tooltip")).toHaveText("Archive chat");
  await archive.focus();
  await expect(page.getByRole("tooltip").filter({ hasText: /^Chat session options$/ })).toHaveCount(0);
});
