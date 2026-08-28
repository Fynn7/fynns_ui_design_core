import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const base = process.env.SANDBOX_URL ?? "http://localhost:5176/";
const outDir = path.resolve("scripts/_audit-shots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(400);

await page.getByRole("button", { name: "Search components" }).click();
await page.waitForTimeout(200);
await page.keyboard.type("List");
await page.waitForTimeout(400);
await page.getByText("List", { exact: true }).first().click();
await page.waitForTimeout(900);

await page.evaluate(() => {
  document.getElementById("list")?.scrollIntoView({ block: "start", behavior: "instant" });
});
await page.waitForTimeout(800);

// Expand lazy List catalog body if collapsed
await page.evaluate(() => {
  const head = document.querySelector("#list")?.closest(".fynns-collapsible, .sandbox-globals-category");
  const trigger = head?.querySelector(".fynns-collapsible-trigger, button[aria-expanded]");
  if (trigger?.getAttribute("aria-expanded") === "false") {
    trigger.click();
  }
});
await page.waitForTimeout(600);

const metrics = await page.evaluate(() => {
  const root = document.documentElement;
  const stripPadRaw = getComputedStyle(root).getPropertyValue("--fynns-layout-strip-pad-inline").trim();
  const stripPadPx = parseFloat(stripPadRaw) * (stripPadRaw.endsWith("rem") ? 16 : 1);
  const listPad = getComputedStyle(root).getPropertyValue("--fynns-list-pad-inline").trim();

  const list = [...document.querySelectorAll("ul.fynns-list")].find(
    (ul) =>
      ul.getAttribute("aria-label")?.includes("status") ||
      ul.getAttribute("aria-label")?.includes("状态"),
  );
  const item =
    list?.querySelector(".fynns-list-item:not(:has(.fynns-list-item-leading))") ??
    document.querySelector("#list .fynns-list-item:not(:has(.fynns-list-item-leading))");
  if (!item) return { error: "no plain list item without leading" };

  const headline = item.querySelector(".fynns-list-item-headline");
  if (!headline) return { error: "missing headline" };
  const itemRect = item.getBoundingClientRect();
  const headRect = headline.getBoundingClientRect();
  const padStartPx = headRect.left - itemRect.left;
  const csPad = parseFloat(getComputedStyle(item).paddingInlineStart);

  return {
    stripPadPx,
    listPadToken: listPad,
    padStartPx,
    csPadStartPx: csPad,
    pass: Math.abs(csPad - stripPadPx) < 1.5 && Math.abs(padStartPx - csPad) < 1.5,
  };
});

await page.screenshot({
  path: path.join(outDir, "list-pad-inline-sandbox.png"),
  fullPage: false,
});

fs.writeFileSync(path.join(outDir, "list-pad-inline-metrics.json"), JSON.stringify(metrics, null, 2));

await browser.close();

console.log(JSON.stringify(metrics, null, 2));
if (metrics.error) {
  console.error("FAIL:", metrics.error);
  process.exit(1);
}
if (!metrics.pass) {
  console.error("FAIL: list pad-inline-start does not match strip-pad-inline");
  process.exit(1);
}
console.log("PASS");
