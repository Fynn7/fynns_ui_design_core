/**
 * CONSUMER_TREATY slug: `FullscreenDialog settings column sheet-max / content-sized`
 * AGENTS: FullscreenDialog body children stretch inline (≥ 0.5.186).
 * Sandbox: #overlays / fullscreen open.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "FullscreenDialog settings column sheet-max / content-sized";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Card stack fills fullscreen body`, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openGlobalsDemo(page, "overlays", "dialogshell");
  const demo = globalsDemo(page, "overlays");
  await demo.getByRole("button", { name: "Open fullscreen dialog" }).click();
  const dialog = page.locator(".fynns-dialog--fullscreen[data-state='open']");
  await expect(dialog).toBeVisible();

  await expect(async () => {
    const metrics = await dialog.evaluate((host) => {
      const body = host.querySelector(".fynns-dialog-body");
      const stack = body?.querySelector(".fynns-unit-stack");
      const card = body?.querySelector(".fynns-card");
      if (!body || !stack || !card) return null;
      const br = body.getBoundingClientRect();
      const sr = stack.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const bcs = getComputedStyle(body);
      const padInline =
        parseFloat(bcs.paddingLeft || "0") + parseFloat(bcs.paddingRight || "0");
      return {
        bodyWidth: br.width,
        stackWidth: sr.width,
        cardWidth: cr.width,
        padInline,
        sheetCapPx: 640,
      };
    });
    expect(metrics, SLUG).not.toBeNull();
    expect(
      metrics!.stackWidth,
      `${SLUG}: unit-stack must fill dialog body (minus pad)`,
    ).toBeGreaterThan(metrics!.bodyWidth - metrics!.padInline - 4);
    expect(
      Math.abs(metrics!.stackWidth - (metrics!.bodyWidth - metrics!.padInline)),
      `${SLUG}: stack vs body content box`,
    ).toBeLessThanOrEqual(3);
    expect(
      metrics!.cardWidth,
      `${SLUG}: Card must exceed sheet-max`,
    ).toBeGreaterThan(metrics!.sheetCapPx + 8);
    expect(
      Math.abs(metrics!.cardWidth - metrics!.stackWidth),
      `${SLUG}: Card vs unit-stack width`,
    ).toBeLessThanOrEqual(2);
  }).toPass({ timeout: 10_000 });
});
