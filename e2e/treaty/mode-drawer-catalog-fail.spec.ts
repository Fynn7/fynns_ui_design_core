/**
 * CONSUMER_TREATY slug: `mode drawer InlineAlert essay`
 * AGENTS: short InlineAlert + InfoHint danger + end-align Retry in mode drawer.
 * Sandbox: #sandbox-navdrawer-mode-catalog-fail / #layouts-demo-navigation-drawer.
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "mode drawer InlineAlert essay";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: short alert; detail on InfoHint`, async ({ page }) => {
  await openLayoutsDemo(page, "navigation-drawer");
  const demo = layoutsDemo(page, "navigation-drawer");
  await expect(demo).toBeVisible();

  // Mode drawer defaults to live destinations so `--with-end` delete is
  // visible; opt into the catalog-fail teaching sample via the show control.
  await demo
    .getByRole("button", {
      name: /Show mode catalog load fail|显示模式侧栏目录加载失败/,
    })
    .click();

  const fail = demo.locator("#sandbox-navdrawer-mode-catalog-fail");
  await expect(fail).toBeVisible();

  const alert = fail.locator(".fynns-inline-alert");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText("Catalog failed to load");

  // Long diagnostic must not live in the alert body.
  await expect(alert).not.toContainText("Connection refused");
  await expect(alert).not.toContainText("hot reload");
  await expect(alert).not.toContainText("server log");

  await expect(fail.locator(".fynns-info-hint-trigger")).toBeVisible();
  await expect(
    fail.locator(".fynns-control-cluster--end-align .fynns-btn--tonal"),
  ).toHaveText("Retry");

  const box = await alert.boundingBox();
  expect(box, SLUG).not.toBeNull();
  expect(
    box!.height,
    `${SLUG}: alert should stay compact (got h=${box!.height})`,
  ).toBeLessThan(120);
});
