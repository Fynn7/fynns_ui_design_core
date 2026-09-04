import { expect, type Page } from "@playwright/test";

/** Wipe session/locale so nav labels stay English and categories start closed. */
export async function resetSandboxSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
}

async function goHome(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator(".fynns-nav-drawer-item").first()).toBeVisible({
    timeout: 30_000,
  });
}

async function openNavPage(
  page: Page,
  label: "Components" | "Layout templates",
): Promise<void> {
  const item = page.getByRole("button", { name: label, exact: true });
  await item.click();
  await expect(item).toHaveAttribute("aria-current", "page");
}

/**
 * Jump to a Globals catalog demo via the Components SearchBar
 * (opens the lazy category Collapsible, scrolls, flashes).
 */
export async function openGlobalsDemo(
  page: Page,
  demoId: string,
  searchHint?: string,
): Promise<void> {
  await goHome(page);
  await openNavPage(page, "Components");

  const search = page.getByRole("searchbox", { name: "Search components" });
  await search.click();
  await search.fill(searchHint ?? demoId);

  const result = page.locator(`#globals-search-result-${demoId}`);
  await expect(result).toBeVisible();
  await result.click();

  const demo = page.locator(`#globals-demo-${demoId}`);
  await expect(demo).toBeVisible({ timeout: 15_000 });
  await demo.scrollIntoViewIfNeeded();
}

/** Layout templates demos are always mounted — switch page and scroll. */
export async function openLayoutsDemo(
  page: Page,
  demoId: string,
): Promise<void> {
  await goHome(page);
  await openNavPage(page, "Layout templates");

  const demo = page.locator(`#layouts-demo-${demoId}`);
  await expect(demo).toBeVisible({ timeout: 15_000 });
  await demo.scrollIntoViewIfNeeded();
}

export function globalsDemo(page: Page, demoId: string) {
  return page.locator(`#globals-demo-${demoId}`);
}

export function layoutsDemo(page: Page, demoId: string) {
  return page.locator(`#layouts-demo-${demoId}`);
}
