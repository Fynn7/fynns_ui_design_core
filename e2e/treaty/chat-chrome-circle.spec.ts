import { test, expect } from "@playwright/test";
import { openLayoutsDemo, layoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test("bar size variants and the session menu share the hover circle and centerline", async ({ page }) => {
  await resetSandboxSession(page);
  await openLayoutsDemo(page, "chat-session-menu");
  const demo = layoutsDemo(page, "chat-session-menu");
  await demo.locator("textarea").fill("Check circular chrome targets");
  await demo.locator("textarea").press("Enter");
  const inspector = demo.getByRole("button", { name: "Inspector", exact: true });
  const more = demo.getByRole("button", { name: "Chat session options", exact: true });
  // Consumers may omit size or leave a previous sm/lg prop in a wrapped action.
  for (const size of ["md", "sm", "lg"]) {
    await inspector.evaluate((el, value) => {
      el.classList.remove("fynns-btn--sm", "fynns-btn--lg");
      if (value !== "md") el.classList.add(`fynns-btn--${value}`);
    }, size);
    await inspector.hover();
    const a = (await inspector.boundingBox())!;
    await more.hover();
    const b = (await more.boundingBox())!;
    expect(a.width).toBe(40);
    expect(a.height).toBe(40);
    expect(b.width).toBe(a.width);
    expect(b.height).toBe(a.height);
    expect(b.x + b.width / 2).toBeCloseTo(a.x + a.width / 2, 0);
    for (const control of [inspector, more]) {
      await control.hover();
      expect(await control.evaluate(el => getComputedStyle(el).borderRadius)).toBe(
        await inspector.evaluate(el => getComputedStyle(el).borderRadius),
      );
    }
  }
});
