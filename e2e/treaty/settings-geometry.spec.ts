import { expect, test } from "@playwright/test";
import { openGlobalsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"] as const) {
  for (const width of [1440, 390, 320]) {
    for (const locale of ["en", "zh"] as const) {
      test(`settings header, surfaces, status/Switch and path glyph geometry: ${theme}/${width}/${locale}`, async ({ page }) => {
        await resetSandboxSession(page);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await openLayoutsDemo(page, "settings-dialog");
        await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
        await page.getByRole("button", { name: "Open settings", exact: true }).click();
        const dialog = page.getByRole("dialog");
        if (locale === "zh") {
          await dialog.getByRole("radio", { name: "中文", exact: true }).click();
          await expect(dialog.getByRole("radio", { name: "中文", exact: true })).toBeEnabled();
        }
        await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
        const metrics = await dialog.evaluate(el => {
          const head = el.querySelector<HTMLElement>(".fynns-dialog-head")!;
          const title = head.querySelector("h2")!.getBoundingClientRect();
          const close = head.querySelector("button")!.getBoundingClientRect();
          const header = head.getBoundingClientRect();
          const row = el.querySelector<HTMLElement>(".fynns-settings-row--status")!;
          const label = row.querySelector(".fynns-control-row__label > .fynns-overflow-tip")!.getBoundingClientRect();
          const description = row.querySelector(".fynns-field-hint")!.getBoundingClientRect();
          const status = row.querySelector(".fynns-info-hint-trigger")!.getBoundingClientRect();
          const track = row.querySelector("[role=switch]")!.getBoundingClientRect();
          const language = el.querySelector(".fynns-toggle-group")!.getBoundingClientRect();
          const content = el.querySelector<HTMLElement>(".fynns-settings-content")!;
          const resolveColor = (token: string) => {
            const probe = document.createElement("span");
            probe.style.backgroundColor = `var(${token})`;
            el.append(probe);
            const color = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return color;
          };
          return {
            headerCenterError: Math.abs(title.top + title.height / 2 - header.top - header.height / 2),
            closeCenterError: Math.abs(title.top + title.height / 2 - close.top - close.height / 2),
            statusCenterError: Math.abs(status.top + status.height / 2 - track.top - track.height / 2),
            textCenterError: Math.abs((label.top + description.bottom) / 2 - track.top - track.height / 2),
            trailingError: Math.abs(language.right - track.right),
            headerColor: getComputedStyle(head).backgroundColor,
            contentColor: getComputedStyle(content).backgroundColor,
            expectedHeader: resolveColor("--fynns-color-surface-1"),
            expectedContent: resolveColor("--fynns-color-surface-2"),
            borderWidth: parseFloat(getComputedStyle(head).borderBottomWidth),
            overflow: el.scrollWidth - el.clientWidth,
          };
        });
        expect(metrics.headerCenterError).toBeLessThanOrEqual(1);
        expect(metrics.closeCenterError).toBeLessThanOrEqual(1);
        expect(metrics.statusCenterError).toBeLessThanOrEqual(1);
        expect(metrics.textCenterError).toBeLessThanOrEqual(1);
        // Narrow language choices stack at the start; the status row remains horizontal.
        if (width === 1440) expect(metrics.trailingError).toBeLessThanOrEqual(1);
        expect(metrics.headerColor).toBe(metrics.expectedHeader);
        expect(metrics.contentColor).toBe(metrics.expectedContent);
        expect(metrics.headerColor).not.toBe(metrics.contentColor);
        expect(metrics.borderWidth).toBe(1);
        expect(metrics.overflow).toBeLessThanOrEqual(1);
        await page.mouse.move(0, 0);
        await page.screenshot({ path: `.tmp/settings-correction/${theme}-${width}-${locale}-general.png` });

        await dialog.getByRole("button", { name: locale === "en" ? "Advanced" : "高级", exact: true }).click();
        const geometry = await dialog.locator(".fynns-field-shell").evaluate(el => {
          const shell = el.getBoundingClientRect();
          const glyph = el.querySelector(".fynns-field-affix--leading > svg")!.getBoundingClientRect();
          const input = el.querySelector("input")!;
          const textStart = input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft);
          return { inset: glyph.left - shell.left, gap: textStart - glyph.right, glyphWidth: glyph.width, overflow: el.scrollWidth - el.clientWidth };
        });
        expect(geometry.inset).toBeGreaterThanOrEqual(16);
        expect(geometry.inset).toBeLessThanOrEqual(18);
        expect(geometry.gap).toBeCloseTo(16, 0);
        expect(geometry.glyphWidth).toBe(16);
        expect(geometry.overflow).toBeLessThanOrEqual(1);
        await page.screenshot({ path: `.tmp/settings-correction/${theme}-${width}-${locale}-advanced.png` });
      });
    }
  }
}

test("the shared Input leading glyph recipe keeps its inset outside settings", async ({ page }) => {
  await resetSandboxSession(page);
  await openGlobalsDemo(page, "input", "Input");
  const input = page.locator("#sandbox-input-leading-affix");
  const metrics = await input.evaluate(el => {
    const shell = el.closest(".fynns-field-shell")!;
    const glyph = shell.querySelector(".fynns-field-affix--leading > svg")!.getBoundingClientRect();
    return { inset: glyph.left - shell.getBoundingClientRect().left,
      gap: el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft) - glyph.right };
  });
  expect(metrics.inset).toBeGreaterThanOrEqual(16);
  expect(metrics.gap).toBeCloseTo(16, 0);
});
