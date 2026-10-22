import { test, expect } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"]) {
  test(`dense header controls stay inside narrow hosts (${theme})`, async ({ page }, testInfo) => {
    await resetSandboxSession(page);
    await page.setViewportSize({ width: 1400, height: 1000 });
    await openGlobalsDemo(page, "card");
    await page.evaluate(t => document.documentElement.setAttribute("data-fynns-theme", t), theme);
    const demo = page.locator("#sandbox-header-actions-responsive");
    for (const width of [1000, 768, 640, 600, 580, 560, 540, 520, 500, 480, 400, 320, 280, 240]) {
      await demo.evaluate((el, w) => { (el as HTMLElement).style.width = `${w}px`; }, width);
      for (const selector of [".fynns-card", ".fynns-collapsible"]) {
        const host = demo.locator(selector).first();
        const geometry = await host.evaluate(el => {
          const head = el.firstElementChild!;
          const bounds = el.getBoundingClientRect();
          const lead = head.firstElementChild!.getBoundingClientRect();
          const buttons = Array.from(head.querySelectorAll("button"));
          return {
            leadWidth: lead.width,
            overflow: head.scrollWidth - head.clientWidth,
            controls: buttons.map(button => {
              const b = button.getBoundingClientRect();
              const label = button.querySelector(".fynns-overflow-tip-label")
                ?? button.querySelector(".fynns-btn-label") ?? button;
              return { text: button.textContent, left: b.left - bounds.left, right: bounds.right - b.right,
                top: b.top, bottom: b.bottom, x: b.left, end: b.right,
                height: b.height, minimum: button.classList.contains("fynns-toggle-chip") ? 30 : 32,
                // Section titles may ellipsize; action labels must remain complete.
                overflow: button.classList.contains("fynns-collapsible-trigger") ? 0 : label.scrollWidth - label.clientWidth };
            }),
          };
        });
        expect(geometry.leadWidth, `${selector} title at ${width}`).toBeGreaterThan(48);
        expect(geometry.overflow, `${selector} overflow at ${width}`).toBeLessThanOrEqual(1);
        for (const control of geometry.controls) {
          expect(control.left, `${control.text} left at ${width}`).toBeGreaterThanOrEqual(0);
          expect(control.right, `${control.text} right at ${width}`).toBeGreaterThanOrEqual(0);
          expect(control.overflow, `${control.text} text at ${width}`).toBeLessThanOrEqual(1);
          expect(control.height).toBeGreaterThanOrEqual(control.minimum);
        }
        for (let i = 0; i < geometry.controls.length; i++) {
          for (const other of geometry.controls.slice(i + 1)) {
            const control = geometry.controls[i];
            const overlapX = Math.min(control.end, other.end) - Math.max(control.x, other.x);
            const overlapY = Math.min(control.bottom, other.bottom) - Math.max(control.top, other.top);
            expect(overlapX > 1 && overlapY > 1, `overlap at ${width}`).toBe(false);
          }
        }
      }
    }
    const card = demo.locator(".fynns-card");
    await card.getByRole("button", { name: "Document version", exact: true }).click();
    await page.getByRole("menuitem", { name: "Current version", exact: true }).click();
    await expect(card.getByRole("button", { name: "Document version", exact: true })).toContainText("Current version");
    await card.getByRole("button", { name: "Review this version", exact: true }).click();
    await expect(card).toContainText("Version ready for review.");
    await demo.evaluate(el => el.scrollIntoView({ block: "center", inline: "nearest" }));
    await demo.screenshot({ path: testInfo.outputPath(`header-actions-${theme}.png`) });
    const disclosure = demo.locator(".fynns-collapsible-trigger");
    await disclosure.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await expect(demo.locator(".fynns-collapsible-actions").getByRole("button", { name: "Review this version" })).toBeVisible();
  });
}
