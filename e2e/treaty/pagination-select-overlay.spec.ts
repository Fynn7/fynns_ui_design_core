/**
 * CONSUMER_TREATY slug: `Pagination Select expands bar (in-flow stretch)`
 * + `Pagination Select overlay square abutting corners`
 * AGENTS: `.fynns-pagination-bar` rows-per-page Select expands as upward overlay
 * (≥ 0.5.151 / 0.5.152) — visible options; H-rail in block-end pad, not through
 * controls. ≥ 0.5.191: floating full-radius capsule (never square abutting edge).
 * Sandbox: #pagination
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Pagination Select expands bar (in-flow stretch)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  // Wide enough that the teaching `#pagination` bar stays a single row
  // (parallel workers / narrow default can wrap discs under the Select).
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: open Select shows options upward; H-rail clears controls`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "pagination", "pagination");
  const demo = globalsDemo(page, "pagination");
  await expect(demo).toBeVisible();

  const bar = demo.locator(".fynns-pagination-bar").first();
  await expect(bar).toBeVisible();
  await bar.scrollIntoViewIfNeeded();

  const select = bar.locator(".fynns-pagination-bar__start > .fynns-select").first();
  const trigger = select.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(select).toHaveAttribute("data-expanded", "true");

  const list = bar.locator(".fynns-pagination-list").first();
  const option = select.getByRole("option").first();
  await expect(option).toBeVisible();

  const panel = select.locator("> .fynns-search-bar-panel").first();
  await expect(panel).toBeVisible();
  await expect(async () => {
    const radii = await panel.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        tl: s.borderTopLeftRadius,
        tr: s.borderTopRightRadius,
        br: s.borderBottomRightRadius,
        bl: s.borderBottomLeftRadius,
        marginEnd: s.marginBottom,
      };
    });
    // Floating capsule — all corners rounded (not md md 0 0).
    for (const key of ["tl", "tr", "br", "bl"] as const) {
      const px = parseFloat(radii[key]);
      expect(px, `${key} radius`).toBeGreaterThan(8);
    }
    expect(parseFloat(radii.marginEnd)).toBeGreaterThan(0);
  }).toPass({ timeout: 5_000 });

  await expect(async () => {
    const barBox = await bar.boundingBox();
    const triggerBox = await trigger.boundingBox();
    const listBox = await list.boundingBox();
    const optionBox = await option.boundingBox();
    expect(barBox).toBeTruthy();
    expect(triggerBox).toBeTruthy();
    expect(listBox).toBeTruthy();
    expect(optionBox).toBeTruthy();
    if (!barBox || !triggerBox || !listBox || !optionBox) return;

    // Trigger band (+ scrollbar pad) — not a 3-option in-flow stretch (~180px).
    expect(barBox.height).toBeLessThan(72);
    expect(optionBox.height).toBeGreaterThan(20);

    // Range FieldHint may wrap under the narrow teaching host — exclude it.
    // Assert trigger + page discs share one band (not mid expanded option panel).
    const bandTop = Math.min(triggerBox.y, listBox.y);
    const bandBottom = Math.max(
      triggerBox.y + triggerBox.height,
      listBox.y + listBox.height,
    );
    expect(bandBottom - bandTop).toBeLessThan(64);

    // Overlay H-rail paints in the bottom `--fynns-scrollbar-size` band (~10px).
    const sb = await bar.evaluate((el) =>
      parseFloat(getComputedStyle(el).getPropertyValue("--fynns-scrollbar-size")) || 10,
    );
    expect(triggerBox.y + triggerBox.height).toBeLessThanOrEqual(
      barBox.y + barBox.height - sb + 2,
    );
    expect(listBox.y + listBox.height).toBeLessThanOrEqual(
      barBox.y + barBox.height - sb + 2,
    );
  }).toPass({ timeout: 10_000 });
});
