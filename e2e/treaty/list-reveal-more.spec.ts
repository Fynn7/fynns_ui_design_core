/**
 * CONSUMER_TREATY slug: `long List dumps all rows`
 * AGENTS: Card / PageScroll Lists use useRevealMore + RevealMore
 * (5/5 via REVEAL_MORE_LIST_DEFAULT_*) after the List. Sandbox: #list.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "long List dumps all rows";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: Show more expands visible items by step 5`, async ({ page }) => {
  await openGlobalsDemo(page, "list", "list");
  const demo = globalsDemo(page, "list");
  await expect(demo).toBeVisible();

  const card = demo.locator(".fynns-card").filter({
    hasText: "Sample list (reveal)",
  });
  await expect(card).toBeVisible();

  const items = card.locator(".fynns-list-item-host");
  await expect(items).toHaveCount(5);

  const more = card.getByRole("button", { name: "Show more" });
  await more.click();
  await expect(items).toHaveCount(10);

  await more.click();
  await expect(items).toHaveCount(12);
  await expect(card.getByRole("button", { name: "Show more" })).toHaveCount(0);
});
