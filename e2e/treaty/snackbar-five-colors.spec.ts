import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("the ordinary snackbar is dark teal without an icon and can opt into one", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "snackbar", "Snackbar");
  const demo = globalsDemo(page, "snackbar");
  const snack = page.locator(".fynns-snackbar");
  await demo.getByRole("button", { name: "Default snackbar", exact: true }).click();
  await expect(snack).toHaveAttribute("data-tone", "neutral");
  await expect(snack.locator(".fynns-snackbar__icon")).toHaveCount(0);
  const plain = await snack.evaluate((el) => getComputedStyle(el).backgroundColor);
  await demo.getByRole("button", { name: "Default with icon", exact: true }).click();
  await expect(snack.locator(".fynns-snackbar__icon svg")).toHaveCount(1);
  expect(await snack.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(plain);
});

test("status fills are opaque light colors, readable, and survive older host markup", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "snackbar", "Snackbar");
  const demo = globalsDemo(page, "snackbar");
  const snack = page.locator(".fynns-snackbar");
  const surfaces = new Set<string>();
  for (const [severity, label] of [["error", "Error"], ["warning", "Warning"], ["info", "Blue info"], ["success", "Success"]] as const) {
    await demo.getByRole("button", { name: `${label} toast`, exact: true }).click();
    await expect(snack).toHaveCSS("opacity", "1");
    await expect(snack.locator(".fynns-snackbar__icon svg")).toHaveCount(1);
    const palette = await snack.evaluate((el) => {
      const rgb = (color: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return Array.from(ctx.getImageData(0, 0, 1, 1).data);
      };
      const style = getComputedStyle(el);
      const luminance = (value: number[]) => value.slice(0, 3).map((channel) => {
        const c = channel / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index]!, 0);
      const bg = rgb(style.backgroundColor);
      const contrast = (color: string) => (luminance(bg) + 0.05) / (luminance(rgb(color)) + 0.05);
      return {
        surface: style.backgroundColor, rgba: bg,
        body: contrast(style.color),
        icon: contrast(getComputedStyle(el.querySelector(".fynns-snackbar__icon")!).color),
        close: contrast(getComputedStyle(el.querySelector(".fynns-snackbar__dismiss")!).color),
      };
    });
    surfaces.add(palette.surface);
    expect(palette.rgba[3]).toBe(255);
    expect(Math.min(...palette.rgba.slice(0, 3))).toBeGreaterThan(160);
    const [r, g, b] = palette.rgba as [number, number, number, number];
    if (severity === "error") expect(r - Math.max(g, b)).toBeGreaterThan(20);
    if (severity === "warning") { expect(r).toBeGreaterThan(g); expect(g - b).toBeGreaterThan(40); }
    if (severity === "info") expect(b - r).toBeGreaterThan(20);
    if (severity === "success") expect(g - r).toBeGreaterThan(20);
    expect(palette.body).toBeGreaterThanOrEqual(4.5);
    expect(palette.icon).toBeGreaterThanOrEqual(3);
    expect(palette.close).toBeGreaterThanOrEqual(3);
    if (severity !== "info") {
      // A cached host from before data-tone must still display its error color.
      await snack.evaluate((el) => el.removeAttribute("data-tone"));
      expect(await snack.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(palette.surface);
    }
  }
  expect(surfaces.size).toBe(4);
});
