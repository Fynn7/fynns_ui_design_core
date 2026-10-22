import { expect, test } from "@playwright/test";
import { resetSandboxSession } from "../helpers/sandbox";

test("structured thinking keeps its first nested row close to the root heading", async ({ page }) => {
  await resetSandboxSession(page);
  await page.goto("/?demo=thinking-reference");
  const root = page.locator('[data-thinking-reference-preview] > .fynns-chat-thinking');
  const first = root.locator(':scope > .fynns-expand > .fynns-expand-inner > .fynns-chat-thinking-body > .fynns-chat-thinking').first();
  const trigger = first.locator(':scope > .fynns-chat-thinking-trigger');
  await expect(trigger).toBeVisible();

  const assertGap = async (scale: number) => {
    await expect(async () => {
      const gap = await root.evaluate((element) => {
        const heading = element.querySelector(':scope > .fynns-chat-thinking-trigger')!;
        const child = element.querySelector(':scope > .fynns-expand > .fynns-expand-inner > .fynns-chat-thinking-body > .fynns-chat-thinking > .fynns-chat-thinking-trigger')!;
        return child.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
      });
      // 14dp heading separation; no extra inset above the first row.
      expect(gap / scale).toBeCloseTo(14, 1);
    }).toPass({ timeout: 5000 });
  };

  await assertGap(2);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await assertGap(2);
  await page.getByRole("button", { name: "Normal density (1×)", exact: true }).click();
  await assertGap(1);
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await assertGap(1);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await assertGap(1);
});
