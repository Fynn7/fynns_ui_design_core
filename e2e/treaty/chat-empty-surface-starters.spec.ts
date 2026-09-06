/**
 * CONSUMER_TREATY slug: `empty-thread starter ≠ composer-shell edges`
 * AGENTS: empty-thread soft Surface inline edges = `.fynns-chat-composer-shell`.
 * Sandbox: #chat Empty mode.
 */
import { test, expect } from "@playwright/test";
import {
  openGlobalsDemo,
  globalsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "empty-thread starter ≠ composer-shell edges";
const EDGE_TOL = 2;

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: soft Surface left/right ≈ composer-shell`, async ({ page }) => {
  await openGlobalsDemo(page, "chat", "chat");
  const demo = globalsDemo(page, "chat");
  await expect(demo).toBeVisible();

  await demo.getByRole("radio", { name: "Empty" }).click();

  const soft = demo.locator(
    ".sandbox-chat-starters .sandbox-chat-starters-layer--solo .fynns-surface--soft",
  );
  await expect(soft).toHaveClass(/fynns-surface--interactive/);
  const shell = demo.locator(".sandbox-chat-main .fynns-chat-composer-shell");
  await expect(soft).toBeVisible();
  await expect(shell).toBeVisible();

  // Large-button grammar: idle transparent state layer → hover opacity 1
  // (parent button drives `:hover > .fynns-surface--interactive::before`).
  await expect
    .poll(async () =>
      soft.evaluate((el) => getComputedStyle(el, "::before").opacity),
    )
    .toBe("0");
  await soft.hover();
  await expect
    .poll(async () =>
      soft.evaluate((el) => getComputedStyle(el, "::before").opacity),
    )
    .toBe("1");

  // Keyboard: Tab from Empty radio → starter button :focus-visible → inset ring
  // (Playwright element.focus() does not set :focus-visible).
  const starterBtn = demo.locator(
    ".sandbox-chat-starters .sandbox-chat-starters-layer--solo .sandbox-chat-starter",
  );
  await demo.getByRole("radio", { name: "Empty" }).focus();
  await page.keyboard.press("Tab");
  await expect(starterBtn).toBeFocused();
  await expect
    .poll(async () =>
      soft.evaluate((el) => getComputedStyle(el).boxShadow),
    )
    .toMatch(/inset/i);

  const form = demo.locator(".sandbox-chat-main .fynns-chat-composer");
  await expect(form).toBeVisible();

  // Soft must match shell — and must NOT flush with the form outer
  // (negative-margin breakout regression).
  await expect(async () => {
    const softBox = await soft.boundingBox();
    const shellBox = await shell.boundingBox();
    const formBox = await form.boundingBox();
    expect(softBox).toBeTruthy();
    expect(shellBox).toBeTruthy();
    expect(formBox).toBeTruthy();
    expect(Math.abs(softBox!.x - shellBox!.x)).toBeLessThanOrEqual(EDGE_TOL);
    expect(
      Math.abs(softBox!.x + softBox!.width - (shellBox!.x + shellBox!.width)),
    ).toBeLessThanOrEqual(EDGE_TOL);
    // Form is wider than shell by composer inset (~24dp/side); soft must
    // sit inside form, not flush with form.x.
    expect(softBox!.x - formBox!.x).toBeGreaterThan(EDGE_TOL);
    expect(formBox!.width - softBox!.width).toBeGreaterThan(EDGE_TOL);
  }).toPass({ timeout: 10_000 });
});

test(`empty-thread Chip / revived ChatStarterPrompts: click → Populated`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "chat", "chat");
  const demo = globalsDemo(page, "chat");
  await demo.getByRole("radio", { name: "Empty" }).click();

  const starters = demo.locator(".sandbox-chat-starters");
  await expect(starters.locator(".sandbox-chat-starters-viewport")).toBeVisible();
  await expect(starters.locator(".sandbox-chat-starters-layer--solo")).toBeVisible();
  await expect(
    starters.locator(".sandbox-chat-starters-layer--solo .fynns-surface--soft"),
  ).toHaveCount(1);
  await starters.getByRole("button").click();
  await expect(demo.getByRole("radio", { name: "Populated" })).toBeChecked();
  await expect(starters).toHaveCount(0);
});

test(`empty-thread starter rotate: vertical slide then settle`, async ({
  page,
}) => {
  await openGlobalsDemo(page, "chat", "chat");
  const demo = globalsDemo(page, "chat");
  await demo.getByRole("radio", { name: "Empty" }).click();

  const starters = demo.locator(".sandbox-chat-starters");
  const label = starters.locator(
    ".sandbox-chat-starter:not([aria-hidden]) .sandbox-chat-starter-label",
  );
  await expect(label).toBeVisible();
  const before = (await label.textContent())?.trim() ?? "";

  await starters.evaluate((el) => {
    el.dispatchEvent(new Event("sandbox-chat-starter-advance"));
  });

  // Mid-slide: outgoing overlay is present.
  await expect(
    starters.locator(".sandbox-chat-starters-layer--out"),
  ).toBeVisible({ timeout: 1_000 });

  await expect(async () => {
    const after = (await label.textContent())?.trim() ?? "";
    expect(after).not.toBe(before);
  }).toPass({ timeout: 3_000 });

  // After settle: solo layer only, no outgoing overlay.
  await expect(async () => {
    await expect(starters.locator(".sandbox-chat-starters-layer--out")).toHaveCount(
      0,
    );
    await expect(
      starters.locator(".sandbox-chat-starters-layer--solo"),
    ).toBeVisible();
    await expect(
      starters.locator(".sandbox-chat-starters-layer--solo .fynns-surface--soft"),
    ).toHaveCount(1);
  }).toPass({ timeout: 5_000 });
});
