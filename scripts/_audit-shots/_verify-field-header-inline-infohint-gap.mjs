/**
 * Verify FieldHeader label + inline InfoHint gap (≥ 0.5.128).
 * Usage: node scripts/_audit-shots/_verify-field-header-inline-infohint-gap.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${base}/#globals-demo-field-header`, {
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
    .getElementById("sandbox-field-header-inline-infohint")
    ?.scrollIntoView({ block: "center", behavior: "instant" });
});
await page.waitForSelector("#sandbox-field-header-inline-infohint", {
  timeout: 30000,
});

const metrics = await page.$eval(
  "#sandbox-field-header-inline-infohint .fynns-field-header__label",
  (label) => {
    const text = label.querySelector(".fynns-control-row__label-text");
    const hint = label.querySelector(".fynns-info-hint-trigger");
    const labelGap = getComputedStyle(label).gap;
    const textRect = text?.getBoundingClientRect();
    const hintRect = hint?.getBoundingClientRect();
    const inkGap =
      textRect && hintRect
        ? Math.round(hintRect.left - textRect.right)
        : null;
    return {
      labelGap,
      inkGap,
      labelDisplay: getComputedStyle(label).display,
    };
  },
);

await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, "field-header-inline-infohint-gap.png");
await page.locator("#sandbox-field-header-inline-infohint").screenshot({
  path: outPath,
});

await browser.close();

const pass =
  (metrics.labelDisplay === "inline-flex" || metrics.labelDisplay === "flex") &&
  metrics.inkGap != null &&
  metrics.inkGap >= 3;

console.log(JSON.stringify({ pass, metrics, screenshot: outPath }, null, 2));
process.exit(pass ? 0 : 1);
