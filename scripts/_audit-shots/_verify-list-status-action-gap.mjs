/**
 * Sandbox #sandbox-list-status-action: short status → first IconButton ink
 * must match glyph↔glyph air inside the cluster (≥ 0.5.62 optical gap ≥ 0.5.59).
 * Usage: node scripts/_audit-shots/_verify-list-status-action-gap.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl =
  process.argv[2] ?? process.env.FYNNS_SANDBOX_URL ?? "http://localhost:5175";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

const search = page.getByRole("searchbox").first();
if ((await search.count()) > 0) {
  await search.fill("List");
  await page.waitForTimeout(300);
  const jump = page.getByRole("button", { name: /^List\b|List /i }).first();
  if ((await jump.count()) > 0) {
    await jump.click();
    await page.waitForTimeout(500);
  }
}

const containment = page
  .locator(".fynns-collapsible")
  .filter({ hasText: /收纳|Containment/i })
  .first();
if ((await containment.count()) > 0) {
  const trigger = containment.locator("button").first();
  const expanded = await trigger.getAttribute("aria-expanded");
  if (expanded !== "true") await trigger.click();
  await page.waitForTimeout(400);
}

await page.evaluate(() => {
  document
    .getElementById("globals-demo-list")
    ?.scrollIntoView({ block: "start", behavior: "instant" });
});
await page.waitForSelector("#sandbox-list-status-action", { timeout: 30000 });
const host = page.locator("#sandbox-list-status-action .fynns-list-item-host--with-end").first();
await host.scrollIntoViewIfNeeded();
await host.hover();
await page.waitForTimeout(200);

const metrics = await page.evaluate(() => {
  const list = document.querySelector("#sandbox-list-status-action");
  const host = list?.querySelector(".fynns-list-item-host--with-end");
  const meta = host?.querySelector(".fynns-list-item-trailing-text");
  const end = host?.querySelector(".fynns-list-item-trailing--end");
  const icons = [...(end?.querySelectorAll(".fynns-btn--icon") ?? [])];
  if (!host || !meta || icons.length < 2) {
    return { ok: false, error: "missing host/meta/icons" };
  }
  const mr = meta.getBoundingClientRect();
  const a = icons[0].getBoundingClientRect();
  const b = icons[1].getBoundingClientRect();
  const g0 = icons[0].querySelector("svg")?.getBoundingClientRect();
  const g1 = icons[1].querySelector("svg")?.getBoundingClientRect();
  const item = host.querySelector(".fynns-list-item");
  const gapMetaIconBox = Math.round((a.left - mr.right) * 10) / 10;
  const gapIconsBox = Math.round((b.left - a.right) * 10) / 10;
  const gapMetaGlyph = g0
    ? Math.round((g0.left - mr.right) * 10) / 10
    : null;
  const gapGlyphGlyph =
    g0 && g1 ? Math.round((g1.left - g0.right) * 10) / 10 : null;
  return {
    ok: true,
    padEnd: getComputedStyle(item).paddingInlineEnd,
    endOpacity: getComputedStyle(end).opacity,
    gapMetaIconBox,
    gapIconsBox,
    gapMetaGlyph,
    gapGlyphGlyph,
    inkDelta:
      gapMetaGlyph != null && gapGlyphGlyph != null
        ? Math.abs(gapMetaGlyph - gapGlyphGlyph)
        : null,
  };
});

await mkdir(outDir, { recursive: true });
const shot = path.join(outDir, "list-status-action-gap.png");
await page.locator("#sandbox-list-status-action").screenshot({ path: shot });
await writeFile(
  path.join(outDir, "list-status-action-gap-metrics.json"),
  JSON.stringify(metrics, null, 2),
);
await browser.close();

const pass =
  metrics.ok &&
  metrics.endOpacity === "1" &&
  metrics.gapIconsBox >= 3.5 &&
  metrics.gapIconsBox <= 5 &&
  metrics.gapMetaIconBox >= 14 &&
  metrics.gapMetaIconBox <= 18 &&
  metrics.inkDelta != null &&
  metrics.inkDelta <= 2;

console.log(JSON.stringify(metrics, null, 2));
if (!pass) {
  console.error("FAIL: status→IconButton optical gap mismatch");
  process.exit(1);
}
console.log("PASS: status→glyph ink matches glyph↔glyph (±2px)");
