/**
 * CONSUMER_TREATY slug: `EndAside instant open / close (no width morph)`
 * AGENTS: toggle `open` only — morph track stays mounted; width transitions.
 * Sandbox: #layouts-demo-shell
 */
import { test, expect } from "@playwright/test";
import {
  openLayoutsDemo,
  layoutsDemo,
  resetSandboxSession,
} from "../helpers/sandbox";

const SLUG = "EndAside instant open / close (no width morph)";

test.beforeEach(async ({ page }) => {
  await resetSandboxSession(page);
});

test(`${SLUG}: track stays mounted and width morphs on close`, async ({
  page,
}) => {
  await openLayoutsDemo(page, "shell");
  const demo = layoutsDemo(page, "shell");
  const shell = demo.locator(".sandbox-globals-clipped-shell");
  const track = shell.locator(".fynns-end-aside-track");
  const asideSwitch = demo.getByRole("switch", { name: "EndAside open" });

  await expect(track, `${SLUG}: track mounted while closed`).toHaveCount(1);
  await expect(track).toHaveAttribute("data-state", "closing");

  await asideSwitch.click();
  await expect(track).toHaveAttribute("data-state", "open");
  const openWidth = await track.evaluate(
    (el) => el.getBoundingClientRect().width,
  );
  expect(openWidth, `${SLUG}: open width > 0`).toBeGreaterThan(80);
  await expect(track, `${SLUG}: track still mounted when open`).toHaveCount(1);

  // Sample width concurrently with close — flyout duration is ~160ms.
  const samplesPromise = track.evaluate(async (el) => {
    const widths: number[] = [];
    const end = performance.now() + 350;
    while (performance.now() < end) {
      widths.push(el.getBoundingClientRect().width);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    return widths;
  });
  await asideSwitch.click();
  const samples = await samplesPromise;

  await expect(track).toHaveAttribute("data-state", "closing");
  await expect
    .poll(async () => track.evaluate((el) => el.getBoundingClientRect().width))
    .toBeLessThan(8);

  await expect(track, `${SLUG}: track still mounted after close`).toHaveCount(1);

  const buckets = new Set(
    samples.map((w) => Math.round(w / 8) * 8).filter((w) => w > 0),
  );
  expect(
    buckets.size,
    `${SLUG}: expected intermediate widths during close morph, got [${[...buckets].join(", ")}] from ${samples.length} samples`,
  ).toBeGreaterThanOrEqual(2);

  const transition = await track.evaluate(
    (el) => getComputedStyle(el).transitionProperty,
  );
  expect(transition, `${SLUG}: width must be a transitioned property`).toMatch(
    /width/,
  );
});
