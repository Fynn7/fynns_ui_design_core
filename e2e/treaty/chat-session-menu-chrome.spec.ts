import { test, expect } from "@playwright/test";
import { openLayoutsDemo, layoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"] as const) {
  test(`chat menu shares the bar edge and action gap (${theme})`, async ({ page }) => {
    await resetSandboxSession(page);
    await openLayoutsDemo(page, "chat-session-menu");
    if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    const demo = layoutsDemo(page, "chat-session-menu");
    await demo.locator("textarea").fill("Check menu alignment");
    await demo.locator("textarea").press("Enter");
    const trigger = demo.getByRole("button", { name: "Chat session options", exact: true });
    const inspector = demo.getByRole("button", { name: "Inspector", exact: true });
    const bar = demo.locator(".fynns-top-app-bar");
    const well = demo.locator(".fynns-fill-column-main");
    const check = async () => {
      const a = (await inspector.boundingBox())!;
      const b = (await trigger.boundingBox())!;
      const c = (await bar.boundingBox())!;
      const gap = await bar.evaluate(el => {
        const probe = document.createElement("span");
        probe.style.width = "var(--fynns-appbar-actions-gap)";
        probe.style.position = "absolute";
        el.append(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        return width;
      });
      expect(b.x + b.width / 2).toBeCloseTo(a.x + a.width / 2, 0);
      expect(b.y - c.y - c.height).toBeCloseTo(gap, 0);
    };
    await check();
    const bounds = await well.boundingBox();
    await trigger.click();
    await page.getByRole("menuitem", { name: "Export chat as…", exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "JSON (.json)", exact: true })).toBeVisible();
    expect(await well.boundingBox()).toEqual(bounds);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    // Shrink the actual shell, not the content column; menu must still follow its edge.
    await demo.locator(".sandbox-chat-product-stage").evaluate(el => { el.style.width = "640px"; });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await check();
  });
}
