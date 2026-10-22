import { test, expect } from "@playwright/test";
import { layoutsDemo, openLayoutsDemo, resetSandboxSession } from "../helpers/sandbox";

test.beforeEach(async ({ page }) => resetSandboxSession(page));

test("overlay destinations dismiss after navigation, footer settings and Back", async ({ page }) => {
  await openLayoutsDemo(page, "drill-in");
  // Exercise a consumer's responsive overlay using the existing public shell recipe.
  await page.addStyleTag({ content: `
    @media (max-width: 56.25rem) {
      #layouts-demo-drill-in .fynns-clipped-nav-shell-body { grid-template-columns: minmax(0, 1fr); }
      #layouts-demo-drill-in .fynns-clipped-nav-shell-main { grid-column: 1; }
      #layouts-demo-drill-in .fynns-clipped-nav-shell-nav {
        position: absolute; inset-block: 0; inset-inline-start: 0;
        width: var(--fynns-navdrawer-width); z-index: 6;
      }
      #layouts-demo-drill-in [data-nav="hidden"] .fynns-clipped-nav-shell-nav { width: 0; }
      #layouts-demo-drill-in .fynns-clipped-nav-shell-resize { display: none; }
    }
  ` });
  await page.setViewportSize({ width: 850, height: 900 });
  const demo = layoutsDemo(page, "drill-in");
  const shell = demo.locator(".fynns-clipped-nav-shell");
  await expect(shell).toHaveAttribute("data-nav", "drawer");

  await demo.getByRole("button", { name: "Catalog", exact: true }).click();
  await expect(shell).toHaveAttribute("data-nav", "hidden");
  await demo.getByRole("button", { name: "Expand navigation", exact: true }).click();
  await expect(demo.getByRole("navigation", { name: "Catalog items" })).toBeVisible();
  await demo.getByRole("searchbox").fill("alpha");
  await expect(shell).toHaveAttribute("data-nav", "drawer");
  await demo.getByRole("button", { name: "Back to destinations", exact: true }).click();
  await expect(shell).toHaveAttribute("data-nav", "hidden");
  await expect(shell).not.toHaveAttribute("data-nav-axis");

  await demo.getByRole("button", { name: "Expand navigation", exact: true }).click();
  await demo.locator(".fynns-nav-drawer-footer button").click();
  await expect(shell).toHaveAttribute("data-nav", "hidden");

  await page.setViewportSize({ width: 1280, height: 900 });
  await demo.getByRole("button", { name: "Expand navigation", exact: true }).click();
  await demo.getByRole("button", { name: "Catalog", exact: true }).click();
  await expect(shell).toHaveAttribute("data-nav", "drawer");
  await demo.getByRole("button", { name: "Back to destinations", exact: true }).click();
  await expect(shell).toHaveAttribute("data-nav", "drawer");
});
