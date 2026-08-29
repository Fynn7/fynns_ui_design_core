/**
 * Verify markdown syntax highlight on sandbox #code-block file-body readOnly pair.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "scripts/_audit-shots");
const BASE = process.env.SANDBOX_URL ?? "http://localhost:5174";

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("searchbox", { name: /搜索组件|Search/i }).fill("CodeBlock");
  await page.getByRole("button", { name: /CodeBlock/i }).first().click();
  await page.waitForTimeout(800);

  const metrics = await page.evaluate(() => {
    const demo = document.querySelector("#globals-demo-code-block, #code-block");
    if (!demo) return { error: "no #code-block" };

    const cards = [...demo.querySelectorAll(".fynns-card")].filter((c) =>
      c.textContent?.includes("sample.md"),
    );
    const editable = cards[0]?.querySelector(".fynns-code-block--editable:not([data-readonly])")
      ?? cards.flatMap((c) => [...c.querySelectorAll(".fynns-code-block--editable")])[0];
    const readOnlyBlocks = [...demo.querySelectorAll(".fynns-code-block--editable")].filter(
      (el) => !el.querySelector("textarea.fynns-code-block-input"),
    );
    const readOnly = readOnlyBlocks.at(-1);

    const roPre = readOnly?.querySelector(".fynns-code-block-pre");
    const roSpans = roPre
      ? [...roPre.querySelectorAll("span[class*='fynns-code-']")].map((s) => ({
          className: s.className,
          text: (s.textContent ?? "").slice(0, 40),
        }))
      : [];

    const editHost = demo.querySelector(
      ".fynns-code-block--soft-wrap-lines, .fynns-code-block--soft-wrap-single",
    );
    const editHighlighted = editHost?.classList.contains("fynns-code-block--highlighted") ?? false;
    const editLinesMode = editHost?.classList.contains("fynns-code-block--soft-wrap-lines") ?? false;

    return {
      cardCount: cards.length,
      readOnlyHasPre: Boolean(roPre),
      readOnlyHighlighted: readOnly?.classList.contains("fynns-code-block--highlighted") ?? false,
      coloredSpanCount: roSpans.filter((s) => !s.className.includes("plain")).length,
      sampleSpans: roSpans.slice(0, 8),
      editableHighlighted: editHighlighted,
      editableLinesMode: editLinesMode,
      editableHasTextarea: Boolean(editHost?.querySelector("textarea")),
      editableHasHighlightPre: Boolean(editHost?.querySelector("pre.fynns-code-block-highlight")),
      editableVisualLines: editHost?.querySelectorAll(".fynns-code-block-visual-line").length ?? 0,
    };
  });

  const pass =
    metrics.readOnlyHasPre &&
    metrics.readOnlyHighlighted &&
    metrics.coloredSpanCount >= 3 &&
    metrics.editableHasTextarea &&
    metrics.editableHasHighlightPre &&
    metrics.editableLinesMode &&
    metrics.editableVisualLines >= 1;

  const demo = page.locator("#globals-demo-code-block").first();
  if (await demo.count()) {
    await demo.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT, "markdown-highlight-sandbox.png"), fullPage: false });
  }

  const report = { pass, metrics, ts: new Date().toISOString() };
  await writeFile(path.join(OUT, "markdown-highlight-metrics.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
