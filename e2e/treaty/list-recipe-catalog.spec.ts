import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test("recipe catalog densifies as List without Chip/FieldHint essays", async ({
  page,
}) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
  await openGlobalsDemo(page, "list", "List");
  const host = globalsDemo(page, "list").locator("#sandbox-list-recipe-catalog");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();
  await expect(host.locator(".fynns-list-item")).toHaveCount(2);
  await expect(host.locator(".fynns-chip")).toHaveCount(0);
  await expect(host.locator(".fynns-card .fynns-field-hint")).toHaveCount(0);
  await host.locator(".fynns-list-item").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
