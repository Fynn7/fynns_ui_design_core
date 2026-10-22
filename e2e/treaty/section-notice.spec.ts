import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("section notice supports keyboard details, recovery, dismissal and narrow panes", async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await openGlobalsDemo(page, "section-notice");
  const demo = globalsDemo(page, "section-notice");
  const notice = demo.locator(".fynns-section-notice").first();
  const disclosure = notice.getByRole("button", { name: /View details|Hide details/ });
  await expect(notice.locator(".fynns-section-notice__details")).toBeHidden();
  const collapsedWidth = (await notice.boundingBox())!.width;
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(notice.locator(".fynns-section-notice__details")).toBeVisible();
  expect((await notice.boundingBox())!.width).toBeCloseTo(collapsedWidth, 0);
  await page.keyboard.press("Space");
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await notice.getByRole("button", { name: "Refresh list" }).click();
  await expect(notice).toContainText("The list is up to date.");
  await expect(notice.getByRole("button")).toHaveCount(0);
  const error = demo.locator(".fynns-section-notice--error");
  await expect(error.getByRole("alert")).toBeVisible();
  await error.getByRole("button", { name: "Dismiss notice" }).click();
  await expect(error).toHaveCount(0);
  await demo.getByRole("button", { name: "Reset examples" }).click();
  await expect(error).toBeVisible();
  for (const item of await demo.locator(".fynns-section-notice").all()) {
    const overflow = await item.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(overflow).toBe(false);
  }
  await error.getByRole("button", { name: "Retry connection" }).click();
  await expect(error).toHaveCount(0);
  await expect(demo.locator(".fynns-section-notice--success")).toContainText("The list is up to date.");
});
