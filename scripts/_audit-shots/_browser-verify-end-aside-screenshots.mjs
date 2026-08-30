/**
 * Visual browser verify: EndAside close mid-frame screenshots.
 * Usage: node scripts/_audit-shots/_browser-verify-end-aside-screenshots.mjs [sandboxUrl] [consumerUrl]
 */
import { chromium } from "playwright";

const sandboxUrl = (process.argv[2] ?? "http://localhost:5174").replace(/\/$/, "");
const consumerUrl = (process.argv[3] ?? "http://localhost:5274").replace(/\/$/, "");

async function sandboxShot(page, out) {
  await page.goto(`${sandboxUrl}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const layoutsNav = page
    .locator(".fynns-nav-drawer-item")
    .filter({ hasText: /Layout templates|布局模板/ })
    .first();
  await layoutsNav.click();
  await page.waitForTimeout(500);
  await page.locator("#layouts-demo-shell").scrollIntoViewIfNeeded();
  const asideSwitch = page.getByRole("switch", {
    name: /EndAside open|打开 EndAside/i,
  });
  if (await asideSwitch.isVisible()) {
    const pressed = await asideSwitch.getAttribute("aria-pressed");
    if (pressed !== "true") await asideSwitch.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${out}/sandbox-end-aside-open.png` });
  await asideSwitch.click();
  await page.waitForTimeout(80);
  await page.screenshot({ path: `${out}/sandbox-end-aside-mid-close.png` });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/sandbox-end-aside-closed.png` });
}

async function consumerShot(page, out) {
  await page.goto(`${consumerUrl}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "申请列表" }).click();
  await page.getByRole("button", { name: /adesso/ }).click();
  await page.waitForSelector(".fynns-end-aside-track[data-state='open']");
  await page.screenshot({ path: `${out}/consumer-end-aside-open.png` });
  const toggle = page.getByRole("button", {
    name: /求职信与技能推荐|Cover letter & skills/,
  });
  await toggle.click();
  await page.waitForTimeout(80);
  await page.screenshot({ path: `${out}/consumer-end-aside-mid-close.png` });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/consumer-end-aside-closed.png` });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const out = "scripts/_audit-shots";
try {
  await sandboxShot(page, out);
  await consumerShot(page, out);
  console.log(
    JSON.stringify({
      pass: errors.length === 0,
      consoleErrors: errors,
      screenshots: [
        `${out}/sandbox-end-aside-open.png`,
        `${out}/sandbox-end-aside-mid-close.png`,
        `${out}/sandbox-end-aside-closed.png`,
        `${out}/consumer-end-aside-open.png`,
        `${out}/consumer-end-aside-mid-close.png`,
        `${out}/consumer-end-aside-closed.png`,
      ],
    }),
  );
} finally {
  await browser.close();
}
