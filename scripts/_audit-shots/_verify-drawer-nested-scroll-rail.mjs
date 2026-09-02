/**
 * Verify overlay Y rail stays below Drawer head when outer body scrolls (≥ 0.5.134).
 * Usage: node scripts/_audit-shots/_verify-drawer-nested-scroll-rail.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 520 } });
await page.goto(`${base}/#drawer-nested-scroll`, {
  waitUntil: "networkidle",
  timeout: 60000,
});

const containment = page
  .locator(".fynns-collapsible")
  .filter({ hasText: /Containment|容器/i })
  .first();
if ((await containment.count()) > 0) {
  const trigger = containment.locator("button").first();
  if ((await trigger.getAttribute("aria-expanded")) !== "true") {
    await trigger.click();
    await page.waitForTimeout(400);
  }
}

await page.evaluate(() => {
  document
    .getElementById("globals-demo-drawer-nested-scroll")
    ?.scrollIntoView({ block: "center", behavior: "instant" });
});
await page.waitForSelector("#globals-demo-drawer-nested-scroll", {
  timeout: 30000,
});

await page
  .getByRole("button", { name: /Open drawer nested scroll|打开抽屉嵌套滚动/i })
  .click();
await page.waitForSelector(
  '.fynns-dialog-panel--drawer[data-state="open"]',
  { timeout: 15000 },
);

const panel = page.locator('.fynns-dialog-panel--drawer[data-state="open"]');
const body = panel.locator(".fynns-dialog-body.fynns-scroll");
const codeHost = panel.locator(".fynns-code-block-pre.fynns-scroll");

await body.evaluate((el) => {
  el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
});
await page.waitForTimeout(300);

await codeHost.hover();
await page.waitForTimeout(300);

const metrics = await page.evaluate(() => {
  const panelEl = document.querySelector(
    '.fynns-dialog-panel--drawer[data-state="open"]',
  );
  const head = panelEl?.querySelector(":scope > .fynns-dialog-head");
  const host = panelEl?.querySelector(".fynns-code-block-pre.fynns-scroll");
  const thumb = document.querySelector(
    '.fynns-scroll-rail[data-axis="y"]:not([hidden]) .fynns-scroll-thumb',
  );
  const headRect = head?.getBoundingClientRect();
  const thumbRect = thumb?.getBoundingClientRect();
  const rail = thumb?.parentElement;
  const railRect = rail?.getBoundingClientRect();
  const headBottom = headRect ? Math.round(headRect.bottom) : null;
  const thumbTop = thumbRect ? Math.round(thumbRect.top) : null;
  const railTop = railRect ? Math.round(railRect.top) : null;
  return {
    headBottom,
    thumbTop,
    railTop,
    thumbBelowHead:
      headBottom != null && thumbTop != null ? thumbTop >= headBottom - 1 : false,
    railBelowHead:
      headBottom != null && railTop != null ? railTop >= headBottom - 1 : false,
    bodyScrollTop: panelEl?.querySelector(".fynns-dialog-body")?.scrollTop ?? null,
  };
});

await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "drawer-nested-scroll-rail.png");
await panel.screenshot({ path: outPath });

await browser.close();

const pass =
  metrics.thumbBelowHead &&
  metrics.railBelowHead &&
  (metrics.bodyScrollTop ?? 0) > 0;

console.log(JSON.stringify({ pass, metrics, screenshot: outPath }, null, 2));
process.exit(pass ? 0 : 1);
