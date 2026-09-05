/**
 * CONSUMER_TREATY slug: `repeatable Textarea remove wraps below row`
 * AGENTS: end-align cluster + __grow Textarea; delete stays beside the well
 * (cluster `align-items: center` — delete mid may sit mid-well, not top).
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
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: remove stays beside Textarea (not wrapped under)`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "form-recipe", "Inspector form recipe");
  const demo = globalsDemo(page, "form-recipe");

  // Prefer the Card host sample (first FieldStack highlights row).
  const card = demo.locator(".fynns-card").first();
  const row = card.locator(".fynns-control-cluster--end-align").filter({
    has: page.getByRole("button", { name: "Remove row" }),
  }).first();

  await expect(row).toBeVisible();
  const textarea = row.locator("textarea").first();
  const remove = row.getByRole("button", { name: "Remove row" });
  await expect(textarea).toBeVisible();
  await expect(remove).toBeVisible();

  // Parallel e2e workers share one sandbox — wait until geometry settles.
  await expect(async () => {
    const tBox = await textarea.boundingBox();
    const rBox = await remove.boundingBox();
    expect(tBox, SLUG).not.toBeNull();
    expect(rBox, SLUG).not.toBeNull();

    expect(
      rBox!.x,
      `${SLUG}: delete must sit to the end side of the Textarea`,
    ).toBeGreaterThan(tBox!.x + tBox!.width * 0.4);

    const removeBottom = rBox!.y + rBox!.height;
    const textareaBottom = tBox!.y + tBox!.height;
    expect(
      rBox!.y < textareaBottom && removeBottom > tBox!.y,
      `${SLUG}: delete must vertically overlap the Textarea (not wrap under)`,
    ).toBe(true);
  }).toPass({ timeout: 10_000 });
});
