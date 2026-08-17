import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const results = [];
const shotDir = join(process.cwd(), "scripts", "_verify-shots");
mkdirSync(shotDir, { recursive: true });

function pass(name, detail) {
  results.push({ ok: true, name, detail });
}

function fail(name, detail) {
  results.push({ ok: false, name, detail });
}

function measureNavSearchGap(drawer) {
  if (!drawer) return null;
  const searchBar = drawer.querySelector(".fynns-search-bar");
  const searchHost =
    searchBar?.closest(".hub-mode-nav-tools") ??
    searchBar?.closest(".fynns-nav-drawer-body > div") ??
    searchBar?.parentElement;
  if (!searchHost) return null;
  const next = searchHost.nextElementSibling;
  if (!next) return null;
  const rs = searchHost.getBoundingClientRect();
  const rn = next.getBoundingClientRect();
  const items = drawer.querySelectorAll(".fynns-navdrawer-item");
  let itemGap = null;
  if (items.length >= 2) {
    const r0 = items[0].getBoundingClientRect();
    const r1 = items[1].getBoundingClientRect();
    itemGap = Math.round(r1.top - r0.bottom);
  }
  return {
    searchToNext: Math.round(rn.top - rs.bottom),
    itemGap,
  };
}

async function verifyHub(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  const failedRequests = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  });

  await page.goto("http://localhost:5180/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  const navToggle = page.getByRole("button", { name: /打开导航|收起导航/ });
  if (await navToggle.count()) {
    const pressed = await navToggle.getAttribute("aria-pressed");
    if (pressed === "false") await navToggle.click();
  }

  const navGapHome = await page.evaluate(() => {
    const drawer = document.querySelector(".fynns-nav-drawer");
    if (!drawer) return null;
    const searchBar = drawer.querySelector(".fynns-search-bar");
    const searchHost =
      searchBar?.closest(".hub-mode-nav-tools") ??
      searchBar?.closest(".fynns-nav-drawer-body > div") ??
      searchBar?.parentElement;
    if (!searchHost) return null;
    const next = searchHost.nextElementSibling;
    if (!next) return null;
    const rs = searchHost.getBoundingClientRect();
    const rn = next.getBoundingClientRect();
    const items = drawer.querySelectorAll(".fynns-nav-drawer-item");
    let itemGap = null;
    if (items.length >= 2) {
      const r0 = items[0].getBoundingClientRect();
      const r1 = items[1].getBoundingClientRect();
      itemGap = Math.round(r1.top - r0.bottom);
    }
    return {
      searchToNext: Math.round(rn.top - rs.bottom),
      itemGap,
    };
  });
  if (navGapHome) {
    if (navGapHome.searchToNext >= 14)
      pass("hub:nav-search-gap-home", `SearchBar→首项 ${navGapHome.searchToNext}px`);
    else fail("hub:nav-search-gap-home", `仅 ${navGapHome.searchToNext}px`);
    if (navGapHome.itemGap != null && navGapHome.itemGap <= 6)
      pass("hub:nav-item-gap-home", `Item↔Item ${navGapHome.itemGap}px`);
    else if (navGapHome.itemGap != null)
      fail("hub:nav-item-gap-home", `Item↔Item ${navGapHome.itemGap}px`);
  } else {
    fail("hub:nav-search-gap-home", "未找到侧栏 SearchBar");
  }

  await page.screenshot({ path: join(shotDir, "hub-nav.png"), fullPage: false });

  const usageBtn = page.getByRole("button", { name: /^用量$/ }).first();
  if (await usageBtn.count()) {
    await usageBtn.click();
    await page.waitForTimeout(1500);
  }

  const hubSpread = await page.locator(".hub-spread").count();
  if (hubSpread === 0) pass("hub:no-hub-spread", "用量表尾无 hub-spread");
  else fail("hub:no-hub-spread", `仍发现 ${hubSpread} 个 .hub-spread`);

  const footer = await page.evaluate(() => {
    const card = [...document.querySelectorAll(".fynns-card")].find((c) =>
      c.textContent?.includes("用量明细"),
    );
    if (!card) return null;
    const pag = card.querySelector(".fynns-pagination");
    if (!pag) return null;
    const cluster = pag.previousElementSibling;
    if (!cluster?.classList.contains("fynns-control-cluster")) return { missing: true };
    const rc = cluster.getBoundingClientRect();
    const rp = pag.getBoundingClientRect();
    const list = pag.querySelector(".fynns-pagination-list");
    const rl = list?.getBoundingClientRect();
    return {
      stacked: rp.top >= rc.bottom - 1,
      gap: Math.round(rp.top - rc.bottom),
      clusterWidth: Math.round(rc.width),
      pagWidth: Math.round(rp.width),
      listHeight: rl ? Math.round(rl.height) : null,
      nowrap: list ? getComputedStyle(list).flexWrap === "nowrap" : false,
    };
  });

  if (!footer) fail("hub:usage-footer", "未找到用量明细表尾");
  else if (footer.missing) fail("hub:usage-footer", "Pagination 前兄弟不是 control-cluster");
  else {
    if (footer.stacked && footer.gap <= 24)
      pass("hub:usage-stacked", `上下堆叠 gap=${footer.gap}px`);
    else if (footer.stacked)
      pass("hub:usage-stacked", `上下堆叠（gap=${footer.gap}px，Card body unit-stack）`);
    else fail("hub:usage-stacked", "Select 与 Pagination 仍并排");
    if (footer.nowrap && (footer.listHeight ?? 0) <= 40)
      pass("hub:pagination-nowrap", `单行页码，list 高 ${footer.listHeight}px`);
    else fail("hub:pagination-nowrap", `list 高 ${footer.listHeight}px 或 wrap 未关闭`);
    if (footer.pagWidth < footer.clusterWidth - 8)
      pass("hub:pagination-content-width", `分页 ${footer.pagWidth}px（内容宽度，cluster ${footer.clusterWidth}px）`);
    else fail("hub:pagination-content-width", `分页仍撑满 ${footer.pagWidth}px`);
  }

  await page.screenshot({ path: join(shotDir, "hub-usage.png"), fullPage: false });

  const statsGrid = await page.evaluate(() => {
    const grid = document.querySelector(".hub-grid--stats");
    if (!grid) return null;
    const tiles = [...grid.querySelectorAll(".fynns-surface")];
    if (tiles.length < 2) return { missing: true };
    const tops = tiles.map((t) => Math.round(t.getBoundingClientRect().top));
    const cols = new Set(tops).size;
    const minCol = getComputedStyle(document.documentElement)
      .getPropertyValue("--fynns-layout-stats-min-col")
      .trim();
    return { cols, tileCount: tiles.length, minCol };
  });

  if (!statsGrid) fail("hub:stats-grid", "未找到 .hub-grid--stats");
  else if (statsGrid.missing) fail("hub:stats-grid", "指标卡不足");
  else if (statsGrid.cols >= 2)
    pass("hub:stats-grid", `${statsGrid.tileCount} 卡 / ${statsGrid.cols} 行（min-col=${statsGrid.minCol}）`);
  else fail("hub:stats-grid", `仍单列堆叠（min-col=${statsGrid.minCol || "缺失"}）`);

  if (consoleErrors.length) fail("hub:console", consoleErrors.slice(0, 5).join(" | "));
  else pass("hub:console", "无 console error");
  if (failedRequests.length) fail("hub:network", failedRequests.slice(0, 5).join(" | "));
  else pass("hub:network", "无 4xx/5xx");

  await page.close();
}

