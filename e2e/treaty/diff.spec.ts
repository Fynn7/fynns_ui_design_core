import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

async function minimumTextContrast(dialog: import("@playwright/test").Locator) {
  return dialog.evaluate(root => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const rgba = (css: string) => {
      context.clearRect(0, 0, 1, 1); context.fillStyle = css; context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const luminance = (color: number[]) => color.slice(0, 3).map(value => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    let minimum = Infinity;
    for (const el of [...root.querySelectorAll(".fynns-diff-token, .fynns-diff-code mark, .fynns-diff-gutter, .fynns-diff-marker, .fynns-diff-added, .fynns-diff-removed")]) {
      if (!el.textContent?.trim()) continue;
      const ancestors: Element[] = [];
      for (let ancestor: Element | null = el; ancestor; ancestor = ancestor.parentElement) ancestors.unshift(ancestor);
      let background = [0, 0, 0];
      for (const ancestor of ancestors) {
        const color = rgba(getComputedStyle(ancestor).backgroundColor), alpha = color[3] / 255;
        background = background.map((value, i) => color[i] * alpha + value * (1 - alpha));
      }
      const foreground = rgba(getComputedStyle(el).color), alpha = foreground[3] / 255;
      const ink = foreground.slice(0, 3).map((value, i) => value * alpha + background[i] * (1 - alpha));
      const a = luminance(ink), b = luminance(background);
      minimum = Math.min(minimum, (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
    }
    return minimum;
  });
}

test.beforeEach(async ({ page }) => { await resetSandboxSession(page); });

test("DiffView context, highlighting, navigation, copy, wrapping and legacy coexist", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openGlobalsDemo(page, "diff-view");
  const demo = globalsDemo(page, "diff-view");
  const view = demo.locator(".fynns-diff");
  await expect(view.getByLabel("Added 2, Removed 2")).toBeVisible();
  await expect(view.locator("mark")).not.toHaveCount(0);
  // The first changed line is inside a multiline comment, not a fresh line grammar.
  await expect(view.locator(".fynns-diff-row--add .fynns-code-comment").first()).toContainText("Setting 12");
  const beforeRows = await view.locator(".fynns-diff-row").count();
  await view.screenshot({ path: "test-results/diff-view.png" });
  await view.getByRole("button", { name: "Show more", exact: true }).first().click();
  expect(await view.locator(".fynns-diff-row").count()).toBeGreaterThan(beforeRows);
  await view.getByRole("button", { name: "Next change", exact: true }).click();
  await expect(view.locator("[data-diff-target]")).toHaveCount(1);
  await expect(view.getByRole("status")).toHaveText("1 / 2");
  await expect(view.getByRole("button", { name: "Next change", exact: true })).toBeFocused();
  await view.getByRole("button", { name: "Next change", exact: true }).click();
  await expect(view.getByRole("status")).toHaveText("2 / 2");
  await view.getByRole("button", { name: "Copy patch", exact: true }).click();
  await expect(page.getByText("Patch copied", { exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toContain("--- a/src/settings.ts\n+++ b/src/settings.ts");
  expect(copied).toContain("+export const setting65");
  expect(copied).not.toContain("Added:");
  await expect(demo.locator(".fynns-diff-view")).toContainText("- remove the old value");
  await expect(demo.locator(".fynns-diff-view")).toContainText("+ add the new value");
  await demo.getByRole("button", { name: "Diff scenario", exact: true }).click();
  await page.getByRole("menuitem", { name: "Long text", exact: true }).click();
  const body = view.locator(".fynns-diff-body");
  expect(await body.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await view.getByRole("button", { name: "Wrap lines", exact: true }).click();
  await expect(view.getByRole("button", { name: "Wrap lines", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(await body.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
});

test("DiffView explicit states and incremental rendering", async ({ page }) => {
  await openGlobalsDemo(page, "diff-view");
  const demo = globalsDemo(page, "diff-view");
  const scenario = async (name: string) => {
    await demo.getByRole("button", { name: "Diff scenario", exact: true }).click();
    await page.getByRole("menuitem", { name, exact: true }).click();
  };
  await scenario("No changes"); await expect(demo.getByText("No changes", { exact: true })).toBeVisible();
  await scenario("Invalid patch"); await expect(demo.getByRole("alert")).toContainText("incomplete");
  await scenario("Limit"); await expect(demo.getByRole("alert")).toContainText("exceeds");
  await scenario("Binary"); await expect(demo.getByText("Binary file changed. Text comparison is unavailable.")).toBeVisible();
  await scenario("Renamed"); await expect(demo.getByText("File renamed. Contents unchanged.")).toBeVisible();
  await scenario("Many lines");
  const view = demo.locator(".fynns-diff");
  await expect(view.locator(".fynns-diff-row")).toHaveCount(500);
  await view.getByRole("button", { name: "Show more", exact: true }).click();
  await expect(view.locator(".fynns-diff-row")).toHaveCount(1000);
  await view.getByRole("button", { name: "Show more", exact: true }).click();
  await expect(view.locator(".fynns-diff-row")).toHaveCount(1200);
});

test("DiffDialog stable geometry, global navigation, disclosure, footer and focus", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openGlobalsDemo(page, "diff-dialog");
  const demo = globalsDemo(page, "diff-dialog");
  const trigger = demo.getByRole("button", { name: "Review files", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Review changes", exact: true });
  const disclosures = dialog.locator(".fynns-collapsible-trigger");
  await expect(disclosures).toHaveCount(3);
  for (const button of await disclosures.all()) await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const box = (await dialog.boundingBox())!;
  await dialog.getByRole("button", { name: "Next change", exact: true }).click();
  await expect(disclosures.first()).toHaveAttribute("aria-expanded", "true");
  await dialog.getByRole("button", { name: "Next change", exact: true }).click();
  await dialog.getByRole("button", { name: "Next change", exact: true }).click();
  await expect(disclosures.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("status")).toHaveText("3 / 3");
  const expandedBox = (await dialog.boundingBox())!;
  expect(Math.abs(expandedBox.height - box.height)).toBeLessThan(1);
  expect(Math.abs(expandedBox.width - box.width)).toBeLessThan(1);
  const headBox = (await dialog.getByRole("heading", { name: "Review changes", exact: true }).boundingBox())!;
  expect(headBox.y).toBeGreaterThanOrEqual(expandedBox.y);
  expect(await dialog.evaluate(el => el.scrollTop)).toBe(0);
  await dialog.getByRole("button", { name: "Expand all files", exact: true }).click();
  for (const button of await disclosures.all()) await expect(button).toHaveAttribute("aria-expanded", "true");
  for (const body of await dialog.locator(".fynns-diff-body").all()) expect(await body.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  await dialog.focus(); await page.mouse.move(0, 0);
  await expect(dialog.getByRole("heading", { name: "Review changes", exact: true })).toBeInViewport({ ratio: 1 });
  expect(await dialog.evaluate(el => el.scrollTop)).toBe(0);
  await page.screenshot({ path: "test-results/diff-dialog-desktop.png" });
  await dialog.getByRole("button", { name: "Copy all patches", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("rename from docs/manual.md");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
  await trigger.click();
  for (const button of await disclosures.all()) await expect(button).toHaveAttribute("aria-expanded", "false");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await demo.getByRole("button", { name: "Review one file", exact: true }).click();
  await expect(dialog.locator(".fynns-collapsible-trigger")).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await demo.getByRole("button", { name: "Review before saving", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toHaveClass(/ghost/);
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toHaveClass(/primary/);
  await dialog.getByRole("button", { name: "Save", exact: true }).click(); await expect(dialog).not.toBeVisible();
});

test("DiffDialog narrow themes, long paths, reduced motion, errors and empty state", async ({ page }) => {
  await openGlobalsDemo(page, "diff-dialog");
  const demo = globalsDemo(page, "diff-dialog");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["dark", "light"]) {
    await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
    await demo.getByRole("button", { name: "Long paths", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Review changes", exact: true });
    const initial = (await dialog.boundingBox())!;
    expect(initial.width).toBeLessThanOrEqual(390);
    await dialog.getByRole("button", { name: "Expand all files", exact: true }).click();
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeVisible();
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await close.focus(); await page.keyboard.press("Tab");
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
    expect(await minimumTextContrast(dialog)).toBeGreaterThanOrEqual(4.5);
    await dialog.focus(); await page.mouse.move(0, 0);
    await page.screenshot({ path: `test-results/diff-dialog-${theme}-narrow.png` });
    await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible();
  }
  await demo.getByRole("button", { name: "Mixed validity", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Review changes", exact: true });
  await dialog.getByRole("button", { name: "Expand all files", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("incomplete");
  await expect(dialog.locator(".fynns-diff-row--add").first()).toBeAttached();
  await expect(dialog.getByRole("button", { name: "Copy all patches", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await demo.getByRole("button", { name: "Empty review", exact: true }).click();
  await expect(dialog.getByText("No files to compare", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeVisible();
});
