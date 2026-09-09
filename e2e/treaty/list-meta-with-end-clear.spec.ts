/**
 * CONSUMER_TREATY slug: `List trailingSupportingText underlaps --with-end IconButtons`
 * AGENTS: hover/coarse reserve must clear in-row short meta (specificity ≥ 0.5.207).
 * Sandbox: #list → #sandbox-list-recipe-catalog / #sandbox-list-status-action
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "List trailingSupportingText underlaps --with-end IconButtons";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: hover reserve clears Builtin meta from IconButtons`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const host = demo.locator("#sandbox-list-recipe-catalog");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const row = host.locator(".fynns-list-item-host--with-end").first();
  await expect(row).toBeVisible();

  await expect(async () => {
    // Re-measure each pass — catalog layout can shift after mount/search jump.
    const box = await row.boundingBox();
    expect(box).toBeTruthy();
    await row.hover();
    await page.mouse.move(
      box!.x + Math.min(80, box!.width / 3),
      box!.y + box!.height / 2,
    );
    const gap = await row.evaluate((hostEl) => {
      const meta = hostEl.querySelector(".fynns-list-item-trailing-text");
      const firstIcon = hostEl.querySelector(
        ".fynns-list-item-trailing--end .fynns-btn--icon",
      );
      const item = hostEl.querySelector(".fynns-list-item");
      if (!meta || !firstIcon || !item) return -999;
      if (!hostEl.matches(":hover")) return -998;
      const pad = Number.parseFloat(getComputedStyle(item).paddingInlineEnd);
      if (!(pad >= 40)) return -997;
      const endOp = Number.parseFloat(
        getComputedStyle(
          hostEl.querySelector(".fynns-list-item-trailing--end")!,
        ).opacity,
      );
      if (!(endOp >= 0.95)) return -996;
      const m = meta.getBoundingClientRect();
      const i = firstIcon.getBoundingClientRect();
      return i.left - m.right;
    });
    expect(gap).toBeGreaterThanOrEqual(4);
  }).toPass({ timeout: 10_000 });
});
