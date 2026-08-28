import { chromium } from "playwright";

const url = process.env.GSC_URL ?? "http://127.0.0.1:5173/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector(".gsc-editor-code textarea", { timeout: 60000 });
await page.waitForTimeout(800);

const metrics = await page.evaluate(() => {
  const host = document.querySelector(".gsc-editor-code");
  const ta = host?.querySelector("textarea");
  const pre = host?.querySelector("pre.fynns-code-block-highlight");
  const spans = pre
    ? [...pre.querySelectorAll("span[class*='fynns-code-']")]
    : [];
  return {
    hasHost: Boolean(host),
    className: host?.className ?? null,
    hasTextarea: Boolean(ta),
    taColor: ta ? getComputedStyle(ta).color : null,
    taWebkitFill: ta ? getComputedStyle(ta).webkitTextFillColor : null,
    hasHighlightPre: Boolean(pre),
    spanCount: spans.length,
    coloredSpans: spans.filter((s) => !s.className.includes("plain")).length,
    sample: spans.slice(0, 6).map((s) => ({
      c: s.className,
      t: (s.textContent ?? "").slice(0, 24),
    })),
    valueLen: ta?.value?.length ?? 0,
  };
});

console.log(JSON.stringify(metrics, null, 2));
await browser.close();
