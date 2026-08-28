/**
 * Verify #form-recipe Highlights repeatable rows: delete IconButton stays on
 * the same row as autoGrow Textarea (control-cluster--end-align + __grow).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "scripts/_audit-shots");
const BASE = process.env.SANDBOX_URL ?? "http://localhost:5176";

const report = { base: BASE, issues: [] };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const search = page.locator('[role="searchbox"], input[type="search"]').first();
  await search.fill("form recipe");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Inspector form recipe|表单/i }).first().click();
  await page.waitForTimeout(500);
  await page.locator("#globals-demo-form-recipe, #form-recipe").first().waitFor({
    state: "visible",
    timeout: 60000,
  });
  await page.locator("#globals-demo-form-recipe, #form-recipe").first().scrollIntoViewIfNeeded();

  const metrics = await page.evaluate(() => {
    const demo =
      document.querySelector("#globals-demo-form-recipe") ??
      document.querySelector("#form-recipe");
    const clusters = [
      ...(demo?.querySelectorAll(
        ".fynns-field-stack .fynns-control-cluster--end-align",
      ) ?? []),
    ].filter((c) => c.querySelector(".fynns-textarea"));

    return clusters.map((cluster, i) => {
      const ta = cluster.querySelector(".fynns-textarea");
      const btn = cluster.querySelector(".fynns-btn--icon");
      const tr = ta?.getBoundingClientRect();
      const br = btn?.getBoundingClientRect();
      return {
        row: i,
        clusterWrap: getComputedStyle(cluster).flexWrap,
        iconTopMinusTextareaBottom: br && tr ? br.top - tr.bottom : null,
        iconTopMinusTextareaTop: br && tr ? br.top - tr.top : null,
        sameRow: br && tr ? br.top < tr.bottom : false,
      };
    });
  });

  report.metrics = metrics;

  if (!metrics.length) {
    report.issues.push("no highlight rows found in #form-recipe");
  }

  for (const m of metrics) {
    if (m.clusterWrap !== "nowrap") {
      report.issues.push(`row ${m.row} flex-wrap=${m.clusterWrap}`);
    }
    if (!m.sameRow) {
      report.issues.push(`row ${m.row} icon wrapped below textarea`);
    }
  }

  await mkdir(OUT, { recursive: true });
  await page.locator("#globals-demo-form-recipe, #form-recipe").first().screenshot({
    path: path.join(OUT, "form-recipe-highlights-sandbox.png"),
  });
} catch (err) {
  report.issues.push(String(err));
} finally {
  await browser.close();
}

await writeFile(
  path.join(OUT, "form-recipe-highlights-metrics.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
process.exit(report.issues.length ? 1 : 0);
