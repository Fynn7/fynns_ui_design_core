/**
 * CONSUMER_TREATY slug: `Card teaching help kisses shell`
 * AGENTS: Card shell ↔ teaching/muted helper uses unit-stack-gap (16dp) —
 * not field-hint-gap (8dp); never flush / ≤8dp (≥ 0.5.233).
 * Live: #sandbox-card-draft-actions / #sandbox-card-chrome-icon-actions /
 * #sandbox-card-head-primary-end.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "Card teaching help kisses shell";

const HOSTS = [
  "sandbox-card-draft-actions",
  "sandbox-card-chrome-icon-actions",
  "sandbox-card-head-primary-end",
] as const;

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Card↔SandboxHelp gap ≥ unit-stack-gap on teach hosts`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "card", "Card");
  const demo = globalsDemo(page, "card");
  await expect(demo).toBeVisible();

  for (const id of HOSTS) {
    const host = demo.locator(`#${id}`);
    await host.scrollIntoViewIfNeeded();
    await expect(host).toBeVisible();

    await expect(async () => {
      const metrics = await host.evaluate((el) => {
        const help = el.querySelector(".sandbox-help") as HTMLElement | null;
        const card = el.querySelector(".fynns-card") as HTMLElement | null;
        if (!help || !card) return null;
        const hr = help.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const helpFirst = hr.bottom <= cr.top + 2;
        const gap = helpFirst ? cr.top - hr.bottom : hr.top - cr.bottom;
        const cs = getComputedStyle(el);
        const root = getComputedStyle(document.documentElement);
        return {
          gap: +gap.toFixed(2),
          hostGap: cs.gap,
          token: root.getPropertyValue("--fynns-layout-unit-stack-gap").trim(),
          fieldHint: root
            .getPropertyValue("--fynns-layout-field-hint-gap")
            .trim(),
        };
      });
      expect(metrics).not.toBeNull();
      expect(metrics!.token).toBe("1rem");
      expect(metrics!.fieldHint).toBe("0.5rem");
      expect(metrics!.gap).toBeGreaterThanOrEqual(15);
    }).toPass({ timeout: 10_000 });
  }
});
