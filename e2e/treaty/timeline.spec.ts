/**
 * CONSUMER_TREATY slug: `lettered timeline A/B/C / list-detail`
 * AGENTS Hard rules + timeline-catalog — flat + with detail only; no lettered
 * Variant/Shell hosts. Dialog foot LTR Cancel → Delete → Save.
 * Sandbox: #timeline → #globals-demo-timeline
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const LETTERED_SLUG = "lettered timeline A/B/C / list-detail";
const FOOT_SLUG = "Timeline edit Dialog foot Cancel → Delete → Save";
const FORBIDDEN =
  /\bVariant\s+[ABC]\b|\bShell\s+[ABC]\b|\blist-detail\b|\bA\s*·\s*flat\b/i;

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${LETTERED_SLUG}: no lettered host copy in #timeline`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "timeline", "Timeline");
  const demo = globalsDemo(page, "timeline");
  const text = await demo.innerText();
  expect(text, LETTERED_SLUG).not.toMatch(FORBIDDEN);
});

test(`${FOOT_SLUG}: Cancel before Delete before Save`, async ({ page }) => {
  await openGlobalsDemo(page, "timeline", "Timeline");
  const demo = globalsDemo(page, "timeline");
  await demo.locator(".fynns-timeline-item").first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const foot = dialog.locator(".fynns-control-cluster--end-align").last();
  const labels = await foot.locator("button").allTextContents();
  const normalized = labels.map((s) => s.trim());
  expect(normalized, FOOT_SLUG).toEqual(["Cancel", "Delete", "Save"]);
});
