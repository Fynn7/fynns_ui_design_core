import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import {
  ChatCitations,
  type ChatCitation,
  type ChatCitationsProps,
} from "./ChatCitation";
import { ChatMarkdown } from "./ChatMarkdown";
import { RefreshIcon } from "./icons";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageProps = Omit<
  HTMLAttributes<HTMLElement>,
  "content" | "role"
> & {
  /** Speaker role — drives alignment and bubble chrome. */
  role: ChatMessageRole;
  /**
   * Message body. Prefer `markdown` for LLM turns (L2 GFM subset via
   * `ChatMarkdown`). When `markdown` is set it becomes the bubble body;
   * `children` is ignored for the body in that case. Without `markdown`,
   * bare string / number children are wrapped as `.fynns-chat-message-prose`
   * so sibling `CodeBlock` / wells get `--fynns-chatmessage-body-stack-gap`.
   * Token append while streaming is still the caller's job — this primitive
   * only paints incomplete cues.
   */
  children?: ReactNode;
  /**
   * Markdown / GFM-subset source for the bubble (`ChatMarkdown`). When set,
   * takes precedence over `children` for the answer body. Streaming: append
   * tokens into this string; incomplete fences stay open through EOF.
   */
  markdown?: string;
  /**
   * Optional leading avatar. Default omit (ChatGPT main thread has none);
   * pass only for multi-agent / branded rows. Ignored for `system`.
   */
  avatar?: ReactNode;
  /** Optional author label above the body. Ignored for `system`. */
  name?: ReactNode;
  /**
   * Incomplete / streaming UI cues: trailing caret blink (only when there is
   * answer text), `aria-busy`, and a polite live region. Does **not** generate
   * tokens — set `true` while the app appends `children`, then `false` when
   * the stream ends. No empty bubble / lone caret while waiting on thinking
   * with no answer tokens yet (including when children are only `null`
   * slots from conditional JSX). Ignored for `system`. Suppressed when
   * `error` is set.
   * @default false
   */
  streaming?: boolean;
  /** Accessible name while `streaming`. Default `"Generating response"`. */
  streamingLabel?: string;
  /**
   * Failed-generation footer under an assistant turn (ChatGPT-style).
   * Pass copy, or `true` for the English default
   * `"There was an error generating a response."`. When set, hides streaming
   * cues, citations, and `actions`. Partial `children` still render above the
   * footer. Ignored for `user` / `system`.
   */
  error?: ReactNode | boolean;
  /** Regenerate control shown with `error`. Omit to hide the button. */
  onRetry?: () => void;
  /** Regenerate button label. @default "Regenerate" */
  retryLabel?: string;
  /**
   * Trailing action cluster under the turn (typically Copy + Regenerate +
   * More). Hidden while `streaming` or when `error` is set. Revealed
   * on message hover / focus-within (touch: always). Core does **not** run an
   * LLM — consumer apps wire Regenerate to their own rerun. Distinct from the
   * failed-generation footer (`error` + `onRetry`). Ignored for `system`.
   */
  actions?: ReactNode;
  /**
   * Browsing / RAG source chips under the turn (assistant only). Hidden while
   * `streaming` or when `error` is set. See `ChatCitations` /
   * `ChatCitationChip`.
   */
  citations?: ChatCitation[];
  /** Accessible name for the citations group. @default "Sources" */
  citationsLabel?: string;
  /** Chips shown before “+N”. @default 3 */
  citationsVisibleCount?: number;
  /** Override new-tab open for citation chips / cards. */
  onCitationOpen?: ChatCitationsProps["onOpen"];
  /**
   * Optional reasoning disclosure between `name` and the answer bubble
   * (typically `<ChatThinking>…</ChatThinking>`). Core does not hide this on
   * `error` — the app decides whether to pass it. Ignored for `system`.
   */
  thinking?: ReactNode;
};

const DEFAULT_ERROR = "There was an error generating a response.";
const DEFAULT_RETRY = "Regenerate";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * True when `children` has paint-worthy body content. Conditional JSX that
 * resolves to only `null` / `false` / whitespace must not open the bubble or
 * stream caret (`Children.toArray` drops nullish slots).
 */
