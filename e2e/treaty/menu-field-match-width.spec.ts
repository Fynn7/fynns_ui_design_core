/**
 * DropdownMenu under FieldBlock (≥ **0.5.239**):
 * menu width = live trigger (Select 0.5.238 parity); long items ellipsize.
 * Sandbox: #menu / #sandbox-menu-field-match
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

test("FieldBlock DropdownMenu matches narrow trigger; long item ellipsizes", async ({
  page,
}) => {
  await openGlobalsDemo(page, "menu", "menu");
  const demo = globalsDemo(page, "menu");
  await expect(demo).toBeVisible();

  const host = demo.locator("#sandbox-menu-field-match .sandbox-select-narrow-host");
  await host.scrollIntoViewIfNeeded();
  const root = host.locator(".fynns-menu-root").first();
  const trigger = root.locator("button.fynns-btn").first();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await expect(async () => {
    const geometry = await root.evaluate((el) => {
      const btn = el.querySelector("button.fynns-btn") as HTMLElement | null;
      const menuEl = document.querySelector(
        ".fynns-menu.fynns-menu--match-trigger[role='menu']",
      ) as HTMLElement | null;
      if (!btn || !menuEl) {
        return {
          ok: false as const,
          hasBtn: Boolean(btn),
          hasMenu: Boolean(menuEl),
          rootMatch: el.getAttribute("data-match-trigger"),
        };
      }
      const tb = btn.getBoundingClientRect();
      const mb = menuEl.getBoundingClientRect();
      const longItem = [...menuEl.querySelectorAll("[role='menuitem']")].find(
        (o) => (o.textContent || "").trim().length > 20,
      ) as HTMLElement | undefined;
      const tipLabel = longItem?.querySelector(
        ".fynns-overflow-tip-label",
      ) as HTMLElement | null;
      return {
        ok: true as const,
        triggerWidth: tb.width,
        menuWidth: mb.width,
        longItemVisible: Boolean(longItem),
        longItemEllipsizes:
          tipLabel != null && tipLabel.scrollWidth > tipLabel.clientWidth + 1,
        hasOverflowTip: Boolean(
          longItem?.querySelector(".fynns-overflow-tip, .fynns-tooltip-trigger"),
        ),
        menuMatchesTrigger: Math.abs(mb.width - tb.width) < 8,
      };
    });
    expect(geometry.ok).toBe(true);
    if (!geometry.ok) return;
    expect(geometry.longItemVisible).toBe(true);
    expect(geometry.menuMatchesTrigger).toBe(true);
    expect(geometry.longItemEllipsizes).toBe(true);
    expect(geometry.hasOverflowTip).toBe(true);
  }).toPass({ timeout: 10_000 });
});
