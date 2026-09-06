/**
 * CONSUMER_TREATY slug: `long Table dumps all rows`
 * AGENTS: Card / PageScroll data Tables use useRevealMore + RevealMore
 * (default 10/10) outside `.fynns-table-wrap`. Sandbox: #table.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "long Table dumps all rows";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Show more expands visible rows by step`, async ({ page }) => {
  await openGlobalsDemo(page, "table", "table");
  const demo = globalsDemo(page, "table");
  await expect(demo).toBeVisible();

  const card = demo.locator(".fynns-card").filter({
    hasText: "Sample catalog (reveal)",
  });
  await expect(card).toBeVisible();

  const rows = card.locator("tbody tr");
  await expect(rows).toHaveCount(10);

  const more = card.getByRole("button", { name: "Show more" });
  await more.click();
  await expect(rows).toHaveCount(20);

  await more.click();
  await expect(rows).toHaveCount(24);
  await expect(card.getByRole("button", { name: "Show more" })).toHaveCount(0);
});
