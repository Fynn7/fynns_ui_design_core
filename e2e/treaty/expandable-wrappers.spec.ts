import { expect, test } from '@playwright/test';
import { openGlobalsDemo, resetSandboxSession } from '../helpers/sandbox';

for (const theme of ['dark', 'light']) {
  for (const width of [1280, 390]) {
    test(`complete disclosure wrappers at ${width}px in ${theme}`, async ({ page, context }, testInfo) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await resetSandboxSession(page);
      await page.setViewportSize({ width, height: 900 });
      await openGlobalsDemo(page, 'code-block', 'CodeBlock');
      if (width === 390) await page.getByRole('button', { name: 'Hide navigation', exact: true }).click();
      await page.evaluate(mode => document.documentElement.setAttribute('data-fynns-theme', mode), theme);

      const code = page.locator('#sandbox-content-expand');
      const source = await code.locator('code').textContent();
      const pre = code.locator('pre');
      const toggle = code.locator('.fynns-expand-toggle');
      await expect(toggle).toBeVisible();
      const collapsed = await pre.evaluate(el => el.getBoundingClientRect().height);
      const visibleLines = await pre.evaluate(el => {
        const css = getComputedStyle(el);
        return (el.clientHeight - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom)) / parseFloat(css.lineHeight);
      });
      expect(visibleLines).toBeCloseTo(5, 0);
      await code.getByRole('button', { name: 'Copy', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText().then(text => text.replace(/\r\n/g, '\n')))).toBe(source);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(await pre.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(collapsed * 2);
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(await pre.evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(collapsed, 0);
      expect(await code.locator('code').textContent()).toBe(source);

      const text = page.locator('#sandbox-content-expand-text');
      const longText = text.locator('.fynns-expandable-content').first();
      await expect(text.locator('.fynns-expand-toggle')).toHaveCount(1);
      const paragraph = longText.locator('p');
      const textHeight = await paragraph.evaluate(el => el.getBoundingClientRect().height);
      await longText.locator('button').click();
      expect(await paragraph.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(textHeight * 2);
      await longText.locator('button').click();
      expect(await paragraph.evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(textHeight, 0);

      const units = page.locator('#sandbox-content-expand-units');
      const body = units.locator('.fynns-expandable-content-body');
      const unitsToggle = units.locator('.fynns-expand-toggle');
      await expect(body).toBeHidden();
      await expect(units.getByRole('textbox')).toHaveCount(0);
      await unitsToggle.click();
      await expect(body).toBeVisible();
      await units.getByRole('textbox').fill('Preserved draft');
      await unitsToggle.click();
      await expect(body).toBeHidden();
      await unitsToggle.focus();
      await page.keyboard.press('Tab');
      expect(await body.evaluate(el => el.contains(document.activeElement))).toBe(false);
      await unitsToggle.click();
      await expect(units.getByRole('textbox')).toHaveValue('Preserved draft');
      await unitsToggle.click();
      const geometry = await code.locator('.fynns-expandable-code').evaluate(el => {
        const frame = el.getBoundingClientRect();
        const control = el.querySelector('button.fynns-expand-toggle')!.getBoundingClientRect();
        const pre = el.querySelector('pre')!.getBoundingClientRect();
        const css = getComputedStyle(el.querySelector('pre')!);
        const foot = getComputedStyle(el.querySelector('.fynns-expandable-code-foot')!);
        return {
          inside: control.bottom < frame.bottom && control.left > frame.left && control.right < frame.right,
          aligned: control.left - pre.left - parseFloat(css.paddingLeft),
          separator: foot.borderTopWidth,
          overflow: el.scrollWidth - el.clientWidth,
        };
      });
      expect(geometry.inside).toBe(true);
      expect(geometry.aligned).toBeCloseTo(0, 0);
      expect(geometry.separator).toBe('0px');
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(await unitsToggle.evaluate(el => !!el.closest('.fynns-card'))).toBe(true);
      if (width === 1280 && theme === 'dark') {
        await code.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await code.screenshot({ path: testInfo.outputPath('content-expand-code.png') });
        await units.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await units.screenshot({ path: testInfo.outputPath('content-expand-units.png') });
        await unitsToggle.click();
        await units.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await units.screenshot({ path: testInfo.outputPath('content-expand-units-open.png') });
        await text.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await text.screenshot({ path: testInfo.outputPath('content-expand-text.png') });
      }
    });
  }
}
