/**
 * CONSUMER_TREATY slug: `Input trailing md IconButton in field shell`
 * AGENTS: Input trailing in-field icons are sm (32dp), never md 40dp disks.
 * Sandbox: #field-header → #globals-demo-field-header
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Input trailing md IconButton in field shell";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: reveal IconButton ≈ 32dp in field affix`, async ({ page }) => {
  await openGlobalsDemo(page, "field-header", "FieldHeader");
  const demo = globalsDemo(page, "field-header");
  const reveal = demo
    .locator("#sandbox-field-header-api-key")
    .locator("xpath=ancestor::*[contains(@class,'fynns-field-shell')][1]")
    .locator(".fynns-field-affix--trailing .fynns-btn--icon")
    .first();

  await expect(reveal).toBeVisible();
  const box = await reveal.boundingBox();
  expect(box, SLUG).not.toBeNull();
  expect(box!.width, `${SLUG}: width ~32dp not 40dp`).toBeGreaterThanOrEqual(30);
  expect(box!.width, `${SLUG}: width ~32dp not 40dp`).toBeLessThanOrEqual(34);
  expect(box!.height, `${SLUG}: height ~32dp not 40dp`).toBeGreaterThanOrEqual(30);
  expect(box!.height, `${SLUG}: height ~32dp not 40dp`).toBeLessThanOrEqual(34);
});
