/**
 * Soft-wrap editable contract (≥ 0.5.27): single visible textarea, no visual-line
 * overlay, native ::selection, full Ctrl+A range — reproduces loadvolume narrow host.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.VERIFY_URL ?? "http://127.0.0.1:5174/#code-block";
const LONG =
  "cp /Users/example/projects/sample-app/assets/very-long-nested-folder-name/texture-atlas-v2.png /tmp/out/texture-atlas-v2.png";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("searchbox", { name: /搜索组件|Search/i }).fill("CodeBlock");
  await page.getByRole("button", { name: /CodeBlock/i }).first().click();

  const ta = page.getByRole("textbox", {
    name: /软换行选区示例|Soft-wrap selection sample/i,
  });
  await ta.scrollIntoViewIfNeeded();
  await ta.click();
  await ta.fill(LONG);

  await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="软换行选区示例"], [aria-label="Soft-wrap selection sample"]',
    );
    const outer = textarea?.closest(".fynns-code-block")?.parentElement;
    if (outer) {
      outer.style.maxWidth = "232px";
      outer.style.width = "232px";
    }
  });
  await page.waitForTimeout(150);
  await page.keyboard.press("Control+A");
  await page.waitForTimeout(80);

  const metrics = await page.evaluate(() => {
    const textarea = document.querySelector(
      '[aria-label="软换行选区示例"], [aria-label="Soft-wrap selection sample"]',
    );
    const host = textarea?.closest(".fynns-code-block");
    if (!textarea || !host) return { error: "missing host" };

    const value = textarea.value;
    const single = host.classList.contains("fynns-code-block--soft-wrap-single");
    const linesMode = host.classList.contains("fynns-code-block--soft-wrap-lines");
    const highlightLayer = host.querySelector(".fynns-code-block-highlight");
    const visualLines = host.querySelectorAll(".fynns-code-block-visual-line");
    const mirrorSpans = host.querySelectorAll(".fynns-code-block-visual-selection");

    const taStyle = getComputedStyle(textarea);
    const inkVisible =
      taStyle.color !== "rgba(0, 0, 0, 0)" &&
      taStyle.webkitTextFillColor !== "rgba(0, 0, 0, 0)" &&
      taStyle.color !== "transparent";

    const selStyle = getComputedStyle(textarea, "::selection");
    const selBg = selStyle.backgroundColor;
    const selInkVisible =
      selStyle.color !== "transparent" &&
      selStyle.webkitTextFillColor !== "transparent";

    return {
      valueLen: value.length,
      single,
      linesMode,
      hasHighlightLayer: Boolean(highlightLayer),
      visualLineCount: visualLines.length,
      mirrorSpanCount: mirrorSpans.length,
      inkVisible,
      selBg,
      selInkVisible,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      fullSelect: textarea.selectionStart === 0 && textarea.selectionEnd === value.length,
    };
  });

  await ta.screenshot({
    path: join(__dir, "codeblock-soft-wrap-single-check.png"),
  });

  const pass =
    !metrics.error &&
    metrics.single &&
    !metrics.linesMode &&
    !metrics.hasHighlightLayer &&
    metrics.visualLineCount === 0 &&
    metrics.mirrorSpanCount === 0 &&
    metrics.inkVisible &&
    metrics.selInkVisible &&
    metrics.fullSelect &&
    metrics.selectionEnd === metrics.valueLen;

  const report = { verdict: pass ? "PASS" : "FAIL", url: baseUrl, metrics };
  writeFileSync(
    join(__dir, "codeblock-soft-wrap-single-metrics.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (!pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
