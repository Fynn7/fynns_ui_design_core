/**
 * Verify nested Card unit-stack Collapsible gap in NavigationDrawer (≥ 0.5.125).
 * Usage: node scripts/_audit-shots/_verify-navdrawer-card-collapsible-gap.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Layout templates|布局模板/ }).click();
await page.waitForTimeout(1200);

const demo = page.locator("#layouts-demo-navigation-drawer").first();
await demo.waitFor({ state: "visible", timeout: 20000 });
await demo.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

const metrics = await demo.evaluate(() => {
  const host = document.getElementById("sandbox-navdrawer-card-collapsible-stack");
  if (!host) return { err: "missing #sandbox-navdrawer-card-collapsible-stack" };
  const stack = host.querySelector(".fynns-unit-stack");
  if (!stack) return { err: "missing .fynns-unit-stack" };
  const unitGap = getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-layout-unit-stack-gap")
    .trim();
  const sectionGap = getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-navdrawer-section-gap")
    .trim();
  const stackGap = getComputedStyle(stack).gap;
  const heads = [
    ...stack.querySelectorAll(":scope > .fynns-collapsible > .fynns-collapsible-head"),
  ];
  const rects = heads.map((el) => el.getBoundingClientRect());
  const headGap =
    rects.length >= 2 ? Math.round(rects[1].top - rects[0].bottom) : null;
  return { unitGap, sectionGap, stackGap, headGap, headCount: heads.length };
});

await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "navdrawer-card-collapsible-gap.png");
await page.locator("#sandbox-navdrawer-card-collapsible-stack").screenshot({
  path: outPath,
});

await browser.close();

const pass =
  !metrics.err &&
  metrics.headCount === 2 &&
  metrics.headGap != null &&
  metrics.headGap >= 14 &&
  metrics.stackGap !== metrics.sectionGap;

console.log(
  JSON.stringify(
    {
      pass,
      metrics,
      screenshot: outPath,
    },
    null,
    2,
  ),
);

process.exit(pass ? 0 : 1);
