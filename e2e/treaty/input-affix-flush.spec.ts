/**
 * CONSUMER_TREATY slug: `Input trailing affix far from shell edge`
 * AGENTS: affix-owned Input shell edge uses capsule-chrome (4dp) only —
 * not text capsule + field-pad (16dp). Plain Input keeps 16dp (≥ 0.5.237).
 * Live: #password / #input.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Input trailing affix far from shell edge";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: password trailing shell end ≈ capsule-chrome 4dp`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "password", "Password");
  const demo = globalsDemo(page, "password");
  const shell = demo.locator(".fynns-field-shell").first();
  const reveal = shell.locator(".fynns-field-affix--trailing .fynns-btn--icon");

  await expect(shell).toBeVisible();
  await expect(reveal).toBeVisible();

  await expect(async () => {
    const metrics = await shell.evaluate((el) => {
      const cs = getComputedStyle(el);
      const btn = el.querySelector(
        ".fynns-field-affix--trailing .fynns-btn--icon",
      ) as HTMLElement | null;
      if (!btn) return null;
      const shellBox = el.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue("--fynns-layout-capsule-chrome-pad-inline")
        .trim();
      return {
        padEnd: parseFloat(cs.paddingInlineEnd),
        clearEnd: +(shellBox.right - btnBox.right).toFixed(2),
        token,
      };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.token).toBe("0.25rem");
    expect(metrics!.padEnd, `${SLUG}: pad-end ~4dp not 16dp`).toBeGreaterThanOrEqual(
      3,
    );
    expect(metrics!.padEnd, `${SLUG}: pad-end ~4dp not 16dp`).toBeLessThanOrEqual(
      5,
    );
    expect(metrics!.clearEnd, `${SLUG}: eye clears shell ≤ ~6dp`).toBeLessThanOrEqual(
      6,
    );
    expect(metrics!.clearEnd, `${SLUG}: eye not flush-zero`).toBeGreaterThanOrEqual(
      2,
    );
  }).toPass({ timeout: 10_000 });
});

test(`${SLUG}: plain Input keeps 16dp text pad; leading affix flush`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "input", "Input");
  const demo = globalsDemo(page, "input");
  const plain = demo.locator("#sandbox-input-plain");
  const leadingShell = demo
    .locator("#sandbox-input-leading-affix")
    .locator("xpath=ancestor::*[contains(@class,'fynns-field-shell')][1]");

  await expect(plain).toBeVisible();
  await expect(leadingShell).toBeVisible();

  await expect(async () => {
    const metrics = await page.evaluate(() => {
      const plainEl = document.querySelector(
        "#sandbox-input-plain",
      ) as HTMLElement | null;
      const leadInput = document.querySelector(
        "#sandbox-input-leading-affix",
      ) as HTMLElement | null;
      const leadShell = leadInput?.closest(
        ".fynns-field-shell",
      ) as HTMLElement | null;
      if (!plainEl || !leadShell) return null;
      const plainPad = parseFloat(getComputedStyle(plainEl).paddingInlineStart);
      const leadPad = parseFloat(
        getComputedStyle(leadShell).paddingInlineStart,
      );
      return { plainPad, leadPad };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.plainPad, `${SLUG}: plain text pad ~16dp`).toBeGreaterThanOrEqual(
      14,
    );
    expect(metrics!.plainPad, `${SLUG}: plain text pad ~16dp`).toBeLessThanOrEqual(
      18,
    );
    expect(
      metrics!.leadPad,
      `${SLUG}: leading affix pad-start ~4dp`,
    ).toBeGreaterThanOrEqual(3);
    expect(
      metrics!.leadPad,
      `${SLUG}: leading affix pad-start ~4dp`,
    ).toBeLessThanOrEqual(5);
  }).toPass({ timeout: 10_000 });
});
