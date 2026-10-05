import {
  type HTMLAttributes,
  type ReactNode,
  useId,
  createContext,
  useContext,
} from "react";
import { resolveThinkingLabel } from "./chatThinkingPolicy";
import { useStatusTreeOpen } from "./useStatusTreeOpen";
import { ChevronRightIcon, SparklesIcon, ICON_SIZE } from "./icons";
import { OverflowTip } from "./OverflowTip";

/** Text stays structured; inline code is display copy, never executable. */
export type ChatThinkingText = string | readonly (string | { code: string })[];
export type ChatThinkingArtifact = { label: string; icon?: ReactNode };

/** Quiet reasoning content. Stable IDs retain nested disclosure state as text grows. */
export type ChatThinkingDetail =
  | { id: string; text: ChatThinkingText; label?: never; details?: never }
  | {
      id: string;
      label: string;
      summary?: string;
      icon?: ReactNode;
      marker?: "icon" | "dot" | "none";
      artifact?: ChatThinkingArtifact;
      details?: readonly ChatThinkingDetail[];
      streaming?: boolean;
      streamingLabel?: string;
      defaultOpen?: boolean;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      text?: never;
    };

const ThinkingDepth = createContext(0);

export type ChatThinkingProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** `status` = label only; `disclosure` = expandable when a body exists. @default "disclosure" */
  variant?: "status" | "disclosure";
  /** Prefer details for structured work: only muted text and nested ChatThinking. */
  details?: readonly ChatThinkingDetail[];
  /** Muted continuation after the main heading. */
  summary?: string;
  /** Decorative nested mark; depth 2+ defaults to dot, depth 1 reserves an icon slot. */
  marker?: "icon" | "dot" | "none";
  /** Non-interactive inline artifact label, owned and styled by core. */
  artifact?: ChatThinkingArtifact;
  /** Thought text or nested ChatThinking. Keep cards, controls and results outside. */
  children?: ReactNode;
  /**
   * While true: streaming label + force-open (unless user pinned closed) +
   * label motion. Trigger stays enabled so the disclosure can
   * collapse mid-run. Label is consumer-owned progressive copy
   * (`"Thinking"`, `"Calling the function…"`, `"Searching…"`, …) —
   * swap `streamingLabel` to morph the row (AGENTS.md **Label tense**).
   */
  streaming?: boolean;
  /** Label while `streaming` (progressive). @default "Thinking" */
  streamingLabel?: string;
  /**
   * Done label when `durationMs` is omitted. Prefer past tense when the
   * run finished without a duration strip (e.g. `"Thought"`). The default
   * `"Thinking"` is a compatibility placeholder — pass an explicit past
   * string (or `durationMs` → `"Thought for Ns"`) for done chrome.
   * @default "Thinking"
   */
  label?: string;
  /** Done wall-clock ms → `"Thought for Ns"` past-tense strip (app-derived). */
  durationMs?: number;
  /** Override done duration copy. Receives whole seconds. */
  durationLabel?: (seconds: number) => string;
  /** Controlled open. Omit for policy-driven uncontrolled open. */
  open?: boolean;
  /** Initial open when uncontrolled. @default false (policy opens while streaming). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional leading glyph. Omit or pass `null` for label-only (no
   * default streaming orb).
   */
  icon?: ReactNode | null;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Single-block reasoning / agent-activity disclosure (ChatGPT / Claude
 * “Thinking / Thought for Ns”; Cursor-style tool status via `streamingLabel`).
 * Compose via `ChatMessage.thinking`. UI chrome only — no LLM / markdown.
 *
 * Lifecycle: keep the same disclosure mounted after `streaming` becomes false
 * and while answer tokens, later activity, or an error render. Completion
 * changes the label and open state; it never removes the trigger or body.
 * Pass completed thought text as `children` and a past-tense `label` or
 * `durationMs`. The parent owns retention across its own state transitions.
 *
 * Open policy (uncontrolled): force open while `streaming` unless the user
 * pinned closed (trigger stays enabled so the disclosure can collapse
 * mid-run; a new streaming cycle clears the pin). Auto-collapse the body once
 * when streaming ends; the header remains visible and can be reopened.
 * User expand after done sticks.
 *
 * `variant="status"` renders a label strip without chevron or body.
 * Default `variant="disclosure"` expands only when `children` exists; without
 * a body it falls back to the same non-expandable strip. ChatThinkingStack
 * owns consecutive row spacing for both variants. Structured details render only
 * muted text and nested ChatThinking with decorative nesting guides and elbows. Keep cards, controls, artifact
 * viewers and results outside. Legacy children follow the same content rule.
 * Do **not** pipe labels or thought text into a live region.
 *
 * @example
 * ```tsx
 * <ChatMessage role="assistant" thinking={
 *   <ChatThinking
 *     streaming={busy}
 *     streamingLabel={busy ? activity : undefined}
 *     durationMs={busy ? undefined : 4200}
 *   >
 *     Checked the docs for token naming…
 *   </ChatThinking>
 * }>
 *   Answer body…
 * </ChatMessage>
 * ```
 */
