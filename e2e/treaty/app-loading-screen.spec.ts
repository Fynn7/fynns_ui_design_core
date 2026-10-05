import { test, expect } from "@playwright/test";
import { openGlobalsDemo, globalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => { await resetSandboxSession(page); });
const diamond = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 8 56 32 32 56 8 32Z" fill="none" stroke="currentColor" stroke-width="6"/></svg>',
);

test("startup uses the configured icon on an opaque centered screen across themes and viewports", async ({ page }) => {
  await openGlobalsDemo(page, "busy-scrim", "AppLoadingScreen");
  await page.evaluate(src => {
    const icon = document.createElement("link");
    icon.rel = "icon"; icon.href = src; document.head.append(icon);
  }, diamond);
  await page.clock.install({ time: new Date("2026-10-05T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-05T00:00:01Z"));
  const button = globalsDemo(page, "busy-scrim").locator("#sandbox-app-loading-open");
  const previousOverflow = await page.evaluate(() => document.body.style.overflow);
  await button.click();
  const screen = page.locator(".fynns-app-loading-screen");
  await expect(screen).toHaveAttribute("data-loading-logo-source", "configured");
  await expect(screen).toBeFocused();
  await expect(screen).toHaveAccessibleName("Starting application");
  const layers = await screen.evaluate(el => {
    const tokens = getComputedStyle(document.documentElement);
    return { startup: Number(getComputedStyle(el).zIndex),
      rails: Number(tokens.getPropertyValue("--fynns-z-scroll-overlay")),
      tooltip: Number(tokens.getPropertyValue("--fynns-z-tooltip")) };
  });
  expect(layers.startup).toBeGreaterThan(layers.rails);
  expect(layers.startup).toBeGreaterThan(layers.tooltip);
  await expect(screen.locator(".fynns-loading-skeleton, .fynns-busy-message, .fynns-circular-progress")).toHaveCount(0);
  const logo = screen.locator(".fynns-app-loading-logo");
  await expect.poll(() => logo.evaluate(el => getComputedStyle(el).animationName)).toBe("fynns-chat-thinking-shimmer");
  await expect.poll(() => logo.evaluate(el => getComputedStyle(el).maskImage)).toContain("data:image/svg+xml");
  for (const width of [1280, 414]) {
    await page.setViewportSize({ width, height: 896 });
    const geometry = await logo.evaluate(el => {
      const box = el.getBoundingClientRect();
      const pane = el.parentElement!.getBoundingClientRect();
      return { centerX: box.x + box.width / 2, centerY: box.y + box.height / 2,
        paneX: pane.x, paneY: pane.y, width: pane.width, height: pane.height,
        alpha: getComputedStyle(el.parentElement!).backgroundColor,
        viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
    });
    expect(geometry.paneX).toBe(0); expect(geometry.paneY).toBe(0);
    expect(geometry.width).toBe(geometry.viewportWidth); expect(geometry.height).toBe(geometry.viewportHeight);
    expect(Math.abs(geometry.centerX - geometry.width / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.centerY - geometry.height / 2)).toBeLessThanOrEqual(1);
    expect(geometry.alpha).toMatch(/^rgb\(/);
  }
  const dark = await screen.evaluate(el => getComputedStyle(el).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute("data-fynns-theme", "light"));
  await expect.poll(() => screen.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(dark);
  await page.keyboard.press("Tab"); await expect(screen).toBeFocused();
  await page.keyboard.press("Escape"); await expect(screen).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => logo.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(logo).toBeVisible();
  await page.clock.runFor(2100);
  await expect(screen).toHaveCount(0);
  await expect(button).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
});

test("failed icons fall back to initials, live configuration wins, and absent identity uses the core mark", async ({ page }) => {
  await openGlobalsDemo(page, "busy-scrim", "AppLoadingScreen");
  await page.route("**/missing-startup.svg", route => route.fulfill({ status: 404, body: "" }));
  await page.evaluate(() => {
    document.title = "Sample Person";
    const icon = document.createElement("link");
    icon.rel = "icon"; icon.href = "/missing-startup.svg"; icon.id = "test-startup-icon";
    document.head.append(icon);
  });
  await page.clock.install({ time: new Date("2026-10-05T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-05T00:00:01Z"));
  await globalsDemo(page, "busy-scrim").locator("#sandbox-app-loading-open").click();
  const screen = page.locator(".fynns-app-loading-screen");
  await expect(screen).toHaveAttribute("data-loading-logo-source", "initials");
  const initials = screen.locator(".fynns-avatar-initials");
  await expect(initials).toHaveText("SP");
  await expect.poll(() => initials.evaluate(el => getComputedStyle(el).animationName)).toBe("fynns-chat-thinking-shimmer");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => initials.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(initials).toBeVisible();
  await page.evaluate(src => { (document.getElementById("test-startup-icon") as HTMLLinkElement).href = src; }, diamond);
  await expect(screen).toHaveAttribute("data-loading-logo-source", "configured");
  await expect(screen.locator(".fynns-avatar")).toHaveCount(0);
  await page.evaluate(() => { document.getElementById("test-startup-icon")!.remove(); document.title = ""; });
  await expect(screen).toHaveAttribute("data-loading-logo-source", "core");
  await expect(screen.locator(".fynns-app-loading-logo")).toBeVisible();
  await page.clock.runFor(2100);
  await expect(screen).toHaveCount(0);
});
