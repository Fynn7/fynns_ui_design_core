import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./Chat";

function renderComposer(props: Record<string, unknown>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(
      createElement(ChatComposer, {
        value: "",
        onChange: () => {},
        ariaLabel: "Test composer",
        stopLabel: "Stop",
        ...props,
      }),
    );
  });
  return { host, root };
}

describe("ChatComposer stopping", () => {
  it("renders Stop enabled while busy", () => {
    const onStop = vi.fn();
    const { host, root } = renderComposer({ busy: true, onStop });
    try {
      const button = host.querySelector('button[aria-label="Stop"]');
      expect(button).not.toBeNull();
      expect(button?.hasAttribute("disabled")).toBe(false);
      expect(button?.className).not.toContain("fynns-btn--loading");
      act(() => {
        button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onStop).toHaveBeenCalledTimes(1);
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });

  it("renders Stop disabled + busy once stopping, ignoring repeat clicks", () => {
    const onStop = vi.fn();
    const { host, root } = renderComposer({ busy: true, onStop, stopping: true });
    try {
      const button = host.querySelector('button[aria-label="Stop"]');
      expect(button).not.toBeNull();
      expect(button?.hasAttribute("disabled")).toBe(true);
      expect(button?.getAttribute("aria-busy")).toBe("true");
      expect(button?.className).toContain("fynns-btn--loading");
      act(() => {
        button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onStop).not.toHaveBeenCalled();
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
});
