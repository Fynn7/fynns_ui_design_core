import { test, expect } from "@playwright/test";
import { openLayoutsDemo, layoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"] as const) {
  test(`chat hover circles have symmetric divider clearance (${theme})`, async ({ page }) => {
    await resetSandboxSession(page);
    await openLayoutsDemo(page, "chat-session-menu");
    if (theme === "light") await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    const demo = layoutsDemo(page, "chat-session-menu");
    await demo.locator("textarea").fill("Check divider clearance");
    await demo.locator("textarea").press("Enter");
    const inspector = demo.getByRole("button", { name: "Inspector", exact: true });
    const more = demo.getByRole("button", { name: "Chat session options", exact: true });
    for (const width of [960, 640]) {
      await demo.locator(".sandbox-chat-product-stage").evaluate((el, value) => { el.style.width = `${value}px`; }, width);
      await inspector.hover();
      const upper = (await inspector.boundingBox())!;
      await more.hover();
      const lower = (await more.boundingBox())!;
      const divider = await demo.locator(".fynns-top-app-bar").evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.bottom - parseFloat(getComputedStyle(el).borderBottomWidth) / 2;
      });
      expect(lower.x + lower.width / 2).toBeCloseTo(upper.x + upper.width / 2, 1);
      expect(lower.y - divider).toBeCloseTo(divider - upper.y - upper.height, 1);
      expect(lower.width).toBe(upper.width);
      expect(lower.height).toBe(upper.height);
    }
  });
}
