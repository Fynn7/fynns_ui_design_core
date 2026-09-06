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

  const soft = demo.locator(".sandbox-chat-starters .fynns-surface--soft");
  const shell = demo.locator(".sandbox-chat-main .fynns-chat-composer-shell");
  await expect(soft).toBeVisible();
  await expect(shell).toBeVisible();

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
  await expect(starters.locator(".fynns-surface--soft")).toHaveCount(1);
  await starters.getByRole("button").click();
  await expect(demo.getByRole("radio", { name: "Populated" })).toBeChecked();
  await expect(starters).toHaveCount(0);
});
