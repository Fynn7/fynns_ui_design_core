/**
 * CONSUMER_TREATY slug: `ListItem Tab focus ring cracked by --with-end overlay`
 * AGENTS: host inset box-shadow on :focus-visible (≥ 0.5.218) — not child outline.
 * Sandbox: #list → #sandbox-list-recipe-catalog
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "ListItem Tab focus ring cracked by --with-end overlay";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: host paints inset focus ring; row button has no outline`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const host = demo.locator("#sandbox-list-recipe-catalog");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const row = host.locator(".fynns-list-item-host--with-end").first();
  const item = row.locator("> .fynns-list-item--interactive");
  await expect(item).toBeVisible();

  // Programmatic focus() does not set :focus-visible — Tab from a prior control.
  await item.evaluate((btn) => {
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => {
      const s = getComputedStyle(el);
      return (
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        !(el as HTMLButtonElement).disabled
      );
    });
    const idx = focusables.indexOf(btn as HTMLElement);
    if (idx > 0) focusables[idx - 1]!.focus();
  });
  await page.keyboard.press("Tab");
  await expect(item).toBeFocused();

  await expect(async () => {
    const styles = await row.evaluate((hostEl) => {
      const btn = hostEl.querySelector(
        ":scope > .fynns-list-item--interactive",
      ) as HTMLElement | null;
      if (!btn) return null;
      const hostCs = getComputedStyle(hostEl);
      const btnCs = getComputedStyle(btn);
      return {
        focusVisible: btn.matches(":focus-visible"),
        hostShadow: hostCs.boxShadow,
        btnOutlineStyle: btnCs.outlineStyle,
        btnOutlineWidth: btnCs.outlineWidth,
      };
    });
    expect(styles).toBeTruthy();
    expect(styles!.focusVisible).toBe(true);
    expect(
      styles!.btnOutlineStyle === "none" || styles!.btnOutlineWidth === "0px",
    ).toBe(true);
    expect(styles!.hostShadow).toMatch(/inset/i);
    expect(styles!.hostShadow).not.toBe("none");
  }).toPass({ timeout: 5_000 });
});
