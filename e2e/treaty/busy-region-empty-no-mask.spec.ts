/**
 * CONSUMER_TREATY slug: `BusyRegion empty cold-start mask island (贴图色块)`
 * AGENTS: empty BusyRegion cold-start drops frosted wash (≥ 0.5.191).
 * Sandbox: #busy-region → #sandbox-busy-region-empty-no-mask
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "BusyRegion empty cold-start mask island (贴图色块)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: empty overlay has transparent wash`, async ({ page }) => {
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const demo = globalsDemo(page, "busy-region");
  const host = demo.locator("#sandbox-busy-region-empty-no-mask");
  await expect(host).toBeVisible();

  const overlay = host.locator(".fynns-busy-region-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay.locator(".fynns-busy-stack")).toBeVisible();

  const bg = await overlay.evaluate((el) => getComputedStyle(el).backgroundColor);
  // transparent / fully clear — not the tokenized gray mask island
  expect(bg, SLUG).toMatch(/^(transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\))$/);

  const filter = await overlay.evaluate(
    (el) =>
      getComputedStyle(el).backdropFilter ||
      (getComputedStyle(el) as CSSStyleDeclaration & { webkitBackdropFilter?: string })
        .webkitBackdropFilter ||
      "none",
  );
  expect(filter, SLUG).toMatch(/^none$/i);
});
