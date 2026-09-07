/**
 * CONSUMER_TREATY slug:
 * `FieldStack Grid vertically centers short FieldBlock beside expanded Select`
 * AGENTS: `.fynns-grid` align-items start (≥ 0.5.172).
 * Sandbox: #form-recipe → #sandbox-field-stack-grid-select
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG =
  "FieldStack Grid vertically centers short FieldBlock beside expanded Select";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: FieldBlock labels stay top-aligned when Select expands`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "form-recipe", "form");
  const demo = globalsDemo(page, "form-recipe");
  const host = demo.locator("#sandbox-field-stack-grid-select");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const grid = host.locator(".fynns-grid");
  await expect(grid).toBeVisible();

  const agentBlock = host.locator(".fynns-field-block").filter({
    has: page.getByText("Agent", { exact: true }),
  });
  const projectBlock = host.locator(".fynns-field-block").filter({
    has: page.getByText("Project (cwd)", { exact: true }),
  });
  await expect(agentBlock).toBeVisible();
  await expect(projectBlock).toBeVisible();

  const projectSelect = projectBlock.locator(".fynns-select").first();
  const projectTrigger = projectSelect.locator("button.fynns-select-trigger");
  await projectTrigger.click();
  await expect(projectSelect).toHaveAttribute("data-expanded", "true");
  await expect(
    projectSelect.getByRole("option", { name: "sample-thesis" }),
  ).toBeVisible({ timeout: 10_000 });

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
});
