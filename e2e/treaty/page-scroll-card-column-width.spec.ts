/**
 * CONSUMER_TREATY slug: `PageScroll Card sheet-max-width under ControlRow`
 * AGENTS: Card stretches to content-column; never sheet-max-width under a
 * full-bleed section ControlRow. Sandbox: #page-scroll.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "PageScroll Card sheet-max-width under ControlRow";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: tool ToggleGroup and Card share right edge`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await openGlobalsDemo(page, "page-scroll", "page-scroll");
  const demo = globalsDemo(page, "page-scroll");
  const stage = demo.locator(".sandbox-page-scroll-stage").first();
  await expect(stage).toBeVisible();

  await expect(async () => {
    const metrics = await stage.evaluate((host) => {
      const group = host.querySelector(".fynns-toggle-group");
      const card = host.querySelector(".fynns-card");
      const row = host.querySelector(".fynns-control-row");
      if (!group || !card || !row) return null;
      const gr = group.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const rr = row.getBoundingClientRect();
      return {
        groupRight: gr.right,
        cardRight: cr.right,
        rowRight: rr.right,
        cardWidth: cr.width,
        sheetCapPx: 640,
      };
    });
    expect(metrics, SLUG).not.toBeNull();
    expect(
      metrics!.cardWidth,
      `${SLUG}: Card must exceed sheet-max 640dp`,
    ).toBeGreaterThan(metrics!.sheetCapPx + 8);
    expect(
      Math.abs(metrics!.cardRight - metrics!.groupRight),
      `${SLUG}: Card right vs ToggleGroup right`,
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(metrics!.cardRight - metrics!.rowRight),
      `${SLUG}: Card right vs ControlRow right`,
    ).toBeLessThanOrEqual(2);
  }).toPass({ timeout: 10_000 });
});
