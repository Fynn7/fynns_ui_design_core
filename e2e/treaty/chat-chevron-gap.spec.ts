import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test("tool summaries and reasoning keep the same label-adjacent chevron through resize and output growth", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "chat-chevron", "chevron gap");
  const demo = globalsDemo(page, "chat-chevron");
  const geometry = () => demo.locator("[data-chevron-case]").evaluateAll((roots) => roots.map((root) => {
    const label = root.querySelector(".fynns-chat-activity-label, .fynns-chat-thinking-label")!;
    const chevron = root.querySelector(".fynns-chat-activity-chevron, .fynns-chat-thinking-chevron")!;
    // Measure text, not the flexible Tooltip wrapper that can hide empty space.
    const text = label.querySelector(".fynns-overflow-tip-label")?.firstChild ?? label.firstChild!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const labelBox = range.getBoundingClientRect();
    const chevronBox = chevron.getBoundingClientRect();
    return { gap: chevronBox.left - labelBox.right, x: chevronBox.x };
  }));
  const assertGap = async () => {
    await expect(async () => {
      const rows = await geometry();
      expect(rows).toHaveLength(6);
      for (const row of rows) expect(row.gap).toBeCloseTo(6, 1);
      // Identical labels, very different output lengths.
      expect(rows[0]!.x).toBeCloseTo(rows[2]!.x, 1);
    }).toPass({ timeout: 5000 });
  };
  await assertGap();
  const initial = await geometry();
  await demo.locator("[data-chat-chevron-host] button").evaluateAll((buttons) => buttons.forEach((button) => (button as HTMLButtonElement).click()));
  await expect(demo.locator('[data-chat-chevron-host] button[aria-expanded="true"]')).toHaveCount(6);
  await assertGap();
  await demo.getByRole("button", { name: "Grow output", exact: true }).click();
  await assertGap();
  const grown = await geometry();
  for (let index = 0; index < initial.length; index++) expect(grown[index]!.x).toBeCloseTo(initial[index]!.x, 1);
  await demo.getByRole("button", { name: "Narrow host", exact: true }).click();
  await assertGap();
  await demo.locator("[data-chat-chevron-host] button").evaluateAll((buttons) => buttons.forEach((button) => (button as HTMLButtonElement).click()));
  await expect(demo.locator('[data-chat-chevron-host] button[aria-expanded="false"]')).toHaveCount(6);
  await assertGap();
});
