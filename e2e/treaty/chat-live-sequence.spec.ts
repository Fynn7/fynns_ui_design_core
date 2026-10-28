/**
 * Live reveal contract: one newly painted chat row at a time.
 * Live: #layouts-demo-chat-product
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("a live reply paints one row at a time, top to bottom", async ({ page }) => {
  await openLayoutsDemo(page, "chat-product");
  const demo = layoutsDemo(page, "chat-product");
  const thread = demo.locator(".fynns-chat-thread");
  await expect(thread).toBeVisible();

  await page.evaluate(() => {
    const log = document.querySelector(".fynns-chat-thread");
    const entries: Array<{ kind: string; t: number }> = [];
    (window as unknown as { __chatSequence: typeof entries }).__chatSequence = entries;
    if (!log) return;
    const classify = (node: Element) => {
      if (node.matches(".fynns-chat-message--user")) return "user";
      if (node.matches(".fynns-chat-reveal")) return "reveal";
      if (node.matches(".fynns-chat-message--assistant")) return "assistant";
      return null;
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const kind = classify(node);
          if (kind) entries.push({ kind, t: performance.now() });
        }
      }
    });
    observer.observe(log, { childList: true, subtree: true });
  });

  const composer = demo.locator(".fynns-chat-composer textarea").first();
  await composer.fill("Sequence check");
  await composer.press("Enter");

  await expect(thread.locator(".fynns-chat-message--user").first()).toBeVisible();
  await expect(thread.locator(".fynns-chat-reveal").first()).toBeVisible();
  await expect(thread.locator(".fynns-chat-message--assistant").first()).toBeVisible();

  const entries = await page.evaluate(
    () =>
      (window as unknown as { __chatSequence?: Array<{ kind: string; t: number }> })
        .__chatSequence ?? [],
  );
  const user = entries.find((entry) => entry.kind === "user");
  const reveal = entries.find((entry) => entry.kind === "reveal");
  const assistant = entries.find((entry) => entry.kind === "assistant");
  expect(user).toBeTruthy();
  expect(reveal).toBeTruthy();
  expect(assistant).toBeTruthy();
  // The queued component and the answer never mount in the same commit, and
  // the answer waits for the component's entrance cadence.
  expect(reveal!.t - user!.t).toBeGreaterThanOrEqual(250);
  expect(assistant!.t - reveal!.t).toBeGreaterThanOrEqual(250);
});
