/**
 * Browser verify: #form-recipe Highlights rows + Dialog host.
 * Checks layout (delete on same row), console errors, failed requests.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "scripts/_audit-shots");
const BASE = process.env.SANDBOX_URL ?? "http://localhost:5176";

const report = {
  base: BASE,
  issues: [],
  consoleErrors: [],
  failedRequests: [],
  metrics: {},
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

page.on("console", (msg) => {
  if (msg.type() === "error") {
    report.consoleErrors.push(msg.text());
  }
});
page.on("requestfailed", (req) => {
  report.failedRequests.push(`${req.failure()?.errorText ?? "failed"} ${req.url()}`);
});
page.on("response", (res) => {
  if (res.status() >= 400) {
    report.failedRequests.push(`${res.status()} ${res.url()}`);
  }
});

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

  report.metrics.cardRows = await page.evaluate(() => {
    const demo = document.querySelector("#globals-demo-form-recipe");
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
      const taMid = tr ? tr.top + tr.height / 2 : 0;
      const btnMid = br ? br.top + br.height / 2 : 0;
      return {
        row: i,
        clusterWrap: getComputedStyle(cluster).flexWrap,
        iconTopMinusTextareaBottom: br && tr ? br.top - tr.bottom : null,
        iconTopMinusTextareaTop: br && tr ? br.top - tr.top : null,
        iconCenterMinusTextareaCenter: br && tr ? btnMid - taMid : null,
        verticallyCentered: br && tr ? Math.abs(btnMid - taMid) <= 2 : false,
        sameRow: br && tr ? br.top < tr.bottom : false,
      };
    });
  });

  await mkdir(OUT, { recursive: true });
  await page.locator("#globals-demo-form-recipe, #form-recipe").first().screenshot({
    path: path.join(OUT, "form-recipe-highlights-browser-card.png"),
  });

  // Open Dialog host — same FieldStack tree
  await page.getByRole("button", { name: /Open Dialog form|打开 Dialog/i }).first().click();
  await page.locator(".fynns-dialog-panel--size-lg").waitFor({ state: "visible" });

  report.metrics.dialogRows = await page.evaluate(() => {
    const body = document.querySelector(".fynns-dialog-panel--size-lg .fynns-dialog-body");
    const clusters = [
      ...(body?.querySelectorAll(
        ".fynns-field-stack .fynns-control-cluster--end-align",
      ) ?? []),
    ].filter((c) => c.querySelector(".fynns-textarea"));

    return clusters.map((cluster, i) => {
      const ta = cluster.querySelector(".fynns-textarea");
      const btn = cluster.querySelector(".fynns-btn--icon");
      const tr = ta?.getBoundingClientRect();
      const br = btn?.getBoundingClientRect();
      const taMid = tr ? tr.top + tr.height / 2 : 0;
      const btnMid = br ? br.top + br.height / 2 : 0;
      return {
        row: i,
        clusterWrap: getComputedStyle(cluster).flexWrap,
        iconTopMinusTextareaBottom: br && tr ? br.top - tr.bottom : null,
        iconTopMinusTextareaTop: br && tr ? br.top - tr.top : null,
        iconCenterMinusTextareaCenter: br && tr ? btnMid - taMid : null,
        verticallyCentered: br && tr ? Math.abs(btnMid - taMid) <= 2 : false,
        sameRow: br && tr ? br.top < tr.bottom : false,
      };
    });
  });

  await page.locator(".fynns-dialog-panel--size-lg").screenshot({
    path: path.join(OUT, "form-recipe-highlights-browser-dialog.png"),
  });

  // Interaction: hover first Highlights delete inside open Dialog
  const dialogDelete = page
    .locator(
      ".fynns-dialog-panel--size-lg .fynns-control-cluster--end-align:has(.fynns-textarea) .fynns-btn--icon",
    )
    .first();
  await dialogDelete.hover({ timeout: 5000 }).catch(() => {});
  await page
    .locator(".fynns-dialog-panel--size-lg")
    .screenshot({ path: path.join(OUT, "form-recipe-highlights-browser-dialog-hover.png") })
    .catch(() => {});

  for (const rows of [report.metrics.cardRows ?? [], report.metrics.dialogRows ?? []]) {
    if (!rows.length) report.issues.push("no highlight rows found");
    for (const m of rows) {
      if (m.clusterWrap !== "nowrap") {
        report.issues.push(`row ${m.row} flex-wrap=${m.clusterWrap}`);
      }
    if (!m.sameRow) {
      report.issues.push(`row ${m.row} delete wrapped below textarea`);
    }
    if (m.iconTopMinusTextareaTop === 0 && (m.iconCenterMinusTextareaCenter ?? 0) > 4) {
      report.issues.push(
        `row ${m.row} delete top-pinned (center delta ${m.iconCenterMinusTextareaCenter}px)`,
      );
    }
    if (m.iconCenterMinusTextareaCenter != null && Math.abs(m.iconCenterMinusTextareaCenter) > 2) {
      report.issues.push(
        `row ${m.row} delete not vertically centered (delta ${m.iconCenterMinusTextareaCenter}px)`,
      );
    }
  }
  }

  if (report.consoleErrors.length) {
    report.issues.push(`console errors: ${report.consoleErrors.length}`);
  }
  if (report.failedRequests.length) {
    report.issues.push(`failed requests: ${report.failedRequests.length}`);
  }
} catch (err) {
  report.issues.push(String(err));
} finally {
  await browser.close();
}

await writeFile(
  path.join(OUT, "form-recipe-highlights-browser-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
process.exit(report.issues.length ? 1 : 0);
