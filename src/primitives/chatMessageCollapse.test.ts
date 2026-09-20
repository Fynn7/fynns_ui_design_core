import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ChatMarkdown } from "./ChatMarkdown";
import {
  CHAT_MESSAGE_COLLAPSE_AFTER_CHARS,
  chatMarkdownVisibleLength,
  chatVisibleTextLength,
  resolveChatCollapse,
} from "./chatMessageCollapse";

describe("chatMarkdownVisibleLength", () => {
  it("ignores markup and counts visible text only", () => {
    expect(chatMarkdownVisibleLength("**bold** and `code`")).toBe(
      "bold and code".length,
    );
    expect(chatMarkdownVisibleLength("# Title\n\n- a\n- b")).toBe("Titleab".length);
    expect(chatMarkdownVisibleLength("```ts\nabc\n```")).toBe(3);
  });

  it("counts CJK and emoji as single code points", () => {
    expect(chatMarkdownVisibleLength("你好世界")).toBe(4);
    expect(chatMarkdownVisibleLength("hi 👋")).toBe(4);
  });
});

describe("chatVisibleTextLength", () => {
  it("counts strings, numbers, and nested children", () => {
    expect(chatVisibleTextLength("hello")).toBe(5);
    expect(chatVisibleTextLength(42)).toBe(2);
    expect(
      chatVisibleTextLength(["ab", null, false, createElement("span", null, "cd")]),
    ).toBe(4);
  });

  it("counts ChatMarkdown source as visible text", () => {
    expect(
      chatVisibleTextLength(createElement(ChatMarkdown, { source: "**hi** there" })),
    ).toBe("hi there".length);
  });
});

describe("resolveChatCollapse", () => {
  it("exposes the default threshold", () => {
    expect(CHAT_MESSAGE_COLLAPSE_AFTER_CHARS).toBe(1200);
  });

  it("keeps short and boundary messages expanded", () => {
    expect(
      resolveChatCollapse({ role: "assistant", markdown: "short" }).canCollapse,
    ).toBe(false);
    expect(
      resolveChatCollapse({ role: "user", markdown: "a".repeat(1200) }).canCollapse,
    ).toBe(false);
  });

  it("collapses long user and assistant turns", () => {
    expect(
      resolveChatCollapse({ role: "assistant", markdown: "a".repeat(1201) })
        .canCollapse,
    ).toBe(true);
    expect(
      resolveChatCollapse({ role: "user", children: "b".repeat(2000) }).canCollapse,
    ).toBe(true);
  });

  it("never collapses system or opted-out turns", () => {
    expect(
      resolveChatCollapse({ role: "system", markdown: "a".repeat(5000) }).canCollapse,
    ).toBe(false);
    expect(
      resolveChatCollapse({
        role: "assistant",
        markdown: "a".repeat(5000),
        collapsible: false,
      }).canCollapse,
    ).toBe(false);
  });

  it("honors a custom threshold", () => {
    expect(
      resolveChatCollapse({
        role: "assistant",
        markdown: "a".repeat(100),
        collapseAfterChars: 50,
      }).canCollapse,
    ).toBe(true);
  });
});
