/**
 * Sandbox #card head Select + labeled Button: title/CTA pin to trigger band.
 * Usage: node scripts/_audit-shots/_verify-card-head-select.mjs [baseUrl]
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
  await search.fill("Card");
  await page.waitForTimeout(300);
  const jump = page.getByRole("button", { name: /^Card\b|Card /i }).first();
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

await page.waitForSelector("#sandbox-card-head-select", { timeout: 30000 });
await page.locator("#sandbox-card-head-select").scrollIntoViewIfNeeded();

const metricsClosed = await page.evaluate(() => {
  const host = document.querySelector(
    "#sandbox-card-head-select .fynns-card-head",
  );
  const title = host?.querySelector(".fynns-card-title");
  const field = host?.querySelector(".fynns-search-bar-field");
  const btn = host?.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  if (!host || !title || !field || !btn) {
    return { ok: false, error: "missing head/title/field/btn" };
  }
  const tb = title.getBoundingClientRect();
  const fb = field.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const triggerCenterY = Math.round(fb.top + fb.height / 2);
  const titleTopDelta = Math.abs(Math.round(tb.top) - Math.round(fb.top));
  const btnCenterY = Math.round((bb.top + bb.bottom) / 2);
  const bandCenterDelta = Math.abs(btnCenterY - triggerCenterY);
  return {
    ok: true,
    headAlign: getComputedStyle(host).alignItems,
    titleTopDelta,
    bandCenterDelta,
    headHeight: Math.round(host.getBoundingClientRect().height),
  };
});

await page.evaluate(() => {
  const trigger = document.querySelector(
    "#sandbox-card-head-select button.fynns-select-trigger",
  );
  if (!trigger) throw new Error("missing select trigger");
  trigger.click();
});
await page.waitForTimeout(400);

const metricsOpen = await page.evaluate(() => {
  const host = document.querySelector(
    "#sandbox-card-head-select .fynns-card-head",
  );
  const title = host?.querySelector(".fynns-card-title");
  const field = host?.querySelector(".fynns-search-bar-field");
  const select = host?.querySelector(".fynns-select");
  const btn = host?.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  const panel = select?.querySelector(".fynns-search-bar-panel");
  if (!host || !title || !field || !select || !btn || !panel) {
    return { ok: false, error: "missing open-state nodes" };
  }
  const tb = title.getBoundingClientRect();
  const fb = field.getBoundingClientRect();
  const sb = select.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const pb = panel.getBoundingClientRect();
  const triggerCenterY = Math.round(fb.top + fb.height / 2);
  const titleTopDelta = Math.abs(Math.round(tb.top) - Math.round(fb.top));
  const btnCenterY = Math.round((bb.top + bb.bottom) / 2);
  const bandCenterDelta = Math.abs(btnCenterY - triggerCenterY);
  const headMidY = Math.round(
    (host.getBoundingClientRect().top + host.getBoundingClientRect().bottom) / 2,
  );
  const titleMidDelta = Math.abs(Math.round(tb.top + tb.height / 2) - headMidY);
  return {
    ok: true,
    headAlign: getComputedStyle(host).alignItems,
    leadAlignSelf: getComputedStyle(
      host.querySelector(".fynns-card-lead"),
    ).alignSelf,
    clusterAlign: getComputedStyle(
      host.querySelector(".fynns-control-cluster"),
    ).alignItems,
    titleTopDelta,
    bandCenterDelta,
    titleMidDelta,
    headHeight: Math.round(host.getBoundingClientRect().height),
    selectHeight: Math.round(sb.height),
    fieldHeight: Math.round(fb.height),
    panelPosition: getComputedStyle(panel).position,
    cardOverflow: getComputedStyle(
      document.querySelector("#sandbox-card-head-select .fynns-card"),
    ).overflow,
  };
});

const metrics = { ...metricsClosed, open: metricsOpen };

await mkdir(outDir, { recursive: true });
const shot = path.join(outDir, "card-head-select.png");
await page.locator("#sandbox-card-head-select").screenshot({ path: shot });
await writeFile(
  path.join(outDir, "card-head-select-metrics.json"),
  JSON.stringify(metrics, null, 2),
);

await browser.close();

const pass =
  metrics.ok &&
  metrics.headAlign === "flex-start" &&
  metrics.titleTopDelta <= 4 &&
  metrics.bandCenterDelta <= 2 &&
  metrics.open?.ok === true &&
  metrics.open.headAlign === "flex-start" &&
  metrics.open.titleTopDelta <= 4 &&
  metrics.open.bandCenterDelta <= 2 &&
  metrics.open.titleMidDelta > 12 &&
  metrics.open.selectHeight > metrics.open.fieldHeight + 8 &&
  metrics.open.panelPosition !== "absolute" &&
  metrics.open.cardOverflow === "visible";

console.log(JSON.stringify(metrics, null, 2));
if (!pass) {
  console.error(
    "FAIL: card head title/CTA not pinned to trigger band when Select expanded",
  );
  process.exit(1);
}
console.log("PASS: card head Select + Button trigger-band alignment");
