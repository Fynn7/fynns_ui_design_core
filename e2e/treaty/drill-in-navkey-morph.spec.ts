/**
 * CONSUMER_TREATY slug: `drill-in / mode sidebar hard-swap (no navKey morph)`
 * AGENTS: ClippedNavShell `navKey` → in-column Shared Axis X (width stays open).
 * Sandbox: #layouts-demo-drill-in
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "drill-in / mode sidebar hard-swap (no navKey morph)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: navKey change keeps track width and runs Shared Axis X`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "drill-in");
  const demo = layoutsDemo(page, "drill-in");
  const shell = demo.locator(".fynns-clipped-nav-shell");
  const navCol = shell.locator(":scope > .fynns-clipped-nav-shell-body > .fynns-clipped-nav-shell-nav");
  const catalogDest = demo.getByRole("button", { name: "Catalog" });

  await expect(shell).toHaveAttribute("data-nav", "drawer");
  const openWidth = await navCol.evaluate((el) => el.getBoundingClientRect().width);
  expect(openWidth, `${SLUG}: open track width`).toBeGreaterThan(120);

  const samplesPromise = navCol.evaluate(async (el) => {
    const widths: number[] = [];
    const axes: string[] = [];
    const end = performance.now() + 500;
    const shellEl = el.closest(".fynns-clipped-nav-shell");
    while (performance.now() < end) {
      widths.push(Math.round(el.getBoundingClientRect().width));
      axes.push(shellEl?.getAttribute("data-nav-axis") ?? "-");
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    return { widths, axes };
  });

  await catalogDest.click();

  await expect(shell).toHaveAttribute("data-nav", "drawer");
  await expect(shell).toHaveAttribute("data-nav-axis", "forward");

  await expect
    .poll(async () => shell.getAttribute("data-nav-axis"))
    .toBeNull();
  await expect(shell).toHaveAttribute("data-nav", "drawer");
  await expect(
    demo.getByRole("navigation", { name: "Catalog items" }),
  ).toBeVisible();

  const { widths, axes } = await samplesPromise;
  const minW = Math.min(...widths);
  const maxW = Math.max(...widths);
  expect(
    minW,
    `${SLUG}: track must NOT collapse during drill-in (min=${minW})`,
  ).toBeGreaterThan(openWidth * 0.85);
  expect(
    maxW - minW,
    `${SLUG}: track width should stay stable (delta=${maxW - minW})`,
  ).toBeLessThan(24);
  expect(
    axes.some((a) => a === "forward"),
    `${SLUG}: expected data-nav-axis=forward during swap`,
  ).toBe(true);

  const back = demo.getByRole("button", { name: "Back to destinations" });
  await back.click();
  await expect(shell).toHaveAttribute("data-nav-axis", "back");
  await expect
    .poll(async () => shell.getAttribute("data-nav-axis"))
    .toBeNull();
  await expect(
    demo.getByRole("navigation", { name: "Sample destinations" }),
  ).toBeVisible();

  /* No lasting Shared Axis ghost: one drawer, no out layer, no catalog label. */
  await expect(navCol.locator(".fynns-clipped-nav-shell-nav-axis")).toHaveCount(0);
  await expect(navCol.locator(".fynns-nav-drawer")).toHaveCount(1);
  await expect(demo.getByRole("navigation", { name: "Catalog items" })).toHaveCount(0);
  const ghost = await navCol.evaluate((el) => {
    const text = el.textContent ?? "";
    const yRails = [...document.querySelectorAll(".fynns-scroll-rail[data-axis='y']:not([hidden])")];
    const navRect = el.getBoundingClientRect();
    const drawerRails = yRails.filter((r) => {
      const rr = r.getBoundingClientRect();
      return Math.abs(rr.right - navRect.right) < 8 || Math.abs(rr.left - navRect.right) < 8;
    });
    return {
      hasCatalog: /Catalog items|alpha|beta|gamma/i.test(text) && /Sample destinations/i.test(text),
      drawerRailCount: drawerRails.length,
    };
  });
  expect(ghost.hasCatalog, `${SLUG}: root+catalog text must not both remain`).toBe(false);
  expect(
    ghost.drawerRailCount,
    `${SLUG}: at most one Y overlay rail on the drawer edge (got ${ghost.drawerRailCount})`,
  ).toBeLessThanOrEqual(1);
});
