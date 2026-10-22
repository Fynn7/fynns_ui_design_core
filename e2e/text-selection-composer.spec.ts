import { test, expect, type Locator, type Page } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "./helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "text-selection-composer", "TextSelectionComposer");
  // The catalog jump focuses its demo after scrolling; wait before selecting.
  await expect(page.locator("#globals-demo-text-selection-composer")).toBeFocused();
});

async function selectText(control: Locator, start = 0, end = 6) {
  await control.click();
  await expect(control).toBeFocused();
  await control.evaluate((node, bounds) => {
    const field = node as HTMLTextAreaElement;
    field.setSelectionRange(bounds.start, bounds.end);
    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift", bubbles: true }));
  }, { start, end });
}

function composer(page: Page) { return page.locator(".fynns-text-selection-composer-panel"); }

test("hover reveals an owned selection; immediate mode also opens without hover", async ({ page }) => {
  const text = page.locator('[aria-label="Rendered text selection"]');
  const choose = () => text.evaluate((node) => {
    const range = document.createRange();
    range.setStart(node.firstChild!, 2);
    range.setEnd(node.firstChild!, 11);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.mouse.move(0, 0);
  await choose();
  await expect(composer(page)).toHaveCount(0);
  await text.hover();
  await expect(composer(page)).toBeVisible();
  await page.getByRole("switch", { name: "Show immediately after selection" }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.getSelection()?.removeAllRanges());
  await choose();
  await expect(composer(page)).toBeVisible();
});

test("saves the quote through input focus and submits exact offsets without editing the source", async ({ page }) => {
  const source = page.getByRole("textbox", { name: "Selection example", exact: true });
  const original = await source.inputValue();
  await selectText(source);
  const panel = composer(page);
  await expect(panel).toBeVisible();
  await source.press("Tab");
  const input = panel.getByRole("textbox");
  await expect(input).toBeFocused();
  await expect(panel.getByRole("button", { name: "Send reference" })).toBeDisabled();
  await input.fill("Clarify this phrase");
  await input.press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Selected text:" })).toContainText("“Select” · Message: Clarify this phrase · Offsets: 0–6");
  await expect(source).toHaveValue(original);
  await expect(source).toBeFocused();
  await page.waitForTimeout(200);
  await expect(panel).toHaveCount(0);
});

test("failed sends retain draft/quote for retry; IME Enter does not send", async ({ page }) => {
  await page.getByRole("switch", { name: "Test send failure" }).click();
  await selectText(page.getByRole("textbox", { name: "Selection example", exact: true }));
  const panel = composer(page);
  const input = panel.getByRole("textbox");
  await input.fill("中文说明");
  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Enter", isComposing: true, bubbles: true, cancelable: true,
  })));
  await expect(panel.getByRole("alert")).toHaveCount(0);
  await input.press("Enter");
  await expect(panel.getByRole("alert")).toContainText("The sample send failed");
  await expect(input).toHaveValue("中文说明");
  await input.press("Enter");
  await expect(panel).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Selected text:" })).toContainText("中文说明");
});

test("Escape restores source focus without reopening; source edits dismiss stale references", async ({ page }) => {
  const source = page.getByRole("textbox", { name: "Selection example", exact: true });
  await selectText(source);
  await composer(page).getByRole("textbox").fill("draft");
  await composer(page).getByRole("textbox").press("Escape");
  await expect(composer(page)).toHaveCount(0);
  await expect(source).toBeFocused();
  await page.waitForTimeout(200);
  await expect(composer(page)).toHaveCount(0);
  await source.press("ArrowRight");
  await selectText(source, 7, 8);
  await expect(composer(page)).toBeVisible();
  await source.fill("Edited source");
  await expect(composer(page)).toHaveCount(0);
});

test("rendered and code selections use the same capsule, stay within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const text = page.locator('[aria-label="Rendered text selection"]');
  await text.scrollIntoViewIfNeeded();
  await text.evaluate((node) => {
    const range = document.createRange();
    range.setStart(node.firstChild!, 2);
    range.setEnd(node.firstChild!, 11);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await text.hover();
  const panel = composer(page);
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(8);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(382);
  await panel.getByRole("textbox").fill("Explain");
  await panel.getByRole("button", { name: "Send reference" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Selected text:" })).toContainText("“reference”");
  const code = page.locator('#globals-demo-text-selection-composer .fynns-code-block textarea');
  await code.scrollIntoViewIfNeeded();
  await selectText(code, 6, 13);
  await expect(panel).toBeVisible();
  await expect(panel.locator(".fynns-sr-only").first()).toHaveText("message");
  await panel.getByRole("textbox").press("Escape");
  await expect(code).toBeFocused();
});
