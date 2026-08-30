/**
 * Sandbox #list inspector trailing: labeled Button + Select must not overlap.
 * Usage: node scripts/_audit-shots/_verify-list-inspector-trailing.mjs [baseUrl]
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
await page.waitForSelector("#globals-demo-list", { timeout: 30000 });
await page.waitForSelector("#sandbox-list-inspector-trailing", {
  timeout: 15000,
});
await page.locator("#sandbox-list-inspector-trailing").scrollIntoViewIfNeeded();

const metricsClosed = await page.evaluate(() => {
  const list = document.querySelector("#sandbox-list-inspector-trailing");
  const hosts = [
    ...(list?.querySelectorAll(".fynns-list-item-host--with-end") ?? []),
  ];
  const host = hosts[0];
  const trailing = host?.querySelector(".fynns-list-item-trailing--end");
  const btn = trailing?.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  const select = trailing?.querySelector(".fynns-select");
  const meta = trailing?.querySelector(":scope > .fynns-list-item-trailing-text");
  const metaInRow = host?.querySelector(
    ".fynns-list-item > .fynns-list-item-trailing > .fynns-list-item-trailing-text",
  );
  if (!host || !trailing || !btn || !select) {
    return { ok: false, error: "missing host/btn/select" };
  }
  const hb = host.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const sb = select.getBoundingClientRect();
  const mr = meta?.getBoundingClientRect();
  const gapMetaBtn =
    mr ? Math.round((bb.left - mr.right) * 10) / 10 : null;
  const li = host.querySelector(".fynns-list-item");
  const liBox = li?.getBoundingClientRect();
  const tb = trailing.getBoundingClientRect();
  const liTop = li ? Math.round(liBox.top) : null;
  const rowCenterY =
    liBox != null ? Math.round((liBox.top + liBox.bottom) / 2) : null;
  const endCenterY = Math.round((tb.top + tb.bottom) / 2);
  const endCenterDelta =
    rowCenterY != null ? Math.abs(endCenterY - rowCenterY) : null;
  const isThreeLine = li?.classList.contains("fynns-list-item--3") ?? false;
  const panel = select.querySelector(".fynns-search-bar-panel");
  const panelPos = panel ? getComputedStyle(panel).position : null;
  const triggerFont = getComputedStyle(
    select.querySelector(".fynns-select-trigger") ?? select,
  ).fontSize;

  const style = getComputedStyle(trailing);
  const overlapX = Math.max(
    0,
    Math.min(bb.right, sb.right) - Math.max(bb.left, sb.left),
  );
  const gap = sb.left - bb.right;
  const hostRight = host.getBoundingClientRect().right;
  const selectPastHost = Math.round((sb.right - hostRight) * 10) / 10;
  const gapHostSelect = Math.round((hostRight - sb.right) * 10) / 10;
  const padEnd = parseFloat(style.paddingInlineEnd) || 0;

  const gapMetaLefts = hosts
    .map((h) => {
      const m = h.querySelector(
        ".fynns-list-item-trailing--end > .fynns-list-item-trailing-text",
      );
      return m ? Math.round(m.getBoundingClientRect().left) : null;
    })
    .filter((n) => n != null);
  const metaLeftSpread =
    gapMetaLefts.length >= 2
      ? Math.max(...gapMetaLefts) - Math.min(...gapMetaLefts)
      : 0;

  return {
    ok: true,
    position: style.position,
    opacity: style.opacity,
    hostWidth: Math.round(hb.width),
    metaInEnd: Boolean(meta),
    metaInRow: Boolean(metaInRow),
    gapMetaBtn,
    gapMetaLefts,
    metaLeftSpread,
    listItemTop: liTop,
    isThreeLine,
    rowCenterY,
    endCenterY,
    endCenterDelta,
    panelPosition: panelPos,
    triggerFontSize: triggerFont,
    btn: {
      left: Math.round(bb.left),
      right: Math.round(bb.right),
      w: Math.round(bb.width),
    },
    select: {
      left: Math.round(sb.left),
      right: Math.round(sb.right),
      w: Math.round(sb.width),
      h: Math.round(sb.height),
    },
    gap: Math.round(gap * 10) / 10,
    overlapX: Math.round(overlapX * 10) / 10,
    selectPastHost,
    gapHostSelect,
    padEnd,
  };
});

await page.evaluate(() => {
  const trigger = document.querySelector(
    "#sandbox-list-inspector-trailing button.fynns-select-trigger",
  );
  if (!trigger) throw new Error("missing select trigger");
  trigger.click();
});
await page.waitForTimeout(400);

const metricsOpen = await page.evaluate(() => {
  const list = document.querySelector("#sandbox-list-inspector-trailing");
  const host = list?.querySelector(".fynns-list-item-host--with-end");
  const li = host?.querySelector(".fynns-list-item");
  const trailing = host?.querySelector(".fynns-list-item-trailing--end");
  const select = trailing?.querySelector(".fynns-select");
  const panel = select?.querySelector(".fynns-search-bar-panel");
  const field = select?.querySelector(".fynns-search-bar-field");
  if (!host || !li || !select || !panel || !field) {
    return { ok: false, error: "missing open-state nodes" };
  }
  const liBox = li.getBoundingClientRect();
  const selectBox = select.getBoundingClientRect();
  const fieldBox = field.getBoundingClientRect();
  const panelBox = panel.getBoundingClientRect();
  const panelStyle = getComputedStyle(panel);
  const results = panel.querySelector(".fynns-search-bar-results");
  const triggerFont = getComputedStyle(
    select.querySelector(".fynns-select-trigger") ?? select,
  ).fontSize;
  const nextHost = list?.querySelectorAll(".fynns-list-item-host--with-end")[1];
  const nextHostTop = nextHost
    ? Math.round(nextHost.getBoundingClientRect().top)
    : null;
  const nextRowOverlap =
    nextHostTop != null
      ? Math.round((selectBox.bottom - nextHostTop) * 10) / 10
      : null;
  const trailingStyle = getComputedStyle(trailing);
  const meta = trailing.querySelector(":scope > .fynns-list-item-trailing-text");
  const btn = trailing.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  const triggerEl = select.querySelector(".fynns-select-trigger") ?? field;
  const triggerTop = Math.round(triggerEl.getBoundingClientRect().top);
  const metaTop = meta ? Math.round(meta.getBoundingClientRect().top) : null;
  const metaHeight = meta ? Math.round(meta.getBoundingClientRect().height) : null;
  const btnTop = btn ? Math.round(btn.getBoundingClientRect().top) : null;
  const btnHeight = btn ? Math.round(btn.getBoundingClientRect().height) : null;
  const content = li.querySelector(".fynns-list-item-content");
  const contentTop = content
    ? Math.round(content.getBoundingClientRect().top)
    : null;
  const triggerCenterY = Math.round(triggerTop + fieldBox.height / 2);
  const bandCenterDelta = Math.max(
    metaTop != null && metaHeight != null
      ? Math.abs(metaTop + metaHeight / 2 - triggerCenterY)
      : 0,
    btnTop != null && btnHeight != null
      ? Math.abs(btnTop + btnHeight / 2 - triggerCenterY)
      : 0,
  );
  const contentTopDelta =
    contentTop != null ? Math.abs(contentTop - triggerTop) : null;
  return {
    ok: true,
    listItemTop: Math.round(liBox.top),
    selectHeight: Math.round(selectBox.height),
    fieldHeight: Math.round(fieldBox.height),
    panelTop: Math.round(panelBox.top),
    panelPosition: panelStyle.position,
    panelDisplay: panelStyle.display,
    panelBottomRadius: panelStyle.borderBottomLeftRadius,
    resultsBottomRadius: results
      ? getComputedStyle(results).borderBottomLeftRadius
      : null,
    triggerFontSize: triggerFont,
    fieldToPanelGap: Math.round((panelBox.top - fieldBox.bottom) * 10) / 10,
    hostOverflow: getComputedStyle(host).overflow,
    trailingAlignItems: trailingStyle.alignItems,
    trailingDisplay: trailingStyle.display,
    nextHostTop,
    nextRowOverlap,
    bandCenterDelta,
    contentTopDelta,
  };
});

const metrics = {
  ...metricsClosed,
  open: metricsOpen,
  listItemTopDelta:
    metricsClosed.listItemTop != null && metricsOpen.listItemTop != null
      ? Math.abs(metricsOpen.listItemTop - metricsClosed.listItemTop)
      : null,
};

await mkdir(outDir, { recursive: true });
const shot = path.join(outDir, "list-inspector-trailing.png");
await page.locator("#sandbox-list-inspector-trailing").screenshot({ path: shot });
await writeFile(
  path.join(outDir, "list-inspector-trailing-metrics.json"),
  JSON.stringify(metrics, null, 2),
);

await browser.close();

const pass =
  metrics.ok &&
  metrics.position === "static" &&
  metrics.overlapX === 0 &&
  metrics.gap >= 7 &&
  metrics.gap <= 9 &&
  metrics.gapMetaBtn >= 7 &&
  metrics.gapMetaBtn <= 9 &&
  metrics.selectPastHost <= 0 &&
  metrics.gapHostSelect >= 24 &&
  metrics.padEnd >= 24 &&
  metrics.metaInEnd === true &&
  metrics.metaInRow === false &&
  metrics.metaLeftSpread <= 1 &&
  parseFloat(metrics.open.triggerFontSize) <= 14 &&
  parseFloat(metrics.triggerFontSize) <= 14 &&
  metrics.open?.ok === true &&
  metrics.open.panelPosition !== "absolute" &&
  metrics.open.selectHeight > metrics.open.fieldHeight + 8 &&
  metrics.open.fieldToPanelGap <= 1 &&
  metrics.listItemTopDelta <= 1 &&
  metrics.open.nextRowOverlap <= 4 &&
  metrics.open.trailingDisplay === "grid" &&
  metrics.open.bandCenterDelta <= 2 &&
  metrics.open.contentTopDelta != null &&
  metrics.open.contentTopDelta <= 10;

console.log(JSON.stringify(metrics, null, 2));
if (!pass) {
  console.error(
    "FAIL: inspector trailing overlap, overlay, Select clip, or gap-meta column drift",
  );
  process.exit(1);
}
console.log(
  "PASS: pinned in-flow, inline Select shell, gap meta on trigger band when open",
);
