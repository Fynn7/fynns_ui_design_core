import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { SparklesIcon } from "./icons";
import { ChatThinking, type ChatThinkingDetail } from "./ChatThinking";

describe("structured thinking retention", () => {
  it("preserves manually collapsed nested content during text and completion updates", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const details = (text: string, streaming: boolean): ChatThinkingDetail[] => [
      { id: "note", text: "Retained record" },
      { id: "step", label: "Review", streaming, details: [{ id: "text", text }] },
      { id: "empty", label: "Not run", details: [] },
    ];
    const render = (text: string, streaming: boolean) => act(() => root.render(createElement(ChatThinking, {
      open: true, label: "Task", details: details(text, streaming),
    }, createElement("button", {}, "Ignored legacy control"))));
    try {
      render("First output", true);
      const nested = host.querySelector(".fynns-chat-thinking--nested")!;
      const trigger = nested.querySelector("button")!;
      const body = nested.querySelector(".fynns-chat-thinking-body")!;
      const bodyId = body.id;
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      act(() => trigger.click());
      render("Second output", true);
      expect(nested.querySelector("button")).toBe(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(body.id).toBe(bodyId);
      expect(body.textContent).toBe("Second output");
      render("Completed output", false);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      act(() => trigger.click());
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(trigger.getAttribute("aria-controls")).toBe(bodyId);
      expect(body.textContent).toBe("Completed output");
      expect(host.querySelectorAll("button")).toHaveLength(2);
      expect(host.textContent).not.toContain("Ignored legacy control");
      expect(host.querySelector("[aria-live]")).toBeNull();
      expect(host.querySelector(".fynns-chat-thinking--static")?.textContent).toBe("Not run");
    } finally { act(() => root.unmount()); host.remove(); }
  });
});

describe("reference reasoning content", () => {
  it("keeps inline code inert and combines headings, summaries, and artifacts accessibly", () => {
    const host = document.createElement("div"); document.body.appendChild(host);
    const root = createRoot(host);
    try {
      act(() => root.render(createElement(ChatThinking, { label: "Review", open: true, details: [
        { id: "step", label: "Developed", summary: "style patterns", icon: createElement(SparklesIcon), defaultOpen: true, details: [
          { id: "child", label: "Details", defaultOpen: true, details: [{ id: "copy", text: ["Read ", { code: "<script>unsafe()</script>" }, " as text."] }] },
        ] },
        { id: "artifact", label: "Read", artifact: { label: "package.json" } },
      ] })));
      expect(host.querySelector("script")).toBeNull();
      expect(host.querySelector("code")?.textContent).toBe("<script>unsafe()</script>");
      expect(host.querySelector('[data-thinking-depth="1"] button')?.textContent).toBe("Developed style patterns");
      expect(host.querySelector('[data-thinking-depth="2"]')?.getAttribute("data-thinking-marker")).toBe("dot");
      const mark = host.querySelector(".fynns-chat-thinking-dot");
      expect(mark?.getAttribute("aria-hidden")).toBe("true");
      expect(host.querySelector(".fynns-chat-thinking-leading")?.getAttribute("aria-hidden")).toBe("true");
      expect(host.querySelector(".fynns-chat-thinking-artifact")?.textContent).toBe(" package.json");
      expect(host.querySelector(".fynns-chat-thinking-artifact button")).toBeNull();
    } finally { act(() => root.unmount()); host.remove(); }
  });
});
