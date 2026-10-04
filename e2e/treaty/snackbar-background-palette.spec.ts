import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const [severity, label] of [
  ["info", "Blue info"], ["warning", "Warning"], ["error", "Error"], ["success", "Success"],
] as const) {
  test(`${severity} toast paints the InlineAlert background, including without an icon`, async ({ page }) => {
    await resetSandboxSession(page);
    await openGlobalsDemo(page, "snackbar", "Snackbar");
    const demo = globalsDemo(page, "snackbar");
    const snack = page.locator(".fynns-snackbar");
    await demo.getByRole("button", { name: "Short snackbar", exact: true }).click();
    await expect(snack).toHaveAttribute("data-tone", "neutral");
    const neutral = await snack.evaluate((el) => getComputedStyle(el).background);

    for (const withIcon of [true, false]) {
      await demo.getByRole("button", {
        name: `${label} ${withIcon ? "toast" : "without icon"}`, exact: true,
      }).click();
      await expect(snack).toHaveAttribute("data-tone", "severity");
      await expect(snack).toHaveAttribute("data-state", "open");
      await expect(snack).toHaveCSS("opacity", "1");
      await expect(snack.locator(".fynns-snackbar__icon")).toHaveCount(withIcon ? 1 : 0);
      expect(await snack.evaluate((el) => getComputedStyle(el).background)).not.toBe(neutral);

      // Compare rendered pixels with a real InlineAlert on the canonical canvas.
      // This catches a gray/teal base diluting the wash even if the icon is colored.
      const samples = await snack.evaluate((el, kind) => {
        const base = document.createElement("div");
        base.id = "snackbar-palette-reference";
        Object.assign(base.style, {
          position: "fixed", top: "16px", left: "16px", width: "80px", height: "64px",
          zIndex: "2147483647", background: "var(--fynns-color-surface)",
        });
        base.setAttribute("aria-hidden", "true");
        const alert = document.createElement("div");
        alert.className = `fynns-inline-alert fynns-inline-alert--${kind}`;
        alert.style.height = "64px";
        base.append(alert);
        document.body.append(base);
        const box = el.getBoundingClientRect();
        return { x: box.left + 8, y: box.top + box.height / 2, scale: devicePixelRatio };
      }, severity);
      const screenshot = (await page.screenshot()).toString("base64");
      const pixels = await page.evaluate(async ({ png, x, y, scale }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${png}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        const sample = (px: number, py: number) => Array.from(context.getImageData(Math.round(px * scale), Math.round(py * scale), 1, 1).data);
        return { toast: sample(x, y), inline: sample(56, 48) };
      }, { png: screenshot, ...samples });
      for (let channel = 0; channel < 4; channel++) {
        expect(Math.abs(pixels.toast[channel]! - pixels.inline[channel]!)).toBeLessThanOrEqual(1);
      }
      await page.locator("#snackbar-palette-reference").evaluate((el) => el.remove());
    }
  });
}
