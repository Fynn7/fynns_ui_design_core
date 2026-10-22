import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("Chat scroll button clears a Table horizontal rail beneath it", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat", "Chat");
  const chat = globalsDemo(page, "chat").locator(".sandbox-chat-frame").first();
  await chat.evaluate((el) => {
    (el as HTMLElement).style.height = "320px";
    (el as HTMLElement).style.flex = "0 0 320px";
  });
  const thread = chat.locator(".fynns-chat-thread");
  await expect.poll(async () => thread.evaluate((el) => el.scrollHeight - el.clientHeight))
    .toBeGreaterThan(100);
  await thread.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  const button = chat.locator("[data-fynns-scroll-occluder]");
  await expect(button).toBeVisible();

  // Put a wide Table scroll host at the button's height, as in a long answer.
  await chat.evaluate((el) => {
    const button = el.querySelector<HTMLElement>("[data-fynns-scroll-occluder]")!;
    const buttonBox = button.getBoundingClientRect();
    const chatBox = el.getBoundingClientRect();
    const wrap = document.createElement("div");
    wrap.className = "fynns-table-wrap fynns-scroll";
    wrap.style.position = "absolute";
    wrap.style.left = "0";
    wrap.style.top = `${buttonBox.top - chatBox.top + buttonBox.height / 2 - 8}px`;
    wrap.style.width = "100%";
    wrap.style.height = "16px";
    wrap.style.overflowX = "auto";
    const table = document.createElement("table");
    table.className = "fynns-table";
    table.style.width = "200%";
    table.innerHTML = "<tbody><tr><td>Wide answer table</td></tr></tbody>";
    wrap.append(table);
    el.append(wrap);
  });
  const wrap = chat.locator(".fynns-table-wrap").last();
  await expect(wrap).toHaveAttribute("data-fynns-scroll-host", /.+/);
  const id = await wrap.getAttribute("data-fynns-scroll-host");
  const rail = page.locator(`.fynns-scroll-rail[data-axis="x"][data-fynns-scroll-host="${id}"]`);
  await expect(rail).toBeVisible();
  await wrap.hover({ position: { x: 8, y: 8 } });
  await expect(rail).toHaveAttribute("data-visible", "true");

  const buttonBox = await button.boundingBox();
  const railBox = await rail.boundingBox();
  expect(buttonBox).toBeTruthy();
  expect(railBox).toBeTruthy();
  const overlap = {
    x: buttonBox!.x + buttonBox!.width / 2,
    y: railBox!.y + railBox!.height / 2,
  };
  expect(overlap.y).toBeGreaterThan(buttonBox!.y);
  expect(overlap.y).toBeLessThan(buttonBox!.y + buttonBox!.height);
  const topElement = await page.evaluate(({ x, y }) =>
    document.elementFromPoint(x, y)?.closest("[data-fynns-scroll-occluder]") !== null,
    overlap,
  );
  expect(topElement).toBe(true);
  const exposedRail = await page.evaluate(({ x, y }) =>
    document.elementFromPoint(x, y)?.closest(".fynns-scroll-rail") !== null,
    { x: railBox!.x + 8, y: overlap.y },
  );
  expect(exposedRail).toBe(true);
  await button.click({ position: { x: 16, y: 16 } });
});
