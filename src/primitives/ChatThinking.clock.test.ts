import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { ChatThinking, type ChatThinkingProps } from "./ChatThinking";

describe("thinking clock updates", () => {
  it.each([false, true])("retains the title, tooltip and disclosure while streaming=%s", (streaming) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (elapsed: string) => act(() => root.render(createElement(ChatThinking, {
      streaming,
      label: `Processing · waiting · ${elapsed}`,
      streamingLabel: `Processing · preparing · ${elapsed}`,
      details: [{ id: "elapsed", text: `Elapsed ${elapsed}.` }],
      defaultOpen: true,
    })));
    try {
      render("59s");
      const label = host.querySelector(".fynns-chat-thinking-label");
      const title = host.querySelector(".fynns-chat-thinking-title");
      const tooltip = host.querySelector(".fynns-overflow-tip");
      const body = host.querySelector(".fynns-chat-thinking-body");
      const trigger = host.querySelector("button")!;
      act(() => trigger.click());
      trigger.focus();
      for (const elapsed of ["1m 0s", "1m 1s", "59m 59s", "1h 0m 0s"]) {
        render(elapsed);
        expect(host.querySelector(".fynns-chat-thinking-label")).toBe(label);
        expect(host.querySelector(".fynns-chat-thinking-title")).toBe(title);
        expect(host.querySelector(".fynns-overflow-tip")).toBe(tooltip);
        expect(host.querySelector(".fynns-chat-thinking-body")).toBe(body);
        expect(title?.textContent).toContain(elapsed);
        expect(body?.textContent).toBe(`Elapsed ${elapsed}.`);
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
        expect(document.activeElement).toBe(trigger);
        expect(host.querySelector("[aria-live]")).toBeNull();
      }
    } finally { act(() => root.unmount()); host.remove(); }
  });

  it("updates summaries, duration labels and phase copy without replacing the title", () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const render = (props: ChatThinkingProps) => act(() => root.render(createElement(ChatThinking, {
      ...props, variant: "status",
    })));
    try {
      render({ label: "Awaiting confirmation", summary: "59s" });
      const title = host.querySelector(".fynns-chat-thinking-title");
      const label = host.querySelector(".fynns-chat-thinking-label");
      render({ label: "Awaiting confirmation", summary: "1m 0s" });
      expect(host.textContent).toBe("Awaiting confirmation 1m 0s");
      render({ durationMs: 61000 });
      expect(host.textContent).toBe("Thought for 61s");
      render({ durationMs: 62000, durationLabel: seconds => `Completed in ${seconds}s` });
      expect(host.textContent).toBe("Completed in 62s");
      render({ streaming: true, streamingLabel: "Preparing output", summary: "63s" });
      expect(host.querySelector(".fynns-chat-thinking-title")).toBe(title);
      expect(host.querySelector(".fynns-chat-thinking-label")).toBe(label);
      expect(label?.classList.contains("fynns-chat-thinking-label--streaming")).toBe(true);
    } finally { act(() => root.unmount()); }
  });
});
