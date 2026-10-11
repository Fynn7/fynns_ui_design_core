import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1600, height: 1100 });
  await openLayoutsDemo(page, "canvas-workspace");
});

for (const theme of ["dark", "light"]) {
  test(`floating tools and one recovery surface leave canvas geometry unchanged (${theme})`, async ({ page }) => {
    await page.evaluate(theme => document.documentElement.setAttribute("data-fynns-theme", theme), theme);
    const demo = page.locator("#sandbox-canvas-workspace");
    const stage = demo.locator(".sandbox-canvas-stage");
    const before = await stage.boundingBox();
    const tools = stage.getByRole("toolbar", { name: "Canvas tools" });
    await expect(tools).toHaveClass(/fynns-toolbar--floating/);
    const inset = await tools.evaluate(el => {
      const box = el.getBoundingClientRect();
      const stage = el.closest(".sandbox-canvas-stage")!.getBoundingClientRect();
      return { left: box.left - stage.left, top: box.top - stage.top, right: stage.right - box.right };
    });
    expect(inset.left).toBeCloseTo(16, 1);
    expect(inset.top).toBeCloseTo(16, 1);
    expect(inset.right).toBeGreaterThanOrEqual(16);
    await tools.getByRole("button", { name: "Hide canvas tools" }).click();
    await expect(tools).toHaveCount(0);
    expect(await stage.boundingBox()).toEqual(before);
    const restore = demo.locator(".fynns-top-app-bar").getByRole("button", { name: "Canvas tools", exact: true });
    await expect(restore).toHaveAttribute("aria-pressed", "false");
    await restore.click();
    await expect(tools).toBeVisible();
    await demo.getByRole("button", { name: "Show persistent save conflict" }).click();
    const recovery = demo.locator(".fynns-workspace-notice");
    await expect(demo.locator(".fynns-workspace-notice-entry")).toHaveAttribute("data-state", "open");
    await expect.poll(() => demo.locator(".fynns-workspace-notice-entry").evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
    const noticeInset = await recovery.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const stage = el.closest(".fynns-workspace-canvas")!.getBoundingClientRect();
      return { top: rect.top - stage.top, right: stage.right - rect.right };
    });
    expect(noticeInset.top).toBeCloseTo(16, 1);
    expect(noticeInset.right).toBeCloseTo(16, 1);
    await expect(recovery.getByRole("button", { name: "Retry save" })).toBeVisible();
    await expect(recovery.getByRole("button", { name: "Save a copy" })).toBeVisible();
    await expect(recovery.getByRole("toolbar")).toHaveCount(0);
    await expect(stage.getByRole("toolbar")).toHaveCount(1);
    expect(await stage.boundingBox()).toEqual(before);
    const dismiss = recovery.getByRole("button", { name: "Dismiss save conflict" });
    await expect(dismiss).toHaveClass(/fynns-btn--ghost/);
    await expect(dismiss).toHaveText("");
    await dismiss.click();
    await expect(recovery).toHaveCount(0);
    await expect(stage).toHaveAttribute("data-paused", "true");
    // Document export now lives in the top-bar menu; recovery expectations stay unchanged.
    await demo.locator(".fynns-top-app-bar").getByRole("button", { name: "Canvas menu" }).click();
    await page.getByRole("menuitem", { name: "Export canvas" }).click();
    await page.getByRole("menuitem", { name: "Save a copy" }).click();
    await expect(stage).not.toHaveAttribute("data-paused");
    await demo.getByRole("button", { name: "Show persistent save conflict" }).click();
    await recovery.getByRole("button", { name: "Retry save" }).click();
    await expect(recovery).toHaveCount(0);
    await expect(stage).not.toHaveAttribute("data-paused");
    expect(await stage.boundingBox()).toEqual(before);
    const clearance = await demo.getByRole("toolbar", { name: "Page tools" }).evaluate(el => {
      const box = el.getBoundingClientRect();
      const parent = el.parentElement!.getBoundingClientRect();
      return [box.left - parent.left, box.top - parent.top, parent.right - box.right, parent.bottom - box.bottom];
    });
    for (const value of clearance) expect(value).toBeGreaterThanOrEqual(16);
  });
}

