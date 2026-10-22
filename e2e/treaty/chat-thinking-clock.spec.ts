import { expect, test, type Page } from "@playwright/test";
import { resetSandboxSession } from "../helpers/sandbox";

async function openClock(page: Page) {
  await resetSandboxSession(page);
  await page.clock.install();
  await page.goto("/?demo=thinking-clock");
  await expect(page.locator("[data-thinking-clock-preview]")).toBeVisible();
}

test("waiting clocks retain their label and entry animation across seconds and boundaries", async ({ page }) => {
  await openClock(page);
  const inline = page.locator('[data-clock-row="inline"]');
  const label = inline.locator(".fynns-chat-thinking-label").first();
  await label.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  const retained = await label.evaluateHandle(el => ({
    label: el, animations: el.getAnimations(), title: el.querySelector(".fynns-chat-thinking-title"),
    trigger: el.closest("button")!,
  }));
  await inline.locator(".fynns-chat-thinking-trigger").first().click();
  for (const boundary of ["Minute boundary", "Hour boundary"]) {
    await page.getByRole("button", { name: boundary, exact: true }).click();
    await page.clock.runFor(1000);
    await expect(inline.locator(".fynns-chat-thinking-title").first()).toContainText(boundary === "Minute boundary" ? "1m 0s" : "1h 0m 0s");
    const state = await retained.evaluate(({ label, animations, title, trigger }) => ({
      sameLabel: label.isConnected && trigger.querySelector(".fynns-chat-thinking-label") === label,
      sameTitle: label.querySelector(".fynns-chat-thinking-title") === title,
      sameAnimations: animations.length === label.getAnimations().length && animations.every((animation, i) => animation === label.getAnimations()[i]),
      opacity: getComputedStyle(label).opacity,
      open: trigger.getAttribute("aria-expanded"),
    }));
    expect(state).toEqual({ sameLabel: true, sameTitle: true, sameAnimations: true, opacity: "1", open: "false" });
  }
  await inline.locator(".fynns-chat-thinking-trigger").first().focus();
  await page.clock.runFor(2000);
  await expect(inline.locator(".fynns-chat-thinking-trigger").first()).toBeFocused();
  await expect(inline.locator(".fynns-chat-thinking-trigger").first()).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("[data-thinking-clock-preview] [aria-live]")).toHaveCount(0);
});

test("processing clocks keep the same running shimmer and nested nodes; completion stops sampling", async ({ page }) => {
  await openClock(page);
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  const label = page.locator('[data-clock-row="inline"] .fynns-chat-thinking-label').first();
  await label.evaluate(el => Promise.all(el.getAnimations().filter(animation => (animation as CSSAnimation).animationName.includes("swap")).map(animation => animation.finished)));
  const retained = await page.locator("[data-thinking-clock-preview]").evaluateHandle(el => ({
    host: el,
    labels: Array.from(el.querySelectorAll(".fynns-chat-thinking-label")),
    animations: Array.from(el.querySelectorAll(".fynns-chat-thinking-label")).map(label => label.getAnimations().find(animation => (animation as CSSAnimation).animationName === "fynns-chat-thinking-shimmer")!),
    paragraph: el.querySelector(".fynns-chat-thinking-text"),
  }));
  await page.clock.runFor(2000);
  const state = await retained.evaluate(({ host, labels, animations, paragraph }) => ({
    sameLabels: labels.every((label, i) => label === host.querySelectorAll(".fynns-chat-thinking-label")[i]),
    sameShimmers: animations.every((animation, i) => animation && labels[i].getAnimations().includes(animation) && animation.playState === "running"),
    sameBody: paragraph === host.querySelector(".fynns-chat-thinking-text"),
    text: paragraph?.textContent,
    tabular: getComputedStyle(labels[0]).fontVariantNumeric,
  }));
  expect(state).toEqual({ sameLabels: true, sameShimmers: true, sameBody: true, text: "Elapsed time 1m 0s.", tabular: "tabular-nums" });
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  const completed = await label.textContent();
  await page.clock.runFor(3000);
  await expect(label).toHaveText(completed!);
  await expect(page.locator('[data-clock-row="inline"]')).not.toHaveAttribute("data-streaming", "true");
  await expect(page.locator('[data-clock-row="inline"] .fynns-chat-thinking-trigger').first()).toHaveAttribute("aria-expanded", "false");
});

test("narrow reduced-motion clocks remain legible without label animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 800 });
  await openClock(page);
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  await page.clock.runFor(2000);
  const labels = page.locator("[data-thinking-clock-preview] .fynns-chat-thinking-label");
  for (const label of await labels.all()) {
    const style = await label.evaluate(el => ({
      animations: el.getAnimations().length,
      opacity: getComputedStyle(el).opacity,
      textFill: getComputedStyle(el).getPropertyValue("-webkit-text-fill-color"),
    }));
    expect(style.animations).toBe(0);
    expect(style.opacity).toBe("1");
    expect(style.textFill).not.toBe("transparent");
  }
  await expect(page.locator('[data-clock-row="summary"]')).toContainText("1m 0s");
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.width);
});
