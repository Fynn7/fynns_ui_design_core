import { test, expect } from "@playwright/test";
import { openLayoutsDemo, layoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test("StatusBar: full-width workspace footer centers text with vertical breathing room", async ({ page }) => {
  await openLayoutsDemo(page, "status-bar");
  const demo = layoutsDemo(page, "status-bar");
  const bar = demo.locator(".fynns-status-bar");
  const metrics = await bar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const body = el.previousElementSibling!.getBoundingClientRect();
    const labels = [...el.querySelectorAll(".fynns-status-bar-item-label")].map(label => {
      const r = label.getBoundingClientRect();
      return { top: r.top - rect.top, bottom: rect.bottom - r.bottom, center: Math.abs((r.top + r.bottom) / 2 - (rect.top + rect.bottom) / 2) };
    });
    return { height: rect.height, fontSize: getComputedStyle(el).fontSize, widthDelta: Math.abs(rect.width - body.width), topDelta: Math.abs(rect.top - body.bottom), labels };
  });
  expect(metrics.height).toBeCloseTo(22, 0);
  expect(metrics.fontSize).toBe("12px");
  expect(metrics.widthDelta).toBeLessThan(1);
  expect(metrics.topDelta).toBeLessThan(1);
  for (const label of metrics.labels) {
    expect(label.top).toBeGreaterThan(1);
    expect(label.bottom).toBeGreaterThan(1);
    expect(label.center).toBeLessThan(1);
  }
  await expect(bar.locator(".fynns-status-bar-leading button")).toHaveText("3 problems");
  const action = bar.getByRole("button", { name: "3 problems", exact: true });
  await action.focus();
  await expect(action).toBeFocused();
  const height = await action.evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeCloseTo(21, 0);
  await action.press("Enter");
  await expect(page.getByText("Opened problems panel (sample)", { exact: true })).toBeVisible();
});

test("StatusBar: narrow workspace truncates labels without squeezing the footer height", async ({ page }) => {
  await openLayoutsDemo(page, "status-bar");
  const demo = layoutsDemo(page, "status-bar");
  await demo.locator(".sandbox-status-workbench").evaluate(el => {
    (el as HTMLElement).style.width = "240px";
  });
  const metrics = await demo.locator(".fynns-status-bar").evaluate(el => ({
    height: el.getBoundingClientRect().height,
    clientWidth: el.clientWidth,
    scrollWidth: el.scrollWidth,
    truncated: [...el.querySelectorAll(".fynns-status-bar-item-label")].some(label => label.scrollWidth > label.clientWidth),
    labels: [...el.querySelectorAll(".fynns-status-bar-item-label")].map(label => getComputedStyle(label).textOverflow),
  }));
  expect(metrics.height).toBeCloseTo(22, 0);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.truncated).toBe(true);
  expect(metrics.labels.every(value => value === "ellipsis")).toBe(true);
});
