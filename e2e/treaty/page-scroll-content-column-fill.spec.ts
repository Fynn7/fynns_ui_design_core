/**
 * CONSUMER_TREATY slug: `PageScroll content-column soft reading-width gutters`
 * AGENTS: `.fynns-content-column` fills `.fynns-page-scroll` (inset only;
 * content-max-width default none ≥ 0.5.186). Sandbox: #page-scroll.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "PageScroll content-column soft reading-width gutters";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: content-column fills page-scroll within inset`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await openGlobalsDemo(page, "page-scroll", "page-scroll");
  const demo = globalsDemo(page, "page-scroll");
  const stage = demo.locator(".sandbox-page-scroll-stage").first();
  await expect(stage).toBeVisible();

  await expect(async () => {
    const metrics = await stage.evaluate((host) => {
      const scroll = host.querySelector(".fynns-page-scroll");
      const col = host.querySelector(".fynns-content-column");
      const card = host.querySelector(".fynns-card");
      if (!scroll || !col || !card) return null;
      const sr = scroll.getBoundingClientRect();
      const cr = col.getBoundingClientRect();
      const cardR = card.getBoundingClientRect();
      const cs = getComputedStyle(col);
      const padInline =
        parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
      return {
        scrollClientWidth: scroll.clientWidth,
        scrollBorderWidth: sr.width,
        colWidth: cr.width,
        cardWidth: cardR.width,
        padInline,
        maxWidth: cs.maxWidth,
        sheetCapPx: 640,
      };
    });
    expect(metrics, SLUG).not.toBeNull();
    expect(
      metrics!.maxWidth === "none" || metrics!.maxWidth === "100%",
      `${SLUG}: content-column max-width must not soft-cap (got ${metrics!.maxWidth})`,
    ).toBe(true);
    expect(
      metrics!.colWidth,
      `${SLUG}: content-column must fill page-scroll content box`,
    ).toBeGreaterThan(metrics!.scrollClientWidth - 16);
    expect(
      metrics!.colWidth,
      `${SLUG}: content-column must not exceed page-scroll clientWidth`,
    ).toBeLessThanOrEqual(metrics!.scrollClientWidth + 1);
    expect(
      metrics!.cardWidth,
      `${SLUG}: Card must exceed sheet-max 640dp`,
    ).toBeGreaterThan(metrics!.sheetCapPx + 8);
    expect(
      metrics!.cardWidth,
      `${SLUG}: Card must nearly fill content-column (minus inset)`,
    ).toBeGreaterThan(metrics!.colWidth - metrics!.padInline - 4);
  }).toPass({ timeout: 10_000 });
});
