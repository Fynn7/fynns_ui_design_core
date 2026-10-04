import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const width of [1280, 640]) {
  test(`inline host reserves a footer without overlaying the app at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await resetSandboxSession(page);
    await openGlobalsDemo(page, "snackbar", "Snackbar");
    const demo = globalsDemo(page, "snackbar");
    const shell = page.locator(".sandbox-root");
    const baseline = await shell.boundingBox();
    await demo.getByRole("switch", { name: "Reserve space for snackbar", exact: true }).click();
    await demo.getByRole("button", { name: "Error snackbar", exact: true }).click();
    const host = page.locator(".fynns-snackbar-host--inline");
    await expect(host).toBeVisible();
    await expect(host.locator(".fynns-snackbar")).toHaveAttribute("data-state", "open");
    const geometry = await host.evaluate((el) => {
      const shellBox = document.querySelector(".sandbox-root")!.getBoundingClientRect();
      const hostBox = el.getBoundingClientRect();
      const snackBox = el.firstElementChild!.getBoundingClientRect();
      return {
        shellBottom: shellBox.bottom, shellHeight: shellBox.height,
        hostTop: hostBox.top, hostBottom: hostBox.bottom,
        snackTop: snackBox.top, snackBottom: snackBox.bottom,
        client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        ownsFooterHitTesting: document.elementFromPoint(hostBox.left + 1, hostBox.top + 1) === el,
      };
    });
    expect(geometry.shellHeight).toBeLessThan(baseline!.height);
    expect(geometry.hostTop).toBeGreaterThanOrEqual(geometry.shellBottom);
    expect(geometry.snackTop).toBeGreaterThanOrEqual(geometry.hostTop);
    expect(geometry.snackBottom).toBeLessThanOrEqual(geometry.hostBottom);
    expect(geometry.hostBottom).toBeLessThanOrEqual(900);
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.client);
    expect(geometry.ownsFooterHitTesting).toBe(true);
    await host.getByRole("button", { name: "Dismiss", exact: true }).click();
    await expect(host).toHaveCount(0);
    await expect.poll(async () => (await shell.boundingBox())!.height).toBe(baseline!.height);
  });
}
