/**
 * CONSUMER_TREATY slugs:
 * - `Pagination Select invents absolute overlay`
 * - `Pagination Select siblings center on expanded height`
 * AGENTS: pager rows-per-page Select is the **stock** Keep-set Select —
 * in-flow `.fynns-search-bar--expanded` joined capsule like Globals `#select`.
 * ≥ 0.5.194: no absolute upward flyout / detached panel.
 * ≥ 0.5.197: noun / range / discs optically center on the 40dp Select shell
 * only — not mid of the expanded joined capsule.
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

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG_OVERLAY}: open Select is joined in-flow capsule (not absolute flyout)`, async ({
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
  await expect(select).toHaveClass(/fynns-search-bar--expanded/);

  const option = select.getByRole("option").first();
  await expect(option).toBeVisible();

  const panel = select.locator("> .fynns-search-bar-panel").first();
  await expect(panel).toBeVisible();

  await expect(async () => {
    const geometry = await select.evaluate((el) => {
      const host = el as HTMLElement;
      const panelEl = host.querySelector(
        ":scope > .fynns-search-bar-panel",
      ) as HTMLElement | null;
      const field = host.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      if (!panelEl || !field) return null;
      const hs = getComputedStyle(host);
      const ps = getComputedStyle(panelEl);
      const hb = host.getBoundingClientRect();
      const fb = field.getBoundingClientRect();
      const pb = panelEl.getBoundingClientRect();
      return {
        hostRadius: hs.borderRadius,
        hostOverflow: hs.overflow,
        panelPosition: ps.position,
        panelBottom: ps.bottom,
        // Joined shell: field above results inside the same host box.
        fieldAbovePanel: fb.bottom <= pb.top + 2,
        panelInsideHost:
          pb.top >= hb.top - 1 &&
          pb.bottom <= hb.bottom + 1 &&
          pb.left >= hb.left - 1 &&
          pb.right <= hb.right + 1,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;

    // Stock SearchBar/Select shell — not absolute upward docking.
    expect(geometry.panelPosition).not.toBe("absolute");
    expect(geometry.panelBottom).not.toBe("100%");
    expect(geometry.fieldAbovePanel).toBe(true);
    expect(geometry.panelInsideHost).toBe(true);

    const radii = geometry.hostRadius.split(/\s+/).map(parseFloat);
    for (const px of radii) {
      expect(px).toBeGreaterThan(8);
    }
  }).toPass({ timeout: 10_000 });
});

test(`${SLUG_SIBLINGS}: noun + range center on Select shell only when expanded`, async ({
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
      const expandedMid = selectBox.top + selectBox.height / 2;
      return {
        shellHeight: sb.height,
        selectHeight: selectBox.height,
        metaDeltaShell: Math.abs(metaMid - shellMid),
        hintDeltaShell: Math.abs(hintMid - shellMid),
        metaDeltaExpanded: Math.abs(metaMid - expandedMid),
        hintDeltaExpanded: Math.abs(hintMid - expandedMid),
        startAlignItems: getComputedStyle(host).alignItems,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;

    expect(geometry.selectHeight).toBeGreaterThan(geometry.shellHeight + 40);
    expect(geometry.startAlignItems).toMatch(/flex-start|start/);
    // Must track the 40dp shell — not the mid of the tall joined capsule.
    expect(geometry.metaDeltaShell).toBeLessThan(6);
    expect(geometry.hintDeltaShell).toBeLessThan(6);
    expect(geometry.metaDeltaExpanded).toBeGreaterThan(20);
    expect(geometry.hintDeltaExpanded).toBeGreaterThan(20);
  }).toPass({ timeout: 10_000 });
});