test("ordinary save failure defaults to snackbar with Retry, without a canvas notice", async ({ page }) => {
  const demo = page.locator("#sandbox-canvas-workspace");
  await demo.getByRole("button", { name: "Simulate save failure" }).click();
  const toast = page.locator(".fynns-snackbar--error");
  await expect(toast).toBeVisible();
  await expect(demo.locator(".fynns-workspace-notice")).toHaveCount(0);
  await toast.getByRole("button", { name: "Retry save" }).click();
  await expect(toast).toHaveCount(0);
});

test("narrow canvas keeps overlays within its 16dp inset", async ({ page }) => {
  await page.locator("#sandbox-canvas-workspace .fynns-top-app-bar").getByRole("button", { name: "Inspector", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 1000 });
  const outerNav = page.getByRole("banner").first().getByRole("button", { name: "Hide navigation", exact: true });
  if (await outerNav.count()) await outerNav.click();
  const demo = page.locator("#sandbox-canvas-workspace");
  await demo.scrollIntoViewIfNeeded();
  await demo.getByRole("button", { name: "Show persistent save conflict" }).click();
  await expect.poll(() => demo.locator(".sandbox-canvas-stage").evaluate(el => el.clientWidth)).toBeGreaterThan(280);
  const metrics = await demo.locator(".fynns-workspace-notice-stack").evaluate(el => {
    const stage = el.parentElement!.getBoundingClientRect();
    return [...el.querySelectorAll(".fynns-workspace-notice")].map(child => {
      const box = child.getBoundingClientRect();
      return { left: box.left - stage.left, right: stage.right - box.right,
        overflow: child.scrollWidth > child.clientWidth + 1 };
    });
  });
  for (const metric of metrics) {
    expect(metric.left).toBeGreaterThanOrEqual(15.9);
    expect(metric.right).toBeCloseTo(16, 1);
    expect(metric.overflow).toBe(false);
  }
  await demo.getByRole("button", { name: "Show three persistent notices" }).click();
  await expect.poll(() => demo.locator(".fynns-workspace-notice-entry").evaluateAll(els => els.every(el => getComputedStyle(el).opacity === "1"))).toBe(true);
  const reserved = await demo.locator(".fynns-workspace-notice-stack").evaluate(el => {
    const tools = el.parentElement!.querySelector(".fynns-workspace-tools")!.getBoundingClientRect();
    const stack = el.getBoundingClientRect();
    const canvas = el.parentElement!.getBoundingClientRect();
    return { gap: tools.top - stack.bottom, top: stack.top - canvas.top,
      scrollClass: el.classList.contains("fynns-scroll"), scrollable: el.scrollHeight > el.clientHeight };
  });
  expect(reserved.gap).toBeGreaterThanOrEqual(15.9);
  expect(reserved.top).toBeCloseTo(16, 1);
  expect(reserved.scrollClass).toBe(true);
  expect(reserved.scrollable).toBe(true);
});

