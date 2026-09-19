import { expect, test } from "@playwright/test";
import {
  globalsDemo,
  openGlobalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

test("Dialog body fades both visible overflow edges and clears after content shrinks", async ({
  page,
}) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "list", "List");
  await globalsDemo(page, "list")
    .locator("#sandbox-list-recipe-catalog .fynns-list-item")
    .first()
    .click();

  const body = page.getByRole("dialog").locator(".fynns-dialog-body.fynns-scroll");
  await expect(body).toBeVisible();
  await body.evaluate((el) => {
    const host = el as HTMLElement;
    host.style.height = "160px";
    host.style.flex = "0 0 160px";
    host.style.whiteSpace = "pre-wrap";
    host.replaceChildren(document.createTextNode("Overflow line\n".repeat(80)));
  });

  await expect(body).toHaveAttribute("data-fade-bottom", "");
  expect(await body.evaluate((el) => getComputedStyle(el).maskImage)).toContain(
    "linear-gradient",
  );

  await body.evaluate((el) => {
    const host = el as HTMLElement;
    host.style.border = "var(--fynns-border-hairline) solid var(--fynns-color-border)";
    host.style.height = "158px";
    host.style.flex = "0 0 158px";
  });
  await expect(body).toHaveAttribute("data-fynns-scroll-border", "");
  expect(
    await body.evaluate((el) => getComputedStyle(el).maskImage.match(/linear-gradient\(/g)),
  ).toHaveLength(5);

  await body.evaluate((el) => {
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  });
  await expect(body).toHaveAttribute("data-fade-top", "");
  await expect(body).toHaveAttribute("data-fade-bottom", "");

  await body.evaluate((el) => {
    const text = el.firstChild;
    if (text instanceof Text) text.data = "Short body";
  });
  await expect(body).not.toHaveAttribute("data-fade-top");
  await expect(body).not.toHaveAttribute("data-fade-bottom");
  expect(await body.evaluate((el) => getComputedStyle(el).maskImage)).toBe("none");
});

test("Table wrap keeps its horizontal fade when vertically capped", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "table", "table");
  const wrap = globalsDemo(page, "table").locator(
    ".fynns-table-wrap.sandbox-table-h-scroll",
  );
  await expect(wrap).toBeVisible();
  await wrap.evaluate((el) => {
    (el as HTMLElement).style.height = "48px";
  });

  await expect(wrap).toHaveAttribute("data-fade-bottom", "");
  await expect(wrap).toHaveAttribute("data-fade-right", "");
  const mask = await wrap.evaluate((el) => {
    const style = getComputedStyle(el);
    return { image: style.maskImage, composite: style.maskComposite };
  });
  expect(mask.image.match(/linear-gradient\(/g)).toHaveLength(2);
  expect(mask.composite).toContain("intersect");
});

test("ChatComposer fades capped text without masking the caret", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat", "Chat");
  const input = globalsDemo(page, "chat")
    .locator(".fynns-chat-composer-input")
    .first();
  await expect(input).toBeVisible();
  await input.fill("Long draft line\n".repeat(50));
  const field = input.locator("xpath=..");
  await expect(input).toHaveAttribute("data-scrollable", "");
  await input.evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(field).toHaveAttribute("data-fade-bottom", "");
  expect(await input.evaluate((el) => getComputedStyle(el).maskImage)).toBe("none");

  await input.evaluate((el) => {
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  });
  await expect(field).toHaveAttribute("data-fade-top", "");
  await expect(field).toHaveAttribute("data-fade-bottom", "");

  await input.fill("");
  await expect(field).not.toHaveAttribute("data-fade-top");
  await expect(field).not.toHaveAttribute("data-fade-bottom");
});
