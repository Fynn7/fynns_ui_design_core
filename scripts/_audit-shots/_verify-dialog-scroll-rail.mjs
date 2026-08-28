/**
 * Verify modal Dialog open: only in-overlay scroll hosts paint Y rails (no phantom
 * PageScroll rail behind centered Dialog).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "scripts/_audit-shots");
const SANDBOX = process.env.SANDBOX_URL ?? "http://localhost:5176";
const CONSUMER = process.env.CONSUMER_URL ?? "http://localhost:5274";
const target = process.argv.includes("--consumer") ? CONSUMER : SANDBOX;

const report = { target, issues: [], metrics: {} };

async function measure(page) {
  return page.evaluate(() => {
    const dialogBody = document.querySelector(
      ".fynns-dialog-panel--size-lg .fynns-dialog-body.fynns-scroll",
    );
    const bodyTop = dialogBody?.getBoundingClientRect().top ?? null;
    const allRails = [
      ...document.querySelectorAll('.fynns-scroll-rail[data-axis="y"]'),
    ];
    const paintedRails = allRails.filter((r) => !r.hidden);
    const dialogRail =
      bodyTop == null
        ? paintedRails[0]
        : paintedRails.reduce((best, rail) => {
            const top = Number.parseFloat(rail.style.top);
            if (!Number.isFinite(top)) return best;
            if (!best) return rail;
            const bestTop = Number.parseFloat(best.style.top);
            return Math.abs(top - bodyTop) < Math.abs(bestTop - bodyTop) ? rail : best;
          }, null);
    const pageScroll = document.querySelector(".fynns-page-scroll.fynns-scroll");
    return {
      visibleRailCount: paintedRails.length,
      rails: paintedRails.map((r) => ({
        top: r.style.top,
        height: r.style.height,
        visible: r.dataset.visible,
        hidden: r.hidden,
        thumbTransform: r.querySelector(".fynns-scroll-thumb")?.style.transform ?? "",
      })),
      dialogRailTop: dialogRail ? Number.parseFloat(dialogRail.style.top) : null,
      dialogRailVisible: dialogRail?.dataset.visible ?? null,
      dialogRailThumb:
        dialogRail?.querySelector(".fynns-scroll-thumb")?.style.transform ?? "",
      dialogScrollTop: dialogBody?.scrollTop ?? null,
      pageScrollTop: pageScroll?.scrollTop ?? null,
      dialogBodyTop: bodyTop,
    };
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  await page.goto(`${target}/`, { waitUntil: "networkidle" });

  if (target.includes("5176")) {
    const search = page.locator('[role="searchbox"], input[type="search"]').first();
    await search.fill("form recipe");
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: /Inspector form recipe|表单/i }).first().click();
    await page.waitForTimeout(400);
    await page
      .getByRole("button", { name: /Open Dialog Card stack|打开 Dialog Card 栈/i })
      .first()
      .click();
  } else {
    await page.getByRole("button", { name: /经历|Experiences/i }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    await page.getByText(/Softwareentwickler|Hiwi/i).first().click({ timeout: 10000 });
  }

  await page.locator(".fynns-dialog-panel--size-lg .fynns-dialog-body").waitFor({
    state: "attached",
    timeout: 15000,
  });
  report.metrics.mounting = await measure(page);
  if (report.metrics.mounting.dialogRailVisible === "true") {
    report.issues.push("mounting: dialog thumb visible on overlay mount");
  }
  if (
    report.metrics.mounting.rails.some((r) => !r.hidden && r.visible === "true")
  ) {
    report.issues.push("mounting: painted Y rail thumb visible during mount");
  }

  await page.locator(".fynns-dialog-panel--size-lg .fynns-dialog-body").waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.locator('.fynns-dialog-overlay[data-state="open"]').waitFor({
    state: "attached",
    timeout: 5000,
  });

  /* During enter animation thumb must stay hidden (no focus-within flash). */
  report.metrics.entering = await measure(page);
  if (report.metrics.entering.dialogRailVisible === "true") {
    report.issues.push("entering: dialog thumb visible during enter animation");
  }

  await page.waitForTimeout(400);

  const body = page.locator(".fynns-dialog-panel--size-lg .fynns-dialog-body");
  await page.mouse.move(8, 8);
  await page.waitForTimeout(100);
  report.metrics.afterEnterIdle = await measure(page);
  if (report.metrics.afterEnterIdle.dialogRailVisible === "true") {
    report.issues.push("afterEnterIdle: thumb visible without host hover");
  }

  await body.hover();
  await page.waitForTimeout(150);
  report.metrics.before = await measure(page);
  if (report.metrics.before.dialogRailVisible !== "true") {
    report.issues.push("beforeScroll: thumb not visible after host hover");
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);

  await body.hover();
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  report.metrics.after = await measure(page);

  await mkdir(OUT, { recursive: true });
  await page.locator(".fynns-dialog-panel--size-lg").screenshot({
    path: path.join(
      OUT,
      target.includes("5176")
        ? "dialog-scroll-rail-sandbox.png"
        : "dialog-scroll-rail-consumer.png",
    ),
  });

  for (const phase of ["before", "after"]) {
    const m = report.metrics[phase];
    if (!m) continue;
    if (m.visibleRailCount !== 1) {
      report.issues.push(`${phase}: expected 1 visible Y rail, got ${m.visibleRailCount}`);
    }
    const railTop = m.dialogRailTop ?? Number.parseFloat(m.rails[0]?.top ?? "");
    if (m.dialogBodyTop != null && Math.abs(railTop - m.dialogBodyTop) > 2) {
      report.issues.push(
        `${phase}: rail top ${railTop}px != dialog body top ${m.dialogBodyTop}px`,
      );
    }
  }

  if (report.metrics.before && report.metrics.after) {
    const beforeThumb = report.metrics.before.dialogRailThumb ?? "";
    const afterThumb = report.metrics.after.dialogRailThumb ?? "";
    if (afterThumb === beforeThumb && (report.metrics.after.dialogScrollTop ?? 0) > 20) {
      report.issues.push("thumb transform did not move after dialog scroll");
    }
  }
} catch (err) {
  report.issues.push(String(err));
} finally {
  await browser.close();
}

await writeFile(
  path.join(OUT, "dialog-scroll-rail-metrics.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
process.exit(report.issues.length ? 1 : 0);
