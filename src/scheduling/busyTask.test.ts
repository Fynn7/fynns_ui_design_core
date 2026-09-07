import { describe, expect, it, vi } from "vitest";
import { runBusyTask, runLoadingTask } from "./busyTask";

function neverSettles(): Promise<never> {
  return new Promise(() => {});
}

async function waitUntil(predicate: () => boolean, label: string): Promise<void> {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new Error(`timed out waiting for ${label}`);
}

describe("runBusyTask", () => {
  it("clears busy after resolve", async () => {
    const setBusy = vi.fn();
    const value = await runBusyTask(setBusy, async () => 42);
    expect(value).toBe(42);
    expect(setBusy.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("clears busy after reject and calls onError", async () => {
    const setBusy = vi.fn();
    const onError = vi.fn();
    const boom = new Error("boom");
    await expect(
      runBusyTask(
        setBusy,
        async () => {
          throw boom;
        },
        { onError },
      ),
    ).rejects.toThrow("boom");
    expect(onError).toHaveBeenCalledWith(boom, { reason: "reject" });
    expect(setBusy.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("timeout clears busy even when task ignores signal", async () => {
    const setBusy = vi.fn();
    const onError = vi.fn();
    await expect(
      runBusyTask(setBusy, () => neverSettles(), {
        timeoutMs: 20,
        onError,
      }),
    ).rejects.toMatchObject({ name: "TimeoutError" });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ name: "TimeoutError" }),
      { reason: "timeout" },
    );
    expect(setBusy.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("external abort clears busy", async () => {
    const setBusy = vi.fn();
    const onError = vi.fn();
    const ac = new AbortController();
    const pending = runBusyTask(setBusy, () => neverSettles(), {
      signal: ac.signal,
      onError,
    });
    await waitUntil(() => setBusy.mock.calls.some((c) => c[0] === true), "busy on");
    ac.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(onError).toHaveBeenCalledWith(expect.anything(), { reason: "abort" });
    expect(setBusy.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("generation: stale finally does not clear newer busy", async () => {
    const setBusy = vi.fn();
    let releaseA: (() => void) | undefined;
    const a = runBusyTask(
      setBusy,
      () =>
        new Promise<void>((resolve) => {
          releaseA = resolve;
        }),
    );
    await waitUntil(() => releaseA !== undefined, "releaseA");

    let releaseB: (() => void) | undefined;
    const b = runBusyTask(
      setBusy,
      () =>
        new Promise<void>((resolve) => {
          releaseB = resolve;
        }),
    );
    await waitUntil(() => releaseB !== undefined, "releaseB");

    releaseA!();
    await a;
    expect(setBusy.mock.calls.filter((c) => c[0] === false)).toHaveLength(0);

    releaseB!();
    await b;
    expect(setBusy.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("refcount: clears only when pending hits 0", async () => {
    const setBusy = vi.fn();
    let releaseA: (() => void) | undefined;
    let releaseB: (() => void) | undefined;
    const a = runBusyTask(
      setBusy,
      () =>
        new Promise<void>((resolve) => {
          releaseA = resolve;
        }),
      { concurrency: "refcount" },
    );
    await waitUntil(() => releaseA !== undefined, "releaseA");
    const b = runBusyTask(
      setBusy,
      () =>
        new Promise<void>((resolve) => {
          releaseB = resolve;
        }),
      { concurrency: "refcount" },
    );
    await waitUntil(() => releaseB !== undefined, "releaseB");

    releaseA!();
    await a;
    expect(setBusy.mock.calls.filter((c) => c[0] === false)).toHaveLength(0);

    releaseB!();
    await b;
    expect(setBusy.mock.calls.filter((c) => c[0] === false)).toHaveLength(1);
  });

  it("passes ctx.signal to the task", async () => {
    const setBusy = vi.fn();
    let sawSignal: AbortSignal | undefined;
    await runBusyTask(setBusy, async (ctx) => {
      sawSignal = ctx.signal;
    });
    expect(sawSignal).toBeInstanceOf(AbortSignal);
  });
});

describe("runLoadingTask", () => {
  it("mirrors busy lifecycle on setLoading", async () => {
    const setLoading = vi.fn();
    await runLoadingTask(setLoading, async () => "ok", { timeoutMs: 1000 });
    expect(setLoading.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });
});
