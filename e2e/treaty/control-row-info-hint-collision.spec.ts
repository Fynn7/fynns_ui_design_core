/** CONSUMER_TREATY: preference InfoHint overlaps Switch / uneven icon column. */
import { expect, test } from "@playwright/test";
import { globalsDemo, openGlobalsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

for (const width of [1280, 600]) {
  test(`long preference label keeps text, help, and Switch apart at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openGlobalsDemo(page, "info-hint", "info-hint");
    const stack = globalsDemo(page, "info-hint").locator("#sandbox-control-row-tip-wrap .fynns-control-stack");
    await expect(stack).toBeVisible();

    const geometry = await stack.evaluate((stackHost) => {
      const rows = stackHost.querySelectorAll(".fynns-control-row");
      if (rows.length !== 2) return null;
      const host = rows[0];
      const text = host.querySelector(".fynns-overflow-tip-label");
      const help = host.querySelector(".fynns-info-hint-trigger--icon");
      const toggle = host.querySelector(".fynns-switch");
      const label = host.querySelector(".fynns-control-row__label");
      if (!text || !help || !toggle || !label) return null;
      const tr = text.getBoundingClientRect();
      const hr = help.getBoundingClientRect();
      const sr = toggle.getBoundingClientRect();
      const lr = label.getBoundingClientRect();
      const nextHelp = rows[1].querySelector(".fynns-info-hint-trigger--icon");
      const nextSwitch = rows[1].querySelector(".fynns-switch");
      if (!nextHelp || !nextSwitch) return null;
      const nr = rows[1].getBoundingClientRect();
      return {
        textRight: tr.right,
        helpLeft: hr.left,
        helpRight: hr.right,
        helpCenterY: (hr.top + hr.bottom) / 2,
        labelRight: lr.right,
        labelCenterY: (lr.top + lr.bottom) / 2,
        switchLeft: sr.left,
        switchRight: sr.right,
        rowRight: host.getBoundingClientRect().right,
        rowBottom: host.getBoundingClientRect().bottom,
        nextRowTop: nr.top,
        nextHelpLeft: nextHelp.getBoundingClientRect().left,
        nextSwitchLeft: nextSwitch.getBoundingClientRect().left,
      };
    });
    expect(geometry).not.toBeNull();
    expect(geometry!.textRight).toBeLessThanOrEqual(geometry!.helpLeft + 1);
    expect(geometry!.helpRight).toBeLessThanOrEqual(geometry!.labelRight + 1);
    expect(geometry!.helpRight).toBeLessThanOrEqual(geometry!.switchLeft + 1);
    expect(geometry!.switchRight).toBeLessThanOrEqual(geometry!.rowRight + 1);
    expect(Math.abs(geometry!.helpCenterY - geometry!.labelCenterY)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry!.helpLeft - geometry!.nextHelpLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry!.switchLeft - geometry!.nextSwitchLeft)).toBeLessThanOrEqual(1);
    expect(geometry!.rowBottom).toBeLessThanOrEqual(geometry!.nextRowTop);
  });
}
