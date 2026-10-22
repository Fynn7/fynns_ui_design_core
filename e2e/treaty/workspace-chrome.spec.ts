import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1600, height: 1100 });
  await openLayoutsDemo(page, "workspace-chrome");
});

test("one ghost inspector toggle, top-bar Home/Back and first New menu", async ({ page }) => {
  const demo = page.locator("#sandbox-workspace-chrome");
  const bar = demo.locator(".fynns-top-app-bar");
  const toggle = bar.getByRole("button", { name: "Inspector", exact: true });
  await expect(toggle).toHaveClass(/fynns-btn--ghost/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveText("");
  await expect(demo.locator(".fynns-end-aside").getByRole("button", { name: /close|collapse/i })).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  for (const name of ["Home", "Back"]) {
    const button = bar.getByRole("button", { name, exact: true });
    await expect(button).toHaveClass(/fynns-btn--ghost/);
    await expect(button).toHaveText("");
  }
  const first = demo.locator(".fynns-nav-drawer-body").getByRole("button").first();
  await expect(first).toHaveText("New document");
  await first.click();
  await page.getByRole("menuitem", { name: "Blank document" }).click();
  await bar.getByRole("button", { name: "Home", exact: true }).click();
  await expect(demo.getByText("No document selected", { exact: true })).toBeVisible();
  await expect(bar).toBeVisible();
});

test("right-click and keyboard rename open Dialog with ghost Cancel and one primary Save", async ({ page }) => {
  const demo = page.locator("#sandbox-workspace-chrome");
  const item = demo.locator(".fynns-nav-drawer-item");
  await demo.locator(".fynns-top-app-bar").getByRole("button", { name: "Home", exact: true }).click();
  await item.click({ button: "right" });
  await expect(demo.getByText("No document selected", { exact: true })).toBeVisible();
  await page.getByRole("menuitem", { name: "Rename document" }).click();
  const dialog = page.getByRole("dialog", { name: "Rename document" });
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toHaveClass(/fynns-btn--ghost/);
  await expect(dialog.locator(".fynns-btn--primary")).toHaveCount(1);
  await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Updated document");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(item).toHaveText("Updated document");
  await item.focus();
  await item.press("Shift+F10");
  await page.getByRole("menuitem", { name: "Rename document" }).click();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  const actions = demo.getByRole("toolbar", { name: "Object actions" });
  await demo.locator(".fynns-top-app-bar").getByRole("button", { name: "Inspector", exact: true }).click();
  await expect(actions.locator(".fynns-btn--primary, .fynns-btn--danger")).toHaveCount(0);
  const metrics = await actions.locator(".fynns-toolbar-actions").evaluate(el => {
    const boxes = [...el.querySelectorAll("button")].map(button => button.getBoundingClientRect());
    return { gap: parseFloat(getComputedStyle(el).gap), tops: boxes.map(box => box.top) };
  });
  expect(metrics.gap).toBe(4);
  expect(Math.max(...metrics.tops) - Math.min(...metrics.tops)).toBeLessThan(1);
});

for (const theme of ["dark", "light"]) {
  test(`InlineAlert content width, centered icon/text/X and 16dp action gap (${theme})`, async ({ page }) => {
    await page.evaluate(theme => document.documentElement.setAttribute("data-fynns-theme", theme), theme);
    const demo = page.locator("#sandbox-inline-alert-dismiss");
    for (const alert of await demo.locator(".fynns-inline-alert").all()) {
      const metrics = await alert.evaluate(el => {
        const box = el.getBoundingClientRect();
        const icon = el.querySelector(".fynns-inline-alert__icon svg")!.getBoundingClientRect();
        const text = el.querySelector(".fynns-inline-alert__text")!.getBoundingClientRect();
        const button = el.querySelector("button");
        const close = button?.getBoundingClientRect();
        const mid = (r: DOMRect) => r.top + r.height / 2;
        return { width: box.width, parent: el.parentElement!.getBoundingClientRect().width,
          iconDelta: Math.abs(mid(icon) - mid(box)), textDelta: Math.abs(mid(text) - mid(box)),
          closeDelta: close ? Math.abs(mid(close) - mid(box)) : null,
          gap: close ? close.left - text.right : null,
          overflow: el.scrollWidth > el.clientWidth + 1, wrapped: text.height > 30,
          ghost: button?.classList.contains("fynns-btn--ghost"), closeText: button?.textContent };
      });
      expect(metrics.iconDelta).toBeLessThan(1);
      expect(metrics.textDelta).toBeLessThan(1);
      expect(metrics.width).toBeLessThanOrEqual(metrics.parent + 1);
      expect(metrics.overflow).toBe(false);
      if (metrics.gap != null) {
        expect(metrics.gap).toBeCloseTo(16, 1);
        expect(metrics.closeDelta).toBeLessThan(1);
        expect(metrics.ghost).toBe(true);
        expect(metrics.closeText).toBe("");
      }
    }
    const short = demo.locator(".fynns-inline-alert--error");
    expect(await short.evaluate(el => el.getBoundingClientRect().width < el.parentElement!.getBoundingClientRect().width - 20)).toBe(true);
    const warning = demo.locator(".fynns-inline-alert--warning");
    expect(await warning.locator(".fynns-inline-alert__text").evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(30);
    await short.getByRole("button", { name: "Dismiss notice", exact: true }).click();
    await expect(short).toHaveCount(0);
    await demo.getByRole("button", { name: "Simulate import failure", exact: true }).click();
    await expect(page.locator(".fynns-snackbar--error")).toBeVisible();
    await expect(short).toHaveCount(0);
    await demo.getByRole("button", { name: "Show persistent notice", exact: true }).click();
    await expect(short).toBeVisible();
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.getByRole("banner").first().getByRole("button", { name: "Hide navigation", exact: true }).click();
    await demo.scrollIntoViewIfNeeded();
    await expect.poll(() => demo.evaluate(el => el.clientWidth)).toBeGreaterThan(280);
    for (const alert of await demo.locator(".fynns-inline-alert").all()) {
      expect(await alert.evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().width <= el.parentElement!.getBoundingClientRect().width + 1)).toBe(true);
    }
  });
}
