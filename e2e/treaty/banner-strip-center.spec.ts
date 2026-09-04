/**
 * CONSUMER_TREATY slug: Banner strip center (icon | body | dismiss)
 * AGENTS Hard rules: DON'T top-align Banner leading icon or dismiss X against
 * multi-line supportingText — cross-axis center; dismiss only inside host.
 * Sandbox: #banner → #globals-demo-banner
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Banner strip icon/dismiss top-aligned on multi-line";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: icon and dismiss midY ≈ banner midY`, async ({ page }) => {
  await openGlobalsDemo(page, "banner", "Banner");
  const demo = globalsDemo(page, "banner");

  // Ensure the dismissible tonal banner is visible.
  const show = demo.getByRole("button", { name: "Show banner" });
  if (await show.isVisible().catch(() => false)) {
    await show.click();
  }

  const banner = demo.locator(".fynns-banner--tonal").first();
  await expect(banner).toBeVisible();

  // Force wrap so supportingText is multi-line (regression target).
  await banner.evaluate((el) => {
    (el as HTMLElement).style.maxWidth = "18rem";
  });

  const dismiss = banner.getByRole("button", { name: "Dismiss banner" });
  const icon = banner.locator(".fynns-banner-icon");
  await expect(dismiss).toBeVisible();
  await expect(icon).toBeVisible();

  const metrics = await banner.evaluate((el) => {
    const iconEl = el.querySelector(".fynns-banner-icon") as HTMLElement | null;
    const dismissEl = el.querySelector(
      '.fynns-banner-trailing button[aria-label]',
    ) as HTMLElement | null;
    const supporting = el.querySelector(
      ".fynns-banner-supporting",
    ) as HTMLElement | null;
    const br = el.getBoundingClientRect();
    const ir = iconEl?.getBoundingClientRect();
    const dr = dismissEl?.getBoundingClientRect();
    const sr = supporting?.getBoundingClientRect();
    return {
      bannerMidY: br.top + br.height / 2,
      iconMidY: ir ? ir.top + ir.height / 2 : null,
      dismissMidY: dr ? dr.top + dr.height / 2 : null,
      supportingHeight: sr?.height ?? 0,
      dismissInside: !!dismissEl && el.contains(dismissEl),
    };
  });

  expect(metrics.dismissInside, `${SLUG}: dismiss must live inside Banner`).toBe(
    true,
  );
  expect(
    metrics.supportingHeight,
    `${SLUG}: supportingText should wrap (>1 line)`,
  ).toBeGreaterThan(20);
  expect(metrics.iconMidY, SLUG).not.toBeNull();
  expect(metrics.dismissMidY, SLUG).not.toBeNull();

  const iconDelta = Math.abs(metrics.iconMidY! - metrics.bannerMidY);
  const dismissDelta = Math.abs(metrics.dismissMidY! - metrics.bannerMidY);
  expect(iconDelta, `${SLUG}: icon midY vs banner midY`).toBeLessThan(6);
  expect(dismissDelta, `${SLUG}: dismiss midY vs banner midY`).toBeLessThan(6);
});