async function verifySandbox(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("http://localhost:5174/", { waitUntil: "networkidle", timeout: 60000 });
  await page.getByLabel("Components", { exact: true }).click();
  await page.waitForTimeout(800);
  const navCat = page.getByRole("button", { name: /^Navigation$/ });
  if (await navCat.count()) {
    const expanded = await navCat.getAttribute("aria-expanded");
    if (expanded === "false") await navCat.click();
  }
  await page.waitForTimeout(600);
  await page.locator("#globals-demo-pagination").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const pagDemo = await page.evaluate(() => {
    const host = document.querySelector("#globals-demo-pagination");
    if (!host) return null;
    const card = host.querySelector(".fynns-card");
    const pag = card?.querySelector(".fynns-pagination");
    if (!card || !pag) return null;
    const cluster = pag.previousElementSibling;
    const rc = cluster?.getBoundingClientRect();
    const rp = pag.getBoundingClientRect();
    const list = pag.querySelector(".fynns-pagination-list");
    const rl = list?.getBoundingClientRect();
    return {
      nowrap: list ? getComputedStyle(list).flexWrap === "nowrap" : false,
      stacked: rc ? rp.top >= rc.bottom - 1 : null,
      gap: rc ? Math.round(rp.top - rc.bottom) : null,
      listHeight: rl ? Math.round(rl.height) : null,
      pagWidth: Math.round(rp.width),
    };
  });

  if (!pagDemo) fail("sandbox:pagination", "未找到 #globals-demo-pagination Card demo");
  else {
    if (pagDemo.stacked) pass("sandbox:pagination-stack", `上下堆叠 gap=${pagDemo.gap}px`);
    else fail("sandbox:pagination-stack", "未上下堆叠");
    if (pagDemo.nowrap && (pagDemo.listHeight ?? 0) <= 40)
      pass("sandbox:pagination-nowrap", `list 高 ${pagDemo.listHeight}px`);
    else fail("sandbox:pagination-nowrap", "页码折行或未 nowrap");
  }

  await page.screenshot({ path: join(shotDir, "sandbox-pagination.png"), fullPage: false });

  await page.getByLabel("Layout templates", { exact: true }).click();
  await page.waitForTimeout(800);
  await page.locator("#layouts-demo-navigation-drawer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const navGap = await page.evaluate(() => {
    const demo = document.querySelector("#layouts-demo-navigation-drawer");
    const drawer = demo?.querySelector(".fynns-nav-drawer");
    if (!drawer) return null;
    const searchBar = drawer.querySelector(".fynns-search-bar");
    const searchHost =
      searchBar?.closest(".hub-mode-nav-tools") ??
      searchBar?.closest(".fynns-nav-drawer-body > div") ??
      searchBar?.parentElement;
    if (!searchHost) return null;
    const next = searchHost.nextElementSibling;
    if (!next) return null;
    const rs = searchHost.getBoundingClientRect();
    const rn = next.getBoundingClientRect();
    return { searchToNext: Math.round(rn.top - rs.bottom) };
  });

  if (navGap && navGap.searchToNext >= 14)
    pass("sandbox:nav-search-gap", `SearchBar→首项 ${navGap.searchToNext}px`);
  else if (navGap) fail("sandbox:nav-search-gap", `仅 ${navGap.searchToNext}px`);
  else fail("sandbox:nav-search-gap", "Layouts demo 未找到 SearchBar");

  await page.screenshot({ path: join(shotDir, "sandbox-navdrawer.png"), fullPage: false });

  if (consoleErrors.length) fail("sandbox:console", consoleErrors.slice(0, 5).join(" | "));
  else pass("sandbox:console", "无 console error");

  await page.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await verifyHub(browser);
  await verifySandbox(browser);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ passed: results.filter((r) => r.ok).length, failed: failed.length, shotDir, results }, null, 2));
process.exit(failed.length ? 1 : 0);
