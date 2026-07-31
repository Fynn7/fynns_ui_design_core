/**
 * Global tooltip “warm” / skip-delay state (module singleton).
 *
 * First hover waits the show delay; once any tip has opened, moving to another
 * trigger within `skipDelayMs` opens instantly — the M3 / Cursor toolbar pattern.
 * No React provider required so every Tooltip in the document shares one pool.
 */

let openCount = 0;
let skipUntilMs = 0;
let skipDelayMs = 500;

export function configureTooltipSkipDelay(ms: number): void {
  skipDelayMs = Math.max(0, ms);
}

export function isTooltipWarm(nowMs: number = performance.now()): boolean {
  return openCount > 0 || nowMs < skipUntilMs;
}

export function notifyTooltipOpened(): void {
  openCount += 1;
}

export function notifyTooltipClosed(nowMs: number = performance.now()): void {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    skipUntilMs = nowMs + skipDelayMs;
  }
}

/** Test helper — resets warm state between cases. */
export function resetTooltipWarmthForTests(): void {
  openCount = 0;
  skipUntilMs = 0;
}
