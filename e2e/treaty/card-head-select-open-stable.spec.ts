/**
 * CONSUMER_TREATY slug: `Card head Select open yanks title band`
 * AGENTS: Card/Collapsible head must keep center band while Select opens —
 * portaled menu must not trigger docked SearchBar expand grid (≥ 0.5.227).
 * Live: #sandbox-card-head-select.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Card head Select open yanks title band";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: head/actions/shell geometry unchanged when Select opens`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "Card");
  const clearSearch = page.getByRole("button", { name: "Clear search" });
  if (await clearSearch.isVisible().catch(() => false)) {
    await clearSearch.click();
  }

  const demo = globalsDemo(page, "card");
  await expect(demo).toBeVisible();
  const host = demo.locator("#sandbox-card-head-select");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const head = host.locator(".fynns-card-head").first();
  const actions = host.locator(".fynns-card-actions").first();
  const shell = host.locator(".fynns-select > .fynns-select-shell").first();

  const closed = await head.evaluate((el) => {
    const card = el.closest(".fynns-card") as HTMLElement;
    const actionsEl = el.querySelector(".fynns-card-actions") as HTMLElement;
    const shellEl = el.querySelector(
      ".fynns-select > .fynns-select-shell",
    ) as HTMLElement;
    const lead = el.querySelector(".fynns-card-lead") as HTMLElement | null;
    const headBox = el.getBoundingClientRect();
    const actionsBox = actionsEl.getBoundingClientRect();
    const shellBox = shellEl.getBoundingClientRect();
    return {
      headDisplay: getComputedStyle(el).display,
      headAlign: getComputedStyle(el).alignItems,
      cardOverflow: card ? getComputedStyle(card).overflow : "",
      actionsTopRel: actionsBox.top - headBox.top,
      actionsLeftRel: actionsBox.left - headBox.left,
      shellTopRel: shellBox.top - headBox.top,
      shellLeftRel: shellBox.left - headBox.left,
      shellW: shellBox.width,
      leadTopRel: lead ? lead.getBoundingClientRect().top - headBox.top : null,
    };
  });

  await host.locator("button.fynns-select-trigger").first().click();
  await expect(page.locator(".fynns-select-menu")).toBeVisible();

  const open = await head.evaluate((el) => {
    const card = el.closest(".fynns-card") as HTMLElement;
    const actionsEl = el.querySelector(".fynns-card-actions") as HTMLElement;
    const shellEl = el.querySelector(
      ".fynns-select > .fynns-select-shell",
    ) as HTMLElement;
    const select = el.querySelector(".fynns-select") as HTMLElement;
    const lead = el.querySelector(".fynns-card-lead") as HTMLElement | null;
    const headBox = el.getBoundingClientRect();
    const actionsBox = actionsEl.getBoundingClientRect();
    const shellBox = shellEl.getBoundingClientRect();
    return {
      headDisplay: getComputedStyle(el).display,
      headAlign: getComputedStyle(el).alignItems,
      cardOverflow: card ? getComputedStyle(card).overflow : "",
      actionsTopRel: actionsBox.top - headBox.top,
      actionsLeftRel: actionsBox.left - headBox.left,
      shellTopRel: shellBox.top - headBox.top,
      shellLeftRel: shellBox.left - headBox.left,
      shellW: shellBox.width,
      leadTopRel: lead ? lead.getBoundingClientRect().top - headBox.top : null,
      selectOpen: select.classList.contains("fynns-select--open"),
      dataExpanded: select.getAttribute("data-expanded"),
    };
  });

  expect(open.selectOpen, SLUG).toBe(true);
  expect(open.dataExpanded, SLUG).toBe("true");
  expect(open.headDisplay, `${SLUG}: head must not switch to grid`).not.toBe(
    "grid",
  );
  expect(
    open.headAlign,
    `${SLUG}: head align must stay center (was ${open.headAlign})`,
  ).toBe(closed.headAlign);
  expect(
    Math.abs(open.actionsTopRel - closed.actionsTopRel),
    `${SLUG}: actions top jumped`,
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

  await expect(actions).toBeVisible();
  await expect(shell).toBeVisible();
});
