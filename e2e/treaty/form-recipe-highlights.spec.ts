/**
 * CONSUMER_TREATY slug: `repeatable Textarea remove wraps below row`
 * AGENTS: end-align cluster + __grow Textarea; delete stays beside the well.
 * Sandbox: #form-recipe → #globals-demo-form-recipe
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "repeatable Textarea remove wraps below row";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: remove stays on same row as Textarea`, async ({ page }) => {
  await openGlobalsDemo(page, "form-recipe", "Inspector form recipe");
  const demo = globalsDemo(page, "form-recipe");
  const row = demo.locator(".fynns-control-cluster--end-align").filter({
    has: page.getByRole("button", { name: "Remove row" }),
  }).first();

  await expect(row).toBeVisible();
  const textarea = row.locator("textarea").first();
  const remove = row.getByRole("button", { name: "Remove row" });
  await expect(textarea).toBeVisible();
  await expect(remove).toBeVisible();

  const tBox = await textarea.boundingBox();
  const rBox = await remove.boundingBox();
  expect(tBox, SLUG).not.toBeNull();
  expect(rBox, SLUG).not.toBeNull();

  const topDelta = Math.abs(rBox!.y - tBox!.y);
  expect(topDelta, `${SLUG}: delete top-aligned with Textarea`).toBeLessThan(24);
  expect(
    rBox!.y,
    `${SLUG}: delete must not sit below the Textarea block`,
  ).toBeLessThan(tBox!.y + tBox!.height * 0.5);
});
