/**
 * CONSUMER_TREATY slug: `wide Table wheel scrolls PageScroll (no wheel→X)`
 * AGENTS: `.fynns-scroll` H-overflow maps vertical wheel → scrollLeft (default on;
 * edge trap ≥ 0.5.186). Sandbox: #table
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "wide Table wheel scrolls PageScroll (no wheel→X)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: vertical wheel pans table wrap horizontally`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "table", "table");
  const demo = globalsDemo(page, "table");
  await expect(demo).toBeVisible();

  const wrap = demo.locator(".fynns-table-wrap.sandbox-table-h-scroll");
  await expect(wrap).toBeVisible();
  const pageScroll = page.locator(".fynns-page-scroll").first();

  const metrics = await wrap.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
  }));
  expect(
    metrics.scrollWidth - metrics.clientWidth,
    `${SLUG}: demo wrap must have H overflow`,
  ).toBeGreaterThan(8);
  expect(
    metrics.scrollHeight - metrics.clientHeight,
    `${SLUG}: H-scroll teaching wrap must not have Y overflow`,
  ).toBeLessThanOrEqual(1);

  await wrap.hover();
  const before = await wrap.evaluate((el) => el.scrollLeft);
  await page.mouse.wheel(0, 120);
  await expect
    .poll(async () => wrap.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(before);

  /* Slide back to start, then keep wheeling up — PageScroll must not jump. */
  await wrap.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await wrap.hover();
  const pageTop = await pageScroll.evaluate((el) => el.scrollTop);
  await page.mouse.wheel(0, -160);
  await expect
    .poll(async () => wrap.evaluate((el) => el.scrollLeft))
    .toBe(0);
  await expect
    .poll(async () => pageScroll.evaluate((el) => el.scrollTop))
    .toBe(pageTop);

  const wheelSwitch = demo.getByRole("switch", { name: /Wheel|滚轮/ });
  await wheelSwitch.click();
  await expect(wrap).toHaveAttribute("data-fynns-wheel-x", "off");

  await wrap.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await wrap.hover();
  await page.mouse.wheel(0, 120);
  await expect
    .poll(async () => wrap.evaluate((el) => el.scrollLeft))
    .toBe(0);
});
