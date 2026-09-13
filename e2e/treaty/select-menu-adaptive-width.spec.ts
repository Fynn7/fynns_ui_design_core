/**
 * Select portaled menu:
 * - ≥ **0.5.238**: menu width = live trigger shell (long labels ellipsize)
 * - ≥ **0.5.220** / ≥ **0.5.244**: matches a stretched fullWidth field (not a short-label chip)
 * Sandbox: #select / #sandbox-select-wide-short
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test("Select menu matches narrow trigger; long option ellipsizes", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  await expect(demo).toBeVisible();

  const narrow = demo.locator(".sandbox-select-narrow-host .fynns-select").first();
  await narrow.scrollIntoViewIfNeeded();
  const trigger = narrow.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(narrow).toHaveAttribute("data-expanded", "true");

  await expect(async () => {
    const geometry = await narrow.evaluate((el) => {
      const host = el as HTMLElement;
      const field = host.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      const menuEl = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      if (!field || !menuEl) return null;
      const fb = field.getBoundingClientRect();
      const mb = menuEl.getBoundingClientRect();
      const longOpt = [...menuEl.querySelectorAll("[role='option']")].find(
        (o) => (o.textContent || "").trim().length > 20,
      ) as HTMLElement | undefined;
      const tipLabel = longOpt?.querySelector(
        ".fynns-overflow-tip-label",
      ) as HTMLElement | null;
      return {
        fieldWidth: fb.width,
        menuWidth: mb.width,
        longOptionVisible: Boolean(longOpt),
        longOptionEllipsizes:
          tipLabel != null && tipLabel.scrollWidth > tipLabel.clientWidth + 1,
        hasOverflowTip: Boolean(
          longOpt?.querySelector(".fynns-overflow-tip, .fynns-tooltip-trigger"),
        ),
        menuMatchesField: Math.abs(mb.width - fb.width) < 8,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;
    expect(geometry.longOptionVisible).toBe(true);
    expect(geometry.menuMatchesField).toBe(true);
    expect(geometry.longOptionEllipsizes).toBe(true);
    expect(geometry.hasOverflowTip).toBe(true);
  }).toPass({ timeout: 10_000 });
});

test("Select menu matches stretched wide field for short options", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  await expect(demo).toBeVisible();

  const wide = demo.locator("#sandbox-select-wide-short .fynns-select").first();
  await wide.scrollIntoViewIfNeeded();
  const trigger = wide.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(wide).toHaveAttribute("data-expanded", "true");

  await expect(async () => {
    const geometry = await wide.evaluate((el) => {
      const host = el as HTMLElement;
      const field = host.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      const menuEl = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      if (!field || !menuEl) return null;
      const fb = field.getBoundingClientRect();
      const mb = menuEl.getBoundingClientRect();
      return {
        fieldWidth: fb.width,
        menuWidth: mb.width,
        menuMatchesField: Math.abs(mb.width - fb.width) < 8,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;
    expect(geometry.fieldWidth).toBeGreaterThan(280);
    expect(geometry.menuMatchesField).toBe(true);
  }).toPass({ timeout: 10_000 });
});

test("Bare Select stays content-sized; trigger label not empty shell", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  await expect(demo).toBeVisible();

  const bare = demo.locator(".fynns-select").first();
  await bare.scrollIntoViewIfNeeded();

  await expect(async () => {
    const geometry = await bare.evaluate((el) => {
      const host = el as HTMLElement;
      const demoHost = host.closest("[id^='globals-demo-']") as HTMLElement | null;
      const tipLabel = host.querySelector(
        ".fynns-select-trigger-text .fynns-overflow-tip-label",
      ) as HTMLElement | null;
      if (!demoHost || !tipLabel) return null;
      const hw = host.getBoundingClientRect().width;
      const dw = demoHost.getBoundingClientRect().width;
      const tipW = tipLabel.getBoundingClientRect().width;
      return {
        hostWidth: hw,
        demoWidth: dw,
        tipWidth: tipW,
        label: (tipLabel.textContent || "").trim(),
        contentSized: hw < dw * 0.75 && hw > 40,
        tipVisible: tipW > 8,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;
    expect(geometry.label.length).toBeGreaterThan(0);
    expect(geometry.contentSized).toBe(true);
    expect(geometry.tipVisible).toBe(true);
  }).toPass({ timeout: 10_000 });
});

test("Narrow Select long value keeps visible trigger tip (not width:0 shell)", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  const narrow = demo.locator(".sandbox-select-narrow-host .fynns-select").first();
  await narrow.scrollIntoViewIfNeeded();
  const trigger = narrow.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(narrow).toHaveAttribute("data-expanded", "true");

  const longOpt = page
    .locator(".fynns-select-menu[role='listbox'] [role='option']")
    .filter({ hasText: /sample-workspace|示例工作区/ })
    .first();
  await expect(longOpt).toBeVisible();
  await longOpt.click();
  await expect(narrow).not.toHaveAttribute("data-expanded", "true");

  await expect(async () => {
    const tip = await narrow.evaluate((el) => {
      const tipLabel = el.querySelector(
        ".fynns-select-trigger-text .fynns-overflow-tip-label",
      ) as HTMLElement | null;
      if (!tipLabel) return null;
      return {
        tipWidth: tipLabel.getBoundingClientRect().width,
        clientWidth: tipLabel.clientWidth,
        scrollWidth: tipLabel.scrollWidth,
        text: (tipLabel.textContent || "").trim(),
      };
    });
    expect(tip).toBeTruthy();
    if (!tip) return;
    expect(tip.tipWidth).toBeGreaterThan(8);
    expect(tip.clientWidth).toBeGreaterThan(0);
    expect(tip.text.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10_000 });
});
