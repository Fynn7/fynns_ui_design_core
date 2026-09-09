/**
 * IconButton primary + loading (≥ **0.5.217**): Spinner must be visible on
 * filled accent chrome (not accent-on-accent blank). Sandbox:
 * #sandbox-iconbutton-primary-loading
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

test("IconButton busy swaps CircularProgress instead of loading: primary loading Spinner is visible", async ({
  page,
}) => {
  await openGlobalsDemo(page, "icon-button", "icon");
  const demo = globalsDemo(page, "icon-button");
  await expect(demo).toBeVisible();

  const host = demo.locator("#sandbox-iconbutton-primary-loading .fynns-btn").first();
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveClass(/fynns-btn--primary/);
  await expect(host).toHaveClass(/fynns-btn--loading/);
  await expect(host).toHaveAttribute("aria-busy", "true");

  const spinner = host.locator(".fynns-loading-spinner-ring").first();
  await expect(spinner).toBeVisible();

  await expect(async () => {
    const contrast = await host.evaluate((el) => {
      const btn = el as HTMLElement;
      const ring = btn.querySelector(
        ".fynns-loading-spinner-ring",
      ) as HTMLElement | null;
      if (!ring) return null;
      const bs = getComputedStyle(btn);
      const rs = getComputedStyle(ring);
      const parseRgb = (c: string) => {
        const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!m) return null;
        return [Number(m[1]), Number(m[2]), Number(m[3])] as const;
      };
      const bg = parseRgb(bs.backgroundColor);
      const top = parseRgb(rs.borderTopColor);
      if (!bg || !top) return { ok: false, reason: "parse" };
      const dist = Math.hypot(bg[0] - top[0], bg[1] - top[1], bg[2] - top[2]);
      return {
        ok: dist > 40,
        dist: Math.round(dist),
        bg: bs.backgroundColor,
        top: rs.borderTopColor,
      };
    });
    expect(contrast).toBeTruthy();
    if (!contrast) return;
    expect(contrast.ok).toBe(true);
  }).toPass({ timeout: 10_000 });
});
