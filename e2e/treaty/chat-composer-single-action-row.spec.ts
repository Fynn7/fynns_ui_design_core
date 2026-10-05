import { expect, test, type Locator } from "@playwright/test";
import { openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

async function expectSingleVisibleActionRow(form: Locator) {
  const geometry = await form.evaluate((element) => {
    const shell = element.querySelector<HTMLElement>(".fynns-chat-composer-shell")!;
    const shellBox = shell.getBoundingClientRect();
    const controls = Array.from(
      element.querySelectorAll<HTMLElement>(".fynns-chat-composer-toolbar button"),
    ).filter((control) => control.getBoundingClientRect().width > 0);
    return controls.map((control) => {
      const box = control.getBoundingClientRect();
      // A parent clip can hide a button even when its own box is in the shell.
      let visibleLeft = shellBox.left;
      let visibleRight = shellBox.right;
      for (let parent = control.parentElement; parent && parent !== shell; parent = parent.parentElement) {
        if (["hidden", "clip"].includes(getComputedStyle(parent).overflowX)) {
          const parentBox = parent.getBoundingClientRect();
          visibleLeft = Math.max(visibleLeft, parentBox.left);
          visibleRight = Math.min(visibleRight, parentBox.right);
        }
      }
      return {
        center: box.top + box.height / 2,
        leftClearance: box.left - visibleLeft,
        rightClearance: visibleRight - box.right,
      };
    });
  });
  expect(geometry.length).toBeGreaterThanOrEqual(3);
  const centers = geometry.map((control) => control.center);
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(2);
  for (const control of geometry) {
    expect(control.leftClearance).toBeGreaterThanOrEqual(-1);
    expect(control.rightClearance).toBeGreaterThanOrEqual(-1);
  }
}

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat");
});

for (const anchor of [
  "sandbox-chat-composer-leading-menus-narrow",
  "sandbox-chat-composer-thinking-toggle-narrow",
]) {
  test(`${anchor} keeps every control on one visible row with empty and multiline drafts`, async ({ page }) => {
    const form = page.locator(`#${anchor} .fynns-chat-composer`);
    await expectSingleVisibleActionRow(form);
    await form.locator("textarea").fill("A multiline draft\nkeeps all actions together.");
    await expectSingleVisibleActionRow(form);
    await form.locator("textarea").fill("");
    await expectSingleVisibleActionRow(form);
  });
}

test("composer retains the core width floor when its host is compressed", async ({ page }) => {
  const host = page.locator("#sandbox-chat-composer-thinking-toggle-narrow");
  // This application's complete action row needs a larger floor than the
  // baseline. The host supplies it through an existing public layout token.
  await host.evaluate((element) => {
    const host = element as HTMLElement;
    host.style.setProperty("--fynns-layout-chat-min-width", "23rem");
    host.style.width = "10rem";
  });
  const form = host.locator(".fynns-chat-composer");
  const width = await form.evaluate((element) => ({
    actual: element.getBoundingClientRect().width,
    floor: Number.parseFloat(getComputedStyle(element).minWidth),
  }));
  expect(width.actual).toBeGreaterThanOrEqual(width.floor);
  await expectSingleVisibleActionRow(form);
});
