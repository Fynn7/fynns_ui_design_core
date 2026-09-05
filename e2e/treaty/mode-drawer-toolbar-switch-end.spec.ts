/**
 * CONSUMER_TREATY slug: `mode drawer toolbar Plus ≠ Switch end`
 * AGENTS: mode `--toolbar-end` Plus and preference Switch share item-pad
 * trailing edge (≥ 0.5.143). Sandbox: #layouts-demo-navigation-drawer.
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "mode drawer toolbar Plus ≠ Switch end";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Plus right ≈ Switch track right`, async ({ page }) => {
  await openLayoutsDemo(page, "navigation-drawer");
  const demo = layoutsDemo(page, "navigation-drawer");
  await expect(demo).toBeVisible();

  await expect(async () => {
    const metrics = await demo.evaluate((host) => {
      const toolsBlocks = [
        ...host.querySelectorAll(".sandbox-navdrawer-tools"),
      ];
      const tools = toolsBlocks.find(
        (el) =>
          el.querySelector(".fynns-control-cluster--toolbar-end") &&
          el.querySelector(".fynns-control-row .fynns-switch"),
      );
      if (!tools) return null;
      const plus = tools.querySelector(
        ".fynns-control-cluster--toolbar-end .fynns-btn--primary",
      );
      const sw = tools.querySelector(".fynns-control-row .fynns-switch");
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
