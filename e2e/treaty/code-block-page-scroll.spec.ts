/**
 * CONSUMER_TREATY slug: `fixed-height CodeBlock / Textarea on page scroll`
 * AGENTS: PageScroll / catalog file bodies default autoGrow — no consumer
 * fixed maxHeight / height lock (autoGrow may paint content-sized height).
 * Sandbox: #code-block file-body Card → aria-label sample.md
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "fixed-height CodeBlock / Textarea on page scroll";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: file-body CodeBlock has no fixed maxHeight lock`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "code-block", "CodeBlock");
  const demo = globalsDemo(page, "code-block");
  const fileBody = demo.locator('[aria-label="sample.md"]').first();
  await expect(fileBody).toBeVisible();

  const host = fileBody.locator(
    "xpath=ancestor::*[contains(@class,'fynns-code-block')][1]",
  );
  await expect(host).toBeVisible();

  const metrics = await host.evaluate((el) => {
    const style = (el as HTMLElement).style;
    const surface = el.querySelector(
      ".fynns-code-block-pre, textarea, .fynns-code-block-editor",
    ) as HTMLElement | null;
    return {
      hostHeight: style.height || "",
      hostMaxHeight: style.maxHeight || "",
      surfaceMaxHeight: surface?.style.maxHeight || "",
    };
  });

  const pxLock = /^\d+(\.\d+)?px$/i;
  // Host must not be a fixed well; autoGrow may set surface height in px.
  expect(metrics.hostHeight, `${SLUG}: host style.height`).toBe("");
  expect(metrics.hostMaxHeight, `${SLUG}: host style.maxHeight`).toBe("");
  expect(
    metrics.surfaceMaxHeight,
    `${SLUG}: file-body must not pin maxHeight (unlike capped demos)`,
  ).toBe("");
  expect(metrics.surfaceMaxHeight, SLUG).not.toMatch(pxLock);
});
