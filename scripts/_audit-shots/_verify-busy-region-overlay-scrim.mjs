/**
 * Verify BusyRegion overlay paints --fynns-color-overlay scrim (≥ 0.5.121).
 * Usage: node scripts/_audit-shots/_verify-busy-region-overlay-scrim.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });

const patterns = page
  .locator(".fynns-collapsible")
  .filter({ hasText: /模式|Patterns/i })
  .first();
if ((await patterns.count()) > 0) {
  const trigger = patterns.locator("button").first();
  if ((await trigger.getAttribute("aria-expanded")) !== "true") {
    await trigger.click();
    await page.waitForTimeout(400);
  }
}

await page.evaluate(() => {
  document
    .getElementById("globals-demo-busy-region")
    ?.scrollIntoView({ block: "start", behavior: "instant" });
});
await page.waitForSelector("#sandbox-busy-region-field-sample", { timeout: 30000 });

await page.getByRole("button", { name: /Show field busy|显示字段 busy/ }).click();
await page.waitForSelector(".fynns-busy-region--busy .fynns-busy-region-overlay");

const overlayBg = await page.$eval(
  ".fynns-busy-region--busy .fynns-busy-region-overlay",
  (el) => getComputedStyle(el).backgroundColor,
);

const tokenOverlay = await page.evaluate(() =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-color-overlay")
    .trim(),
);

const matchesToken = overlayBg === tokenOverlay;

await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "busy-region-overlay-scrim.png");
await page.locator("#sandbox-busy-region-field-sample").screenshot({ path: outPath });

await browser.close();

const pass = matchesToken;
console.log(
  JSON.stringify(
    { pass, overlayBg, tokenOverlay, matchesToken, screenshot: outPath },
    null,
    2,
  ),
);
process.exit(pass ? 0 : 1);
