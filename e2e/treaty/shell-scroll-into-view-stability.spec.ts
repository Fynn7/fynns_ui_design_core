import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const width of [1933, 800]) {
  test(`component jumps keep shell chrome at the viewport bottom at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1125 });
    await resetSandboxSession(page);
    await openGlobalsDemo(page, "form-recipe", "Inspector form recipe");

    const shell = page.locator(".sandbox-root");
    const canvas = shell.locator(".sandbox-canvas");
    const field = globalsDemo(page, "form-recipe").locator("textarea").first();

    // Model a layout spill without changing the grid tracks. `hidden` lets
    // scrollIntoView scroll the outer shell by the top bar height, leaving
    // both the drawer footer and canvas above the viewport bottom.
    await shell.evaluate((el) => {
      const host = el as HTMLElement;
      host.style.position = "relative";
      const spill = document.createElement("div");
      spill.setAttribute("data-shell-layout-spill", "");
      spill.style.position = "absolute";
      spill.style.top = "100%";
      spill.style.height = `${host.querySelector(".fynns-top-app-bar")!.clientHeight}px`;
      spill.style.width = "1px";
      spill.style.pointerEvents = "none";
      host.append(spill);
    });
    await canvas.evaluate((el) => { el.scrollTop = 0; });
    await field.evaluate((el) => {
      el.scrollIntoView({ block: "start", behavior: "instant" });
      el.focus({ preventScroll: true });
    });
    await expect(field).toBeFocused();
    expect(await canvas.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

    const assertEdges = async () => {
      const geometry = await shell.evaluate((el) => ({
        scrollTop: el.scrollTop,
        viewport: window.innerHeight,
        bottom: el.getBoundingClientRect().bottom,
        edges: [
          ".fynns-clipped-nav-shell-body",
          ".sandbox-nav",
          ".sandbox-canvas",
        ].map((selector) => el.querySelector(selector)!.getBoundingClientRect().bottom),
      }));
      expect(geometry.scrollTop).toBe(0);
      expect(geometry.bottom).toBeCloseTo(geometry.viewport, 0);
      for (const bottom of geometry.edges) expect(bottom).toBeCloseTo(geometry.viewport, 0);
    };
    await assertEdges();

    await shell.evaluate((el) => {
      el.scrollTop = 100;
      el.querySelector("[data-shell-layout-spill]")!.remove();
    });
    await assertEdges();
    await page.setViewportSize({ width, height: 900 });
    await assertEdges();
  });
}
