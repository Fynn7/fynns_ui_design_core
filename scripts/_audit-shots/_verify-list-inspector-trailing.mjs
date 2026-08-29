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

const metrics = await page.evaluate(() => {
  const list = document.querySelector("#sandbox-list-inspector-trailing");
  const host = list?.querySelector(".fynns-list-item-host--with-end");
  const trailing = host?.querySelector(".fynns-list-item-trailing--end");
  const btn = trailing?.querySelector(".fynns-btn:not(.fynns-btn--icon)");
  const select = trailing?.querySelector(".fynns-select");
  if (!host || !trailing || !btn || !select) {
    return { ok: false, error: "missing host/btn/select" };
  }
  const hb = host.getBoundingClientRect();
  const bb = btn.getBoundingClientRect();
  const sb = select.getBoundingClientRect();
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
  return {
    ok: true,
    position: style.position,
    opacity: style.opacity,
    hostWidth: Math.round(hb.width),
    btn: {
      left: Math.round(bb.left),
      right: Math.round(bb.right),
      w: Math.round(bb.width),
    },
    select: {
      left: Math.round(sb.left),
      right: Math.round(sb.right),
      w: Math.round(sb.width),
    },
    gap: Math.round(gap * 10) / 10,
    overlapX: Math.round(overlapX * 10) / 10,
    selectPastHost,
    gapHostSelect,
    padEnd,
  };
});

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
  metrics.gap >= 2 &&
  metrics.selectPastHost <= 0 &&
  metrics.gapHostSelect >= 24 &&
  metrics.padEnd >= 24;

console.log(JSON.stringify(metrics, null, 2));
if (!pass) {
  console.error(
    "FAIL: inspector trailing overlap, overlay, or Select end clipped (need pad/gap ≥ radius-3xl)",
  );
  process.exit(1);
}
console.log("PASS: pinned in-flow, no Button∩Select overlap, Select clears host radius");
