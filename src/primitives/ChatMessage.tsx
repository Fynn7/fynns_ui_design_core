import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";
import {
  ChatCitations,
  type ChatCitation,
  type ChatCitationsProps,
} from "./ChatCitation";
import { RefreshIcon } from "./icons";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageProps = Omit<
  HTMLAttributes<HTMLElement>,
  "content" | "role"
> & {
  /** Speaker role — drives alignment and bubble chrome. */
  role: ChatMessageRole;
  /**
   * Message body. The caller owns markdown rendering and token append while
   * streaming — this primitive only paints incomplete cues.
   */
  children?: ReactNode;
  /**
   * Optional leading avatar. Default omit (ChatGPT main thread has none);
   * pass only for multi-agent / branded rows. Ignored for `system`.
   */
  avatar?: ReactNode;
  /** Optional author label above the body. Ignored for `system`. */
  name?: ReactNode;
  /**
   * Incomplete / streaming UI cues: trailing caret blink, `aria-busy`, and a
   * polite live region. Does **not** generate tokens — set `true` while the
   * app appends `children`, then `false` when the stream ends.
   * Ignored for `system`. Suppressed when `error` is set.
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
   * Trailing action cluster (copy / regenerate). Hidden while `streaming`
   * or when `error` is set. User actions are hover / focus-within (touch:
   * always). Assistant: always. Ignored for `system`.
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
};

const DEFAULT_ERROR = "There was an error generating a response.";
const DEFAULT_RETRY = "Regenerate";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Chat row for user / assistant / system turns (ChatGPT-style).
 * `streaming` is a **UI prop only** — caret + incomplete semantics; no LLM.
 *
 * Dual placement: main uses rem-capped host (`--fynns-chatmessage-max-width`);
 * `EndAside` / `.fynns-chat-host--fill` use 100% pane content. User bubble is
 * always 70% of that host.
 *
 * Assistant `citations` render ChatGPT-style source chips under the body
 * (hover preview, click opens; +N expands footnote cards). `error` /
 * `onRetry` paint the failed-generation footer under the turn (partial body
 * may remain above).
 */
export function ChatMessage({
  role,
  children,
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
  const hasBody = children != null && children !== "";
  const showBubble = hasBody || isStreaming;
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
        {showBubble ? (
          <div className="fynns-chat-message-bubble">
            {hasBody ? (
              <div className="fynns-chat-message-body">{children}</div>
            ) : null}
            {isStreaming ? (
              <span className="fynns-chat-message-cursor" aria-hidden />
            ) : null}
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
