/**
 * CONSUMER_TREATY slug: `inspector Select open yanks trailing`
 * AGENTS: List `--with-end` Select ± CTA stays cross-axis centered while
 * open — portaled menu must not trigger Autocomplete docked flex-start
 * (≥ 0.5.226). Live: #sandbox-list-inspector-trailing.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "inspector Select open yanks trailing";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: host/trailing/shell geometry unchanged when Select opens`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  // Sticky SearchBar stays expanded after the jump and intercepts trailing clicks.
  const clearSearch = page.getByRole("button", { name: "Clear search" });
  if (await clearSearch.isVisible().catch(() => false)) {
    await clearSearch.click();
  }
  const demo = globalsDemo(page, "list");
  await expect(demo).toBeVisible();

  const list = demo.locator("#sandbox-list-inspector-trailing");
  await expect(list).toBeVisible();
  const host = list.locator(".fynns-list-item-host--with-end").first();
  await host.scrollIntoViewIfNeeded();

  const closed = await host.evaluate((el) => {
    const endEl = el.querySelector(
      ".fynns-list-item-trailing--end",
    ) as HTMLElement;
    const shellEl = el.querySelector(".fynns-select-shell") as HTMLElement;
    const hostBox = el.getBoundingClientRect();
    const endBox = endEl.getBoundingClientRect();
    const shellBox = shellEl.getBoundingClientRect();
    return {
      hostAlign: getComputedStyle(el).alignItems,
      endTopRel: endBox.top - hostBox.top,
      endLeftRel: endBox.left - hostBox.left,
      shellTopRel: shellBox.top - hostBox.top,
      shellLeftRel: shellBox.left - hostBox.left,
      shellW: shellBox.width,
    };
  });

  await host.locator("button.fynns-select-trigger").first().click();
  await expect(page.locator(".fynns-select-menu")).toBeVisible();

  const open = await host.evaluate((el) => {
    const endEl = el.querySelector(
      ".fynns-list-item-trailing--end",
    ) as HTMLElement;
    const shellEl = el.querySelector(".fynns-select-shell") as HTMLElement;
    const select = el.querySelector(".fynns-select") as HTMLElement;
    const hostBox = el.getBoundingClientRect();
    const endBox = endEl.getBoundingClientRect();
    const shellBox = shellEl.getBoundingClientRect();
    return {
      hostAlign: getComputedStyle(el).alignItems,
      endTopRel: endBox.top - hostBox.top,
      endLeftRel: endBox.left - hostBox.left,
      shellTopRel: shellBox.top - hostBox.top,
      shellLeftRel: shellBox.left - hostBox.left,
      shellW: shellBox.width,
      selectOpen: select.classList.contains("fynns-select--open"),
      endAlignSelf: getComputedStyle(endEl).alignSelf,
    };
  });

  expect(open.selectOpen, SLUG).toBe(true);
  expect(open.hostAlign, `${SLUG}: host must stay center`).toBe("center");
  expect(open.endAlignSelf, `${SLUG}: trailing must not flex-start`).not.toBe(
    "flex-start",
  );
  expect(
    Math.abs(open.endTopRel - closed.endTopRel),
    `${SLUG}: trailing top jumped ${closed.endTopRel} → ${open.endTopRel}`,
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(open.endLeftRel - closed.endLeftRel),
    `${SLUG}: trailing left jumped`,
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(open.shellTopRel - closed.shellTopRel),
    `${SLUG}: Select shell top jumped`,
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(open.shellLeftRel - closed.shellLeftRel),
    `${SLUG}: Select shell left jumped`,
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(open.shellW - closed.shellW),
    `${SLUG}: Select shell width jumped`,
  ).toBeLessThanOrEqual(1);
});
