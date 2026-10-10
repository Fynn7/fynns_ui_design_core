import { expect, test } from "@playwright/test";
import { openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

for (const theme of ["dark", "light"]) {
  for (const width of [1400, 390]) {
    test("action gaps at " + width + "px in " + theme, async ({ page }) => {
      await resetSandboxSession(page);
      await page.setViewportSize({ width, height: 1000 });
      await openLayoutsDemo(page, "toolbar");
      if (width < 600) {
        await page.getByRole("banner").first().getByRole("button", { name: "Hide navigation", exact: true }).click();
      }
      await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
      const demo = page.locator("#sandbox-action-spacing");
      if (width < 600) await expect.poll(() => demo.evaluate(el => el.clientWidth)).toBeGreaterThan(280);
      await demo.scrollIntoViewIfNeeded();
      const rows = demo.locator(".fynns-toolbar-actions, :scope > .fynns-control-cluster");
      expect(await rows.count()).toBe(6);
      for (const row of await rows.all()) {
        const metrics = await row.evaluate(el => {
          const boxes = [...el.children].map(child => child.getBoundingClientRect());
          const cs = getComputedStyle(el);
          const vertical = cs.flexDirection === "column";
          return {
            gap: parseFloat(cs.gap),
            gaps: boxes.slice(1).flatMap((box, i) => {
              const prev = boxes[i];
              if (vertical) return [box.top - prev.bottom];
              if (Math.abs(box.top - prev.top) < 15) return [box.left - prev.right];
              return [];
            }),
            overflow: el.scrollWidth > el.clientWidth + 1,
          };
        });
        expect(metrics.gap).toBe(8);
        for (const gap of metrics.gaps) expect(gap).toBeCloseTo(8, 1);
        expect(metrics.overflow).toBe(false);
      }
      const icons = page.locator("#layouts-demo-toolbar .fynns-toolbar-actions");
      let iconRows = 0;
      for (const row of await icons.all()) {
        const onlyIcons = await row.evaluate(el => !el.querySelector(".fynns-btn:not(.fynns-btn--icon)"));
        if (onlyIcons) {
          iconRows++;
          expect(await row.evaluate(el => parseFloat(getComputedStyle(el).gap))).toBe(4);
        }
      }
      expect(iconRows).toBe(3);
      const split = demo.locator(".fynns-splitbtn");
      const joinedGap = await split.evaluate(el => {
        const buttons = el.querySelectorAll("button");
        return buttons[1].getBoundingClientRect().left - buttons[0].getBoundingClientRect().right;
      });
      expect(joinedGap).toBeCloseTo(0, 1);
      // A portaled menu must leave the inner action row's spacing unchanged.
      await demo.locator(".fynns-menu-trigger-btn").first().click();
      await expect(page.getByRole("menu")).toBeVisible();
      expect(await rows.first().evaluate(el => parseFloat(getComputedStyle(el).gap))).toBe(8);
    });

    test("drawer title boundaries at " + width + "px in " + theme, async ({ page }) => {
      await resetSandboxSession(page);
      await page.setViewportSize({ width, height: 1000 });
      await openLayoutsDemo(page, "navigation-drawer");
      await page.evaluate(value => document.documentElement.setAttribute("data-fynns-theme", value), theme);
      const demo = page.locator("#sandbox-navdrawer-title-spacing");
      await demo.scrollIntoViewIfNeeded();
      const metrics = await demo.evaluate(root => {
        const drawers = root.querySelectorAll(".fynns-nav-drawer");
        const lineTop = (el: Element) => el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop);
        const sheet = drawers[0].querySelector(".fynns-nav-drawer-headline")!;
        const titles = drawers[1].querySelectorAll(".fynns-nav-drawer-section-headline");
        const divider = drawers[1].querySelector(".fynns-divider")!;
        const items = drawers[1].querySelectorAll(".fynns-nav-drawer-item");
        return {
          sheetEdge: lineTop(sheet) - drawers[0].getBoundingClientRect().top,
          bodyEdge: lineTop(titles[0]) - drawers[1].getBoundingClientRect().top,
          dividerGap: lineTop(titles[1]) - divider.getBoundingClientRect().bottom,
          titleToItem: items[0].getBoundingClientRect().top - titles[0].getBoundingClientRect().bottom,
        };
      });
      expect(metrics.sheetEdge).toBeCloseTo(24, 1);
      expect(metrics.bodyEdge).toBeCloseTo(24, 1);
      expect(metrics.dividerGap).toBeCloseTo(16, 1);
      expect(metrics.titleToItem).toBeCloseTo(4, 1);
    });
  }
}
