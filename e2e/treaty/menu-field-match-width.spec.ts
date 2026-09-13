/**
 * DropdownMenu under FieldBlock (≥ **0.5.239** / ≥ **0.5.254** / ≥ **0.5.255**):
 * menu width = live trigger; left flush with trigger; labeled chevron present
 * and vertically centered; trigger OverflowTip must not clip Latin descenders
 * (line-height snug, not 1).
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
  const trigger = root.locator("button.fynns-menu-trigger-btn").first();
  await expect(trigger.locator(".fynns-menu-trigger-chevron")).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await expect(async () => {
    const geometry = await root.evaluate((el) => {
      const btn = el.querySelector(
        "button.fynns-menu-trigger-btn",
      ) as HTMLElement | null;
      const chev = btn?.querySelector(
        ".fynns-menu-trigger-trailing .fynns-menu-trigger-chevron",
      ) as HTMLElement | null;
      const label = btn?.querySelector(
        ".fynns-menu-trigger-label",
      ) as HTMLElement | null;
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
      const cr = chev?.getBoundingClientRect();
      const lr = label?.getBoundingClientRect();
      const tipLabelHost = label?.querySelector(
        ".fynns-overflow-tip-label",
      ) as HTMLElement | null;
      const tipCs = tipLabelHost ? getComputedStyle(tipLabelHost) : null;
      const hostCs = label ? getComputedStyle(label) : null;
      const fs = tipCs ? parseFloat(tipCs.fontSize) : 0;
      const lh = tipCs ? parseFloat(tipCs.lineHeight) : 0;
      let descenderClip = 0;
      if (tipLabelHost) {
        const probe = tipLabelHost.cloneNode(true) as HTMLElement;
        probe.textContent = "gyjpq";
        probe.style.cssText =
          "position:absolute;left:-9999px;visibility:hidden;pointer-events:none";
        tipLabelHost.parentElement?.append(probe);
        const box = probe.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(probe);
        const ink = range.getBoundingClientRect();
        descenderClip = Math.max(0, ink.bottom - box.bottom);
        probe.remove();
      }
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
        leftDelta: Math.abs(mb.left - tb.left),
        hasChevron: Boolean(chev),
        chevMidVsLabel:
          cr && lr
            ? Math.abs(cr.top + cr.height / 2 - (lr.top + lr.height / 2))
            : null,
        lineHeightRatio: fs > 0 ? lh / fs : 0,
        hostLineHeight: hostCs?.lineHeight ?? null,
        descenderClip,
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
    expect(geometry.hasChevron).toBe(true);
    expect(geometry.longItemVisible).toBe(true);
    expect(geometry.menuMatchesTrigger).toBe(true);
    expect(geometry.leftDelta).toBeLessThan(2);
    expect(geometry.lineHeightRatio).toBeGreaterThanOrEqual(1.2);
    expect(geometry.descenderClip).toBeLessThan(0.5);
    expect(geometry.chevMidVsLabel == null || geometry.chevMidVsLabel < 3).toBe(
      true,
    );
    expect(geometry.longItemEllipsizes).toBe(true);
    expect(geometry.hasOverflowTip).toBe(true);
  }).toPass({ timeout: 10_000 });
});
