/**
 * Verify EndAside PageScroll scroll host (0.5.93).
 * Usage: node scripts/_audit-shots/verify-end-aside-page-scroll-0.5.93.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:5174").replace(/\/$/, "");

const metrics = {
  pass: false,
  base: `${base}/`,
  screen: "Layouts #layouts-demo-shell EndAside PageScroll",
  consoleErrors: [],
};

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") metrics.consoleErrors.push(msg.text());
  });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  await page
    .locator(".fynns-nav-drawer-item")
    .filter({ hasText: /Layout templates|布局模板/ })
    .first()
    .click();
  await page.waitForTimeout(500);
  await page.locator("#layouts-demo-shell").scrollIntoViewIfNeeded();

  const asideSwitch = page.getByRole("switch", {
    name: /EndAside open|打开 EndAside/i,
  });
  const aside = page.locator("#layouts-demo-shell .fynns-end-aside-track").first();
  const scrollHost = page.locator(
    "#layouts-demo-shell .fynns-end-aside .fynns-page-scroll",
  ).first();

  if (await aside.evaluate((el) => el.getBoundingClientRect().width) < 120) {
    await asideSwitch.click();
    await page.waitForTimeout(280);
  }

  await scrollHost.waitFor({ state: "visible", timeout: 15000 });

  const geom = await scrollHost.evaluate((el) => {
    const track = el.closest(".fynns-end-aside-track");
    const column = el.querySelector(".fynns-content-column");
    const trackR = track?.getBoundingClientRect();
    const hostR = el.getBoundingClientRect();
    const colR = column?.getBoundingClientRect();
    return {
      trackHeight: trackR ? Math.round(trackR.height) : null,
      hostHeight: Math.round(hostR.height),
      hostClientHeight: el.clientHeight,
      hostScrollHeight: el.scrollHeight,
      columnHeight: colR ? Math.round(colR.height) : null,
      overflowY: getComputedStyle(el).overflowY,
    };
  });

  metrics.geom = geom;
  metrics.scrollable = geom.hostScrollHeight > geom.hostClientHeight + 8;
  metrics.hostBounded =
    geom.trackHeight != null && geom.hostHeight <= geom.trackHeight + 2;
  metrics.pass =
    metrics.scrollable &&
    metrics.hostBounded &&
    geom.overflowY === "auto" &&
    metrics.consoleErrors.length === 0;

  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
  process.exit(metrics.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
