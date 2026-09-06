/**
 * CONSUMER_TREATY slug: `List path catalog Switch+Chip+danger disk soup`
 * AGENTS: enable = leading Checkbox; trailing = ghost md only; no Chip headline.
 * Sandbox: #list → #sandbox-list-repo-path-actions
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "List path catalog Switch+Chip+danger disk soup";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
  await page.setViewportSize({ width: 1400, height: 900 });
});

test(`${SLUG}: Checkbox lead + aligned ghost md end cluster`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "list", "List");
  const demo = globalsDemo(page, "list");
  const host = demo.locator("#sandbox-list-repo-path-actions");
  await expect(host).toBeVisible();
  await host.scrollIntoViewIfNeeded();

  const row = host.locator(".fynns-list-item-host").filter({
    has: page.getByText("sample-repo", { exact: true }),
  });
  await expect(row).toBeVisible();

  await expect(row.locator(".fynns-chip")).toHaveCount(0);
  await expect(row.locator(".fynns-switch")).toHaveCount(0);
  // Custom Checkbox paints a face; native input may be opacity:0 (not "visible").
  await expect(row.locator("input.fynns-checkbox-input")).toHaveCount(1);
  await expect(
    row.getByRole("checkbox", { name: "Include in batch", includeHidden: true }),
  ).toBeAttached();

  const icons = row.locator(
    ".fynns-list-item-trailing--end .fynns-control-cluster .fynns-btn--icon",
  );
  await expect(icons).toHaveCount(3);

  await expect(async () => {
    const boxes = await icons.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, height: r.height, left: r.left };
      }),
    );
    expect(boxes.length).toBe(3);
    for (const b of boxes) {
      expect(b.height).toBeGreaterThanOrEqual(36);
      expect(b.height).toBeLessThanOrEqual(44);
    }
    const tops = boxes.map((b) => b.top);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(2);
    // Same-size disks, left-to-right order with small gaps.
    expect(boxes[1].left).toBeGreaterThan(boxes[0].left);
    expect(boxes[2].left).toBeGreaterThan(boxes[1].left);
  }).toPass({ timeout: 10_000 });
});
