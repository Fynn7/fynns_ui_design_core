import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

// The archived-chats settings window is one fixed panel: swapping the
// General / Archived sub-pages (or emptying the archive) must never resize it.
test("archived-chats settings dialog keeps one width across sub-pages and states", async ({ page }) => {
  await resetSandboxSession(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLayoutsDemo(page, "chat-sessions-drawer");
  const demo = page.locator("#sandbox-chat-sessions-drawer");
  await demo.locator(".fynns-nav-drawer-footer").getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  // Entry lands on the archived sub-page with the sample rows.
  await expect(dialog.getByRole("heading", { name: "Archived chats" })).toBeVisible();
  // The open animation scales the panel; measure at rest, not mid-flight.
  await expect.poll(() => dialog.evaluate((el) => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const width = () => dialog.evaluate((el) => el.getBoundingClientRect().width);
  const overflow = () => dialog.evaluate((el) => el.scrollWidth - el.clientWidth);
  const archivedWidth = await width();
  expect(await overflow()).toBeLessThanOrEqual(1);

  await dialog.getByRole("button", { name: "General", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "General" })).toBeVisible();
  expect(await width()).toBeCloseTo(archivedWidth, 0);
  expect(await overflow()).toBeLessThanOrEqual(1);

  await dialog.getByRole("button", { name: "Archived chats", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Archived chats" })).toBeVisible();
  expect(await width()).toBeCloseTo(archivedWidth, 0);

  // Empty archive (restore every sample row): still the same width.
  await dialog.getByRole("button", { name: "Unarchive", exact: true }).first().click();
  await dialog.getByRole("button", { name: "Unarchive", exact: true }).first().click();
  await expect(dialog.getByText("No archived conversations", { exact: true })).toBeVisible();
  expect(await width()).toBeCloseTo(archivedWidth, 0);
  expect(await overflow()).toBeLessThanOrEqual(1);
});
