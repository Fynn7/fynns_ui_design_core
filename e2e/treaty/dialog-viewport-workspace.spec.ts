/**
 * CONSUMER_TREATY slug: `code/config Dialog still too small at lg`.
 * Sandbox: #dialog-viewport.
 */
import { expect, test } from "@playwright/test";
import {
  globalsDemo,
  openGlobalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("viewport Dialog stays inset and gives its CodeBlock the workspace", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openGlobalsDemo(page, "dialog-viewport", "viewport workspace");
  await globalsDemo(page, "dialog-viewport")
    .getByRole("button", { name: "Open viewport workspace dialog" })
    .click();

  const dialog = page.locator(
    ".fynns-dialog-panel--size-viewport[data-state='open']",
  );
  await expect(dialog).toBeVisible();

  const metrics = await dialog.evaluate((host) => {
    const body = host.querySelector<HTMLElement>(".fynns-dialog-body");
    const code = host.querySelector<HTMLElement>(".fynns-code-block");
    const input = host.querySelector<HTMLTextAreaElement>(".fynns-code-block-input");
    if (!body || !code || !input) return null;
    const panelRect = host.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const codeRect = code.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    return {
      panelWidth: panelRect.width,
      panelHeight: panelRect.height,
      bodyHeight: bodyRect.height,
      codeWidth: codeRect.width,
      codeHeight: codeRect.height,
      inputHeight: inputRect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.panelWidth).toBeGreaterThan(metrics!.viewportWidth * 0.8);
  expect(metrics!.panelWidth).toBeLessThan(metrics!.viewportWidth);
  expect(metrics!.panelHeight).toBeGreaterThan(metrics!.viewportHeight * 0.75);
  expect(metrics!.panelHeight).toBeLessThan(metrics!.viewportHeight);
  expect(metrics!.codeWidth).toBeGreaterThan(metrics!.panelWidth * 0.9);
  expect(metrics!.codeHeight).toBeGreaterThan(metrics!.bodyHeight * 0.9);
  expect(metrics!.inputHeight).toBeGreaterThan(metrics!.codeHeight * 0.8);
});
