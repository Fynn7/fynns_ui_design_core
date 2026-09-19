import { expect, test } from "@playwright/test";
import {
  globalsDemo,
  openGlobalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test("Table caps long text and tips only the clipped label", async ({ page }) => {
  await openGlobalsDemo(page, "table", "table");
  const demo = globalsDemo(page, "table");
  const longCell = demo.locator(".fynns-table-cell").filter({
    hasText: "sample/catalog-item-with-an-extremely-long-identifier-for-table-overflow-and-a-second-descriptive-segment",
  }).first();
  const label = longCell.locator(".fynns-overflow-tip-label").first();
  await expect(label).toHaveAttribute("data-overflowing", "true");
  const size = await label.evaluate((el) => ({
    width: el.getBoundingClientRect().width,
    scrollWidth: el.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(size.width).toBeLessThanOrEqual(size.viewport * 0.4 + 1);
  expect(size.scrollWidth).toBeGreaterThan(size.width + 1);

  await longCell.locator(".fynns-table-text").first().hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "sample/catalog-item-with-an-extremely-long-identifier-for-table-overflow-and-a-second-descriptive-segment",
  );

  const shortLabel = demo.locator(".fynns-table-cell").filter({ hasText: "Ready" }).first()
    .locator(".fynns-overflow-tip-label");
  await expect(shortLabel).toHaveAttribute("data-overflowing", "false");
});

test("Table provides its own scroll host", async ({ page }) => {
  await openGlobalsDemo(page, "table", "table");
  const demo = globalsDemo(page, "table");
  const card = demo.locator(".fynns-card").filter({ hasText: "Sample catalog (reveal)" });
  const wrap = card.locator(".fynns-table-wrap");
  await expect(wrap).toHaveCount(1);
  await expect(wrap.locator("table.fynns-table")).toBeVisible();
});
