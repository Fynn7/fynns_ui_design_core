import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "snackbar", "Snackbar");
});

test("default keeps its theme surface without an icon and supports an optional info icon", async ({ page }) => {
  const demo = globalsDemo(page, "snackbar");
  const snack = page.locator(".fynns-snackbar");
  await demo.getByRole("button", { name: "Short snackbar", exact: true }).click();
  await expect(snack).toHaveClass(/fynns-snackbar--default/);
  await expect(snack.locator(".fynns-snackbar__icon")).toHaveCount(0);
  await expect(snack).toHaveAttribute("role", "status");
  const background = await snack.evaluate((el) => getComputedStyle(el).backgroundColor);
  await demo.getByRole("button", { name: "Default with icon", exact: true }).click();
  await expect(snack.locator(".fynns-snackbar__icon svg")).toHaveCount(1);
  expect(await snack.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(background);
});

for (const severity of ["info", "success", "warning", "error"] as const) {
  test(`${severity} uses the original InlineAlert transparent background, text and icon colors`, async ({ page }) => {
    const label = severity[0].toUpperCase() + severity.slice(1);
    const demo = globalsDemo(page, "snackbar");
    const snack = page.locator(".fynns-snackbar");
    const reference = demo.locator(`#sandbox-snackbar-inline-reference .fynns-inline-alert--${severity}`);
    const inline = await reference.evaluate((el) => ({
      fill: getComputedStyle(el).backgroundColor,
      text: getComputedStyle(el).color,
      icon: getComputedStyle(el.querySelector(".fynns-inline-alert__icon")!).color,
    }));
    await demo.getByRole("button", { name: `${label} snackbar`, exact: true }).click();
    await expect(snack).toHaveAttribute("data-state", "open");
    await expect(snack).toHaveAttribute("role", severity === "error" ? "alert" : "status");
    await expect(snack).toHaveAttribute("aria-live", severity === "error" ? "assertive" : "polite");
    const actual = await snack.evaluate((el) => {
      const css = getComputedStyle(el);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = css.backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return {
        fill: css.backgroundColor, text: css.color, image: css.backgroundImage,
        alpha: context.getImageData(0, 0, 1, 1).data[3],
        icon: getComputedStyle(el.querySelector(".fynns-snackbar__icon")!).color,
      };
    });
    expect(actual.fill).toBe(inline.fill);
    expect(actual.text).toBe(inline.text);
    expect(actual.icon).toBe(inline.icon);
    expect(actual.image).toBe("none");
    // The existing InlineAlert is 12% transparent color, not an opaque fill.
    expect(actual.alpha).toBeGreaterThanOrEqual(30);
    expect(actual.alpha).toBeLessThanOrEqual(31);
    await expect(snack.locator(".fynns-snackbar__icon")).toHaveAttribute("aria-hidden", "true");

    await demo.getByRole("button", { name: `${label} without icon`, exact: true }).click();
    await expect(snack.locator(".fynns-snackbar__icon")).toHaveCount(0);
    expect(await snack.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(inline.fill);
  });
}
