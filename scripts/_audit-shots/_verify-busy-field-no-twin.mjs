import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });

const patterns = page
  .locator(".fynns-collapsible")
  .filter({ hasText: /模式|Patterns/i })
  .first();
if ((await patterns.count()) > 0) {
  const trigger = patterns.locator("button").first();
  const expanded = await trigger.getAttribute("aria-expanded");
  if (expanded !== "true") await trigger.click();
  await page.waitForTimeout(400);
}

await page.evaluate(() => {
  document
    .getElementById("globals-demo-busy-region")
    ?.scrollIntoView({ block: "start", behavior: "instant" });
});
await page.waitForSelector("#globals-demo-busy-region", { timeout: 30000 });

const demo = page.locator("#globals-demo-busy-region");
await demo.scrollIntoViewIfNeeded();

const startBtn = page.getByRole("button", {
  name: /Show field busy|显示字段 busy/,
});
await startBtn.waitFor({ state: "visible", timeout: 10000 });
await startBtn.click();
await page.waitForTimeout(400);

const metrics = await page.evaluate(() => {
  const blocks = [
    ...document.querySelectorAll("#globals-demo-busy-region .fynns-field-block"),
  ];
  const field = blocks[blocks.length - 1];
  if (!field) return { error: "no field-block" };
  const busy = field.querySelector(".fynns-busy-region--busy");
  const regionRing = busy?.querySelector(".fynns-circular-progress");
  const headerBtn = field.querySelector(
    ".fynns-field-header__actions .fynns-btn--icon",
  );
  const headerLoading = headerBtn?.classList.contains("fynns-btn--loading");
  const headerDisabled =
    headerBtn?.hasAttribute("disabled") ||
    headerBtn?.getAttribute("aria-disabled") === "true";
  const loadingSlots = field.querySelectorAll(".fynns-btn--loading").length;
  const rings = field.querySelectorAll(".fynns-circular-progress").length;
  return {
    hasBusyRegion: Boolean(busy),
    hasRegionRing: Boolean(regionRing),
    headerLoading: Boolean(headerLoading),
    headerDisabled: Boolean(headerDisabled),
    loadingSlots,
    rings,
  };
});

await mkdir(outDir, { recursive: true });
const shotPath = path.join(outDir, "busy-field-no-twin.png");
await demo.screenshot({ path: shotPath });

const pass =
  !metrics.error &&
  metrics.hasBusyRegion &&
  metrics.hasRegionRing &&
  metrics.headerLoading === false &&
  metrics.loadingSlots === 0 &&
  metrics.rings === 1;

const report = { url: page.url(), metrics, pass, shotPath };
await writeFile(
  path.join(outDir, "busy-field-no-twin-metrics.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(pass ? 0 : 1);
