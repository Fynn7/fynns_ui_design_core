/**
 * CONSUMER_TREATY: private toast action capsule / close X wrapper.
 * Sandbox: #snackbar. Core owns action style and independent dismiss control.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "snackbar", "Snackbar");
});

test("Snackbar keeps the existing ghost action and default close X", async ({ page }) => {
  await globalsDemo(page, "snackbar")
    .getByRole("button", { name: "Snackbar with Undo", exact: true })
    .click();

  const snack = page.locator(".fynns-snackbar");
  await expect(snack).toHaveAttribute("data-state", "open");
  await expect(snack.getByRole("button", { name: "Undo", exact: true }))
    .toHaveClass(/fynns-btn--ghost/);
  await expect(snack.getByRole("button", { name: "Dismiss", exact: true }))
    .toBeVisible();
});

test("Snackbar tonal action has a capsule surface and a working close X", async ({ page }) => {
  await globalsDemo(page, "snackbar")
    .getByRole("button", { name: "Tonal action + dismiss", exact: true })
    .click();

  const snack = page.locator(".fynns-snackbar");
  await expect(snack).toHaveAttribute("data-state", "open");
  const action = snack.getByRole("button", { name: "View draft", exact: true });
  await expect(action).toHaveClass(/fynns-btn--tonal/);
  // Check the resting surface, without hover: the screenshot variant has a
  // filled action even when the pointer is elsewhere.
  await page.mouse.move(0, 0);
  const surface = await action.evaluate((el) => {
    const css = getComputedStyle(el);
    return { background: css.backgroundColor, radius: parseFloat(css.borderRadius) };
  });
  expect(surface.background).not.toMatch(/^transparent$|rgba\(0, 0, 0, 0\)/);
  expect(surface.radius).toBeGreaterThan(0);
  await snack.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(snack).toHaveCount(0);
});

test("Snackbar tonal action without X invokes its callback and preserves replacement", async ({ page }) => {
  await globalsDemo(page, "snackbar")
    .getByRole("button", { name: "Tonal action only", exact: true })
    .click();

  const snack = page.locator(".fynns-snackbar");
  await expect(snack).toHaveAttribute("data-state", "open");
  await expect(snack.getByRole("button")).toHaveCount(1);
  const action = snack.getByRole("button", { name: "View draft", exact: true });
  await expect(action).toHaveClass(/fynns-btn--tonal/);
  await action.click();
  await expect(snack).toHaveText("Draft opened");
  await expect(snack).toHaveAttribute("data-state", "open");
  await expect(snack.getByRole("button")).toHaveCount(0);
});

test("Snackbar without X auto-dismisses after long duration", async ({ page }) => {
  await page.clock.install();
  await globalsDemo(page, "snackbar")
    .getByRole("button", { name: "Tonal action only", exact: true })
    .click();

  const snack = page.locator(".fynns-snackbar");
  await expect(snack).toHaveAttribute("data-state", "open");
  await page.clock.fastForward(9_000);
  await expect(snack).toHaveAttribute("data-state", "open");
  await page.clock.fastForward(1_000);
  await expect(snack).toHaveAttribute("data-state", "closed");
  await page.clock.fastForward(1_000);
  await expect(snack).toHaveCount(0);
});
