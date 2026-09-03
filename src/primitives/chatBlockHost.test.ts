import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
  isChatBlockHost,
  isChatStackBlock,
  isChatStreamOpaqueHost,
} from "./chatBlockHost";

function NamedCodeBlock() {
  return createElement("pre");
}
NamedCodeBlock.displayName = "CodeBlock";

function NamedChatMarkdown() {
  return createElement("div");
}
NamedChatMarkdown.displayName = "ChatMarkdown";

describe("isChatBlockHost", () => {
  it("treats CodeBlock as stack and stream-opaque", () => {
    const el = createElement(NamedCodeBlock);
    expect(isChatBlockHost(el, "stack")).toBe(true);
    expect(isChatStreamOpaqueHost(el)).toBe(true);
  });

  it("treats ChatMarkdown as stack but not stream-opaque", () => {
    const el = createElement(NamedChatMarkdown);
    expect(isChatStackBlock(el)).toBe(true);
    expect(isChatStreamOpaqueHost(el)).toBe(false);
  });

  it("class-based fynns-code-block is opaque in both modes", () => {
    const el = createElement("div", { className: "fynns-code-block" });
    expect(isChatStackBlock(el)).toBe(true);
    expect(isChatStreamOpaqueHost(el)).toBe(true);
  });

  it("stack mode includes block DOM tags; stream-opaque is narrower", () => {
    expect(isChatStackBlock(createElement("p", null, "hi"))).toBe(true);
    expect(isChatStreamOpaqueHost(createElement("p", null, "hi"))).toBe(false);
    expect(isChatStreamOpaqueHost(createElement("pre", null, "x"))).toBe(true);
  });

  it("streamOpaque: any className short-circuits (pre+language stays wrapable)", () => {
    expect(
      isChatStreamOpaqueHost(createElement("pre", { className: "language-js" }, "x")),
    ).toBe(false);
    expect(
      isChatStreamOpaqueHost(
        createElement("hr", { className: "fynns-chat-markdown-hr" }),
      ),
    ).toBe(false);
    const md = createElement("div", { className: "fynns-chat-markdown" });
    expect(isChatStackBlock(md)).toBe(true);
    expect(isChatStreamOpaqueHost(md)).toBe(false);
  });

  it("inline spans are not stack blocks", () => {
    expect(isChatStackBlock(createElement("span", null, "x"))).toBe(false);
    expect(isChatStackBlock("plain")).toBe(false);
  });
});
