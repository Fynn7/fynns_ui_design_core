import { expect, test } from "@playwright/test";
import { layoutsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const width of [1280, 640]) {
  test(`snackbar show, replacement and dismissal preserve shell and Chat geometry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await resetSandboxSession(page);
    await openLayoutsDemo(page, "fill-column");
    const demo = layoutsDemo(page, "fill-column");
    const trigger = demo.getByRole("button", { name: "Simulate request error", exact: true });
    await trigger.scrollIntoViewIfNeeded();
    const measure = () => page.evaluate(() => {
      const selectors = [
        ".sandbox-root", ".sandbox-body", ".sandbox-canvas", ".fynns-nav-drawer",
        "#layouts-demo-fill-column .sandbox-fill-column-stage",
        "#layouts-demo-fill-column .sandbox-fill-column-stage .fynns-fill-column-main",
        "#layouts-demo-fill-column .sandbox-fill-column-stage .fynns-chat",
        "#layouts-demo-fill-column .sandbox-fill-column-stage .fynns-chat-thread",
        "#layouts-demo-fill-column .sandbox-fill-column-stage .fynns-chat-composer",
      ];
      return selectors.map(selector => {
        const el = document.querySelector<HTMLElement>(selector)!;
        const box = el.getBoundingClientRect();
        return { selector, x: box.x, y: box.y, width: box.width, height: box.height,
          scrollTop: el.scrollTop, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight };
      });
    });
    const baseline = await measure();
    await trigger.click();
    const host = page.locator(".fynns-snackbar-host");
    await expect(host).toBeVisible();
    await expect(host).toHaveCSS("position", "fixed");
    expect(await host.evaluate(el => el.parentElement === document.body)).toBe(true);
    await expect(host.locator(".fynns-snackbar")).toHaveCSS("opacity", "1");
    expect(await measure()).toEqual(baseline);
    await expect(host.locator(".fynns-snackbar")).toHaveCSS("backdrop-filter", "blur(16px)");
    await trigger.click();
    await expect(host.locator(".fynns-snackbar")).toHaveCSS("opacity", "1");
    expect(await measure()).toEqual(baseline);
    await host.getByRole("button", { name: "Dismiss", exact: true }).click();
    await expect(host).toHaveCount(0);
    expect(await measure()).toEqual(baseline);
  });
}
