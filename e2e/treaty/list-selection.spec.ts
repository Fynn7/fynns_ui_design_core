import { test, expect, type Page } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

const menu = (page: Page) => page.locator('[role="menu"][data-state="open"]');
const chat = (page: Page) => page.locator("#sandbox-chat-sessions-drawer");
const row = (page: Page, id: string) => chat(page).locator(`[data-chat-session-id="${id}"]`);
test.beforeEach(async ({ page }) => { await resetSandboxSession(page); });

test("Ctrl click, Shift range and Ctrl+Shift additive range keep the active conversation unchanged", async ({ page }) => {
  await openLayoutsDemo(page, "chat-sessions-drawer");
  await row(page, "b").click({ modifiers: ["Control"] });
  await row(page, "d").click({ modifiers: ["Shift"] });
  await expect(row(page, "b")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, "c")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, "d")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, "a")).toHaveAttribute("aria-current", "page");
  await row(page, "a").click({ modifiers: ["Control"] });
  await row(page, "b").click({ modifiers: ["Control", "Shift"] });
  await expect(row(page, "d")).toHaveAttribute("aria-pressed", "true");
  await row(page, "b").click({ button: "right" });
  await expect(menu(page).getByRole("menuitem", { name: "Delete selected entries", exact: true })).toBeVisible();
  await expect(menu(page).getByRole("menuitem", { name: "Delete entry", exact: true })).toHaveCount(0);
  await menu(page).getByRole("menuitem", { name: "Delete selected entries", exact: true }).click();
  await expect(row(page, "a")).toHaveCount(0);
  await expect(row(page, "d")).toHaveCount(0);
  await expect(row(page, "e")).toBeVisible();
});

test("Ctrl+A includes unrevealed sessions and sends a bulk target snapshot", async ({ page }) => {
  await openLayoutsDemo(page, "chat-sessions-drawer");
  await expect(row(page, "g")).toHaveCount(0);
  await row(page, "b").focus();
  await page.keyboard.press("Control+a");
  await row(page, "c").click({ button: "right" });
  await menu(page).getByRole("menuitem", { name: "Delete selected entries", exact: true }).click();
  await expect(chat(page).getByText("No conversations", { exact: true })).toBeVisible();
  await expect(chat(page).getByRole("button", { name: "Show more", exact: true })).toHaveCount(0);
});

test("right-click and More on selected rows retain the batch; an unselected row becomes a single target", async ({ page }) => {
  await openLayoutsDemo(page, "chat-sessions-drawer");
  await row(page, "b").click({ modifiers: ["Control"] });
  await row(page, "c").click({ modifiers: ["Control"] });
  await row(page, "b").hover();
  await row(page, "b").locator("..").getByRole("button", { name: "More session actions" }).click();
  await expect(menu(page).getByRole("menuitem", { name: "Delete selected entries", exact: true })).toBeVisible();
  await row(page, "e").click({ button: "right" });
  await expect(menu(page)).toHaveCount(1);
  await expect(menu(page).getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
  await expect(row(page, "b")).toHaveAttribute("aria-pressed", "false");
  await expect(row(page, "e")).toHaveAttribute("aria-pressed", "true");
  await expect(row(page, "a")).toHaveAttribute("aria-current", "page");
});

test("editable input retains native Ctrl+A and independent list scopes do not steal shortcuts", async ({ page }) => {
  await openLayoutsDemo(page, "list-selection");
  const demo = page.locator("#sandbox-list-selection");
  const scopes = demo.locator("[data-fynns-selection-scope]");
  const input = demo.getByRole("textbox", { name: "Selection shortcut input" });
  await input.focus();
  await page.keyboard.press("Control+a");
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionEnd! - el.selectionStart!)).toBe("Sample input".length);
  await expect(demo.locator("[data-selection-count]")).toContainText("0");
  await scopes.nth(0).getByRole("button", { name: "Sample session A", exact: true }).focus();
  await page.keyboard.press("Control+a");
  await expect(demo.locator("[data-selection-count]")).toContainText("4");
  await expect(scopes.nth(1).locator("[data-fynns-selected]")).toHaveCount(0);
  await expect(scopes.nth(0).getByRole("button", { name: "Sample session D", exact: true })).toHaveAttribute("aria-pressed", "false");
  await scopes.nth(0).getByRole("button", { name: "Sample session C", exact: true }).click({ button: "right" });
  await expect(menu(page).getByRole("menuitem", { name: "Copy selected names", exact: true })).toBeVisible();
});

test("grouped sidebar Ctrl+A includes collapsed rows and skips disabled entries", async ({ page }) => {
  await openLayoutsDemo(page, "list-selection");
  const scope = page.locator("#sandbox-list-selection .fynns-nav-drawer-body");
  await scope.getByRole("button", { name: "Sample child sessions", exact: true }).click();
  await scope.getByRole("button", { name: "Sample session A", exact: true }).focus();
  await page.keyboard.press("Control+a");
  await scope.getByRole("button", { name: "Sample session A", exact: true }).click({ button: "right" });
  await menu(page).getByRole("menuitem", { name: "Copy selected names", exact: true }).click();
  await expect(page.getByText("Sample session A, Sample session B, Sample session C, Sample session E", { exact: true })).toBeVisible();
});

test("Escape closes the menu then clears selection, and source reset clears the selection anchor", async ({ page }) => {
  await openLayoutsDemo(page, "chat-sessions-drawer");
  await row(page, "b").focus();
  await page.keyboard.press("Control+Space");
  await row(page, "c").click({ modifiers: ["Control"] });
  await page.keyboard.press("Shift+F10");
  await expect(menu(page).getByRole("menuitem", { name: "Delete selected entries", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(row(page, "c")).toBeFocused();
  await expect(row(page, "b")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(row(page, "b")).toHaveAttribute("aria-pressed", "false");
  await row(page, "b").click({ modifiers: ["Control"] });
  await chat(page).getByRole("button", { name: "Refresh catalog", exact: true }).click();
  await expect(row(page, "b")).toHaveAttribute("aria-pressed", "false");
});
