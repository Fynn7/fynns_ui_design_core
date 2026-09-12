/**
 * CONSUMER_TREATY slug: `trailingSupportingText right-hug drift`
 * AGENTS: date catalogs use List trailingMetaAlign="start" — fixed
 * start-ink column (≥ 0.5.223). Sandbox: #list org+dates.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "trailingSupportingText right-hug drift";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: org+dates trailing starts share one grid edge`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  await expect(demo).toBeVisible();

  await expect(async () => {
    const metrics = await demo.evaluate((root) => {
      const scoped = [
        ...root.querySelectorAll(".fynns-list[data-trailing-meta-align='start']"),
      ].find(
        (el) => el.querySelectorAll(".fynns-list-item-trailing-text").length >= 2,
      );
      if (!scoped) return null;
      const texts = [
        ...scoped.querySelectorAll(".fynns-list-item-trailing-text"),
      ];
      const lefts = texts.map((el) => el.getBoundingClientRect().left);
      const widths = texts.map(
        (el) => el.parentElement!.getBoundingClientRect().width,
      );
      const minL = Math.min(...lefts);
      const maxL = Math.max(...lefts);
      return {
        lefts,
        widths,
        startDelta: maxL - minL,
        align: scoped.getAttribute("data-trailing-meta-align"),
      };
    });
    expect(metrics, SLUG).not.toBeNull();
    expect(metrics!.align).toBe("start");
    expect(
      metrics!.startDelta,
      `${SLUG}: trailing starts must grid-align (Δ=${metrics!.startDelta}; lefts=${metrics!.lefts})`,
    ).toBeLessThanOrEqual(1);
    for (const w of metrics!.widths) {
      expect(w).toBeGreaterThan(8);
    }
  }).toPass({ timeout: 10_000 });
});
