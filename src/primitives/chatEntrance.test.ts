import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { Chat, ChatThread } from "./Chat";
import { ChatMessage } from "./ChatMessage";
import { ChatReveal } from "./ChatReveal";

describe("chat entrance", () => {
  it("keeps initial history still and reveals only later messages and blocks", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (append: boolean) => {
      act(() => {
        root.render(
          createElement(
            Chat,
            {},
            createElement(
              ChatThread,
              {},
              createElement(ChatMessage, {
                key: "old",
                role: "user",
                markdown: "Earlier question",
              }),
              createElement(ChatReveal, { key: "old-block" }, "Earlier block"),
              append &&
                createElement(ChatMessage, {
                  key: "new",
                  role: "assistant",
                  markdown: "New answer",
                }),
              append &&
                createElement(ChatReveal, { key: "new-block" }, "New block"),
            ),
          ),
        );
      });
    };

    try {
      render(false);
      expect(host.querySelectorAll(".fynns-chat-message--enter")).toHaveLength(0);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(0);

      render(true);
      expect(host.querySelectorAll(".fynns-chat-message--enter")).toHaveLength(1);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(1);
      expect(host.querySelector(".fynns-chat-message--enter")?.textContent).toContain("New answer");
      expect(host.querySelector(".fynns-chat-reveal--enter")?.textContent).toContain("New block");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });

  it("slides an appended part without doubling the entrance of a new message", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (phase: number) => {
      act(() => {
        root.render(
          createElement(
            Chat,
            {},
            createElement(
              ChatThread,
              {},
              createElement(
                ChatMessage,
                { key: "old", role: "assistant" },
                createElement(ChatReveal, { key: "old-part" }, "Existing part"),
                phase >= 2 &&
                  createElement(ChatReveal, { key: "added-part" }, "Added part"),
              ),
              phase >= 1 &&
                createElement(
                  ChatMessage,
                  { key: "new", role: "assistant" },
                  createElement(ChatReveal, { key: "new-part" }, "New part"),
                ),
            ),
          ),
        );
      });
    };

    try {
      render(0);
      render(1);
      expect(host.querySelectorAll(".fynns-chat-message--enter")).toHaveLength(1);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(0);

      render(2);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(1);
      expect(host.querySelector(".fynns-chat-reveal--enter")?.textContent).toBe("Added part");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
});
