/**
 * CONSUMER_TREATY slug: `editable CodeBlock typing keeps the page scroll`
 * AGENTS: the autoGrow height probe must not move the page — it restores the
 * previous height and every captured scroll offset before the measured height
 * is applied (core ≥ 0.5.314).
 * Sandbox: #code-block file-body Card → textarea[aria-label="sample.md"]
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "editable CodeBlock typing keeps the page scroll";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: typing does not snap the scroll host back`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "code-block", "CodeBlock");
  const demo = globalsDemo(page, "code-block");
  const editor = demo.locator('textarea[aria-label="sample.md"]').first();
  await expect(editor).toBeVisible();

  /* A catalog keeps a long entry in the scroll host of its column, so the
     entry body dominates that host range. Build the same geometry around
     the real editor: a short scroll host around the whole code block. */
  await page.evaluate(() => {
    const editor = document.querySelector(
      'textarea[aria-label="sample.md"]',
    ) as HTMLTextAreaElement;
    const block = editor.closest(".fynns-code-block") as HTMLElement;
    const host = document.createElement("div");
    host.id = "sandbox-code-block-scroll-host";
    host.style.cssText = "height: 120px; overflow: auto;";
    block.parentElement?.insertBefore(host, block);
    host.appendChild(block);
  });
  const host = page.locator("#sandbox-code-block-scroll-host");
  await expect(host).toBeVisible();

  /* Caret at the end of the entry, host scrolled to the last line: the
     height probe collapses the editor, so an unfixed build shortens the
     host range and the browser clamps the scroll offset to 0. */
  await editor.evaluate((el: HTMLTextAreaElement) => {
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  });
  await host.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const before = await host.evaluate((el) => el.scrollTop);
  expect(before, `${SLUG}: scroll host must be scrolled`).toBeGreaterThan(0);

  await page.keyboard.press("x");

  const after = await host.evaluate((el) => el.scrollTop);
  expect(
    Math.abs(after - before),
    `${SLUG}: scroll offset moved from ${before} to ${after}`,
  ).toBeLessThanOrEqual(1);
});
