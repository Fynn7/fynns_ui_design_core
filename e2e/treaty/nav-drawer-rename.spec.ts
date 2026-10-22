import { test, expect } from "@playwright/test";
import { layoutsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1600, height: 1100 });
});

test("double-click a persistent destination opens the core rename dialog", async ({ page }) => {
  await openLayoutsDemo(page, "nav-drawer-rename");
  const demo = layoutsDemo(page, "nav-drawer-rename");
  // Stable row locator — the accessible name changes with the renamed label.
  const item = demo.locator(".fynns-nav-drawer-item").first();

  await item.dblclick();
  const dialog = page.getByRole("dialog", { name: "Rename destination" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
    "Design notes",
  );
  // One primary only, cancel stays ghost.
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toHaveClass(
    /fynns-btn--ghost/,
  );
  await expect(dialog.locator(".fynns-btn--primary")).toHaveCount(1);

  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Renamed notes");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(item).toHaveText("Renamed notes");
});

test("Enter commits, Escape cancels and F2 opens the rename dialog", async ({ page }) => {
  await openLayoutsDemo(page, "nav-drawer-rename");
  const demo = layoutsDemo(page, "nav-drawer-rename");
  const item = demo.locator(".fynns-nav-drawer-item").nth(1);
  const dialog = page.getByRole("dialog", { name: "Rename destination" });

  await item.dblclick();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("  ");
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Meeting notes");
  await dialog.getByRole("textbox", { name: "Name", exact: true }).press("Enter");
  await expect(dialog).toBeHidden();
  await expect(item).toHaveText("Meeting notes");

  await item.dblclick();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Discarded");
  await dialog.getByRole("textbox", { name: "Name", exact: true }).press("Escape");
  await expect(dialog).toBeHidden();
  await expect(item).toHaveText("Meeting notes");

  await item.focus();
  await item.press("F2");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("the workspace recipe shares one rename dialog between double-click and the context menu", async ({ page }) => {
  await openLayoutsDemo(page, "workspace-chrome");
  const demo = page.locator("#sandbox-workspace-chrome");
  const item = demo.locator(".fynns-nav-drawer-item");
  const dialog = page.getByRole("dialog", { name: "Rename document" });

  await item.dblclick();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
    "Sample document",
  );
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();

  await item.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Rename document" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Updated document");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(item).toHaveText("Updated document");
});
