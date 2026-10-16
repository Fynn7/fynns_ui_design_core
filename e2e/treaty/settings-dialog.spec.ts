import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLayoutsDemo(page, "settings-dialog");
});

test("category changes preserve drafts, explicit save updates the effective path, Escape restores focus", async ({ page }) => {
  const launch = page.getByRole("button", { name: "Open settings", exact: true });
  await launch.click();
  const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
  await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const initial = await dialog.boundingBox();
  await dialog.getByRole("button", { name: "Advanced", exact: true }).click();
  await dialog.getByRole("textbox", { name: "Project scan root", exact: true }).fill("D:\\Projects");
  await expect(dialog.getByRole("status")).toHaveText("Unsaved changes");
  await dialog.getByRole("button", { name: "General", exact: true }).click();
  await dialog.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(dialog.getByRole("textbox")).toHaveValue("D:\\Projects");
  await expect(dialog.getByText("Current location: D:\\Workspaces", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Save path", exact: true }).click();
  await expect(dialog.getByText("Current location: D:\\Projects", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save path", exact: true })).toBeDisabled();
  expect((await dialog.boundingBox())!.width).toBeCloseTo(initial!.width, 0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(launch).toBeFocused();
});

test("failed language and startup saves roll back; failed path save retains its draft and can retry", async ({ page }) => {
  const demo = page.locator("#sandbox-settings-dialog");
  await demo.getByRole("switch", { name: "Fail next save", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "中文", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "English", exact: true })).toBeChecked();
  await dialog.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(dialog).toBeHidden();
  await demo.getByRole("switch", { name: "Fail next save", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  dialog = page.getByRole("dialog");
  const startup = dialog.getByRole("switch", { name: "Launch at login", exact: true });
  await startup.click();
  await expect(startup).not.toBeChecked();
  await expect(startup).toBeChecked();
  await dialog.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(dialog).toBeHidden();
  await demo.getByRole("switch", { name: "Fail next save", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  await dialog.getByRole("button", { name: "Advanced", exact: true }).click();
  await dialog.getByRole("textbox").fill("D:\\Retry");
  await dialog.getByRole("button", { name: "Save path", exact: true }).click();
  await expect(dialog.getByText("Could not save the path. Your draft is kept; try again.")).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveValue("D:\\Retry");
  await dialog.getByRole("button", { name: "Save path", exact: true }).click();
  await expect(dialog.getByText("Current location: D:\\Retry", { exact: true })).toBeVisible();
});

test("language and startup save immediately; keyboard navigation stays inside the dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Open settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "中文", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "常规", exact: true })).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "中文", exact: true })).toBeEnabled();
  await page.mouse.move(0, 0);
  await page.screenshot({ path: ".tmp/settings-validation/zh-1440-general.png" });
  await dialog.getByRole("switch", { name: "开机自启动", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "自启动已关闭", exact: true })).toBeVisible();
  await expect(dialog.getByRole("switch")).toBeEnabled();
  await dialog.getByRole("button", { name: "常规", exact: true }).focus();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByRole("button", { name: "关闭设置", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "打开设置", exact: true }).click();
  await expect(dialog.getByRole("switch")).not.toBeChecked();
});

test("loading keeps known labels and geometry; retry works; unsupported startup is explained", async ({ page }) => {
  const demo = page.locator("#sandbox-settings-dialog");
  await demo.getByRole("button", { name: "Scenario", exact: true }).click();
  await page.getByRole("menuitem", { name: "Loading", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("[aria-busy=true]")).toHaveCount(2);
  await expect(dialog.getByText("Launch at login", { exact: true })).toBeVisible();
  await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const before = await dialog.boundingBox();
  const skeletonBackground = await dialog.locator(".fynns-busy-region-overlay").first().evaluate(el => getComputedStyle(el).backgroundColor);
  expect(skeletonBackground).toBe("rgba(0, 0, 0, 0)");
  await expect(dialog.locator("[aria-busy=true]")).toHaveCount(0);
  expect((await dialog.boundingBox())!.height).toBeCloseTo(before!.height, 0);
  await dialog.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(dialog).toBeHidden();
  await demo.getByRole("button", { name: "Scenario", exact: true }).click();
  await page.getByRole("menuitem", { name: "Load failure", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  await expect(dialog.getByText("Could not load settings.", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(dialog.getByRole("switch")).toBeEnabled();
  await dialog.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(dialog).toBeHidden();
  await demo.getByRole("button", { name: "Scenario", exact: true }).click();
  await page.getByRole("menuitem", { name: "Unsupported platform", exact: true }).click();
  await demo.getByRole("button", { name: "Open settings", exact: true }).click();
  await expect(dialog.getByRole("switch")).toBeDisabled();
  await expect(dialog.getByText("Launch at login is unavailable on this platform.", { exact: true })).toBeVisible();
});

test("desktop/narrow, both themes, reduced motion and long paths stay within the panel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Open settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  for (const theme of ["dark", "light"]) {
    await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 480 : 900 });
      await dialog.getByRole("button", { name: "General", exact: true }).click();
      const boxes = await dialog.evaluate(el => {
        const panel = el.getBoundingClientRect();
        const nav = el.querySelector("nav")!.getBoundingClientRect();
        const content = el.querySelector("section")!.getBoundingClientRect();
        return { left: panel.left, right: panel.right, navRight: nav.right, contentLeft: content.left,
          navBottom: nav.bottom, contentTop: content.top, overflow: el.scrollWidth - el.clientWidth };
      });
      expect(boxes.left).toBeGreaterThanOrEqual(0);
      expect(boxes.right).toBeLessThanOrEqual(width);
      expect(boxes.overflow).toBeLessThanOrEqual(1);
      const overlaps = await dialog.locator(".fynns-settings-rows .fynns-control-block").evaluateAll(rows => rows.some(row => {
        const label = row.querySelector(".fynns-control-row__label")!.getBoundingClientRect();
        const controls = row.querySelector(".fynns-control-row__controls")!.getBoundingClientRect();
        return label.left < controls.right && controls.left < label.right && label.top < controls.bottom && controls.top < label.bottom;
      }));
      expect(overlaps).toBe(false);
      if (width > 640) expect(boxes.navRight).toBeCloseTo(boxes.contentLeft, 0);
      else expect(boxes.navBottom).toBeLessThanOrEqual(boxes.contentTop + 1);
      await page.screenshot({ path: `.tmp/settings-validation/${theme}-${width}-general.png` });
      await dialog.getByRole("button", { name: "Advanced", exact: true }).click();
      await dialog.getByRole("textbox").fill(`D:\\${theme}-${width}\\` + "Long folder name\\".repeat(10));
      await expect(dialog.getByRole("button", { name: "Save path", exact: true })).toBeInViewport();
      await dialog.getByRole("button", { name: "Save path", exact: true }).click();
      await expect(dialog.getByRole("status")).toHaveText("Saved on this device");
      expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `.tmp/settings-validation/${theme}-${width}-advanced.png` });
    }
  }
});
