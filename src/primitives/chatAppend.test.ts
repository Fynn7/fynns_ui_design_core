import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { Chat, ChatThread } from "./Chat";
import { ChatMessage } from "./ChatMessage";
import { ChatReveal } from "./ChatReveal";

describe("chat append paint", () => {
  it("paints appended messages and blocks immediately, without entrance classes", () => {
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
      render(true);
      expect(host.querySelectorAll(".fynns-chat-message--enter")).toHaveLength(0);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(0);
      expect(host.textContent).toContain("New answer");
      expect(host.textContent).toContain("New block");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });

  it("does not mark a part appended inside an existing message", () => {
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
              createElement(
                ChatMessage,
                { key: "answer", role: "assistant" },
                createElement(ChatReveal, { key: "part-1" }, "Existing part"),
                append &&
                  createElement(ChatReveal, { key: "part-2" }, "Added part"),
              ),
            ),
          ),
        );
      });
    };

    try {
      render(false);
      render(true);
      expect(host.querySelectorAll(".fynns-chat-reveal--enter")).toHaveLength(0);
      expect(host.textContent).toContain("Added part");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
});
