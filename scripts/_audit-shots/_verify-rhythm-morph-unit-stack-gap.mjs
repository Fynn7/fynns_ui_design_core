import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${baseUrl}/#rhythm`, { waitUntil: "networkidle", timeout: 60000 });

const rhythmBtn = page.getByRole("button", {
  name: /Toolbar|unit rhythm|工具条|节奏/i,
});
await rhythmBtn.waitFor({ state: "visible", timeout: 15000 });
if ((await rhythmBtn.getAttribute("aria-expanded")) !== "true") {
  await rhythmBtn.click();
}

const stack = page.locator(".sandbox-globals-rhythm-morph-stack");
await stack.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const metrics = await stack.evaluate((el) => {
  const row = el.querySelector(".fynns-control-row");
  const hint = el.querySelector(".fynns-field-hint");
  const rowBox = row?.getBoundingClientRect();
  const hintBox = hint?.getBoundingClientRect();
  const gapPx =
    rowBox && hintBox ? Math.round(hintBox.top - rowBox.bottom) : null;
  const stackGap = getComputedStyle(el).gap;
  return {
    stackGap,
    rowBottom: rowBox?.bottom ?? null,
    hintTop: hintBox?.top ?? null,
    gapPx,
  };
});

await mkdir(outDir, { recursive: true });
const shotPath = path.join(outDir, "rhythm-morph-unit-stack-gap.png");
await stack.screenshot({ path: shotPath });

const report = {
  url: page.url(),
  expectedGapPx: 16,
  cssStackGap: metrics.stackGap,
  measuredGapPx: metrics.gapPx,
  pass: metrics.gapPx != null && metrics.gapPx >= 14 && metrics.gapPx <= 18,
};

await writeFile(
  path.join(outDir, "rhythm-morph-unit-stack-gap-metrics.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(report.pass ? 0 : 1);
