/**
 * Verify EndAside width morph on toggle (0.5.84).
 * Usage: node scripts/_audit-shots/verify-end-aside-morph-0.5.84.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:5174").replace(/\/$/, "");

const metrics = {
  pass: false,
  base: `${base}/`,
  screen: "Layouts #layouts-demo-shell EndAside toggle",
  consoleErrors: [],
};

async function sampleWidths(page, aside, ms = 180) {
  const samples = [];
  const start = Date.now();
  while (Date.now() - start < ms) {
    const w = await aside.evaluate((el) => el.getBoundingClientRect().width);
    samples.push(Math.round(w));
    await page.waitForTimeout(16);
  }
  return samples;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") metrics.consoleErrors.push(msg.text());
  });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const layoutsNav = page
    .locator(".fynns-nav-drawer-item")
    .filter({ hasText: /Layout templates|布局模板/ })
    .first();
  await layoutsNav.waitFor({ state: "visible", timeout: 15000 });
  await layoutsNav.click();
  await page.waitForTimeout(500);

  await page.locator("#layouts-demo-shell").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const asideSwitch = page.getByRole("switch", {
    name: /EndAside open|打开 EndAside/i,
  });
  await asideSwitch.waitFor({ state: "visible", timeout: 15000 });

  const aside = page.locator("#layouts-demo-shell .fynns-end-aside-track").first();
  await aside.waitFor({ state: "attached", timeout: 10000 });

  async function asideWidth() {
    return await aside.evaluate((el) =>
      Math.round(el.getBoundingClientRect().width),
    );
  }

  if (await asideWidth() < 120) {
    await asideSwitch.click();
    await page.waitForTimeout(280);
  }
  metrics.openWidth = await asideWidth();

  await asideSwitch.click();
  const closeSamples = await sampleWidths(page, aside, 220);
  metrics.closeSamples = closeSamples;
  metrics.closeMorph = Math.max(...closeSamples) - Math.min(...closeSamples);
  metrics.closedWidth = await asideWidth();

  await page.waitForTimeout(120);
  await asideSwitch.click();
  const openSamples = await sampleWidths(page, aside, 220);
  metrics.openSamples = openSamples;
  metrics.openMorph = Math.max(...openSamples) - Math.min(...openSamples);
  metrics.reopenedWidth = await asideWidth();

  const stillMounted = await aside.count() > 0;
  metrics.stillMountedWhenClosed = stillMounted;

  const closeMorphOk = metrics.closeMorph >= 40 && metrics.closedWidth <= 8;
  const openEndOk = metrics.reopenedWidth >= 200;
  const mountedOk = stillMounted;

  metrics.pass =
    closeMorphOk &&
    openEndOk &&
    mountedOk &&
    metrics.consoleErrors.length === 0;

  await page.screenshot({
    path: "scripts/_audit-shots/browser-end-aside-morph-0.5.84.png",
    fullPage: false,
  });

  await browser.close();
  console.log(JSON.stringify(metrics, null, 2));
  if (!metrics.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
