import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  resolveThinkingLabel,
  resolveThinkingOpen,
} from "./chatThinkingPolicy";
import { ChevronRightIcon, ICON_SIZE } from "./icons";

export type ChatThinkingProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Thought body (caller-owned summary — core does not parse markdown). */
  children?: ReactNode;
  /** While true: "Thinking" label, force-open (unless user pinned closed), opacity pulse. */
  streaming?: boolean;
  /** Label while `streaming`. @default "Thinking" */
  streamingLabel?: string;
  /** Done label when `durationMs` is omitted. @default "Thinking" */
  label?: string;
  /** Done wall-clock ms → `"Thought for Ns"` (app-derived). */
  durationMs?: number;
  /** Override done duration copy. Receives whole seconds. */
  durationLabel?: (seconds: number) => string;
  /** Controlled open. Omit for policy-driven uncontrolled open. */
  open?: boolean;
  /** Initial open when uncontrolled. @default false (policy opens while streaming). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional leading glyph. Omit for label + chevron only. */
  icon?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Single-block reasoning disclosure (ChatGPT / Claude “Thinking / Thought for Ns”).
 * Compose via `ChatMessage.thinking`. UI chrome only — no LLM / markdown.
 *
 * Open policy (uncontrolled): force open while `streaming` unless the user
 * pinned closed; auto-collapse once when streaming ends; user expand sticks.
 *
 * Without `children`, renders a non-expandable duration / label strip (no chevron).
 *
 * @example
 * ```tsx
 * <ChatMessage role="assistant" thinking={
 *   <ChatThinking streaming={busy} durationMs={busy ? undefined : 4200}>
 *     Checked the docs for token naming…
 *   </ChatThinking>
 * }>
 *   Answer body…
 * </ChatMessage>
 * ```
 */
export function ChatThinking({
  children,
  streaming = false,
  streamingLabel,
  label,
  durationMs,
  durationLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  icon,
  className,
  ...rest
}: ChatThinkingProps) {
  const bodyId = useId();
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [userPinnedClosed, setUserPinnedClosed] = useState(false);
  const [userPinnedOpen, setUserPinnedOpen] = useState(false);
  const [didAutoCollapse, setDidAutoCollapse] = useState(false);
  const wasStreamingRef = useRef(streaming);
  const policyRef = useRef({
    internalOpen: defaultOpen,
    userPinnedClosed: false,
    userPinnedOpen: false,
    didAutoCollapse: false,
  });
  policyRef.current.internalOpen = internalOpen;
  policyRef.current.userPinnedClosed = userPinnedClosed;
  policyRef.current.userPinnedOpen = userPinnedOpen;
  policyRef.current.didAutoCollapse = didAutoCollapse;

  const hasBody = children != null && children !== "";
  const resolvedLabel = resolveThinkingLabel({
    streaming,
    durationMs,
    streamingLabel,
    label,
    durationLabel,
  });

  useEffect(() => {
    if (isControlled) {
      wasStreamingRef.current = streaming;
      return;
    }

    const wasStreaming = wasStreamingRef.current;
    const prev = policyRef.current;
    let userPinnedClosedNext = prev.userPinnedClosed;
    let userPinnedOpenNext = prev.userPinnedOpen;
    let didAutoNext = prev.didAutoCollapse;
    const internalNext = prev.internalOpen;

    if (streaming && !wasStreaming) {
      userPinnedClosedNext = false;
      userPinnedOpenNext = false;
      didAutoNext = false;
    }

    const result = resolveThinkingOpen({
      streaming,
      internalOpen: internalNext,
      userPinnedClosed: userPinnedClosedNext,
      userPinnedOpen: userPinnedOpenNext,
      didAutoCollapse: didAutoNext,
      wasStreaming,
    });

    wasStreamingRef.current = streaming;

    if (userPinnedClosedNext !== prev.userPinnedClosed) {
      setUserPinnedClosed(userPinnedClosedNext);
    }
    if (userPinnedOpenNext !== prev.userPinnedOpen) {
      setUserPinnedOpen(userPinnedOpenNext);
    }
    if (result.didAutoCollapse !== prev.didAutoCollapse) {
      setDidAutoCollapse(result.didAutoCollapse);
    }
    if (result.open !== prev.internalOpen) {
      setInternalOpen(result.open);
    }
  }, [streaming, isControlled]);

  const isOpen = isControlled ? Boolean(open) : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
      if (streaming) {
        setUserPinnedClosed(!next);
        if (next) setUserPinnedOpen(false);
      } else {
        setUserPinnedOpen(next);
        setUserPinnedClosed(false);
        if (next) setDidAutoCollapse(true);
      }
    }
    onOpenChange?.(next);
  };

  const toggle = () => setOpen(!isOpen);

  const labelNode = (
    <span
      className={join(
        "fynns-chat-thinking-label",
        streaming && "fynns-chat-thinking-label--streaming",
      )}
    >
      {resolvedLabel}
    </span>
  );

  if (!hasBody) {
    return (
      <div
        {...rest}
        className={join(
          "fynns-chat-thinking",
          "fynns-chat-thinking--static",
          streaming && "fynns-chat-thinking--streaming",
          className,
        )}
        data-streaming={streaming ? "true" : undefined}
        aria-busy={streaming || undefined}
      >
        <div className="fynns-chat-thinking-row">
          {icon != null ? (
            <span className="fynns-chat-thinking-leading" aria-hidden>
              {icon}
            </span>
          ) : null}
          {labelNode}
        </div>
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={join(
        "fynns-chat-thinking",
        isOpen && "fynns-chat-thinking--open",
        streaming && "fynns-chat-thinking--streaming",
        className,
      )}
      data-streaming={streaming ? "true" : undefined}
      data-state={isOpen ? "open" : "closed"}
      aria-busy={streaming || undefined}
    >
      <button
        type="button"
        className="fynns-chat-thinking-trigger"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={toggle}
      >
        {icon != null ? (
          <span className="fynns-chat-thinking-leading" aria-hidden>
            {icon}
          </span>
        ) : null}
        {labelNode}
        <ChevronRightIcon
          className="fynns-chat-thinking-chevron"
          size={ICON_SIZE}
          aria-hidden
        />
      </button>
      <div
        className="fynns-expand"
        data-state={isOpen ? "open" : "closed"}
        aria-hidden={!isOpen}
      >
        <div className="fynns-expand-inner">
          <div
            id={bodyId}
            className="fynns-chat-thinking-body"
            inert={isOpen ? undefined : true}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

