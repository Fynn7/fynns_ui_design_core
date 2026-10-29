import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { ChatMarkdown } from "./ChatMarkdown";

describe("ChatMarkdown streaming reveal", () => {
  it("wraps words only while reveal is on and preserves the text", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (source: string, reveal: boolean) => {
      act(() => {
        root.render(createElement(ChatMarkdown, { source, reveal }));
      });
    };

    try {
      render("Hello **world** again", true);
      expect(host.querySelectorAll(".fynns-chat-stream-word")).toHaveLength(3);
      expect(host.textContent).toBe("Hello world again");

      render("Hello **world** again", false);
      expect(host.querySelectorAll(".fynns-chat-stream-word")).toHaveLength(0);
      expect(host.textContent).toBe("Hello world again");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });

  it("keeps earlier word nodes mounted when the stream appends", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (source: string) => {
      act(() => {
        root.render(createElement(ChatMarkdown, { source, reveal: true }));
      });
    };

    try {
      render("Hello world");
      const first = host.querySelector(".fynns-chat-stream-word");
      expect(first?.textContent).toBe("Hello");

      render("Hello world again");
      expect(host.querySelectorAll(".fynns-chat-stream-word")).toHaveLength(3);
      expect(host.querySelector(".fynns-chat-stream-word")).toBe(first);
      expect(host.textContent).toBe("Hello world again");
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
});
