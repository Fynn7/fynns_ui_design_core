/**
 * Thread turn rhythm: the first turn must breathe like every turn below it.
 * The top inset is `--fynns-chat-thread-pad-block-start` (aliases
 * `chat-thread-gap`); the scroll end keeps its own `thread-pad-block` +
 * `composer-scroll-pad` pair.
 * Live: #globals-demo-chat-question / #layouts-demo-chat-product
 */
import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("first turn inset equals the inter-turn gap, and the end keeps composer clearance", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat-question", "ChatQuestion");
  const demo = globalsDemo(page, "chat-question");
  const thread = demo.locator(".fynns-chat-thread");
  await expect(thread).toBeVisible();

  const rhythm = async () => {
    await expect(async () => {
      const measured = await thread.evaluate((el) => {
        const style = getComputedStyle(el);
        const inner = el.querySelector(".fynns-chat-thread-inner")!;
        const items = [...inner.children] as HTMLElement[];
        const first = items[0]!.getBoundingClientRect();
        const second = items[1]!.getBoundingClientRect();
        return {
          paddingTop: parseFloat(style.paddingTop),
          paddingBottom: parseFloat(style.paddingBottom),
          gap: parseFloat(getComputedStyle(inner).rowGap),
          firstTop: first.top - el.getBoundingClientRect().top,
          turnGap: second.top - first.bottom,
        };
      });
      // Token relationship first: the start inset *is* the turn gap.
      expect(measured.paddingTop).toBeCloseTo(measured.gap, 1);
      // Then geometry, so a consumer padding override cannot pass the check.
      expect(measured.firstTop).toBeCloseTo(measured.gap, 0);
      expect(measured.turnGap).toBeCloseTo(measured.gap, 0);
      // End keeps its own base + docked-composer clearance (44dp), so a
      // scrolled-to-bottom last turn never sits under the composer.
      expect(measured.paddingBottom).toBeGreaterThan(measured.gap);
    }).toPass({ timeout: 5000 });
  };

  await rhythm();
  // Answer the open question card: the thread grows downward, so the top
  // inset must stay put instead of tracking the new first turn.
  await demo.getByText("D. Other", { exact: true }).first().click();
  await demo.locator(".fynns-chat-question").first().getByRole("textbox").fill("A short list");
  await demo
    .locator(".fynns-chat-question")
    .first()
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(demo.locator(".fynns-chat-thread-inner > [data-event-id]")).toHaveCount(6);
  await rhythm();
});
