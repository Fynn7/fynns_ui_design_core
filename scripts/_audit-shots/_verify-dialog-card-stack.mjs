/**
 * Verify #form-recipe Dialog Card stack: Cards keep body height (not head-only crush).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "scripts/_audit-shots");
const BASE = process.env.SANDBOX_URL ?? "http://localhost:5176";

const report = { base: BASE, issues: [], metrics: {} };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const search = page.locator('[role="searchbox"], input[type="search"]').first();
  await search.fill("form recipe");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Inspector form recipe|表单/i }).first().click();
  await page.waitForTimeout(400);

  await page
    .getByRole("button", { name: /Open Dialog Card stack|打开 Dialog Card 栈/i })
    .first()
    .click();
  await page.locator(".fynns-dialog-panel--size-lg").waitFor({ state: "visible" });

  report.metrics = await page.evaluate(() => {
    const body = document.querySelector(".fynns-dialog-panel--size-lg .fynns-dialog-body");
    const cards = [...(body?.querySelectorAll(":scope > .fynns-card") ?? [])];
    const headMin = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--fynns-size-icon-target"),
    );
    return {
      dialogBodyChildShrink: cards.map((card) =>
        getComputedStyle(card).flexShrink,
      ),
      cards: cards.map((card, i) => {
        const head = card.querySelector(".fynns-card-head");
        const cardBody = card.querySelector(".fynns-card-body");
        const cr = card.getBoundingClientRect();
        const hr = head?.getBoundingClientRect();
        const br = cardBody?.getBoundingClientRect();
        const bodyHeight = br ? br.height : 0;
        return {
          index: i,
          cardHeight: cr.height,
          headHeight: hr?.height ?? 0,
          bodyHeight,
          crushed: bodyHeight < 8,
          flexShrink: getComputedStyle(card).flexShrink,
        };
      }),
    };
  });

  await mkdir(OUT, { recursive: true });
  await page.locator(".fynns-dialog-panel--size-lg").screenshot({
    path: path.join(OUT, "dialog-card-stack-sandbox.png"),
  });

  for (const c of report.metrics.cards ?? []) {
    if (c.crushed) {
      report.issues.push(`card ${c.index} body crushed (height ${c.bodyHeight}px)`);
    }
    if (c.flexShrink !== "0") {
      report.issues.push(`card ${c.index} flex-shrink=${c.flexShrink} (expected 0)`);
    }
    if (c.cardHeight < 80 && c.index < 3) {
      report.issues.push(`card ${c.index} total height ${c.cardHeight}px looks head-only`);
    }
  }
} catch (err) {
  report.issues.push(String(err));
} finally {
  await browser.close();
}

await writeFile(
  path.join(OUT, "dialog-card-stack-metrics.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
process.exit(report.issues.length ? 1 : 0);
