/**
 * CONSUMER_TREATY slugs:
 * `FieldStack Grid vertically centers short FieldBlock beside expanded Select`
 * `FieldStack Grid hugs max-content leaving dead gutter in form Surface`
 * AGENTS: `.fynns-grid` align-items start (≥ 0.5.172); fixed-x fill (≥ 0.5.211).
 * Sandbox: #form-recipe → #sandbox-field-stack-grid-select (Card FormRecipeFields)
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG_ALIGN =
  "FieldStack Grid vertically centers short FieldBlock beside expanded Select";
const SLUG_FILL =
  "FieldStack Grid hugs max-content leaving dead gutter in form Surface";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG_ALIGN} + ${SLUG_FILL}: top-align + fill Card body`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "form-recipe", "form");
  const demo = globalsDemo(page, "form-recipe");
  const host = demo.locator("#sandbox-field-stack-grid-select");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const card = host.locator(".fynns-card").first();
  const grid = host.locator(".fynns-grid").first();
  await expect(grid).toBeVisible();

  const agentBlock = host.locator(".fynns-field-block").filter({
    has: page.getByText("Agent", { exact: true }),
  });
  const projectBlock = host.locator(".fynns-field-block").filter({
    has: page.getByText("Project (cwd)", { exact: true }),
  });
  await expect(agentBlock).toBeVisible();
  await expect(projectBlock).toBeVisible();

  // Fixed-x fill (≥ 0.5.211): grid spans the Card body content box.
  await expect(async () => {
    const fill = await page.evaluate(() => {
      const h = document.querySelector(
        "#sandbox-field-stack-grid-select",
      ) as HTMLElement | null;
      const body = h?.querySelector(".fynns-card-body") as HTMLElement | null;
      const g = h?.querySelector(".fynns-grid") as HTMLElement | null;
      if (!body || !g) return null;
      const br = body.getBoundingClientRect();
      const gr = g.getBoundingClientRect();
      const cs = getComputedStyle(body);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const contentW = br.width - padL - padR;
      return {
        gridW: gr.width,
        contentW,
        delta: Math.abs(gr.width - contentW),
        template: getComputedStyle(g).gridTemplateColumns,
      };
    });
    expect(fill).toBeTruthy();
    if (!fill) return;
    expect(fill.delta).toBeLessThan(4);
    expect(fill.gridW).toBeGreaterThan(400);
    const tracks = fill.template
      .trim()
      .split(/\s+/)
      .map((t) => parseFloat(t))
      .filter((n) => Number.isFinite(n));
    expect(tracks.length).toBeGreaterThanOrEqual(2);
    expect(Math.abs(tracks[0] - tracks[1])).toBeLessThan(4);
    expect(tracks[0]).toBeGreaterThan(fill.gridW * 0.4);
  }).toPass({ timeout: 5_000 });

  const projectSelect = projectBlock.locator(".fynns-select").first();
  const projectTrigger = projectSelect.locator("button.fynns-select-trigger");
  await projectTrigger.click();
  await expect(projectSelect).toHaveAttribute("data-expanded", "true");
  await expect(
    page.locator(".fynns-select-menu[role='listbox']").getByRole("option", {
      name: "sample-thesis",
    }),
  ).toBeVisible({ timeout: 10_000 });

  await expect(async () => {
    const hostH = await projectSelect.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    expect(hostH).toBeLessThan(56);
  }).toPass({ timeout: 5_000 });

  await expect(async () => {
    const geometry = await projectSelect.evaluate((el) => {
      const hostEl = el as HTMLElement;
      const field = hostEl.querySelector(
        ":scope > .fynns-search-bar-field",
      ) as HTMLElement | null;
      const menu = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      if (!field || !menu) return null;
      const measureRaw = getComputedStyle(hostEl)
        .getPropertyValue("--fynns-select-measure-min")
        .trim();
      const measurePx = parseFloat(measureRaw);
      const fw = field.getBoundingClientRect().width;
      const mw = menu.getBoundingClientRect().width;
      return {
        measurePx,
        fieldW: fw,
        menuW: mw,
        fieldAtLeastMeasure: fw + 1 >= measurePx,
        menuAtLeastField: mw + 1 >= fw,
      };
    });
    expect(geometry).toBeTruthy();
    if (!geometry) return;
    expect(geometry.measurePx).toBeGreaterThan(120);
    expect(geometry.fieldAtLeastMeasure).toBe(true);
    expect(geometry.menuAtLeastField).toBe(true);
    expect(geometry.fieldW).toBeGreaterThan(geometry.measurePx + 40);
  }).toPass({ timeout: 10_000 });

  await expect(async () => {
    const align = await grid.evaluate((el) => getComputedStyle(el).alignItems);
    expect(align).toBe("start");

    const tops = await Promise.all([
      agentBlock.locator(".fynns-field-header").first().evaluate((el) =>
        el.getBoundingClientRect().top,
      ),
      projectBlock.locator(".fynns-field-header").first().evaluate((el) =>
        el.getBoundingClientRect().top,
      ),
    ]);
    expect(Math.abs(tops[0] - tops[1])).toBeLessThan(2);

    const blockTops = await Promise.all([
      agentBlock.evaluate((el) => el.getBoundingClientRect().top),
      projectBlock.evaluate((el) => el.getBoundingClientRect().top),
    ]);
    expect(Math.abs(blockTops[0] - blockTops[1])).toBeLessThan(2);
  }).toPass({ timeout: 10_000 });

  await expect(card).toBeVisible();
});

test(`Select menu under Dialog overlay: Project Select options above modal`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "form-recipe", "form");
  const demo = globalsDemo(page, "form-recipe");
  await demo.getByRole("button", { name: "Open Dialog form" }).click();
  const dialog = page.locator(".fynns-dialog-overlay");
  await expect(dialog).toBeVisible();

  const projectBlock = dialog.locator(".fynns-field-block").filter({
    has: page.getByText("Project (cwd)", { exact: true }),
  });
  const trigger = projectBlock.locator("button.fynns-select-trigger");
  await trigger.click();

  const menu = page.locator(".fynns-select-menu[role='listbox']");
  await expect(menu).toBeVisible({ timeout: 10_000 });
  await expect(
    menu.getByRole("option", { name: "sample-thesis" }),
  ).toBeVisible();

  await expect(async () => {
    const stack = await page.evaluate(() => {
      const menuEl = document.querySelector(
        ".fynns-select-menu[role='listbox']",
      ) as HTMLElement | null;
      const overlay = document.querySelector(
        ".fynns-dialog-overlay",
      ) as HTMLElement | null;
      if (!menuEl || !overlay) return null;
      const mz = parseFloat(getComputedStyle(menuEl).zIndex);
      const oz = parseFloat(getComputedStyle(overlay).zIndex);
      const box = menuEl.getBoundingClientRect();
      const top = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + Math.min(24, box.height / 2),
      );
      return {
        menuZ: mz,
        overlayZ: oz,
        above: mz > oz,
        hitMenu: !!(top && top.closest(".fynns-select-menu")),
      };
    });
    expect(stack).toBeTruthy();
    if (!stack) return;
    expect(stack.above).toBe(true);
    expect(stack.hitMenu).toBe(true);
  }).toPass({ timeout: 5_000 });
});
