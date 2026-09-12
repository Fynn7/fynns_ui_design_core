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

test(`${SLUG}: capped well scrolls — rows do not paint over next help`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const host = demo.locator("#sandbox-list-repo-path-actions");
  await host.scrollIntoViewIfNeeded();
  const list = host.locator("ul.fynns-list.fynns-scroll");
  const help = demo.locator(".sandbox-help").filter({
    hasText: /trailing-stats|trailing 元数据/,
  });

  const metrics = await list.evaluate((ul) => {
    const cs = getComputedStyle(ul);
    return {
      overflowY: cs.overflowY,
      maxHeight: cs.maxHeight,
      scrollHeight: ul.scrollHeight,
      clientHeight: ul.clientHeight,
    };
  });
  expect(["auto", "scroll", "overlay"]).toContain(metrics.overflowY);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight + 1);

  await expect(help.first()).toBeVisible();
  const overlap = await page.evaluate(() => {
    const ul = document.querySelector(
      "#sandbox-list-repo-path-actions ul.fynns-list.fynns-scroll",
    );
    const help = [...document.querySelectorAll(".sandbox-help")].find((el) =>
      /trailing-stats|trailing 元数据/.test(el.textContent || ""),
    );
    if (!ul || !help) return -1;
    const hosts = [...ul.querySelectorAll(".fynns-list-item-host")];
    const helpBox = help.getBoundingClientRect();
    let max = 0;
    for (const h of hosts) {
      const r = h.getBoundingClientRect();
      const top = Math.max(r.top, helpBox.top);
      const bottom = Math.min(r.bottom, helpBox.bottom);
      if (bottom > top) max = Math.max(max, bottom - top);
    }
    return Math.round(max);
  });
  expect(overlap).toBeLessThanOrEqual(1);
});
