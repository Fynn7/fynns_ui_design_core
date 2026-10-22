import { test, expect, type Page } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

const demo = (page: Page) => page.locator("#sandbox-chat-sessions-drawer");
const row = (page: Page, id: string) => demo(page).locator(`[data-chat-session-id="${id}"]`);
const openMenu = (page: Page) => page.locator('[role="menu"][data-state="open"]');

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openLayoutsDemo(page, "chat-sessions-drawer");
});

test("right-click targets the whole row without changing selection; Escape restores focus", async ({ page }) => {
  await row(page, "b").click({ button: "right" });
  await expect(openMenu(page).getByRole("menuitem", { name: "Rename", exact: true })).toBeFocused();
  await expect(row(page, "a")).toHaveAttribute("aria-current", "page");
  await expect(row(page, "b")).not.toHaveAttribute("aria-current");
  await openMenu(page).getByRole("menuitem", { name: "Delete entry", exact: true }).click();
  await expect(row(page, "b")).toHaveCount(0);
  await expect(row(page, "a")).toBeVisible();

  const host = row(page, "c").locator("..");
  await host.getByRole("button", { name: "More session actions" }).click({ button: "right", force: true });
  await expect(openMenu(page).getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(row(page, "c")).toBeFocused();
});

test("row More and keyboard context access share actions and replace the active menu", async ({ page }) => {
  await row(page, "b").focus();
  await page.keyboard.press("Shift+F10");
  await expect(openMenu(page)).toHaveCount(1);
  await openMenu(page).getByRole("menuitem", { name: "Rename", exact: true }).click();
  await expect(page.getByText("Rename: B", { exact: true })).toBeVisible();
  await row(page, "c").hover();
  await row(page, "c").locator("..").getByRole("button", { name: "More session actions" }).click();
  await expect(openMenu(page)).toHaveCount(1);
  await row(page, "d").click({ button: "right" });
  await expect(openMenu(page)).toHaveCount(1);
  await openMenu(page).getByRole("menuitem", { name: "Delete entry", exact: true }).click();
  await expect(row(page, "d")).toHaveCount(0);
  await expect(row(page, "c")).toBeVisible();
});

test("blank list context offers new and delete-all; unrelated chrome opens no menu", async ({ page }) => {
  const body = demo(page).locator(".fynns-nav-drawer-body");
  const bounds = await body.boundingBox();
  await body.click({ button: "right", position: { x: 15, y: bounds!.height - 12 } });
  await expect(openMenu(page).getByRole("menuitem", { name: "New chat", exact: true })).toBeVisible();
  await expect(openMenu(page).getByRole("menuitem", { name: "Rename", exact: true })).toHaveCount(0);
  await openMenu(page).getByRole("menuitem", { name: "New chat", exact: true }).click();
  await expect(row(page, "a")).not.toHaveAttribute("aria-current");
  await demo(page).getByRole("button", { name: "New chat", exact: true }).click({ button: "right" });
  await expect(openMenu(page)).toHaveCount(0);

  await demo(page).locator(".fynns-nav-drawer-new-chat").getByRole("button", { name: "More session actions" }).click();
  await openMenu(page).getByRole("menuitem", { name: "Delete all sessions", exact: true }).click();
  await expect(demo(page).getByText("No conversations", { exact: true })).toBeVisible();
  await body.click({ button: "right", position: { x: 15, y: bounds!.height - 12 } });
  await expect(openMenu(page).getByRole("menuitem", { name: "Delete all sessions", exact: true })).toBeDisabled();
});

test("pagination, loading and errors retain core states and dismiss stale menus", async ({ page }) => {
  await expect(row(page, "f")).toHaveCount(0);
  await demo(page).getByRole("button", { name: "Show more", exact: true }).click();
  await expect(row(page, "g")).toBeVisible();
  await row(page, "a").click({ button: "right" });
  await demo(page).getByRole("switch", { name: "Loading sessions" }).click();
  await expect(openMenu(page)).toHaveCount(0);
  await expect(demo(page).locator('[aria-busy="true"]')).toBeVisible();
  await expect(demo(page).getByRole("button", { name: "New chat", exact: true })).toBeDisabled();
  await demo(page).getByRole("switch", { name: "Loading sessions" }).click();
  await demo(page).getByRole("switch", { name: "Session load failure" }).click();
  await expect(demo(page).getByRole("alert")).toContainText("Catalog failed to load");
  await expect(demo(page).getByText("No conversations", { exact: true })).toHaveCount(0);
});

test("modal variant pins footer and contains right-click menu within viewport", async ({ page }) => {
  await demo(page).getByRole("button", { name: "Open session overlay" }).click();
  const panel = page.locator(".fynns-dialog-panel--nav-drawer");
  await expect(panel).toBeVisible();
  const panelBounds = await panel.boundingBox();
  const footerBounds = await panel.locator(".fynns-nav-drawer-footer").boundingBox();
  expect(panelBounds!.y + panelBounds!.height - footerBounds!.y - footerBounds!.height).toBeLessThan(4);
  await panel.locator('[data-chat-session-id="b"]').click({ button: "right" });
  const menuBounds = await openMenu(page).boundingBox();
  const viewport = page.viewportSize()!;
  expect(menuBounds!.x).toBeGreaterThanOrEqual(8);
  expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(viewport.width - 7);
  expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(viewport.height - 7);
  await page.keyboard.press("Escape");
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-chat-session-id="b"]')).toBeFocused();
});
