import { expect, test } from "@playwright/test";
import { layoutsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const width of [1280, 640]) {
  test(`FillColumn protects an inserted notice and docks Chat at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await resetSandboxSession(page);
    await openLayoutsDemo(page, "fill-column");
    const demo = layoutsDemo(page, "fill-column");
    const main = demo.locator(".sandbox-fill-column-stage .fynns-fill-column-main");
    const measure = () => main.evaluate((el) => {
      const css = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const first = el.firstElementChild!.getBoundingClientRect();
      const chat = el.querySelector(".fynns-chat")!.getBoundingClientRect();
      return {
        top: parseFloat(css.paddingTop), left: parseFloat(css.paddingLeft), right: parseFloat(css.paddingRight),
        firstTop: first.top - box.top, firstLeft: first.left - box.left,
        firstRight: box.right - first.right, dock: box.bottom - chat.bottom,
        client: el.clientWidth, scroll: el.scrollWidth,
      };
    });
    await expect(main.locator(".fynns-inline-alert")).toBeVisible();
    const inset = await measure();
    expect(inset.top).toBeGreaterThan(0);
    expect(inset.left).toBe(inset.top);
    expect(inset.right).toBe(inset.top);
    expect(inset.firstTop).toBeCloseTo(inset.top, 0);
    expect(inset.firstLeft).toBeCloseTo(inset.left, 0);
    expect(inset.firstRight).toBeCloseTo(inset.right, 0);
    expect(inset.dock).toBeCloseTo(0, 0);
    expect(inset.scroll).toBeLessThanOrEqual(inset.client);
    await demo.getByRole("switch", { name: "Persistent conversation notice", exact: true }).click();
    await expect(main.locator(".fynns-inline-alert")).toHaveCount(0);
    expect((await measure()).firstTop).toBeCloseTo(inset.top, 0);
    await demo.getByRole("button", { name: "Simulate request error", exact: true }).click();
    await expect(page.locator(".fynns-snackbar--error")).toHaveAttribute("role", "alert");
    await expect(main.locator(".fynns-inline-alert")).toHaveCount(0);
    expect((await measure()).dock).toBeCloseTo(0, 0);
  });
}
