import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.argv[2] ?? "http://localhost:5174";
const outDir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${baseUrl}/#rhythm`, { waitUntil: "networkidle", timeout: 60000 });

const rhythmBtn = page.getByRole("button", {
  name: /Toolbar|unit rhythm|工具条|节奏/i,
});
await rhythmBtn.waitFor({ state: "visible", timeout: 15000 });
if ((await rhythmBtn.getAttribute("aria-expanded")) !== "true") await rhythmBtn.click();

const cluster = page.locator(".sandbox-globals-rhythm-cover-letter .fynns-control-cluster");
await cluster.scrollIntoViewIfNeeded();

const metrics = await cluster.evaluate((el) => {
  const kids = [...el.children];
  const boxes = kids.map((k) => {
    const r = k.getBoundingClientRect();
    return {
      cls: k.className,
      left: r.left,
      right: r.right,
      text: k.textContent?.trim().slice(0, 40),
    };
  });
  const last = boxes[boxes.length - 1];
  const primaryLast =
    last?.cls.includes("fynns-btn--primary") ||
    last?.text?.includes("Run sample") ||
    last?.text?.includes("运行示例");
  const firstPrimary = boxes[0]?.cls.includes("fynns-btn--primary");
  return { boxes, primaryLast, firstPrimary };
});

console.log(JSON.stringify(metrics, null, 2));
await browser.close();
process.exit(metrics.primaryLast && !metrics.firstPrimary ? 0 : 1);
