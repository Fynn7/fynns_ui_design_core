import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { ChatThinking } from "./ChatThinking";

describe("ChatThinking variants", () => {
  it("status suppresses supplied body and disclosure restores accessible expansion", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const onOpenChange = vi.fn();
    try {
      act(() => root.render(createElement(ChatThinking, {
        variant: "status", label: "Checked wording", onOpenChange,
      }, "Retained reasoning")));
      expect(host.textContent).toBe("Checked wording");
      expect(host.querySelector("button")).toBeNull();
      expect(host.querySelector("[aria-controls]")).toBeNull();
      act(() => root.render(createElement(ChatThinking, {
        variant: "disclosure", label: "Checked wording", onOpenChange,
      }, "Retained reasoning")));
      const trigger = host.querySelector("button")!;
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      const body = host.querySelector(".fynns-chat-thinking-body")!;
      expect(trigger.getAttribute("aria-controls")).toBe(body.id);
      act(() => trigger.click());
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(body.textContent).toBe("Retained reasoning");
      expect(onOpenChange).toHaveBeenCalledWith(true);
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
});
