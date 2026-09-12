/**
 * CONSUMER_TREATY slug: `Select supporting copy kisses trigger`
 * AGENTS: control → supporting/teaching copy under Select uses
 * `--fynns-layout-field-hint-gap` (8dp) — never flush 0–4dp (≥ 0.5.230).
 * Live: #sandbox-select-wide-short.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Select supporting copy kisses trigger";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: wide-short Select→help gap ≥ field-hint-gap`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  await expect(demo).toBeVisible();

  const host = demo.locator("#sandbox-select-wide-short");
  await host.scrollIntoViewIfNeeded();
  const trigger = host.locator("button.fynns-select-trigger").first();
  const help = host.locator(".sandbox-help").first();
  await expect(trigger).toBeVisible();
  await expect(help).toBeVisible();

  await expect(async () => {
    const metrics = await host.evaluate((el) => {
      const trig = el.querySelector(
        "button.fynns-select-trigger",
      ) as HTMLElement | null;
      const hint = el.querySelector(".sandbox-help") as HTMLElement | null;
      if (!trig || !hint) return null;
      const gap = hint.getBoundingClientRect().top - trig.getBoundingClientRect().bottom;
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue("--fynns-layout-field-hint-gap")
        .trim();
      const hostGap = getComputedStyle(el).gap;
      return { gap: +gap.toFixed(2), token, hostGap };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.token).toBe("0.5rem");
    expect(metrics!.gap).toBeGreaterThanOrEqual(7);
  }).toPass({ timeout: 10_000 });
});
