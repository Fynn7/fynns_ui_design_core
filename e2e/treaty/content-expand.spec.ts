import { expect, test } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("code preview disclosure stays separate from action chrome and supports keyboard", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "code-block", "CodeBlock");
  const host = page.locator("#sandbox-content-expand");
  const preview = host.locator("#sandbox-expand-preview");
  const toggle = host.locator(".fynns-expand-toggle");
  await expect(toggle).toHaveAttribute("aria-controls", "sandbox-expand-preview");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).not.toHaveClass(/fynns-btn/);
  await expect(toggle.locator("svg")).toHaveCount(1);
  const collapsedHeight = await preview.evaluate(node => node.getBoundingClientRect().height);
  const appearance = await toggle.evaluate(node => {
    const css = getComputedStyle(node);
    return { padding: css.padding, background: css.backgroundColor, cluster: !!node.closest(".fynns-control-cluster") };
  });
  expect(appearance).toEqual({ padding: "0px", background: "rgba(0, 0, 0, 0)", cluster: false });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(await preview.evaluate(node => node.getBoundingClientRect().height)).toBeGreaterThan(collapsedHeight * 2);
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await preview.evaluate(node => node.getBoundingClientRect().height)).toBeCloseTo(collapsedHeight, 0);
});
