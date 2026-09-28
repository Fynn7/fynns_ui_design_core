import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("Other draft survives choices and answered cards stay in chronological multi-turn history", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat-question", "ChatQuestion");
  const demo = globalsDemo(page, "chat-question");
  const question = demo.locator(".fynns-chat-question").first();
  const input = question.getByRole("textbox");
  const submit = question.getByRole("button", { name: "Continue", exact: true });
  const ids = () => demo.locator(".fynns-chat-thread-inner > [data-event-id]").evaluateAll(
    (items) => items.map((item) => item.getAttribute("data-event-id")),
  );
  await expect(input).toBeDisabled();
  await expect(submit).toBeDisabled();
  await question.getByText("D. Other", { exact: true }).click();
  await input.fill("   ");
  await expect(submit).toBeDisabled();
  await input.fill("  A short list  ");
  await question.getByText("A. Concise paragraph", { exact: true }).click();
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue("  A short list  ");
  await question.getByText("D. Other", { exact: true }).click();
  await expect(input).toBeEnabled();
  await question.evaluate((el) => { el.setAttribute("data-retained", "true"); });
  expect(await ids()).toEqual(["1", "2", "3"]);
  await submit.click();
  await expect(question).toHaveAttribute("data-retained", "true");
  await expect(question.locator(".fynns-card-title")).toHaveText("Answered");
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue("A short list");
  await expect(submit).toHaveCount(0);
  await expect(demo.locator('[data-event-kind="assistant"]')).toHaveCount(1);
  expect(await ids()).toEqual(["1", "2", "3", "4", "5", "6"]);
  await expect(demo.locator('[data-event-id="4"]')).toContainText("A short list");
  await expect(demo.locator('[data-event-id="5"]')).toContainText("Applied the answer");
  const composer = demo.locator(".fynns-chat-composer");
  await composer.getByRole("textbox").fill("Prepare another sample.");
  await composer.getByRole("button", { name: "Send", exact: true }).click();
  await expect(demo.locator(".fynns-chat-question")).toHaveCount(2);
  expect(await ids()).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  await expect(question).toHaveAttribute("data-retained", "true");
  const radios = demo.locator('input[type="radio"]');
  const names = await radios.evaluateAll((items) => items.map((item) => (item as HTMLInputElement).name));
  expect(new Set(names).size).toBe(2);
});

test("mixed thinking variants share rhythm and question controls fit a narrow host", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat-question", "ChatQuestion");
  const demo = globalsDemo(page, "chat-question");
  await demo.evaluate((el) => { el.style.width = "320px"; });
  const stack = demo.locator(".fynns-chat-thinking-stack").first();
  const rows = stack.locator(":scope > .fynns-chat-thinking");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).getByRole("button")).toHaveCount(1);
  await expect(rows.nth(2).getByRole("button")).toHaveCount(0);
  await expect(rows.nth(2).locator(".fynns-chat-thinking-chevron")).toHaveCount(0);
  const gaps = await rows.evaluateAll((items) => items.slice(1).map((item, index) =>
    item.getBoundingClientRect().top - items[index]!.getBoundingClientRect().bottom,
  ));
  expect(gaps[0]).toBeCloseTo(22, 0);
  expect(gaps[1]).toBeCloseTo(gaps[0]!, 1);
  await rows.nth(0).getByRole("button").click();
  await expect(rows.nth(0).getByRole("button")).toHaveAttribute("aria-expanded", "true");
  await expect(rows.nth(0).locator(".fynns-chat-thinking-body")).toBeVisible();
  const group = demo.getByRole("group", { name: "How should the response be presented?", exact: true });
  await expect(group).toBeVisible();
  await group.getByText("D. Other", { exact: true }).click();
  await group.getByRole("textbox").fill("A long custom answer that stays in the inline input");
  const widths = await group.evaluate((el) => ({ available: el.clientWidth, used: el.scrollWidth }));
  expect(widths.used).toBeLessThanOrEqual(widths.available + 1);
  await group.getByRole("radio", { name: "A. Concise paragraph", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(group.getByRole("radio", { name: "B. Detailed explanation", exact: true })).toBeChecked();
});
