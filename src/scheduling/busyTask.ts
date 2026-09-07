import { useCallback, useRef, useState } from "react";
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

/** Why a busy/loading task failed (passed to `onError` before rethrow). */
export type BusyTaskFailReason = "reject" | "timeout" | "abort";

export type BusyTaskContext = {
  /** Linked to `options.signal` + internal timeout AbortController. */
  signal: AbortSignal;
};

/**
 * Concurrent-run policy for a given `setBusy` / hook instance:
 * - `generation` (default): only the latest run may clear busy in `finally`
 * - `refcount`: nested/overlapping runs; clear busy only when count hits 0
 * - `exclusive`: starting a new run aborts the previous in-flight controller
 */
export type BusyTaskConcurrency = "generation" | "refcount" | "exclusive";

export type RunBusyTaskOptions = {
  /** External cancel (unmount, Stop, Confirm Cancel → abort). */
  signal?: AbortSignal;
  /**
   * Soft hang guard. After ms: abort internal controller, clear busy (per
   * concurrency), call `onError`, then reject with `TimeoutError`.
   * Omit = no timeout (foot-gun — prefer a consumer default such as 30_000).
   */
  timeoutMs?: number;
  /**
   * Observability / toast hook. Invoked before rethrow.
   * Must NOT clear busy itself — finally / generation owns that.
   */
  onError?: (error: unknown, meta: { reason: BusyTaskFailReason }) => void;
  concurrency?: BusyTaskConcurrency;
};

type BusyGate = {
  generation: number;
  pending: number;
  controller: AbortController | null;
};

const busyGates = new WeakMap<(busy: boolean) => void, BusyGate>();

function getGate(setBusy: (busy: boolean) => void): BusyGate {
  let gate = busyGates.get(setBusy);
  if (!gate) {
    gate = { generation: 0, pending: 0, controller: null };
    busyGates.set(setBusy, gate);
  }
  return gate;
}

function makeTimeoutError(): Error {
  if (typeof DOMException !== "undefined") {
    try {
      return new DOMException("Busy task timed out", "TimeoutError");
    } catch {
      /* older engines */
    }
  }
  const err = new Error("Busy task timed out");
  err.name = "TimeoutError";
  return err;
}

function makeAbortError(reason?: unknown): Error {
  if (reason instanceof Error) return reason;
  if (typeof DOMException !== "undefined") {
    try {
      return new DOMException("Busy task aborted", "AbortError");
    } catch {
      /* older engines */
    }
  }
  const err = new Error("Busy task aborted");
  err.name = "AbortError";
  return err;
}

function isTimeoutError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { name?: string }).name === "TimeoutError");
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { name?: string }).name === "AbortError");
}

function linkAbortSignals(
  internal: AbortController,
  external: AbortSignal | undefined,
): () => void {
  if (!external) return () => {};
  if (external.aborted) {
    internal.abort(external.reason);
    return () => {};
  }
  const onAbort = () => {
    internal.abort(external.reason);
  };
  external.addEventListener("abort", onAbort, { once: true });
  return () => external.removeEventListener("abort", onAbort);
}

type BusyTaskFn<T> = ((ctx: BusyTaskContext) => Promise<T>) | (() => Promise<T>);

function invokeTask<T>(task: BusyTaskFn<T>, ctx: BusyTaskContext): Promise<T> {
  return (task as (c: BusyTaskContext) => Promise<T>)(ctx);
}

function raceWithAbort<T>(taskPromise: Promise<T>, signal: AbortSignal, timedOut: () => boolean): Promise<T> {
  if (signal.aborted) {
    const err = timedOut()
      ? makeTimeoutError()
      : makeAbortError(signal.reason);
    return Promise.reject(err);
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(timedOut() ? makeTimeoutError() : makeAbortError(signal.reason));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    taskPromise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/**
 * Show busy UI, wait for a paint, then run `task`.
 *
 * `setBusy(true)` is applied via `flushSync` so `BusyScrim` / `BusyRegion` are
 * in the DOM before `afterNextPaint`. Long synchronous / WASM work can still
 * stall CSS animation after it starts — use a Worker or `yieldToMain` slices
 * for that case.
 *
 * Pass `timeoutMs` / `signal` so a hang or cancel clears busy (any settle path
 * clears per `concurrency`). Without them, a never-settling Promise leaves
 * busy forever — treat that as a consumer bug. Timeout races the task even when
 * the task ignores `ctx.signal`.
 *
 * **Concurrency identity:** pass a **stable** `setBusy` (e.g. `useState` setter
 * or a `useCallback` wrapper). An inline `(b) => setX(b)` each call breaks
 * WeakMap generation / exclusive / refcount sharing for that host.
 *
 * `timeoutMs` starts after `afterNextPaint` (total hang ≈ paint wait + timeout).
 * Do not mix `concurrency` modes on the same `setBusy` identity.
 */
export async function runBusyTask<T>(
  setBusy: (busy: boolean) => void,
  task: BusyTaskFn<T>,
  options?: RunBusyTaskOptions,
): Promise<T> {
  const concurrency = options?.concurrency ?? "generation";
  const gate = getGate(setBusy);
  const internal = new AbortController();
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const unlinkExternal = linkAbortSignals(internal, options?.signal);

  if (concurrency === "exclusive" && gate.controller) {
    gate.controller.abort();
  }
  gate.controller = internal;

  let myGeneration = 0;
  if (concurrency === "generation" || concurrency === "exclusive") {
    gate.generation += 1;
    myGeneration = gate.generation;
  }
  if (concurrency === "refcount") {
    gate.pending += 1;
  }

  const clearBusyIfOwner = () => {
    if (concurrency === "refcount") {
      gate.pending = Math.max(0, gate.pending - 1);
      if (gate.pending === 0) setBusy(false);
      return;
    }
    if (gate.generation === myGeneration) {
      setBusy(false);
    }
  };

  flushSync(() => {
    setBusy(true);
  });
  await afterNextPaint();

  if (typeof options?.timeoutMs === "number" && options.timeoutMs >= 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      internal.abort(makeTimeoutError());
    }, options.timeoutMs);
  }

  const ctx: BusyTaskContext = { signal: internal.signal };

  try {
    const result = await raceWithAbort(invokeTask(task, ctx), internal.signal, () => timedOut);
    return result;
  } catch (error) {
    let failReason: BusyTaskFailReason = "reject";
    if (timedOut || isTimeoutError(error)) {
      failReason = "timeout";
      const err = isTimeoutError(error) ? (error as Error) : makeTimeoutError();
      options?.onError?.(err, { reason: failReason });
      throw err;
    }
    // Only classify abort when *our* controller aborted. A task that throws
    // AbortError while the gate is still active is a normal reject.
    if (internal.signal.aborted) {
      failReason = "abort";
      const err = isAbortError(error) ? error : makeAbortError(internal.signal.reason);
      options?.onError?.(err, { reason: failReason });
      throw err;
    }
    options?.onError?.(error, { reason: failReason });
    throw error;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    unlinkExternal();
    if (gate.controller === internal) {
      gate.controller = null;
    }
    clearBusyIfOwner();
  }
}

