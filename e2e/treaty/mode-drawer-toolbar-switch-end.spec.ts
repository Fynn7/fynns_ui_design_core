/**
 * CONSUMER_TREATY slug: `mode drawer toolbar Plus ≠ Switch end`
 * AGENTS: mode `--toolbar-end` Plus, preference Switch, and destination
 * Item **pill outer** share one trailing edge (≥ **0.5.228**; supersedes
 * 0.5.143 item-pad-end inset). Sandbox: #layouts-demo-navigation-drawer.
 *
 * Also asserts bare `--toolbar-end` (body direct child) opens
 * `--fynns-navdrawer-search-gap` (8dp) before the next sibling — not
 * section-gap 4dp (≥ **0.5.222**). Slug: mode drawer tools↔filter crushed to 4dp.
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "mode drawer toolbar Plus ≠ Switch end";
const PILL_SLUG = "mode drawer Plus ≠ Item pill end";
const GAP_SLUG = "mode drawer tools↔filter crushed to 4dp";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Plus right ≈ Switch track right`, async ({ page }) => {
  await openLayoutsDemo(page, "navigation-drawer");
  const demo = layoutsDemo(page, "navigation-drawer");
  await expect(demo).toBeVisible();

  await expect(async () => {
    const metrics = await demo.evaluate((host) => {
      const mode = [...host.querySelectorAll(".fynns-nav-drawer")].find((el) =>
        /mode|模式/i.test(el.getAttribute("aria-label") ?? ""),
      );
      if (!mode) return null;
      const plus = mode.querySelector(
        ".fynns-control-cluster--toolbar-end .fynns-btn--primary",
      );
      const sw = mode.querySelector(".fynns-control-row .fynns-switch");
      if (!plus || !sw) return null;
      const pr = plus.getBoundingClientRect();
      const sr = sw.getBoundingClientRect();
      return {
        plusRight: pr.right,
        switchRight: sr.right,
        delta: Math.abs(pr.right - sr.right),
      };
    });
    expect(metrics, SLUG).not.toBeNull();
    expect(
      metrics!.delta,
      `${SLUG}: Plus right vs Switch right (got Δ=${metrics!.delta})`,
    ).toBeLessThanOrEqual(2);
  }).toPass({ timeout: 10_000 });
});

test(`${PILL_SLUG}: Plus right ≈ destination Item pill right`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "navigation-drawer");
  const demo = layoutsDemo(page, "navigation-drawer");
  await expect(demo).toBeVisible();

  await expect(async () => {
    const metrics = await demo.evaluate((host) => {
      const mode = [...host.querySelectorAll(".fynns-nav-drawer")].find((el) =>
        /mode|模式/i.test(el.getAttribute("aria-label") ?? ""),
      );
      if (!mode) return null;
      const plus = mode.querySelector(
        ".fynns-control-cluster--toolbar-end .fynns-btn--primary",
      );
      const pill =
        mode.querySelector(
          ".fynns-nav-drawer-item-host--with-end > .fynns-nav-drawer-item",
        ) ?? mode.querySelector(".fynns-nav-drawer-item");
      const tools = mode.querySelector(
        ".fynns-control-cluster--toolbar-end",
      ) as HTMLElement | null;
      if (!plus || !pill || !tools) return null;
      const pr = plus.getBoundingClientRect();
      const ir = pill.getBoundingClientRect();
      return {
        plusRight: pr.right,
        pillRight: ir.right,
        delta: Math.abs(pr.right - ir.right),
        toolsPadEnd: getComputedStyle(tools).paddingInlineEnd,
      };
    });
    expect(metrics, PILL_SLUG).not.toBeNull();
    expect(
      metrics!.delta,
      `${PILL_SLUG}: Plus right vs Item pill right (got Δ=${metrics!.delta}; toolsPadEnd=${metrics!.toolsPadEnd})`,
    ).toBeLessThanOrEqual(2);
  }).toPass({ timeout: 10_000 });
});

test(`${GAP_SLUG}: bare toolbar-end → next uses search-gap 8dp`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "navigation-drawer");
  const demo = layoutsDemo(page, "navigation-drawer");
  await expect(demo).toBeVisible();

  await expect(async () => {
    const metrics = await demo.evaluate((host) => {
      const mode = [...host.querySelectorAll(".fynns-nav-drawer")].find((el) =>
        /mode|模式/i.test(el.getAttribute("aria-label") ?? ""),
      );
      const body = mode?.querySelector(":scope > .fynns-nav-drawer-body");
      const toolbar = body?.querySelector(
        ":scope > .fynns-control-cluster--toolbar-end",
      );
      const next = toolbar?.nextElementSibling as HTMLElement | null;
      if (!toolbar || !next) return null;
      const margin = Number.parseFloat(getComputedStyle(next).marginBlockStart);
      const gap = getComputedStyle(document.documentElement).getPropertyValue(
        "--fynns-navdrawer-search-gap",
      );
      return { margin, gap: gap.trim(), nextClass: next.className };
    });
    expect(metrics, GAP_SLUG).not.toBeNull();
    expect(
      metrics!.margin,
      `${GAP_SLUG}: expected ~8px search-gap (got ${metrics!.margin}px; next=${metrics!.nextClass})`,
    ).toBeGreaterThanOrEqual(7.5);
    expect(metrics!.margin).toBeLessThanOrEqual(8.5);
  }).toPass({ timeout: 10_000 });
});
