/**
 * Sandbox #card head Select + labeled Button: collapsed header rhythm + expanded trigger band.
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
  const lead = host?.querySelector(".fynns-card-lead");
  if (!host || !title || !field || !btn || !lead) {
    return { ok: false, error: "missing head/title/field/btn/lead" };
  }
  const hb = host.getBoundingClientRect();
  const tb = title.getBoundingClientRect();
  const fb = field.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const triggerCenterY = Math.round(fb.top + fb.height / 2);
  const titleTopDelta = Math.abs(Math.round(tb.top) - Math.round(fb.top));
  const titleCenterY = Math.round((tb.top + tb.bottom) / 2);
  const titleBandCenterDelta = Math.abs(titleCenterY - triggerCenterY);
  const btnCenterY = Math.round((bb.top + bb.bottom) / 2);
  const bandCenterDelta = Math.abs(btnCenterY - triggerCenterY);
  const headCenterY = Math.round((hb.top + hb.bottom) / 2);
  const titleCenterDelta = Math.abs(titleCenterY - headCenterY);
  const titleInsetTop = Math.round(tb.top - hb.top);
  const sb = host.querySelector(".fynns-select")?.getBoundingClientRect();
  const clusterGap =
    sb != null
      ? Math.round((bb.left - sb.right) * 10) / 10
      : null;
  const clusterGapToken = getComputedStyle(
    host.querySelector(".fynns-control-cluster"),
  ).gap;
  return {
    ok: true,
    headAlign: getComputedStyle(host).alignItems,
    headDisplay: getComputedStyle(host).display,
    leadAlignSelf: getComputedStyle(lead).alignSelf,
    leadPaddingBlock: getComputedStyle(lead).paddingBlock,
    titleTopDelta,
    titleBandCenterDelta,
    bandCenterDelta,
    titleCenterDelta,
    titleInsetTop,
    clusterGap,
    clusterGapToken,
    headHeight: Math.round(hb.height),
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
  const btn = host?.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  const lead = host?.querySelector(".fynns-card-lead");
  const select = host?.querySelector(".fynns-select");
  const panel = select?.querySelector(".fynns-search-bar-panel");
  if (!host || !title || !field || !btn || !lead || !select || !panel) {
    return { ok: false, error: "missing open-state nodes" };
  }
  const hb = host.getBoundingClientRect();
  const tb = title.getBoundingClientRect();
  const fb = field.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const sb = select.getBoundingClientRect();
  const triggerCenterY = Math.round(fb.top + fb.height / 2);
  const titleTopDelta = Math.abs(Math.round(tb.top) - Math.round(fb.top));
  const titleCenterY = Math.round((tb.top + tb.bottom) / 2);
  const titleBandCenterDelta = Math.abs(titleCenterY - triggerCenterY);
  const btnCenterY = Math.round((bb.top + bb.bottom) / 2);
  const bandCenterDelta = Math.abs(btnCenterY - triggerCenterY);
  const titleMidDelta = Math.abs(
    Math.round((tb.top + tb.bottom) / 2) -
      Math.round((hb.top + hb.bottom) / 2),
  );
  return {
    ok: true,
    headAlign: getComputedStyle(host).alignItems,
    headDisplay: getComputedStyle(host).display,
    leadAlignSelf: getComputedStyle(lead).alignSelf,
    titleTopDelta,
    titleBandCenterDelta,
    bandCenterDelta,
    titleMidDelta,
    headHeight: Math.round(hb.height),
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
  metrics.headAlign === "center" &&
  metrics.headDisplay === "flex" &&
  metrics.leadAlignSelf === "stretch" &&
  metrics.titleCenterDelta <= 2 &&
  metrics.bandCenterDelta <= 2 &&
  metrics.titleInsetTop >= 10 &&
  metrics.clusterGap >= 7 &&
  metrics.clusterGap <= 9 &&
  metrics.open?.ok === true &&
  metrics.open.headDisplay === "grid" &&
  metrics.open.titleBandCenterDelta <= 2 &&
  metrics.open.bandCenterDelta <= 2 &&
  metrics.open.titleMidDelta > 12 &&
  metrics.open.selectHeight > metrics.open.fieldHeight + 8 &&
  metrics.open.panelPosition !== "absolute" &&
  metrics.open.cardOverflow === "visible";

console.log(JSON.stringify(metrics, null, 2));
if (!pass) {
  console.error(
    "FAIL: card head collapsed rhythm or expanded trigger-band alignment",
  );
  process.exit(1);
}
console.log(
  "PASS: collapsed header center rhythm + expanded trigger-band alignment",
);
