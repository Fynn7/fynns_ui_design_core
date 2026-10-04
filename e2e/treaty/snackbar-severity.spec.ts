import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "snackbar", "Snackbar");
});

test("default info icon and severity surfaces work with and without icons", async ({ page }) => {
  const demo = globalsDemo(page, "snackbar");
  const snack = page.locator(".fynns-snackbar");
  await demo.getByRole("button", { name: "Short snackbar", exact: true }).click();
  await expect(snack.locator(".fynns-snackbar__icon svg")).toHaveCount(1);
  await expect(snack).toHaveAttribute("role", "status");
  await expect(snack).toHaveAttribute("aria-live", "polite");
  const normalSurface = await snack.evaluate((el) => getComputedStyle(el).backgroundColor);

  for (const severity of ["info", "warning", "error", "success"] as const) {
    const label = severity[0].toUpperCase() + severity.slice(1);
    await demo.getByRole("button", { name: `${label} toast`, exact: true }).click();
    await expect(snack).toHaveAttribute("data-state", "open");
    await expect(snack).toHaveClass(new RegExp(`fynns-snackbar--${severity}`));
    await expect(snack).toHaveAttribute("role", severity === "error" ? "alert" : "status");
    await expect(snack).toHaveAttribute("aria-live", severity === "error" ? "assertive" : "polite");
    await expect(snack.locator(".fynns-snackbar__icon")).toHaveAttribute("aria-hidden", "true");
    const palette = await snack.evaluate((el) => {
      const css = getComputedStyle(el);
      return { surface: css.backgroundColor, glyph: getComputedStyle(el.querySelector(".fynns-snackbar__icon")!).color };
    });
    if (severity === "info") expect(palette.surface).toBe(normalSurface);
    else expect(palette.surface).not.toBe(normalSurface);
    expect(palette.glyph).not.toBe(await snack.evaluate((el) => getComputedStyle(el).color));

    await demo.getByRole("button", { name: `${label} without icon`, exact: true }).click();
    await expect(snack).toHaveAttribute("data-state", "open");
    await expect(snack.locator(".fynns-snackbar__icon")).toHaveCount(0);
    expect(await snack.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(palette.surface);
    await expect(snack.locator(".fynns-snackbar__message")).not.toBeEmpty();
  }
});

test("error toast rises at the viewport bottom and respects reduced motion", async ({ page }) => {
  const button = globalsDemo(page, "snackbar").getByRole("button", { name: "Error toast", exact: true });
  await button.click();
  const snack = page.locator(".fynns-snackbar");
  await expect(snack).toHaveAttribute("data-state", "open");
  await expect(async () => {
    expect(await snack.evaluate((el) => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  }).toPass();
  const placement = await snack.evaluate((el) => {
    const host = el.parentElement!;
    const box = host.getBoundingClientRect();
    const css = getComputedStyle(host);
    const closed = el.cloneNode(true) as HTMLElement;
    closed.dataset.state = "closed";
    closed.style.transition = "none";
    host.append(closed);
    const dy = new DOMMatrix(getComputedStyle(closed).transform).m42;
    closed.remove();
    return { bottom: innerHeight - box.bottom, inset: parseFloat(css.bottom), center: box.x + box.width / 2, viewport: innerWidth, dy };
  });
  expect(placement.bottom).toBeCloseTo(placement.inset, 0);
  expect(placement.center).toBeCloseTo(placement.viewport / 2, 0);
  expect(placement.dy).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await button.click();
  await expect(snack).toHaveCSS("transform", "none");
});
