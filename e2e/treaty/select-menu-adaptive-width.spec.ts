/**
 * Select portaled menu (≥ **0.5.209**): min-width = trigger, grows with
 * option labels (not locked to shell width). Sandbox: #select narrow host.
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

test("Select menu grows past narrow trigger for long option labels", async ({
  page,
}) => {
  await openGlobalsDemo(page, "select", "select");
  const demo = globalsDemo(page, "select");
  await expect(demo).toBeVisible();

  const narrow = demo.locator(".sandbox-select-narrow-host .fynns-select").first();
  await narrow.scrollIntoViewIfNeeded();
  const trigger = narrow.locator("button.fynns-select-trigger").first();
  await trigger.click();
  await expect(narrow).toHaveAttribute("data-expanded", "true");

  await expect(async () => {
    const geometry = await narrow.evaluate((el) => {
      const host = el as HTMLElement;
      const field = host.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      const menuEl = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      if (!field || !menuEl) return null;
      const fb = field.getBoundingClientRect();
      const mb = menuEl.getBoundingClientRect();
      const longOpt = [...menuEl.querySelectorAll("[role='option']")].find(
        (o) => (o.textContent || "").trim().length > 20,
      ) as HTMLElement | undefined;
      return {
        fieldWidth: fb.width,
        menuWidth: mb.width,
        longOptionVisible: Boolean(longOpt),
        longOptionOverflows:
          longOpt != null &&
          longOpt.scrollWidth <= longOpt.clientWidth + 1,
        menuWiderThanField: mb.width > fb.width + 8,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;
    expect(geometry.longOptionVisible).toBe(true);
    expect(geometry.menuWiderThanField).toBe(true);
    expect(geometry.longOptionOverflows).toBe(true);
  }).toPass({ timeout: 10_000 });
});