test("three independently actionable notices stack, dedupe, animate exit and preserve keyboard focus", async ({ page }) => {
  const demo = page.locator("#sandbox-canvas-workspace");
  const stage = demo.locator(".fynns-workspace-canvas");
  const before = await stage.boundingBox();
  await demo.getByRole("button", { name: "Show three persistent notices" }).click();
  const entries = demo.locator(".fynns-workspace-notice-entry");
  await expect(entries).toHaveCount(3);
  await expect.poll(() => entries.evaluateAll(els => els.every(el => el.getAttribute("data-state") === "open"))).toBe(true);
  await expect.poll(() => entries.evaluateAll(els => els.every(el => getComputedStyle(el).transform === "matrix(1, 0, 0, 1, 0, 0)"))).toBe(true);
  const metrics = await demo.locator(".fynns-workspace-notice").evaluateAll(els => els.map(el => {
    const box = el.getBoundingClientRect();
    const stage = el.closest(".fynns-workspace-canvas")!.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, right: stage.right - box.right };
  }));
  for (let index = 0; index < metrics.length; index++) {
    expect(metrics[index].right).toBeCloseTo(16, 1);
    if (index) expect(metrics[index].top - metrics[index - 1].bottom).toBeCloseTo(16, 1);
  }
  await demo.getByRole("button", { name: "Show persistent save conflict" }).click();
  await expect(entries).toHaveCount(3);
  const closing = entries.filter({ has: page.getByRole("button", { name: "Dismiss attachment notice" }) });
  const lower = demo.getByRole("button", { name: "Dismiss offline notice" });
  const lowerBefore = (await lower.boundingBox())!.y;
  await closing.getByRole("button", { name: "Dismiss attachment notice" }).click();
  // Removed from interaction immediately, retained in DOM for its exit transition.
  await expect(demo.locator('[data-notice-id="attachment"]')).toHaveAttribute("data-state", "exiting");
  await expect(demo.locator('[data-notice-id="attachment"]')).toHaveAttribute("inert", "");
  await expect(lower).toBeFocused();
  await expect(entries).toHaveCount(2);
  expect((await lower.boundingBox())!.y).toBeLessThan(lowerBefore);
  expect(await stage.boundingBox()).toEqual(before);
  await demo.getByRole("button", { name: "Retry save" }).click();
  await expect(entries).toHaveCount(1);
  await expect(stage).not.toHaveAttribute("data-paused");
  await demo.getByRole("button", { name: "Sync changes" }).click();
  await expect(entries).toHaveCount(0);
});

test("entry fades in, exit collapses gradually, and reduced motion skips travel", async ({ page }) => {
  const demo = page.locator("#sandbox-canvas-workspace");
  await demo.getByRole("button", { name: "Show three persistent notices" }).click();
  const middle = demo.locator('[data-notice-id="attachment"]');
  await expect(middle).toHaveAttribute("data-state", "open");
  await expect.poll(() => middle.evaluate(el => getComputedStyle(el).opacity)).toBe("1");
  const durations = await middle.evaluate(el => getComputedStyle(el).transitionDuration);
  expect(durations).toContain("0.24s");
  const samples = await demo.evaluate(async root => {
    const middle = root.querySelector<HTMLElement>('[data-notice-id="attachment"]')!;
    const lower = root.querySelector<HTMLElement>('[data-notice-id="offline"]')!;
    const start = lower.getBoundingClientRect().top;
    middle.querySelector<HTMLButtonElement>(".fynns-workspace-notice-message button")!.click();
    const frames: { opacity: number; y: number }[] = [];
    while (middle.isConnected) {
      await new Promise(requestAnimationFrame);
      if (middle.isConnected) frames.push({ opacity: parseFloat(getComputedStyle(middle).opacity), y: lower.getBoundingClientRect().top });
    }
    return { start, end: lower.getBoundingClientRect().top, frames };
  });
  expect(samples.frames.some(frame => frame.opacity > 0 && frame.opacity < 1)).toBe(true);
  expect(samples.frames.some(frame => frame.y < samples.start && frame.y > samples.end)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await demo.getByRole("button", { name: "Show three persistent notices" }).click();
  await expect(middle).toHaveAttribute("data-state", "open");
  const reduced = await middle.evaluate(el => ({ duration: getComputedStyle(el).transitionDuration, transform: getComputedStyle(el).transform }));
  expect(reduced.duration).not.toContain("0.24s");
  expect(reduced.transform).toBe("none");
  await middle.getByRole("button", { name: "Dismiss attachment notice" }).click();
  await expect(middle).toHaveCount(0);
});
