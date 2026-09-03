import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { isChatStreamOpaqueHost } from "./chatBlockHost";

/** Class on the last streamed glyph (R05 color pulse). */
export const CHAT_STREAM_TAIL_CLASS = "fynns-chat-message-stream-tail";

/**
 * Split the last non-whitespace Unicode glyph (emoji-safe via `Array.from`).
 * Trailing whitespace stays after the wrapped glyph.
 */
export function splitLastGlyph(
  text: string,
): { head: string; tail: string; trailing: string } | null {
  const chars = Array.from(text);
  if (chars.length === 0) return null;
  let idx = chars.length - 1;
  while (idx >= 0 && chars[idx]!.trim().length === 0) idx -= 1;
  if (idx < 0) return null;
  return {
    head: chars.slice(0, idx).join(""),
    tail: chars[idx]!,
    trailing: chars.slice(idx + 1).join(""),
  };
}

function isOpaqueBlockHost(el: ReactElement): boolean {
  return isChatStreamOpaqueHost(el);
}

/**
 * Walk children from the end and wrap the last text glyph in
 * `.fynns-chat-message-stream-tail`. Skips opaque block hosts (CodeBlock, …)
 * so earlier prose can still receive the cue. Returns `null` when nothing
 * was wrapable (caller may omit the streaming glyph cue).
 */
export function applyStreamingTail(children: ReactNode): ReactNode | null {
  const items = Children.toArray(children);
  if (items.length === 0) return null;

  for (let i = items.length - 1; i >= 0; i--) {
    const child = items[i];

    if (typeof child === "string" || typeof child === "number") {
      const split = splitLastGlyph(String(child));
      if (!split) continue;
      const next = items.slice();
      next[i] = (
        <>
          {split.head}
          <span className={CHAT_STREAM_TAIL_CLASS}>{split.tail}</span>
          {split.trailing}
        </>
      );
      return next.length === 1 ? next[0] : next;
    }

    if (!isValidElement(child)) continue;
    if (isOpaqueBlockHost(child)) continue;

    const nested = (child.props as { children?: ReactNode }).children;
    if (nested == null || nested === false) continue;

    const wrapped = applyStreamingTail(nested);
    if (wrapped == null) continue;

    const next = items.slice();
    const prevClass = (child.props as { className?: string }).className;
    next[i] = cloneElement(child as ReactElement<{ children?: ReactNode; className?: string }>, {
      children: wrapped,
      // Keep host classes; tail lives inside.
      className: prevClass,
    });
    return next.length === 1 ? next[0] : next;
  }

  return null;
}
