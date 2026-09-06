/**
 * CONSUMER_TREATY slug: `Pagination Select expands bar (in-flow stretch)`
 * AGENTS: `.fynns-pagination-bar` rows-per-page Select expands as upward overlay
 * (≥ 0.5.151 / 0.5.152) — visible options; H-rail in block-end pad, not through controls.
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
});

test(`${SLUG}: open Select shows options upward; H-rail clears controls`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "pagination", "pagination");
  const demo = globalsDemo(page, "pagination");
  await expect(demo).toBeVisible();

  const bar = demo.locator(".fynns-pagination-bar").first();
  await expect(bar).toBeVisible();

  const select = bar.locator(".fynns-pagination-bar__start > .fynns-select").first();
  const trigger = select.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(select).toHaveAttribute("data-expanded", "true");

  const barBox = await bar.boundingBox();
  const triggerBox = await trigger.boundingBox();
  expect(barBox).toBeTruthy();
  expect(triggerBox).toBeTruthy();
  // Trigger band (+ scrollbar pad) — not a 3-option in-flow stretch (~180px).
  expect(barBox!.height).toBeLessThan(72);

  const option = select.getByRole("option").first();
  await expect(option).toBeVisible();
  const optionBox = await option.boundingBox();
  expect(optionBox).toBeTruthy();
  expect(optionBox!.height).toBeGreaterThan(20);
  // Opens upward: options sit above the trigger.
  expect(optionBox!.y + optionBox!.height).toBeLessThanOrEqual(triggerBox!.y + 2);

  const hint = bar.locator(".fynns-field-hint").first();
  const list = bar.locator(".fynns-pagination-list").first();
  const hintBox = await hint.boundingBox();
  const listBox = await list.boundingBox();
  expect(hintBox).toBeTruthy();
  expect(listBox).toBeTruthy();
  // Trigger / range / page discs stay on one trigger band (not mid-panel with
  // the upward overlay). Allow small optical drift from scrollbar pad.
  const bandTop = Math.min(triggerBox!.y, hintBox!.y, listBox!.y);
  const bandBottom = Math.max(
    triggerBox!.y + triggerBox!.height,
    hintBox!.y + hintBox!.height,
    listBox!.y + listBox!.height,
  );
  expect(bandBottom - bandTop).toBeLessThan(48);

  // Overlay H-rail paints in the bottom `--fynns-scrollbar-size` band (~10px).
  const sb = await bar.evaluate((el) =>
    parseFloat(getComputedStyle(el).getPropertyValue("--fynns-scrollbar-size")) || 10,
  );
  expect(triggerBox!.y + triggerBox!.height).toBeLessThanOrEqual(
    barBox!.y + barBox!.height - sb + 2,
  );
  expect(listBox!.y + listBox!.height).toBeLessThanOrEqual(
    barBox!.y + barBox!.height - sb + 2,
  );
});
