import { isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Shared Chat body / streaming-tail block-host tables.
 * Internal seam — not a public Consumer API.
 *
 * Two modes share name/class locality but diverge intentionally:
 * - **stack** — answer body units that must open body-stack-gap (includes
 *   ChatMarkdown + block HTML tags).
 * - **streamOpaque** — hosts that must not receive the streaming glyph cue
 *   (ChatMarkdown stays wrapable so the R05 pulse can land on prose).
 */

const STACK_COMPONENT =
  /^(CodeBlock|ChatMarkdown|BusyRegion|Surface|Table|Carousel|EmptyState|ChatCitations|LinearProgress|CircularProgress)$/i;
const STREAM_OPAQUE_COMPONENT =
  /^(CodeBlock|BusyRegion|Surface|Table|Carousel|EmptyState|ChatCitations|LinearProgress|CircularProgress)$/i;

const STACK_CLASS =
  /\bfynns-(code-block|chat-markdown|surface|table|carousel|empty-state|busy-region|chat-citations)\b/;
const STREAM_OPAQUE_CLASS =
  /\bfynns-(code-block|surface|table|carousel|empty-state|busy-region|chat-citations)\b/;

const STACK_DOM =
  /^(div|p|pre|ul|ol|li|table|thead|tbody|tr|td|th|section|article|aside|header|footer|blockquote|hr|h[1-6]|figure|figcaption)$/i;
const STREAM_OPAQUE_DOM = /^(pre|table|hr|img|video|iframe|svg)$/i;

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

export type ChatBlockHostMode = "stack" | "streamOpaque";

/** True when `el` is an opaque / stack block host for the given mode. */
export function isChatBlockHost(
  el: ReactElement,
  mode: ChatBlockHostMode,
): boolean {
  const type = el.type;
  const name = elementTypeName(type);
  const componentRe =
    mode === "stack" ? STACK_COMPONENT : STREAM_OPAQUE_COMPONENT;
  if (componentRe.test(name)) return true;

  const className = (el.props as { className?: unknown }).className;
  const classRe = mode === "stack" ? STACK_CLASS : STREAM_OPAQUE_CLASS;

  // streamOpaque: any string className short-circuits (legacy isOpaqueBlockHost).
  // `<pre className="language-js">` stays wrapable for the streaming cue.
  if (mode === "streamOpaque") {
    if (typeof className === "string") return classRe.test(className);
    if (typeof type === "string") return STREAM_OPAQUE_DOM.test(type);
    return false;
  }

  if (typeof className === "string" && classRe.test(className)) return true;
  if (typeof type === "string") return STACK_DOM.test(type);
  return false;
}

/** Body-stack unit detector (ChatMessage prose promotion). */
export function isChatStackBlock(child: ReactNode): boolean {
  if (!isValidElement(child)) return false;
  return isChatBlockHost(child, "stack");
}

/** Streaming-tail skip detector (opaque wells only). */
export function isChatStreamOpaqueHost(el: ReactElement): boolean {
  return isChatBlockHost(el, "streamOpaque");
}