function hasRenderableBody(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    if (typeof child === "number") return true;
    return true;
  });
}

/**
 * Block answer units that must stack with body-stack-gap against prose.
 * Inline marks (`code`, `span`, `a`, …) stay inside a single prose run.
 */
function isBlockBodyChild(child: ReactNode): boolean {
  if (!isValidElement(child)) return false;
  const type = child.type;
  if (typeof type === "string") {
    return /^(div|p|pre|ul|ol|li|table|thead|tbody|tr|td|th|section|article|aside|header|footer|blockquote|hr|h[1-6]|figure|figcaption)$/i.test(
      type,
    );
  }
  const name =
    (typeof type === "function" || (typeof type === "object" && type != null)
      ? String(
          ("displayName" in type && type.displayName) ||
            ("name" in type && type.name) ||
            "",
        )
      : "") || "";
  if (
    /^(CodeBlock|ChatMarkdown|BusyRegion|Surface|Table|Carousel|EmptyState|ChatCitations|LinearProgress|CircularProgress)$/i.test(
      name,
    )
  ) {
    return true;
  }
  const className = (child.props as { className?: unknown }).className;
  if (typeof className === "string") {
    return /\bfynns-(code-block|chat-markdown|surface|table|carousel|empty-state|busy-region|chat-citations)\b/.test(
      className,
    );
  }
  return false;
}

/**
 * Promote bare text / inline runs to `.fynns-chat-message-prose` so they stack
 * against sibling CodeBlock / wells with `--fynns-chatmessage-body-stack-gap`.
 * Consecutive non-block children (string + inline `code`, …) coalesce into
 * **one** prose unit so chatCaption-style mixes stay inline. Streaming caret
 * nests inside the last prose when that unit is trailing.
 */
function renderBodyChildren(
  children: ReactNode,
  showCursor: boolean,
): ReactNode {
  const items = Children.toArray(children).filter((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    return true;
  });

  const out: ReactNode[] = [];
  let lastProseIndex = -1;
  let inlineBuf: ReactNode[] = [];
  let proseKey = 0;

  const flushInline = () => {
    if (inlineBuf.length === 0) return;
    lastProseIndex = out.length;
    out.push(
      <div
        key={`fynns-chat-prose-${proseKey++}`}
        className="fynns-chat-message-prose"
      >
        {inlineBuf}
      </div>,
    );
    inlineBuf = [];
  };

  items.forEach((child) => {
    if (typeof child === "string" || typeof child === "number") {
      inlineBuf.push(child);
      return;
    }
    if (isBlockBodyChild(child)) {
      flushInline();
      out.push(child);
      return;
    }
    inlineBuf.push(child);
  });
  flushInline();

  if (!showCursor) return out;

  const caret = (
    <span key="fynns-chat-cursor" className="fynns-chat-message-cursor" aria-hidden />
  );

  const lastIsProse =
    lastProseIndex >= 0 && lastProseIndex === out.length - 1;

  if (lastIsProse && isValidElement(out[lastProseIndex])) {
    const prose = out[lastProseIndex] as ReactElement<{ children?: ReactNode }>;
    out[lastProseIndex] = cloneElement(prose, {
      children: (
        <>
          {prose.props.children}
          {caret}
        </>
      ),
    });
    return out;
  }

  const last = out[out.length - 1];
  if (isValidElement(last)) {
    const type = last.type;
    const name =
      (typeof type === "function" || (typeof type === "object" && type != null)
        ? String(
            ("displayName" in type && type.displayName) ||
              ("name" in type && type.name) ||
              "",
          )
        : "") || "";
    const className = (last.props as { className?: unknown }).className;
    const isMarkdown =
      /^ChatMarkdown$/i.test(name) ||
      (typeof className === "string" &&
        /\bfynns-chat-markdown\b/.test(className));
    if (isMarkdown) {
      out[out.length - 1] = cloneElement(
        last as ReactElement<{ showCursor?: boolean }>,
        { showCursor: true },
      );
      return out;
    }
  }

  out.push(caret);
  return out;
}

