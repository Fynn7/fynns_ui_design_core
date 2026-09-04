/**
 * CONSUMER_TREATY slug: `org · dates glued in supportingText`
 * AGENTS: Content density / List — org in supportingText; dates in
 * trailingSupportingText (no · / — / – glue).
 * Sandbox: #list → #globals-demo-list
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "org · dates glued in supportingText";
const GLUE = /[·—–]/;

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: org and dates stay split on #list`, async ({ page }) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const orgList = demo.getByRole("list", {
    name: "Sample organization and date-range list rows",
  });
  await expect(orgList).toBeVisible();

  const rows = orgList.locator(".fynns-list-item");
  await expect(rows).toHaveCount(3);

  for (let i = 0; i < 3; i++) {
    const row = rows.nth(i);
    const supporting = row.locator(".fynns-list-item-supporting");
    const trailing = row.locator(".fynns-list-item-trailing-text");
    await expect(supporting, `${SLUG}: supportingText present`).toBeVisible();
    await expect(trailing, `${SLUG}: trailingSupportingText present`).toBeVisible();

    const supportingText = (await supporting.innerText()).trim();
    const trailingText = (await trailing.innerText()).trim();
    expect(supportingText, `${SLUG}: org must not glue dates`).not.toMatch(GLUE);
    expect(trailingText.length, `${SLUG}: dates column non-empty`).toBeGreaterThan(0);
    expect(
      supportingText.includes(trailingText),
      `${SLUG}: dates must not live inside supportingText`,
    ).toBe(false);
  }
});
