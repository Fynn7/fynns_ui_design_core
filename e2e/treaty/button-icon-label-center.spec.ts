/**
 * Sandbox: #button-icon-label — labeled Button with a leading icon, both
 * direct children and children passed through a React Fragment.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("Button icon and text share a vertical center", async ({ page }) => {
  await openGlobalsDemo(page, "button-icon-label", "icon and text");
  const demo = globalsDemo(page, "button-icon-label");
  const buttons = demo.getByRole("button");
  await expect(buttons).toHaveCount(2);

  for (const button of await buttons.all()) {
    const delta = await button.evaluate((el) => {
      const label = el.querySelector(".fynns-btn-label");
      const icon = label?.querySelector("svg");
      const text = Array.from(label?.childNodes ?? []).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      );
      if (!icon || !text) return null;

      const textRange = document.createRange();
      textRange.selectNodeContents(text);
      const iconBox = icon.getBoundingClientRect();
      const textBox = textRange.getBoundingClientRect();
      return Math.abs(
        iconBox.top + iconBox.height / 2 - (textBox.top + textBox.height / 2),
      );
    });
    expect(delta).not.toBeNull();
    expect(delta!).toBeLessThan(2);
  }
});
