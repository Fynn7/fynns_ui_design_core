import { expect, test, type Locator } from "@playwright/test";
import { openGlobalsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

const LONG_DRAFT = "A long message should leave Send at the lower right. ".repeat(12);

async function expectExpandedSendAtEnd(form: Locator) {
  await form.locator("textarea").fill(LONG_DRAFT);
  await expect(form.locator(".fynns-chat-composer-shell")).toHaveAttribute(
    "data-expanded",
    "",
  );

  const { shellGap, toolbarGap } = await form.evaluate((el) => {
    const shell = el.querySelector<HTMLElement>(".fynns-chat-composer-shell")!;
    const toolbar = el.querySelector<HTMLElement>(".fynns-chat-composer-toolbar")!;
    const send = el.querySelector<HTMLElement>(".fynns-chat-composer-primary")!;
    const shellBox = shell.getBoundingClientRect();
    const toolbarBox = toolbar.getBoundingClientRect();
    const sendBox = send.getBoundingClientRect();
    return {
      shellGap: shellBox.right - sendBox.right,
      toolbarGap: toolbarBox.right - sendBox.right,
    };
  });

  expect(shellGap).toBeGreaterThanOrEqual(0);
  expect(shellGap).toBeLessThan(20);
  expect(toolbarGap).toBeLessThan(2);
}

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("long drafts keep Send at the lower right in every layout chat host", async ({ page }) => {
  await openLayoutsDemo(page, "chat-product");
  const forms = page.locator(".fynns-chat-composer");
  const count = await forms.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expectExpandedSendAtEnd(forms.nth(index));
  }
});

test("long drafts keep Send at the lower right in every Components chat variant", async ({ page }) => {
  await openGlobalsDemo(page, "chat");
  const forms = page.locator("#globals-demo-chat .fynns-chat-composer");
  const count = await forms.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expectExpandedSendAtEnd(forms.nth(index));
  }
});
