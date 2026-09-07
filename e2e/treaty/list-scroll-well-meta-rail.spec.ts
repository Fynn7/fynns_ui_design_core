/**
 * CONSUMER_TREATY slug: `List scroll-well trailing meta kisses overlay rail`
 * AGENTS: capped List.fynns-scroll reserves scrollbar-size; row meta clears rail.
 * Sandbox: #list → #sandbox-list-repo-path-actions
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "List scroll-well trailing meta kisses overlay rail";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: trailing meta clears overlay Y rail band`, async ({ page }) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const host = demo.locator("#sandbox-list-repo-path-actions");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const list = host.locator("ul.fynns-list.fynns-scroll");
  await expect(list).toBeVisible();

  const row = list.locator(".fynns-list-item-host").filter({
    has: page.getByText("sample-repo", { exact: true }),
  });
  await expect(row).toBeVisible();
  const meta = row.locator(".fynns-list-item-trailing-text .fynns-table-meta");
  await expect(meta).toBeVisible();

  await expect(async () => {
    const gap = await row.evaluate((hostEl) => {
      const ul = hostEl.closest("ul.fynns-list");
      const meta = hostEl.querySelector(
        ".fynns-list-item-trailing-text .fynns-table-meta",
      );
      if (!ul || !meta) return -1;
      const listBox = ul.getBoundingClientRect();
      const metaBox = meta.getBoundingClientRect();
      return listBox.right - metaBox.right;
    });
    expect(gap).toBeGreaterThanOrEqual(10);
  }).toPass({ timeout: 10_000 });
});
