import { isValidElement, type ReactNode } from "react";
import {
  parseChatMarkdown,
  type MdBlock,
  type MdInline,
} from "./chatMarkdown/parse";

/** Default visible-text threshold before a user/assistant turn collapses. */
export const CHAT_MESSAGE_COLLAPSE_AFTER_CHARS = 1200;

function countCodePoints(value: string): number {
  return Array.from(value).length;
}

function countInlines(nodes: MdInline[]): number {
  let total = 0;
  for (const node of nodes) {
    switch (node.type) {
      case "text":
      case "code":
        total += countCodePoints(node.value);
        break;
      case "strong":
      case "em":
      case "del":
      case "link":
        total += countInlines(node.children);
        break;
      case "br":
        break;
    }
  }
  return total;
}

function countBlocks(blocks: MdBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
      case "heading":
        total += countInlines(block.children);
        break;
      case "code":
        total += countCodePoints(block.value);
        break;
      case "blockquote":
        total += countBlocks(block.children);
        break;
      case "list":
        for (const item of block.items) total += countInlines(item.children);
        break;
      case "hr":
        break;
    }
  }
  return total;
}

/** Visible text length of a `ChatMarkdown` source (markup excluded). */
export function chatMarkdownVisibleLength(source: string): number {
  if (!source.trim()) return 0;
  return countBlocks(parseChatMarkdown(source));
}

function elementTypeName(type: unknown): string {
  if (typeof type === "function" || (typeof type === "object" && type != null)) {
    return String(
      ("displayName" in type && type.displayName) ||
        ("name" in type && type.name) ||
        "",
    );
  }
  return "";
}

/**
 * Visible text length of arbitrary `ChatMessage` children. Strings / numbers
 * count directly; `<ChatMarkdown source>` counts parsed visible text;
 * `CodeBlock code` counts raw code; any other element recurses into
 * `props.children`. Emoji / CJK count as single code points.
 */
export function chatVisibleTextLength(node: ReactNode): number {
  if (node == null || typeof node === "boolean") return 0;
  if (typeof node === "string" || typeof node === "number") {
    return countCodePoints(String(node));
  }
  if (Array.isArray(node)) {
    return node.reduce<number>((sum, child) => sum + chatVisibleTextLength(child), 0);
  }
  if (isValidElement(node)) {
    const props = node.props as {
      source?: unknown;
      code?: unknown;
      children?: ReactNode;
    };
    const name = elementTypeName(node.type);
    if (/^ChatMarkdown$/i.test(name) && typeof props.source === "string") {
      return chatMarkdownVisibleLength(props.source);
    }
    if (/^CodeBlock$/i.test(name) && typeof props.code === "string") {
      return countCodePoints(props.code);
    }
    return chatVisibleTextLength(props.children);
  }
  return 0;
}

export type ChatCollapseDecision = {
  /** Raw visible text length backing the decision. */
  visibleLength: number;
  /** True when the toggle should render (long user/assistant turn). */
  canCollapse: boolean;
};

/** Pure collapse gate shared by `ChatMessage` and unit tests. */
export function resolveChatCollapse(input: {
  role: "user" | "assistant" | "system";
  collapsible?: boolean;
  markdown?: string;
  children?: ReactNode;
  collapseAfterChars?: number;
}): ChatCollapseDecision {
  const threshold = input.collapseAfterChars ?? CHAT_MESSAGE_COLLAPSE_AFTER_CHARS;
  if (input.collapsible === false || input.role === "system") {
    return { visibleLength: 0, canCollapse: false };
  }
  const visibleLength =
    input.markdown != null
      ? chatMarkdownVisibleLength(input.markdown)
      : chatVisibleTextLength(input.children);
  return { visibleLength, canCollapse: visibleLength > threshold };
}
