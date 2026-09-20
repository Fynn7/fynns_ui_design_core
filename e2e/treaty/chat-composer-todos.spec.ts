import { expect, test } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("todo progress stays above the composer and can collapse or switch off", async ({ page }) => {
  await openGlobalsDemo(page, "chat");
  const demo = page.locator("#sandbox-chat-composer-todos");
  const panel = demo.locator(".fynns-chat-composer-todos");
  const list = panel.locator("ol");
  const composer = demo.locator(".fynns-chat-composer-shell");

  await expect(list.locator("li")).toHaveCount(5);
  await expect(list).toBeVisible();
  expect((await panel.boundingBox())!.y).toBeLessThan((await composer.boundingBox())!.y);
  const reveal = panel.locator(".fynns-chat-composer-todos-reveal");
  const motion = await reveal.evaluate((el) => ({
    transition: getComputedStyle(el).transitionProperty,
    divider: getComputedStyle(el.firstElementChild!, "::before").borderTopStyle,
  }));
  expect(motion.transition).toContain("grid-template-rows");
  expect(motion.divider).toBe("solid");
  const expandedHeight = (await panel.boundingBox())!.height;

  await demo.getByRole("button", { name: "Collapse tasks" }).click();
  await expect(list).toBeHidden();
  expect((await panel.boundingBox())!.height).toBeLessThan(expandedHeight);
  await expect(demo.locator("textarea")).toBeVisible();
  await demo.getByRole("button", { name: "Expand tasks" }).click();
  await expect(list).toBeVisible();

  await demo.getByRole("button", { name: "Complete next task" }).click();
  await expect(panel).toContainText("1 out of 5 tasks completed");
  await demo.getByRole("button", { name: "Use normal composer" }).click();
  await expect(panel).toHaveCount(0);
  await expect(composer).not.toHaveAttribute("data-expanded", "");
  await expect(demo.locator("textarea")).toBeVisible();
  await demo.getByRole("button", { name: "Show task list" }).click();
  await expect(panel).toContainText("1 out of 5 tasks completed");
  await expect(composer).toHaveAttribute("data-expanded", "");
});
