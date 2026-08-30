/**
 * Verify EndAside toggle does not flash workspace BusyRegion copy.
 * Usage: node scripts/_audit-shots/verify-end-aside-no-busy-flash.mjs [consumerUrl]
 */
import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:5274").replace(/\/$/, "");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "申请列表" }).click();
  await page.getByRole("button", { name: /adesso/ }).click();
  await page.waitForSelector(".fynns-end-aside-track[data-state='open']");

  const toggle = page.getByRole("button", {
    name: /求职信与技能推荐|Cover letter & skills/,
  });

  const samples = await page.evaluate(async () => {
    const toggle = document.querySelector(
      '[aria-label="求职信与技能推荐"], [aria-label="Cover letter & skills"]',
    );
    const busyText = /正在加载工作区|Loading workspace/;
    const read = () => {
      const busy = document.querySelector(
        ".fynns-destination-app-shell-canvas .fynns-busy-region",
      );
      const text = busy?.textContent ?? "";
      return {
        busyVisible: Boolean(busy && busyText.test(text)),
        busyLabel: text.trim().slice(0, 80),
      };
    };
    const out = [{ phase: "before", ...read() }];
    toggle?.click();
    const t0 = performance.now();
    while (performance.now() - t0 < 400) {
      out.push({ phase: "during", t: Math.round(performance.now() - t0), ...read() });
      await new Promise((r) => requestAnimationFrame(r));
    }
    return out;
  });

  const flash = samples.some((s) => s.phase === "during" && s.busyVisible);
  const result = {
    pass: !flash && consoleErrors.length === 0,
    url: `${base}/`,
    samples,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  if (!result.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