export function ChatThinking({
  variant = "disclosure",
  children,
  details,
  summary,
  marker,
  artifact,
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
  const depth = useContext(ThinkingDepth);
  const structured = details !== undefined;
  const nestedMarker = marker ?? (icon != null ? "icon" : depth > 1 ? "dot" : depth === 1 ? "icon" : "none");
  const { open: isOpen, setOpen } = useStatusTreeOpen({
    mode: "thinking",
    streaming,
    open,
    defaultOpen,
    onOpenChange,
  });

  const body = structured ? details.map((detail) =>
    detail.text !== undefined ? (
      <p key={detail.id} className="fynns-chat-thinking-text">{typeof detail.text === "string" ? detail.text : detail.text.map((part, index) => typeof part === "string" ? part : <code key={index}>{part.code}</code>)}</p>
    ) : (
      <ChatThinking
        key={detail.id}
        label={detail.label}
        summary={detail.summary}
        icon={detail.icon}
        marker={detail.marker}
        artifact={detail.artifact}
        details={detail.details}
        streaming={detail.streaming}
        streamingLabel={detail.streamingLabel ?? detail.label}
        defaultOpen={detail.defaultOpen}
        open={detail.open}
        onOpenChange={detail.onOpenChange}
      />
    ),
  ) : children;
  const hasBody = variant === "disclosure" && (structured
    ? details.length > 0
    : children != null && children !== "");
  const resolvedLabel = resolveThinkingLabel({
    streaming,
    durationMs,
    streamingLabel,
    label,
    durationLabel,
  });

  const toggle = () => setOpen(!isOpen);

  const leading =
    depth > 0 && nestedMarker === "dot" ? <span className="fynns-chat-thinking-dot" aria-hidden /> : (icon != null && !(depth > 0 && nestedMarker === "none")) || (depth > 0 && nestedMarker === "icon") ? (
      <span className="fynns-chat-thinking-leading" aria-hidden>
        {icon ?? <SparklesIcon />}
      </span>
    ) : null;

  const labelNode = (
    <OverflowTip
      key={resolvedLabel}
      content={[resolvedLabel, summary, artifact?.label].filter(Boolean).join(" ")}
      className={join(
        "fynns-chat-thinking-label",
        streaming && "fynns-chat-thinking-label--streaming",
        "fynns-chat-thinking-label--swap",
      )}
    >
      <span className="fynns-chat-thinking-title">{resolvedLabel}</span>
      {summary && <>{" "}<span className="fynns-chat-thinking-summary">{summary}</span></>}
      {artifact && <span className="fynns-chat-thinking-artifact">{" "}{artifact.icon && <span className="fynns-chat-thinking-artifact-icon" aria-hidden>{artifact.icon}</span>}<span>{artifact.label}</span></span>}
    </OverflowTip>
  );

  if (!hasBody) {
    return (
      <div
        {...rest}
        className={join(
          "fynns-chat-thinking",
          depth > 0 && "fynns-chat-thinking--nested",
          structured && "fynns-chat-thinking--structured",
          "fynns-chat-thinking--static",
          streaming && "fynns-chat-thinking--streaming",
          className,
        )}
        data-thinking-depth={depth}
        data-thinking-marker={depth > 0 ? nestedMarker : undefined}
        data-streaming={streaming ? "true" : undefined}
        aria-busy={streaming || undefined}
      >
        <div className="fynns-chat-thinking-row">
          {leading}
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
        depth > 0 && "fynns-chat-thinking--nested",
        structured && "fynns-chat-thinking--structured",
        isOpen && "fynns-chat-thinking--open",
        streaming && "fynns-chat-thinking--streaming",
        className,
      )}
      data-thinking-depth={depth}
      data-thinking-marker={depth > 0 ? nestedMarker : undefined}
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
        {leading}
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
            <ThinkingDepth.Provider value={depth + 1}>{body}</ThinkingDepth.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

export type ChatThinkingStackProps = HTMLAttributes<HTMLDivElement>;

/**
 * Consecutive ChatThinking rows with the canonical quiet status rhythm.
 * Use in ChatMessage.thinking; preserve child keys and append in event order.
 * End a stack at an intervening question/message/result; start a new one after it.
 */
export function ChatThinkingStack({ children, className, ...rest }: ChatThinkingStackProps) {
  return (
    <div {...rest} className={join("fynns-chat-thinking-stack", className)}>
      {children}
    </div>
  );
}
