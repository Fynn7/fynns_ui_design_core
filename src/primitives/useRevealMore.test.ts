import { act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { useRevealMore, type UseRevealMoreOptions, type UseRevealMoreResult } from "./useRevealMore";

type Api = {
  current: UseRevealMoreResult | null;
  setProps: (next: UseRevealMoreOptions) => void;
};

function mountHook(initial: UseRevealMoreOptions): { api: Api; unmount: () => void } {
  const host = document.createElement("div");
  document.body.appendChild(host);
  let root: Root | null = createRoot(host);
  const api: Api = { current: null, setProps: () => {} };

  function Harness({ options }: { options: UseRevealMoreOptions }) {
    const result = useRevealMore(options);
    useEffect(() => {
      api.current = result;
    });
    return null;
  }

  let props = initial;
  function render(next: UseRevealMoreOptions) {
    props = next;
    act(() => {
      root!.render(createElement(Harness, { options: props }));
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

describe("useRevealMore", () => {
  it("starts at initial and reveals by step", () => {
    const { api, unmount } = mountHook({ total: 25, initial: 10, step: 10 });
    expect(api.current!.visible).toBe(10);
    expect(api.current!.remaining).toBe(15);
    expect(api.current!.canRevealMore).toBe(true);

    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(20);
    expect(api.current!.remaining).toBe(5);

    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(25);
    expect(api.current!.canRevealMore).toBe(false);
    unmount();
  });

  it("hides need for short totals", () => {
    const { api, unmount } = mountHook({ total: 7, initial: 10, step: 10 });
    expect(api.current!.visible).toBe(7);
    expect(api.current!.canRevealMore).toBe(false);
    unmount();
  });

  it("clamps when total shrinks without resetting upward growth", () => {
    const { api, unmount } = mountHook({ total: 30, initial: 10, step: 10 });
    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(20);

    api.setProps({ total: 14, initial: 10, step: 10 });
    expect(api.current!.visible).toBe(14);
    expect(api.current!.canRevealMore).toBe(false);
    unmount();
  });

  it("resets to initial when resetKey changes", () => {
    const { api, unmount } = mountHook({
      total: 40,
      initial: 10,
      step: 10,
      resetKey: "a",
    });
    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(20);

    api.setProps({ total: 40, initial: 10, step: 10, resetKey: "b" });
    expect(api.current!.visible).toBe(10);
    unmount();
  });

  it("keeps expanded window when total grows (polling)", () => {
    const { api, unmount } = mountHook({ total: 22, initial: 10, step: 10 });
    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(20);

    api.setProps({ total: 28, initial: 10, step: 10 });
    expect(api.current!.visible).toBe(20);
    expect(api.current!.remaining).toBe(8);
    unmount();
  });

  it("supports List defaults 5/5", () => {
    const { api, unmount } = mountHook({ total: 12, initial: 5, step: 5 });
    expect(api.current!.visible).toBe(5);
    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(10);
    act(() => {
      api.current!.revealMore();
    });
    expect(api.current!.visible).toBe(12);
    expect(api.current!.canRevealMore).toBe(false);
    unmount();
  });
});
