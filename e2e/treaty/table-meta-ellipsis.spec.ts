/**
 * CONSUMER_TREATY slug: `table-meta overflows without ellipsis`
 * AGENTS: `.fynns-table-meta` single-line ellipsis in narrow Card / unit-stack
 * hosts (≥ 0.5.231) — never hard-clip past the edge with no “…”.
 * Live: #sandbox-card-table-meta-ellipsis.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "table-meta overflows without ellipsis";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Card body table-meta ellipsizes when squeezed`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "Card");
  const demo = globalsDemo(page, "card");
  await expect(demo).toBeVisible();

  const host = demo.locator("#sandbox-card-table-meta-ellipsis");
  await host.scrollIntoViewIfNeeded();
  const meta = host.locator(".fynns-table-meta").first();
  await expect(meta).toBeVisible();

  await expect(async () => {
    const metrics = await meta.evaluate((el) => {
      // OverflowTip (≥ 0.5.240) clips on `.fynns-overflow-tip-label`; bare
      // text still clips on `.fynns-table-meta` itself.
      const clip =
        (el.querySelector(".fynns-overflow-tip-label") as HTMLElement | null) ??
        el;
      const cs = getComputedStyle(clip);
      const r = el.getBoundingClientRect();
      const cardEl = el.closest(".fynns-card");
      const cr = cardEl?.getBoundingClientRect();
      return {
        overflow: cs.overflow,
        textOverflow: cs.textOverflow,
        whiteSpace: cs.whiteSpace,
        scrollW: Math.round(clip.scrollWidth),
        clientW: Math.round(clip.clientWidth),
        metaRight: +r.right.toFixed(2),
        cardRight: cr ? +cr.right.toFixed(2) : null,
        endsWithEllipsisVisual: clip.scrollWidth > clip.clientWidth + 1,
      };
    });
    expect(metrics.overflow).toMatch(/hidden|clip/);
    expect(metrics.textOverflow).toBe("ellipsis");
    expect(metrics.whiteSpace).toBe("nowrap");
    expect(metrics.endsWithEllipsisVisual).toBe(true);
    if (metrics.cardRight != null) {
      expect(metrics.metaRight).toBeLessThanOrEqual(metrics.cardRight + 1);
    }
  }).toPass({ timeout: 10_000 });
});
