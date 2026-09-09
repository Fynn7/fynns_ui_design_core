/**
 * CONSUMER_TREATY slugs:
 * - `Pagination Select invents absolute overlay`
 * - `Pagination Select siblings center on expanded height`
 * - `Pagination bar gaps crushed to 4dp`
 * AGENTS: pager rows-per-page Select is the **stock** Keep-set Select —
 * M3 Exposed Dropdown: 40dp shell in-flow + portaled `.fynns-select-menu`
 * (same as Globals `#select`, ≥ **0.5.208**).
 * Do **not** invent a private `bottom:100%` dock on `.fynns-search-bar-panel`.
 * ≥ 0.5.197 / 0.5.208: noun / range / discs share the 40dp Select shell band.
 * ≥ 0.5.202: noun|Select|range = 8dp; start↔end = 16dp (not 4dp).
 * Sandbox: #pagination (+ anatomy reference #select)
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG_OVERLAY = "Pagination Select invents absolute overlay";
const SLUG_SIBLINGS = "Pagination Select siblings center on expanded height";
const SLUG_GAPS = "Pagination bar gaps crushed to 4dp";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG_OVERLAY}: open Select portals listbox (not in-flow joined capsule)`, async ({
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
  await expect(select).toHaveClass(/fynns-select--open/);
  await expect(select).not.toHaveClass(/fynns-search-bar--expanded/);

  const option = page.locator(".fynns-select-menu[role='listbox'] [role='option']").first();
  await expect(option).toBeVisible();

  const menu = page.locator(".fynns-select-menu[role='listbox']").first();
  await expect(menu).toBeVisible();

  await expect(async () => {
    const geometry = await select.evaluate((el) => {
      const host = el as HTMLElement;
      const field = host.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      const inFlowPanel = host.querySelector(
        ":scope > .fynns-search-bar-panel",
      ) as HTMLElement | null;
      const menuEl = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      if (!field || !menuEl) return null;
      const hs = getComputedStyle(host);
      const ms = getComputedStyle(menuEl);
      const hb = host.getBoundingClientRect();
      const fb = field.getBoundingClientRect();
      const mb = menuEl.getBoundingClientRect();
      return {
        hostHeight: hb.height,
        fieldHeight: fb.height,
        menuPosition: ms.position,
        menuInBody: menuEl.parentElement === document.body,
        hasInFlowPanel: Boolean(inFlowPanel),
        hostOverflow: hs.overflow,
        // Portaled: menu is not contained inside the host box.
        menuInsideHost:
          mb.top >= hb.top - 1 &&
          mb.bottom <= hb.bottom + 1 &&
          mb.left >= hb.left - 1 &&
          mb.right <= hb.right + 1,
        menuBelowOrAboveField:
          Math.abs(mb.top - fb.bottom) < 24 || Math.abs(fb.top - mb.bottom) < 24,
        // Digit-only options: menu hugs ≈ shell (≥ trigger; not locked narrower).
        menuAtLeastField: mb.width + 1 >= fb.width,
        widthDelta: Math.abs(mb.width - fb.width),
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;

    expect(geometry.hasInFlowPanel).toBe(false);
    expect(geometry.menuInBody).toBe(true);
    expect(geometry.menuPosition).toBe("fixed");
    expect(geometry.menuInsideHost).toBe(false);
    // Shell stays ~40dp — does not grow into a joined capsule.
    expect(geometry.hostHeight).toBeLessThan(56);
    expect(geometry.fieldHeight).toBeGreaterThan(36);
    expect(geometry.fieldHeight).toBeLessThan(48);
    expect(geometry.menuBelowOrAboveField).toBe(true);
    expect(geometry.menuAtLeastField).toBe(true);
    expect(geometry.widthDelta).toBeLessThan(8);
  }).toPass({ timeout: 10_000 });
});

test(`${SLUG_SIBLINGS}: noun + range stay on Select shell band when open`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "pagination", "pagination");
  const demo = globalsDemo(page, "pagination");
  await expect(demo).toBeVisible();

  const bar = demo.locator(".fynns-pagination-bar").first();
  await bar.scrollIntoViewIfNeeded();

  const start = bar.locator(".fynns-pagination-bar__start").first();
  const select = start.locator("> .fynns-select").first();
  const trigger = select.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(select).toHaveAttribute("data-expanded", "true");

  await expect(async () => {
    const geometry = await start.evaluate((el) => {
      const host = el as HTMLElement;
      const selectEl = host.querySelector(
        ":scope > .fynns-select",
      ) as HTMLElement | null;
      const shell = selectEl?.querySelector(
        ":scope > .fynns-search-bar-field, :scope > .fynns-select-shell",
      ) as HTMLElement | null;
      const meta = host.querySelector(
        ":scope > .fynns-table-meta",
      ) as HTMLElement | null;
      const hint = host.querySelector(
        ":scope > .fynns-field-hint",
      ) as HTMLElement | null;
      if (!selectEl || !shell || !meta || !hint) return null;
      const sb = shell.getBoundingClientRect();
      const mb = meta.getBoundingClientRect();
      const hb = hint.getBoundingClientRect();
      const selectBox = selectEl.getBoundingClientRect();
      const shellMid = sb.top + sb.height / 2;
      const metaMid = mb.top + mb.height / 2;
      const hintMid = hb.top + hb.height / 2;
      return {
        shellHeight: sb.height,
        selectHeight: selectBox.height,
        metaDeltaShell: Math.abs(metaMid - shellMid),
        hintDeltaShell: Math.abs(hintMid - shellMid),
        startAlignItems: getComputedStyle(host).alignItems,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;

    // Portaled menu: host height stays on the shell band.
    expect(geometry.selectHeight).toBeLessThan(geometry.shellHeight + 8);
    expect(geometry.startAlignItems).toMatch(/flex-start|start/);
    expect(geometry.metaDeltaShell).toBeLessThan(6);
    expect(geometry.hintDeltaShell).toBeLessThan(6);
  }).toPass({ timeout: 10_000 });
});

test(`${SLUG_GAPS}: noun|Select|range ≥8dp and start↔end ≥16dp`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "pagination", "pagination");
  const demo = globalsDemo(page, "pagination");
  await expect(demo).toBeVisible();

  // Prefer the Catalog Card bar (has noun + Select + range + discs).
  const bar = demo.locator(".fynns-pagination-bar").filter({
    has: page.locator(".fynns-pagination-bar__start > .fynns-table-meta"),
  }).first();
  await bar.scrollIntoViewIfNeeded();

  await expect(async () => {
    const geometry = await bar.evaluate((el) => {
      const host = el as HTMLElement;
      const start = host.querySelector(
        ":scope > .fynns-pagination-bar__start",
      ) as HTMLElement | null;
      const end = host.querySelector(
        ":scope > .fynns-pagination-bar__end",
      ) as HTMLElement | null;
      const meta = start?.querySelector(
        ":scope > .fynns-table-meta",
      ) as HTMLElement | null;
      const select = start?.querySelector(
        ":scope > .fynns-select",
      ) as HTMLElement | null;
      const hint = start?.querySelector(
        ":scope > .fynns-field-hint",
      ) as HTMLElement | null;
      if (!start || !end || !meta || !select || !hint) return null;
      const mb = meta.getBoundingClientRect();
      const sb = select.getBoundingClientRect();
      const hb = hint.getBoundingClientRect();
      const eb = end.getBoundingClientRect();
      const startBox = start.getBoundingClientRect();
      return {
        metaToSelect: Math.round(sb.left - mb.right),
        selectToHint: Math.round(hb.left - sb.right),
        startGapPx: parseFloat(getComputedStyle(start).columnGap || getComputedStyle(start).gap) || 0,
        barGapPx: parseFloat(getComputedStyle(host).columnGap || getComputedStyle(host).gap) || 0,
        startEndGap: Math.round(eb.left - startBox.right),
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;

    expect(geometry.metaToSelect).toBeGreaterThanOrEqual(7);
    expect(geometry.selectToHint).toBeGreaterThanOrEqual(7);
    expect(geometry.startGapPx).toBeGreaterThanOrEqual(7);
    expect(geometry.barGapPx).toBeGreaterThanOrEqual(15);
    expect(geometry.startEndGap).toBeGreaterThanOrEqual(15);
  }).toPass({ timeout: 10_000 });
});
