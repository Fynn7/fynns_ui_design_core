import { useCallback, useState } from "react";
import { flushSync } from "react-dom";

type SchedulerWithYield = {
  yield?: () => Promise<void>;
};

/**
 * Resolves after the browser has painted at least one frame (double rAF).
 * Call after busy UI is committed so CircularProgress can start spinning
 * before heavy work blocks the main thread.
 */
export function afterNextPaint(): Promise<void> {
  if (typeof requestAnimationFrame !== "function") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Yield the main thread so pending paint / input can run.
 * Prefer `scheduler.yield()` when available; otherwise `setTimeout(0)`.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerWithYield }).scheduler;
  if (typeof scheduler?.yield === "function") {
    return scheduler.yield();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Show busy UI, wait for a paint, then run `task`.
 *
 * `setBusy(true)` is applied via `flushSync` so `BusyScrim` / `BusyRegion` are
 * in the DOM before `afterNextPaint`. Long synchronous / WASM work can still
 * stall CSS animation after it starts — use a Worker or `yieldToMain` slices
 * for that case.
 */
export async function runBusyTask<T>(
  setBusy: (busy: boolean) => void,
  task: () => Promise<T>,
): Promise<T> {
  flushSync(() => {
    setBusy(true);
  });
  await afterNextPaint();
  try {
    return await task();
  } finally {
    setBusy(false);
  }
}

export type UseBusyTaskResult = {
  busy: boolean;
  /** Optional label set by the latest `run(label, task)` call. */
  label: string | undefined;
  /**
   * Flush-sync busy on, paint, then `task`. Pass `label` when the page binds
   * it to `BusyScrim` / `BusyRegion`.
   */
  run: <T>(label: string, task: () => Promise<T>) => Promise<T>;
};

/**
 * Holds `busy` (+ last `label`) for pairing with `BusyScrim` / `BusyRegion`.
 * Prefer this over hand-rolling `flushSync` + `afterNextPaint`.
 */
export function useBusyTask(): UseBusyTaskResult {
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);

  const run = useCallback(async <T,>(nextLabel: string, task: () => Promise<T>) => {
    flushSync(() => {
      setLabel(nextLabel);
      setBusy(true);
    });
    await afterNextPaint();
    try {
      return await task();
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, label, run };
}