/**
 * Chat row for user / assistant / system turns (ChatGPT-style).
 * `streaming` is a **UI prop only** — caret + incomplete semantics; no LLM.
 *
 * Dual placement: main uses rem-capped host (`--fynns-chatmessage-max-width`)
 * with user bubble at 70%; `EndAside` / `.fynns-chat-host--fill` use 100% pane
 * content and lift the user bubble ceiling to 100% so long turns match the
 * composer shell width (short copy still shrinks, end-aligned).
 *
 * Assistant `citations` render ChatGPT-style source chips under the body
 * (hover preview, click opens; +N expands footnote cards). `thinking` sits
 * between `name` and the answer bubble (typically `ChatThinking`). `error` /
 * `onRetry` paint the failed-generation footer under the turn (partial body
 * may remain above).
 */
export function ChatMessage({
  role,
  children,
  markdown,
  avatar,
  name,
  streaming = false,
  streamingLabel = "Generating response",
  error,
  onRetry,
  retryLabel = DEFAULT_RETRY,
  actions,
  citations,
  citationsLabel,
  citationsVisibleCount,
  onCitationOpen,
  thinking,
  className,
  ...rest
}: ChatMessageProps) {
  const isSystem = role === "system";
  const isAssistant = role === "assistant";
  const hasError =
    isAssistant && error != null && error !== false && error !== "";
  const errorCopy = error === true ? DEFAULT_ERROR : error;
  const isStreaming = !isSystem && !hasError && streaming;
  const showActions = !isSystem && !hasError && actions != null && !isStreaming;
  const showAvatar = !isSystem && avatar != null;
  const showName = !isSystem && name != null;
  const showThinking = !isSystem && thinking != null;
  const bodyChildren =
    markdown != null ? <ChatMarkdown source={markdown} /> : children;
  const hasBody = hasRenderableBody(bodyChildren);
  /** Caret only while tokens exist — never an empty bubble during thinking. */
  const showCursor = isStreaming && hasBody;
  const showBubble = hasBody;
  const showCitations =
    isAssistant &&
    !hasError &&
    !isStreaming &&
    citations != null &&
    citations.length > 0;

  return (
    <article
      {...rest}
      className={join(
        "fynns-chat-message",
        `fynns-chat-message--${role}`,
        isStreaming && "fynns-chat-message--streaming",
        hasError && "fynns-chat-message--error",
        className,
      )}
      data-role={role}
      data-message-author-role={role}
      data-streaming={isStreaming ? "true" : undefined}
      data-error={hasError ? "true" : undefined}
      aria-busy={isStreaming || undefined}
      aria-label={isStreaming ? streamingLabel : undefined}
      role={isSystem ? "status" : undefined}
    >
      {showAvatar ? (
        <div className="fynns-chat-message-avatar" aria-hidden>
          {avatar}
        </div>
      ) : null}
      <div className="fynns-chat-message-main">
        {showName ? (
          <div className="fynns-chat-message-name">{name}</div>
        ) : null}
        {showThinking ? thinking : null}
        {showBubble ? (
          <div className="fynns-chat-message-bubble">
            <div className="fynns-chat-message-body">
              {renderBodyChildren(bodyChildren, showCursor)}
            </div>
          </div>
        ) : null}
        {showCitations ? (
          <ChatCitations
            citations={citations}
            label={citationsLabel}
            visibleCount={citationsVisibleCount}
            onOpen={onCitationOpen}
          />
        ) : null}
        {hasError ? (
          <div className="fynns-chat-message-error" role="alert">
            <p className="fynns-chat-message-error-text">{errorCopy}</p>
            {onRetry ? (
              <Button
                type="button"
                size="sm"
                variant="tonal"
                className="fynns-chat-message-error-retry"
                onClick={onRetry}
              >
                <RefreshIcon size={16} />
                {retryLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
        {showActions ? (
          <div className="fynns-chat-message-actions">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}
