/**
 * CONSUMER_TREATY slugs:
 * - `ControlRow / control-cluster Buttons left-packed under label`
 * - `ControlRow label crushed to 2px / hairline sliver`
 * AGENTS: cluster flex-end (≥ 0.5.158); label track floor (≥ 0.5.159).
 * Sandbox: #rhythm → #sandbox-rhythm-action-end
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG_END =
  "ControlRow / control-cluster Buttons left-packed under label";
const SLUG_LABEL = "ControlRow label crushed to 2px / hairline sliver";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG_END}: meta+Button cluster end-packs (not under label)`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "rhythm", "Toolbar rhythm");
  const demo = globalsDemo(page, "rhythm");
  const host = demo.locator("#sandbox-rhythm-action-end");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const pendingRow = host.locator(".fynns-control-row").filter({
    has: page.getByText("Needs setup", { exact: true }),
  });
  await expect(pendingRow).toBeVisible();

  const label = pendingRow.locator(".fynns-control-row__label");
  const button = pendingRow.getByRole("button", { name: "Configure" });
  await expect(button).toBeVisible();

  await expect(async () => {
    const labelBox = await label.boundingBox();
    const buttonBox = await button.boundingBox();
    const rowBox = await pendingRow.boundingBox();
    expect(labelBox).toBeTruthy();
    expect(buttonBox).toBeTruthy();
    expect(rowBox).toBeTruthy();
    if (!labelBox || !buttonBox || !rowBox) return;

    expect(buttonBox.x).toBeGreaterThan(labelBox.x + labelBox.width);
    const rowMid = rowBox.x + rowBox.width / 2;
    expect(buttonBox.x + buttonBox.width).toBeGreaterThan(rowMid);
    expect(rowBox.x + rowBox.width - (buttonBox.x + buttonBox.width)).toBeLessThan(
      24,
    );
  }).toPass({ timeout: 10_000 });
});

test(`${SLUG_LABEL}: Ready label stays ≥ control-row-label with long meta`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "rhythm", "Toolbar rhythm");
  const demo = globalsDemo(page, "rhythm");
  const host = demo.locator("#sandbox-rhythm-action-end");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const readyRow = host.locator(".fynns-control-row").filter({
    has: page.getByText("Ready", { exact: true }),
  }).first();
  const label = readyRow.locator(".fynns-control-row__label");
  await expect(label).toBeVisible();

  await expect(async () => {
    const labelBox = await label.boundingBox();
    expect(labelBox).toBeTruthy();
    if (!labelBox) return;
    // --fynns-layout-control-row-label = 7.5rem ≈ 120px at 16px root.
    expect(labelBox.width).toBeGreaterThanOrEqual(100);
    await expect(label).toHaveText("Ready");
  }).toPass({ timeout: 10_000 });
});
