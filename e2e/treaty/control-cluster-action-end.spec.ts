/**
 * CONSUMER_TREATY slug:
 * `ControlRow / control-cluster Buttons left-packed under label`
 * AGENTS: cluster flex-end (≥ 0.5.158).
 * Sandbox: #rhythm end-align strip (labeled Buttons).
 *
 * Probe / install / sync-status walls were removed from Globals — label-floor
 * and long-path overlap stay documented in DESIGN_SYSTEM (no live anti-demo).
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG_END =
  "ControlRow / control-cluster Buttons left-packed under label";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG_END}: labeled end-align cluster packs to trailing edge`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "rhythm", "Toolbar rhythm");
  const demo = globalsDemo(page, "rhythm");
  const primary = demo.getByRole("button", {
    name: /Primary action|主要操作/,
  });
  await expect(primary).toBeVisible();
  await primary.scrollIntoViewIfNeeded();

  const cluster = primary.locator(
    "xpath=ancestor::*[contains(@class,'fynns-control-cluster--end-align')][1]",
  );
  await expect(cluster).toBeVisible();

  await expect(async () => {
    const clusterBox = await cluster.boundingBox();
    const buttonBox = await primary.boundingBox();
    expect(clusterBox).toBeTruthy();
    expect(buttonBox).toBeTruthy();
    if (!clusterBox || !buttonBox) return;

    const clusterMid = clusterBox.x + clusterBox.width / 2;
    expect(buttonBox.x + buttonBox.width).toBeGreaterThan(clusterMid);
    expect(
      clusterBox.x + clusterBox.width - (buttonBox.x + buttonBox.width),
    ).toBeLessThan(24);
  }).toPass({ timeout: 10_000 });
});