/** Same lifecycle as `runBusyTask` — drives Button / ConfirmDialog `loading`. */
export async function runLoadingTask<T>(
  setLoading: (loading: boolean) => void,
  task: BusyTaskFn<T>,
  options?: RunBusyTaskOptions,
): Promise<T> {
  return runBusyTask(setLoading, task, options);
}

export type UseBusyTaskResult = {
  busy: boolean;
  /** Optional label set by the latest `run(label, task)` call. */
  label: string | undefined;
  /** Monotonic generation for the latest started run. */
  generation: number;
  /** Active nest count when using `concurrency: "refcount"`. */
  pendingCount: number;
  /** Abort the current in-flight controller (if any). */
  abort: (reason?: unknown) => void;
  /**
   * Flush-sync busy on, paint, then `task`. Pass `label` when the page binds
   * it to `BusyScrim` / `BusyRegion`.
   */
  run: <T>(
    label: string,
    task: BusyTaskFn<T>,
    options?: RunBusyTaskOptions,
  ) => Promise<T>;
};

export type UseLoadingTaskResult = {
  loading: boolean;
  generation: number;
  pendingCount: number;
  abort: (reason?: unknown) => void;
  run: <T>(task: BusyTaskFn<T>, options?: RunBusyTaskOptions) => Promise<T>;
};

function syncGateMeta(
  setBusy: (busy: boolean) => void,
  setGeneration: (n: number) => void,
  setPendingCount: (n: number) => void,
): void {
  const gate = busyGates.get(setBusy);
  if (gate) {
    setGeneration(gate.generation);
    setPendingCount(gate.pending);
  }
}

/**
 * Holds `busy` (+ last `label`) for pairing with `BusyScrim` / `BusyRegion`.
 * Prefer this over hand-rolling `flushSync` + `afterNextPaint`.
 */
export function useBusyTask(): UseBusyTaskResult {
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [generation, setGeneration] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const setBusyStable = useCallback((next: boolean) => {
    setBusy(next);
  }, []);
  const runAbortRef = useRef<AbortController | null>(null);

  const abort = useCallback((reason?: unknown) => {
    runAbortRef.current?.abort(reason);
  }, []);

  const run = useCallback(
    async <T,>(nextLabel: string, task: BusyTaskFn<T>, options?: RunBusyTaskOptions) => {
      if ((options?.concurrency ?? "generation") === "exclusive") {
        runAbortRef.current?.abort();
      }
      const linked = new AbortController();
      runAbortRef.current = linked;
      const unlink = linkAbortSignals(linked, options?.signal);

      flushSync(() => {
        setLabel(nextLabel);
      });

      try {
        return await runBusyTask(setBusyStable, task, {
          ...options,
          signal: linked.signal,
        });
      } finally {
        unlink();
        if (runAbortRef.current === linked) {
          runAbortRef.current = null;
        }
        syncGateMeta(setBusyStable, setGeneration, setPendingCount);
      }
    },
    [setBusyStable],
  );

  return { busy, label, generation, pendingCount, abort, run };
}

/**
 * Holds `loading` for Button / ConfirmDialog chrome. Same hang guards as
 * `useBusyTask` — prefer over bare `setLoading(true)` without a clear path.
 */
export function useLoadingTask(): UseLoadingTaskResult {
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const setLoadingStable = useCallback((next: boolean) => {
    setLoading(next);
  }, []);
  const runAbortRef = useRef<AbortController | null>(null);

  const abort = useCallback((reason?: unknown) => {
    runAbortRef.current?.abort(reason);
  }, []);

  const run = useCallback(
    async <T,>(task: BusyTaskFn<T>, options?: RunBusyTaskOptions) => {
      if ((options?.concurrency ?? "generation") === "exclusive") {
        runAbortRef.current?.abort();
      }
      const linked = new AbortController();
      runAbortRef.current = linked;
      const unlink = linkAbortSignals(linked, options?.signal);

      try {
        return await runLoadingTask(setLoadingStable, task, {
          ...options,
          signal: linked.signal,
        });
      } finally {
        unlink();
        if (runAbortRef.current === linked) {
          runAbortRef.current = null;
        }
        syncGateMeta(setLoadingStable, setGeneration, setPendingCount);
      }
    },
    [setLoadingStable],
  );

  return { loading, generation, pendingCount, abort, run };
}
