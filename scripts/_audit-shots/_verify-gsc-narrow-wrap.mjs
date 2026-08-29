/**
 * GSC narrow editor: soft-wrap visual lines must remeasure on host resize (≥ 0.5.39).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.GSC_URL ?? "http://127.0.0.1:5173/";
const longLine =
  "loadvolume D:/fynns_local_ws/fynns_bachelor_thesis/_data/zsi/zsi-heptane/zsi-heptane.dat";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector(".gsc-editor-code textarea", { timeout: 60000 });
await page.waitForTimeout(800);
await page.locator(".gsc-editor-code textarea").fill(longLine, { force: true });
await page.waitForTimeout(400);
await page.evaluate(() => {
  const host = document.querySelector(".gsc-editor-host");
  if (host) {
    host.style.width = "281px";
    host.style.maxWidth = "281px";
  }
  const code = document.querySelector(".gsc-editor-code");
  if (code) {
    code.style.width = "281px";
    code.style.height = "249px";
  }
});
await page.waitForTimeout(600);

const metrics = await page.evaluate(() => {
  const host = document.querySelector(".gsc-editor-code");
  const ta = host?.querySelector("textarea");
  const pre = host?.querySelector("pre.fynns-code-block-highlight");
  const lines = pre
    ? [...pre.querySelectorAll(".fynns-code-block-visual-line")]
    : [];
  const taR = ta?.getBoundingClientRect();
  const firstLine = lines[0]?.getBoundingClientRect();
  const lastLine = lines[lines.length - 1]?.getBoundingClientRect();
  const colored = pre
    ? [...pre.querySelectorAll("span[class*='fynns-code-']")].length
    : 0;
  return {
    visualLineCount: lines.length,
    coloredSpans: colored,
    taW: taR?.width,
    offsetFirst: firstLine && taR ? firstLine.top - taR.top : null,
    offsetLast: lastLine && taR ? taR.bottom - lastLine.bottom : null,
    lineEnds: lines.map((l) => (l.textContent ?? "").slice(-24)),
  };
});

await page
  .locator(".gsc-editor-code")
  .screenshot({ path: join(__dir, "gsc-narrow-wrap-fix.png") });

const pass = metrics.visualLineCount >= 2 && metrics.coloredSpans > 0;
const report = { verdict: pass ? "PASS" : "FAIL", url: baseUrl, metrics };
writeFileSync(
  join(__dir, "gsc-narrow-wrap-metrics.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(pass ? 0 : 1);
