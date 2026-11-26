import { act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useChatSequencer,
  type ChatSequencerOptions,
  type ChatSequencerResult,
} from "./useChatSequencer";

type Item = { id: string; text: string };

type Api = {
  current: ChatSequencerResult<Item> | null;
  setProps: (next: ChatSequencerOptions<Item>) => void;
};

function mountHook(initial: ChatSequencerOptions<Item>): { api: Api; unmount: () => void } {
  const host = document.createElement("div");
  document.body.appendChild(host);
  let root: Root | null = createRoot(host);
  const api: Api = { current: null, setProps: () => {} };

  function Harness({ options }: { options: ChatSequencerOptions<Item> }) {
    const result = useChatSequencer(options);
    useEffect(() => {
      api.current = result;
    });
    return null;
  }

  function render(next: ChatSequencerOptions<Item>) {
    act(() => {
      root!.render(createElement(Harness, { options: next }));
    });
  }
  api.setProps = (next) => render(next);
  render(initial);

  return {
    api,
    unmount: () => {
      act(() => {
        root?.unmount();
      });
      root = null;
      host.remove();
    },
  };
}

function ids(result: ChatSequencerResult<Item> | null): string[] {
  return result?.visibleItems.map((item) => item.id) ?? [];
}

const key = (item: Item) => item.id;

afterEach(() => {
  vi.useRealTimers();
});

describe("useChatSequencer", () => {
  it("paints recorded history at once and appends later rows one at a time", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "task" };
    const b: Item = { id: "b", text: "frame" };
    const c: Item = { id: "c", text: "thinking" };
    const { api, unmount } = mountHook({ items: [a, b], getKey: key, intervalMs: 50 });
    expect(ids(api.current)).toEqual(["a", "b"]);
    expect(api.current!.waiting).toBe(0);

    api.setProps({ items: [a, b, c], getKey: key, intervalMs: 50 });
    expect(ids(api.current)).toEqual(["a", "b"]);
    expect(api.current!.waiting).toBe(1);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(ids(api.current)).toEqual(["a", "b", "c"]);
    expect(api.current!.waiting).toBe(0);
    unmount();
  });

  it("paints an appended complete row on the next task by default", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "task" };
    const b: Item = { id: "b", text: "answer" };
    const { api, unmount } = mountHook({ items: [a], getKey: key });
    expect(ids(api.current)).toEqual(["a"]);

    api.setProps({ items: [a, b], getKey: key });
    expect(ids(api.current)).toEqual(["a"]);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(ids(api.current)).toEqual(["a", "b"]);
    unmount();
  });

  it("reveals a run started here from its first row", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "task" };
    const b: Item = { id: "b", text: "frame" };
    const c: Item = { id: "c", text: "warning" };
    const { api, unmount } = mountHook({
      items: [],
      getKey: key,
      seed: "first",
      intervalMs: 50,
    });
    expect(ids(api.current)).toEqual([]);

    api.setProps({ items: [a], getKey: key, seed: "first", intervalMs: 50 });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(ids(api.current)).toEqual(["a"]);

    api.setProps({ items: [a, b, c], getKey: key, seed: "first", intervalMs: 50 });
    expect(api.current!.waiting).toBe(2);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(ids(api.current)).toEqual(["a", "b"]);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(ids(api.current)).toEqual(["a", "b", "c"]);
    unmount();
  });

  it("holds the next row until every visible row has settled", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "frame" };
    const b: Item = { id: "b", text: "thinking" };
    const c: Item = { id: "c", text: "tool" };
    const settled = new Set<string>(["a"]);
    const isSettled = (item: Item) => settled.has(item.id);
    const { api, unmount } = mountHook({
      items: [a, b],
      getKey: key,
      isSettled,
      intervalMs: 50,
    });
    expect(ids(api.current)).toEqual(["a", "b"]);

    api.setProps({ items: [a, b, c], getKey: key, isSettled, intervalMs: 50 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(ids(api.current)).toEqual(["a", "b"]);

    settled.add("b");
    api.setProps({ items: [a, b, c], getKey: key, isSettled, intervalMs: 50 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(ids(api.current)).toEqual(["a", "b", "c"]);
    unmount();
  });

  it("never removes or reorders rows that were already painted", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "task" };
    const b: Item = { id: "b", text: "frame" };
    const c: Item = { id: "c", text: "answer" };
    const { api, unmount } = mountHook({ items: [a, b], getKey: key, intervalMs: 50 });
    expect(ids(api.current)).toEqual(["a", "b"]);

    api.setProps({ items: [a], getKey: key, intervalMs: 50 });
    expect(ids(api.current)).toEqual(["a", "b"]);

    api.setProps({ items: [a, c], getKey: key, intervalMs: 50 });
    expect(ids(api.current)).toEqual(["a", "b"]);
    expect(api.current!.waiting).toBe(1);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(ids(api.current)).toEqual(["a", "b", "c"]);
    unmount();
  });

  it("seeds the new source list when the reset key changes", () => {
    vi.useFakeTimers();
    const a: Item = { id: "a", text: "old" };
    const b: Item = { id: "b", text: "new 1" };
    const c: Item = { id: "c", text: "new 2" };
    const { api, unmount } = mountHook({
      items: [a],
      getKey: key,
      intervalMs: 50,
      resetKey: "run-1",
    });
    expect(ids(api.current)).toEqual(["a"]);

    api.setProps({
      items: [b, c],
      getKey: key,
      intervalMs: 50,
      resetKey: "run-2",
    });
    expect(ids(api.current)).toEqual(["b", "c"]);
    unmount();
  });
});
