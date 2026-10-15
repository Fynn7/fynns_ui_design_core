import { test, expect } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "info-hint");
});

test("completion details retain a circular hover target and keyboard tooltip", async ({ page }) => {
  const host = page.locator("#sandbox-status-hint");
  const hint = host.locator(".fynns-card-actions").getByRole("button", { name: "Completed", exact: true });
  await expect(hint).toBeVisible();
  await expect(hint.locator("svg circle")).toHaveCount(0);
  const glyph = await hint.locator("svg").boundingBox();
  expect(glyph?.width).toBe(16);
  expect(glyph?.height).toBe(16);
  const resting = await hint.evaluate(el => getComputedStyle(el).backgroundColor);
  await hint.hover();
  await expect.poll(() => hint.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(resting);
  expect(await hint.evaluate(el => getComputedStyle(el).borderRadius)).toBe("50%");
  await expect(page.getByRole("tooltip")).toContainText("The result is available");
  await page.mouse.move(0, 0);
  await hint.focus();
  await expect(hint).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("The result is available");
});

test("header clamps wrapped default and large buttons without shrinking body controls", async ({ page }) => {
  const host = page.locator("#sandbox-status-hint");
  const header = host.locator(".fynns-card-actions button");
  const body = host.locator(".fynns-card-body button");
  const head = host.locator(".fynns-card-head");
  const originalHeight = (await head.boundingBox())!.height;
  for (const sizeClass of ["", "fynns-btn--lg", "fynns-btn--sm"]) {
    // Model consumer size props on a Tooltip-wrapped control; the core host
    // must constrain all three class shapes without changing the title band.
    await header.evaluate((el, cls) => {
      el.classList.remove("fynns-btn--sm", "fynns-btn--lg");
      if (cls) el.classList.add(cls);
    }, sizeClass);
    const box = (await header.boundingBox())!;
    expect(box.width).toBe(32);
    expect(box.height).toBe(32);
    expect((await head.boundingBox())!.height).toBe(originalHeight);
    const bodyBox = (await body.boundingBox())!;
    expect(bodyBox.width).toBe(40);
    expect(bodyBox.height).toBe(40);
  }
});
