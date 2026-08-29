import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.argv[2] ?? "http://localhost:5176";
const out = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Layout templates|布局模板/ }).click();
await page.waitForTimeout(1200);

const demo = page.locator("#layouts-demo-navigation-drawer").first();
await demo.waitFor({ state: "visible", timeout: 20000 });
await demo.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

const metrics = await demo.evaluate(() => {
  const drawers = [...document.querySelectorAll("#layouts-demo-navigation-drawer .sandbox-globals-navdrawer")];
  const bulkDrawer = drawers[2];
  if (!bulkDrawer) return { err: "no third drawer", count: drawers.length };
  const items = [...bulkDrawer.querySelectorAll(".fynns-nav-drawer-item")];
  const activeCount = items.filter((el) => el.classList.contains("fynns-nav-drawer-item--active")).length;
  const checkedCount = bulkDrawer.querySelectorAll('input[type="checkbox"]:checked').length;
  return {
    drawerCount: drawers.length,
    itemCount: items.length,
    activeCount,
    checkedCount,
    pass: activeCount === 0 && checkedCount >= 4,
  };
});

console.log(JSON.stringify(metrics, null, 2));
await demo.screenshot({ path: path.join(out, "verify-bulk-soft-0.5.65-layouts.png") });
await browser.close();
process.exit(metrics.pass ? 0 : 1);
