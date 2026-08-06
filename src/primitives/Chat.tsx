import {
  Children,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CompositionEvent,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type TextareaHTMLAttributes,
} from "react";
import { ArrowUpIcon, ChevronDownIcon, MicIcon, StopSquareIcon } from "./icons";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ChatContextValue = {
  threadRef: RefObject<HTMLDivElement | null>;
  atBottom: boolean;
  setAtBottom: (v: boolean) => void;
  stickToBottom: boolean;
  setStickToBottom: (v: boolean) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function useChatContext(component: string): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Chat>`);
  }
  return ctx;
}

export type ChatProps = HTMLAttributes<HTMLDivElement> & {
  /** Accessible name for the chat region. @default "Chat" */
  label?: string;
};

/**
 * ChatGPT-style chat shell: column with scrollable thread + docked composer.
 * Provides stick-to-bottom scroll context for `ChatThread` / `ChatScrollToBottom`.
 */
export function Chat({
  label = "Chat",
  className,
  children,
  ...rest
}: ChatProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [stickToBottom, setStickToBottom] = useState(true);

  const scrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    const el = threadRef.current;
    if (!el) return;
    const resolved =
      behavior ?? (prefersReducedMotion() ? "auto" : "smooth");
    el.scrollTo({ top: el.scrollHeight, behavior: resolved });
    setAtBottom(true);
    setStickToBottom(true);
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      threadRef,
      atBottom,
      setAtBottom,
      stickToBottom,
      setStickToBottom,
      scrollToBottom,
    }),
    [atBottom, stickToBottom, scrollToBottom],
  );

  return (
    <ChatContext.Provider value={value}>
      <div
        {...rest}
        className={join("fynns-chat", className)}
        role="region"
        aria-label={label}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}

export type ChatThreadProps = HTMLAttributes<HTMLDivElement> & {
  /** Shown when there are no message children. */
  empty?: ReactNode;
  /** Accessible name for the log. @default "Conversation" */
  label?: string;
};

/**
 * Scrollable message log (`role="log"`). Only this region scrolls inside `Chat`.
 */
export function ChatThread({
  empty,
  label = "Conversation",
  className,
  children,
  ...rest
}: ChatThreadProps) {
  const {
    threadRef,
    setAtBottom,
    setStickToBottom,
    stickToBottom,
  } = useChatContext("ChatThread");
  const hasMessages = Children.count(children) > 0;

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;

    const update = () => {
      const thresholdPx = (() => {
        const raw = getComputedStyle(el).getPropertyValue(
          "--fynns-chat-scroll-threshold",
        );
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? n * (raw.includes("rem") ? 16 : 1) : 80;
      })();
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const nearBottom = distance <= thresholdPx;
      setAtBottom(nearBottom);
      if (nearBottom) setStickToBottom(true);
      else setStickToBottom(false);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, [threadRef, setAtBottom, setStickToBottom]);

  useLayoutEffect(() => {
    if (!stickToBottom || !hasMessages) return;
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [children, stickToBottom, hasMessages, threadRef]);

  return (
    <div
      {...rest}
      ref={threadRef}
      className={join("fynns-chat-thread", "fynns-scroll", className)}
      role="log"
      aria-label={label}
      aria-relevant="additions"
    >
      <div className="fynns-chat-thread-inner">
        {hasMessages ? children : empty}
      </div>
    </div>
  );
}

export type ChatScrollToBottomProps = {
  /** Tooltip / aria-label. @default "Scroll to bottom" */
  label?: string;
  className?: string;
};

/** Circular ↓ control above the composer when the thread is scrolled up. */
export function ChatScrollToBottom({
  label = "Scroll to bottom",
  className,
}: ChatScrollToBottomProps) {
  const { atBottom, scrollToBottom } = useChatContext("ChatScrollToBottom");
  if (atBottom) return null;

  return (
    <div className={join("fynns-chat-scroll-fab", className)}>
      <Tooltip content={label}>
        <IconButton
          size="sm"
          variant="elevated"
          aria-label={label}
          onClick={() => scrollToBottom()}
        >
          <ChevronDownIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export type ChatComposerProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onChange" | "onSubmit"
> & {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** @default "Message" */
  placeholder?: string;
  /** Leading control. Omit or pass `null` to hide (no default Attach). */
  leading?: ReactNode | null;
  /** Optional attachment previews above the field (caller-owned). */
  attachments?: ReactNode;
  /** Override trailing primary action. */
  trailing?: ReactNode;
  busy?: boolean;
  onStop?: () => void;
  /** When set, empty idle shows a mic in the primary slot (Send stays when text). */
  onDictate?: () => void;
  dictating?: boolean;
  onStopDictate?: () => void;
  disabled?: boolean;
  /** Accessible name for the textarea. */
  ariaLabel: string;
  /** @default "Send" */
  sendLabel?: string;
  /** @default "Stop generating" */
  stopLabel?: string;
  /** @default "Dictate" */
  dictateLabel?: string;
  /** @default "Stop dictation" */
  stopDictateLabel?: string;
  /** Extra attrs for the textarea. */
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "disabled" | "placeholder" | "aria-label"
  >;
};

/**
 * Docked ChatGPT/Cursor-style composer: radius-3xl shell, Enter to send,
 * Shift+Enter newline, Esc stops while busy.
 *
 * Multiline layout (model C + compact morph): full-width textarea above a
 * bottom toolbar when expanded; collapsed keeps a single ~40dp row via
 * toolbar `display: contents` (Input density — not SearchBar 56dp).
 * Spec: `llm/CHAT_COMPOSER_LAYOUT.md`.
 *
 * ChatGPT’s live prompt is ProseMirror (`contenteditable`) with a
 * fallback textarea; height grows with the block + parent `max-height`
 * scroll. This primitive uses a controlled `<textarea>` + layout-effect
 * auto-grow instead (plain text, no editor dep) — see AGENTS.md Chat
 * “composer input model” parity note.
 *
 * CJK IME parity (ChatGPT): Enter while composing confirms the candidate
 * only — it must not send. See `handleKeyDown` / composition handlers.
 */
export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  function ChatComposer(
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Message",
      leading,
      attachments,
      trailing,
      busy = false,
      onStop,
      onDictate,
      dictating = false,
      onStopDictate,
      disabled = false,
      ariaLabel,
      sendLabel = "Send",
      stopLabel = "Stop generating",
      dictateLabel = "Dictate",
      stopDictateLabel = "Stop dictation",
      className,
      textareaProps,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const localRef = useRef<HTMLTextAreaElement | null>(null);
    /** True between compositionstart and compositionend (CJK IME). */
    const composingRef = useRef(false);
    /**
     * Safari (and some IME hosts) fire compositionend *before* the Enter
     * keydown that confirmed the candidate, with `isComposing` already false.
     * Swallow that one Enter so it does not send (ChatGPT parity).
     */
    const skipEnterAfterCompositionRef = useRef(false);
    const skipEnterClearRafRef = useRef<number | null>(null);
    /** Compact row vs full-width text + bottom toolbar (Cursor morph). */
    const [expanded, setExpanded] = useState(false);
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const canSubmit = value.trim().length > 0 && !busy && !disabled;
    const hasAttachments = attachments != null;

    useEffect(() => {
      return () => {
        if (skipEnterClearRafRef.current != null) {
          cancelAnimationFrame(skipEnterClearRafRef.current);
        }
      };
    }, []);

    const resize = useCallback(() => {
      const el = localRef.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      const line =
        Number.parseFloat(cs.minHeight) ||
        Number.parseFloat(cs.lineHeight) ||
        Number.parseFloat(cs.fontSize) * 1.5 ||
        24;
      // Empty = one text line (ChatGPT collapsed). Ignore placeholder wrap
      // scrollHeight so a long hint cannot inflate the shell in a narrow pane.
      if (!el.value) {
        el.style.height = `${line}px`;
        setExpanded(hasAttachments);
        return;
      }
      el.style.height = "0px";
      const scrollH = el.scrollHeight;
      const max =
        Number.parseFloat(cs.getPropertyValue("max-height")) || line * 8;
      const next = Math.min(Math.max(scrollH, line), max);
      el.style.height = `${next}px`;
      // 2px tolerance avoids float/subpixel flicker at exactly 1lh.
      const tallerThanOneLine = scrollH > line + 2;
      setExpanded(
        hasAttachments || el.value.includes("\n") || tallerThanOneLine,
      );
    }, [hasAttachments]);

    useLayoutEffect(() => {
      resize();
    }, [value, hasAttachments, resize]);

    const handleSubmit = (e?: FormEvent) => {
      e?.preventDefault();
      if (!canSubmit) return;
      onSubmit?.(value);
    };

    const handleCompositionStart = (
      e: CompositionEvent<HTMLTextAreaElement>,
    ) => {
      composingRef.current = true;
      skipEnterAfterCompositionRef.current = false;
      if (skipEnterClearRafRef.current != null) {
        cancelAnimationFrame(skipEnterClearRafRef.current);
        skipEnterClearRafRef.current = null;
      }
      textareaProps?.onCompositionStart?.(e);
    };

    const handleCompositionEnd = (
      e: CompositionEvent<HTMLTextAreaElement>,
    ) => {
      composingRef.current = false;
      skipEnterAfterCompositionRef.current = true;
      if (skipEnterClearRafRef.current != null) {
        cancelAnimationFrame(skipEnterClearRafRef.current);
      }
      // Clear after paint so a confirming Enter in this frame is skipped,
      // but a later intentional Enter still sends.
      skipEnterClearRafRef.current = requestAnimationFrame(() => {
        skipEnterAfterCompositionRef.current = false;
        skipEnterClearRafRef.current = null;
      });
      textareaProps?.onCompositionEnd?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      textareaProps?.onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === "Escape" && busy && onStop) {
        e.preventDefault();
        onStop();
        return;
      }

      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        // CJK IME: confirm candidate only — do not preventDefault / send.
        // keyCode 229 = legacy "processing" key during composition (Windows).
        if (
          composingRef.current ||
          e.nativeEvent.isComposing ||
          e.keyCode === 229 ||
          skipEnterAfterCompositionRef.current
        ) {
          skipEnterAfterCompositionRef.current = false;
          return;
        }
        e.preventDefault();
        if (canSubmit) onSubmit?.(value);
      }
    };

    const showLeading = leading != null;

    let primary: ReactNode = null;
    if (trailing !== undefined) {
      primary = trailing;
    } else if (busy && onStop) {
      primary = (
        <Tooltip content={stopLabel}>
          <IconButton
            type="button"
            size="sm"
            variant="primary"
            aria-label={stopLabel}
            onClick={onStop}
            className="fynns-chat-composer-primary"
          >
            <StopSquareIcon />
          </IconButton>
        </Tooltip>
      );
    } else if (dictating && onStopDictate) {
      primary = (
        <Tooltip content={stopDictateLabel}>
          <IconButton
            type="button"
            size="sm"
            variant="primary"
            aria-label={stopDictateLabel}
            onClick={onStopDictate}
            className="fynns-chat-composer-primary"
          >
            <StopSquareIcon />
          </IconButton>
        </Tooltip>
      );
    } else if (onDictate && value.trim().length === 0) {
      primary = (
        <Tooltip content={dictateLabel}>
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            aria-label={dictateLabel}
            disabled={disabled}
            onClick={onDictate}
            className="fynns-chat-composer-primary"
          >
            <MicIcon />
          </IconButton>
        </Tooltip>
      );
    } else {
      /* Always show Send when idle (and no dictate-empty swap); empty → disabled. */
      primary = (
        <Tooltip content={sendLabel}>
          <IconButton
            type="submit"
            size="sm"
            variant="primary"
            aria-label={sendLabel}
            disabled={!canSubmit}
            className="fynns-chat-composer-primary"
          >
            <ArrowUpIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <form
        {...rest}
        className={join("fynns-chat-composer", className)}
        onSubmit={handleSubmit}
        aria-busy={busy || undefined}
      >
        <div
          className="fynns-chat-composer-shell"
          data-expanded={expanded ? "" : undefined}
        >
          {hasAttachments ? (
            <div className="fynns-chat-composer-attachments fynns-scroll">
              {attachments}
            </div>
          ) : null}
          <div className="fynns-chat-composer-body">
            <textarea
              {...textareaProps}
              ref={setRefs}
              id={textareaProps?.id ?? autoId}
              className={join(
                "fynns-chat-composer-input",
                "fynns-scroll",
                textareaProps?.className,
              )}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              aria-label={ariaLabel}
              rows={1}
            />
            <div className="fynns-chat-composer-toolbar" role="toolbar">
              {showLeading ? (
                <div className="fynns-chat-composer-leading">{leading}</div>
              ) : null}
              <div className="fynns-chat-composer-primary-slot">{primary}</div>
            </div>
          </div>
        </div>
      </form>
    );
  },
);
