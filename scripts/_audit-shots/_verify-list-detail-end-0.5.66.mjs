import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.argv[2] ?? "http://localhost:5176";
const out = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
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
  document.getElementById("globals-demo-list")?.scrollIntoView({ block: "start", behavior: "instant" });
});
await page.waitForSelector("#globals-demo-list", { timeout: 30000 });

const treeHost = page
  .locator("#globals-demo-list")
  .locator("li.fynns-list-item-host--with-detail.fynns-list-item-host--with-end")
  .first();
await treeHost.waitFor({ state: "visible", timeout: 15000 });
await treeHost.hover();
await page.waitForTimeout(300);

const metrics = await treeHost.evaluate((host) => {
  const row = host.querySelector(".fynns-list-item-row");
  const trailing = host.querySelector(".fynns-list-item-trailing--end");
  const firstChild = host.querySelector(".fynns-list-item-detail .fynns-list-item");
  if (!row || !trailing) return { err: "missing row or trailing", pass: false };
  const rowBox = row.getBoundingClientRect();
  const trailBox = trailing.getBoundingClientRect();
  const childBox = firstChild?.getBoundingClientRect();
  const trailMid = trailBox.top + trailBox.height / 2;
  const rowMid = rowBox.top + rowBox.height / 2;
  const deltaMid = Math.abs(trailMid - rowMid);
  const trailBelowRow = trailBox.top > rowBox.bottom - 4;
  const trailOverlapsChild =
    childBox != null && trailBox.bottom > childBox.top + 8 && trailMid > rowBox.bottom;
  return {
    rowHeight: rowBox.height,
    trailMid,
    rowMid,
    deltaMid,
    trailBelowRow,
    trailOverlapsChild,
    pass: deltaMid <= 4 && !trailBelowRow && !trailOverlapsChild,
  };
});

console.log(JSON.stringify(metrics, null, 2));
await treeHost.screenshot({ path: path.join(out, "verify-list-detail-end-0.5.66.png") });
await browser.close();
process.exit(metrics.pass ? 0 : 1);
