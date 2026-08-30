/**
 * Verify ControlRow labeled Button cluster wraps in narrow EndAside (0.5.88).
 * Usage: node scripts/_audit-shots/verify-control-row-cluster-wrap-0.5.88.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:5174").replace(/\/$/, "");

const metrics = {
  pass: false,
  base: `${base}/`,
  screen: "Layouts #layouts-demo-shell EndAside ControlRow cluster wrap",
  consoleErrors: [],
};

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

  const cluster = page
    .locator("#layouts-demo-shell .fynns-end-aside .fynns-control-cluster")
    .first();
  await cluster.waitFor({ state: "visible", timeout: 10000 });

  const card = page
    .locator("#layouts-demo-shell .fynns-end-aside .fynns-card")
    .first();

  const geom = await cluster.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const card = el.closest(".fynns-card");
    const cardR = card?.getBoundingClientRect();
    const buttons = el.querySelectorAll(".fynns-btn:not(.fynns-btn--icon)");
    const firstBtn = buttons[0];
    const firstR = firstBtn?.getBoundingClientRect();
    return {
      clusterWidth: Math.round(r.width),
      clusterHeight: Math.round(r.height),
      clusterLeft: Math.round(r.left),
      clusterRight: Math.round(r.right),
      cardLeft: cardR ? Math.round(cardR.left) : null,
      cardRight: cardR ? Math.round(cardR.right) : null,
      firstButtonLeft: firstR ? Math.round(firstR.left) : null,
      buttonCount: buttons.length,
    };
  });

  const minAsidePx = await aside.evaluate((el) => {
    const cs = getComputedStyle(el);
    const min = cs.getPropertyValue("--fynns-layout-end-aside-min-width").trim();
    return Math.round(el.getBoundingClientRect().width);
  });

  metrics.asideWidth = await asideWidth();
  metrics.minAsideFloorPx = 280;
  metrics.geom = geom;

  const overflowPx =
    geom.cardRight != null ? geom.clusterRight - geom.cardRight : 0;
  const startClipPx =
    geom.cardLeft != null && geom.firstButtonLeft != null
      ? geom.cardLeft - geom.firstButtonLeft
      : 0;
  metrics.overflowPx = overflowPx;
  metrics.startClipPx = startClipPx;

  // Wrapped: taller than one 40dp button row OR no horizontal overflow past Card.
  const wrappedOrContained =
    geom.clusterHeight > 48 || overflowPx <= 1;
  metrics.wrappedOrContained = wrappedOrContained;

  metrics.pass =
    geom.buttonCount >= 4 &&
    wrappedOrContained &&
    startClipPx <= 1 &&
    metrics.asideWidth >= metrics.minAsideFloorPx - 2 &&
    metrics.consoleErrors.length === 0;

  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
  process.exit(metrics.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
