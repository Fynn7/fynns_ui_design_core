/**
 * CONSUMER_TREATY slug: `BusyRegion + chrome loading stack`
 * AGENTS: one progress chrome per wait — BusyRegion only; header/foot
 * disabled without loading.
 * Sandbox: #busy-region → #globals-demo-busy-region
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "BusyRegion + chrome loading stack";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Show busy uses region overlay, not button loading`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "busy-region", "BusyRegion");
  const demo = globalsDemo(page, "busy-region");

  const start = demo.getByRole("button", { name: "Show busy" });
  await start.click();

  const region = demo.locator(".fynns-busy-region--busy").first();
  await expect(region).toBeVisible();
  await expect(region.locator(".fynns-busy-stack")).toBeVisible();

  // Start/Clear row sits under the first BusyRegion — assert those controls
  // never carry loading while the region is busy.
  const startStop = demo.getByRole("button", {
    name: /Show busy|Clear busy/,
  });
  const count = await startStop.count();
  expect(count, SLUG).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const btn = startStop.nth(i);
    await expect(btn, `${SLUG}: chrome must not use loading`).not.toHaveClass(
      /fynns-btn--loading/,
    );
    await expect(btn, `${SLUG}: chrome must not set aria-busy`).not.toHaveAttribute(
      "aria-busy",
      "true",
    );
  }
});
