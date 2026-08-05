/**
 * Single-case ClippedNavShell / EndAside scale probe.
 * Usage: node scripts/shell-scale-case.mjs --id=01 --w=1280 --h=800 --zoom=1 --nav=drawer --aside=1
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const id = arg("id", "00");
const width = Number(arg("w", "1280"));
const height = Number(arg("h", "800"));
const zoom = Number(arg("zoom", "1"));
const nav = arg("nav", "drawer"); // drawer | rail | hidden
const asideOn = arg("aside", "1") !== "0";
const outDir = path.resolve("scripts/_scale-out");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  // Ignore noisy favicon / source-map 404s.
  if (/404|Failed to load resource|net::ERR_/i.test(text)) return;
  errors.push(`console: ${text}`);
});

await page.goto("http://localhost:5174/?v=scale-" + id, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForTimeout(400);

if (zoom !== 1) {
  await page.evaluate((z) => {
    document.documentElement.style.zoom = String(z);
  }, zoom);
}

await page.getByRole("button", { name: /^(组件|Components)$/ }).click();
await page.waitForTimeout(500);

await page.evaluate(() => {
  const cats = [...document.querySelectorAll(".sandbox-globals-category")];
  const navCat = cats.find(
    (c) =>
      (c.querySelector(".fynns-collapsible-title")?.textContent || "").trim() ===
        "导航" ||
      /Navigation/i.test(
        c.querySelector(".fynns-collapsible-title")?.textContent || "",
      ),
  );
  if (navCat && !navCat.classList.contains("fynns-collapsible--open")) {
    navCat.querySelector(".fynns-collapsible-trigger")?.click();
  }
});
await page.waitForTimeout(400);

await page.evaluate(
  ({ nav, asideOn }) => {
    const switches = [...document.querySelectorAll("[role=switch]")];
    const findSwitch = (re) =>
      switches.find((s) => {
        const wrap = s.closest("label") || s.parentElement?.parentElement || s;
        return re.test(wrap?.textContent || "");
      });

    const dest = findSwitch(/打开目的地|destination|目的地/);
    const aside = findSwitch(/打开 EndAside|EndAside/);

    const setChecked = (el, want) => {
      if (!el) return;
      const on = el.getAttribute("aria-checked") === "true";
      if (on !== want) el.click();
    };

    if (nav === "hidden") {
      setChecked(dest, false);
    } else {
      setChecked(dest, true);
    }
    setChecked(aside, asideOn);
  },
  { nav, asideOn },
);
await page.waitForTimeout(300);

// Rail: open destinations then crowd via narrow main is automatic; force compact
// by clicking toggle closed then open if needed, or set via crowding.
if (nav === "rail") {
  await page.evaluate(() => {
    // Click nav toggle to ensure open, then shrink frame to crowd if possible.
    const shell = document.querySelector(
      ".sandbox-globals-clipped-shell > .fynns-clipped-nav-shell",
    );
    if (!shell) return;
    // Prefer data-nav=rail via onNavCrowded: temporarily shrink host.
  });
  await page.evaluate(() => {
    const host = document.querySelector(".sandbox-globals-clipped-shell");
    if (host) {
      host.style.maxWidth = "22rem";
      host.style.width = "22rem";
    }
  });
  await page.waitForTimeout(500);
  // Restore width but keep rail if crowded flag stuck
  await page.evaluate(() => {
    const host = document.querySelector(".sandbox-globals-clipped-shell");
    if (host) {
      host.style.maxWidth = "";
      host.style.width = "";
    }
  });
  await page.waitForTimeout(300);
}

const frame = page.locator(".sandbox-globals-clipped-shell");
await frame.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(200);

const shotPath = path.join(outDir, `${id}.png`);
await frame.screenshot({ path: shotPath }).catch(async () => {
  await page.screenshot({ path: shotPath, fullPage: false });
});

const metrics = await page.evaluate(() => {
  const frame = document.querySelector(".sandbox-globals-clipped-shell");
  const shell = frame?.querySelector(":scope > .fynns-clipped-nav-shell");
  const main = shell?.querySelector(".fynns-clipped-nav-shell-main");
  const aside = shell?.querySelector(".fynns-end-aside");
  const body = shell?.querySelector(".sandbox-globals-shell-body");
  const outerAside = document.querySelector(
    ".fynns-clipped-nav-shell-main > .fynns-end-aside, .sandbox-body ~ .fynns-end-aside, aside.fynns-end-aside",
  );
  // Prefer outer sandbox EndAside (inspector)
  const sandboxRoot = document.querySelector(".sandbox-root.fynns-clipped-nav-shell");
  const appAside = sandboxRoot?.querySelector(
    ".fynns-clipped-nav-shell-main > .sandbox-body ~ *, .fynns-end-aside",
  );
  const outer =
    [...document.querySelectorAll(".fynns-end-aside")].find(
      (el) => !frame?.contains(el),
    ) || null;

  function box(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      l: Math.round(r.left),
      t: Math.round(r.top),
      r: Math.round(r.right),
      b: Math.round(r.bottom),
      pos: cs.position,
      minW: cs.minWidth,
      overflow: cs.overflow,
    };
  }

  const fr = frame?.getBoundingClientRect();
  const ar = aside?.getBoundingClientRect();
  const child = aside?.firstElementChild?.getBoundingClientRect();
  const or = outer?.getBoundingClientRect();

  const nestedOverflow = !fr || !ar
    ? null
    : Math.max(0, Math.round(ar.right - fr.right), Math.round(fr.left - ar.left));

  const childOverflow =
    !ar || !child ? null : Math.max(0, Math.round(child.width - ar.width + 0.5));

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const outerOverflowX = outer
    ? Math.max(0, Math.round(or.right - viewportW), Math.round(-or.left))
    : null;

  // Any descendant wider than frame?
  let maxChildBleed = 0;
  if (frame) {
    for (const el of frame.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      maxChildBleed = Math.max(
        maxChildBleed,
        r.right - fr.right,
        fr.left - r.left,
      );
    }
  }

  return {
    navMode: shell?.getAttribute("data-nav") ?? null,
    hasFrame: !!frame,
    hasNestedAside: !!aside,
    hasOuterAside: !!outer,
    frame: box(frame),
    main: box(main),
    nestedAside: box(aside),
    body: box(body),
    outerAside: box(outer),
    nestedOverflowPx: nestedOverflow,
    childOverflowPx: childOverflow,
    outerOverflowXPx: outerOverflowX,
    frameScrollOverflow:
      frame != null && frame.scrollWidth > frame.clientWidth + 1,
    mainScrollOverflow:
      main != null && main.scrollWidth > main.clientWidth + 1,
    maxChildBleedPx: Math.round(Math.max(0, maxChildBleed)),
    zoomStyle: document.documentElement.style.zoom || "1",
  };
});

const failReasons = [];
if (!metrics.hasFrame) failReasons.push("missing-frame");
if (metrics.nestedOverflowPx > 0) failReasons.push(`nested-overflow:${metrics.nestedOverflowPx}`);
if (metrics.childOverflowPx > 1) failReasons.push(`child-overflow:${metrics.childOverflowPx}`);
if (metrics.frameScrollOverflow) failReasons.push("frame-scroll-overflow");
if (metrics.mainScrollOverflow) failReasons.push("main-scroll-overflow");
if (metrics.maxChildBleedPx > 2) failReasons.push(`child-bleed:${metrics.maxChildBleedPx}`);
if (metrics.outerOverflowXPx > 2) failReasons.push(`outer-overflow-x:${metrics.outerOverflowXPx}`);
if (asideOn && !metrics.hasNestedAside && metrics.navMode !== null) {
  failReasons.push("aside-expected-missing");
}
/* Crushed aside: open, not closing, narrower than ~10rem while main also tiny
 * and still in drawer (crowding should densify to rail first). */
if (
  asideOn &&
  metrics.hasNestedAside &&
  metrics.nestedAside &&
  metrics.nestedAside.w < 140 &&
  metrics.main &&
  metrics.main.w < 140 &&
  metrics.navMode === "drawer"
) {
  failReasons.push(`crushed-aside-drawer:${metrics.nestedAside.w}`);
}
if (errors.length) failReasons.push(`page-errors:${errors.length}`);

const result = {
  id,
  width,
  height,
  zoom,
  navRequested: nav,
  asideOn,
  shotPath,
  metrics,
  errors: errors.slice(0, 8),
  pass: failReasons.length === 0,
  failReasons,
};

const jsonPath = path.join(outDir, `${id}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
process.exit(result.pass ? 0 : 2);
