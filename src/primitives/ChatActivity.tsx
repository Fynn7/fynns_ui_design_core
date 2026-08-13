import {
  Children,
  isValidElement,
  type AnimationEvent,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ChevronRightIcon, FileIcon, ICON_SIZE, WrenchIcon } from "./icons";

export type ChatActivityStepStatus = "pending" | "active" | "done";

export type ChatActivityProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  /** Collapsible header — current stage summary (e.g. “Updated plan with details”). */
  label: ReactNode;
  /** Step rows (`ChatActivityStep`). */
  children?: ReactNode;
  /**
   * While true: header shimmer, `aria-busy`, and (uncontrolled) force-open
   * unless the user pinned the tree closed. Trigger stays enabled so the
   * tree can collapse mid-run. A new streaming cycle clears the pin.
   */
  streaming?: boolean;
  /** Controlled open. Omit for uncontrolled. */
  open?: boolean;
  /** @default true when `streaming`, else true (tree is useful open by default). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ChatActivityStepProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** @default "done" */
  status?: ChatActivityStepStatus;
  /**
   * Leading glyph (`any` ReactNode — consumers swap per tool / situation).
   * Omit → `WrenchIcon` for `done` / `pending`, soft status mark for
   * `active`. Pass `null` for an empty node (rail still connects). Node
   * box is `--fynns-size-icon`; SVG descendants are sized to that token.
   */
  icon?: ReactNode | null;
  /** Short step title (one line preferred). */
  label: ReactNode;
  /** Optional supporting copy under the title (active / narrative steps). */
  description?: ReactNode;
  /** Optional trailing artifact chip (`ChatActivityArtifact` or custom node). */
  artifact?: ReactNode;
};

export type ChatActivityArtifactProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  children: ReactNode;
  /** Leading glyph inside the capsule. @default FileIcon */
  icon?: ReactNode;
  /** When set, renders an anchor (caller owns navigation). */
  href?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ChatActivityStreamValue = {
  streaming: boolean;
  /** Increments each time `streaming` goes false → true so done steps replay the min-busy hold. */
  cycle: number;
  /**
   * Only the last step in the tree plays enter on mount. Earlier siblings
   * that appear in the same commit (instant-done rows) skip the fade/slide
   * so the whole tree does not re-animate as a block.
   */
  enterOnMount: boolean;
};

const ChatActivityStream = createContext<ChatActivityStreamValue>({
  streaming: false,
  cycle: 0,
  enterOnMount: false,
});

function readActivityMinBusyMs(el: Element | null): number {
  if (!el || typeof window === "undefined") return 1200;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  const style = getComputedStyle(el);
  let raw = style
    .getPropertyValue("--fynns-chatmessage-activity-step-min-busy")
    .trim();
  const nested = raw.match(/^var\((--[^),]+)/);
  if (nested) raw = style.getPropertyValue(nested[1]).trim();
  if (!raw) return 1200;
  if (raw.endsWith("ms")) return Math.max(0, Number.parseFloat(raw) || 1200);
  if (raw.endsWith("s")) return Math.max(0, (Number.parseFloat(raw) || 1.2) * 1000);
  return 1200;
}

/**
 * File / output capsule beside a done tool step (Cursor-style plan.md chip).
 * Micro chrome — may use `radius-sm` (not Chat panel `radius-22` floor).
 */
export function ChatActivityArtifact({
  children,
  icon,
  href,
  className,
  ...rest
}: ChatActivityArtifactProps) {
  const body = (
    <>
      <span className="fynns-chat-activity-artifact-icon" aria-hidden>
        {icon ?? <FileIcon size={ICON_SIZE} />}
      </span>
      <span className="fynns-chat-activity-artifact-label">{children}</span>
    </>
  );
  const classes = join("fynns-chat-activity-artifact", className);
  if (href != null) {
    return (
      <a {...rest} href={href} className={classes}>
        {body}
      </a>
    );
  }
  return (
    <span {...rest} className={classes}>
      {body}
    </span>
  );
}

/**
 * One row in a `ChatActivity` tree — tool call, narrative beat, or pending.
 * Icon | label(+artifact) share a dedicated `step-row` band so the glyph
 * center matches the label line box (strict); description sits under the
 * band, indented past the node column.
 */
export function ChatActivityStep({
  status = "done",
  icon,
  label,
  description,
  artifact,
  className,
  onAnimationEnd,
  ...rest
}: ChatActivityStepProps) {
  const stream = useContext(ChatActivityStream);
  const rootRef = useRef<HTMLDivElement>(null);
  const seenActiveRef = useRef(status === "active");
  const cycleSeenRef = useRef(stream.cycle);
  const streamingRef = useRef(stream.streaming);
  streamingRef.current = stream.streaming;
  const [holding, setHolding] = useState(
    () => stream.streaming && status === "done",
  );
  const [entering, setEntering] = useState(() => {
    if (!stream.streaming || !stream.enterOnMount) return false;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (stream.cycle !== cycleSeenRef.current) {
      cycleSeenRef.current = stream.cycle;
      seenActiveRef.current = status === "active";
    }
    if (status === "active") {
      seenActiveRef.current = true;
      setHolding(false);
      return;
    }
    if (status !== "done" || seenActiveRef.current) {
      setHolding(false);
      return;
    }
    if (!streamingRef.current) {
      setHolding(false);
      return;
    }
    setHolding(true);
    const ms = readActivityMinBusyMs(rootRef.current);
    if (ms <= 0) {
      setHolding(false);
      seenActiveRef.current = true;
      return;
    }
    const id = window.setTimeout(() => {
      setHolding(false);
      seenActiveRef.current = true;
    }, ms);
    return () => window.clearTimeout(id);
  }, [stream.cycle, status]);

  const visualStatus: ChatActivityStepStatus = holding ? "active" : status;
  const leading =
    icon === null ? null : holding ? (
      <span className="fynns-chat-activity-mark" aria-hidden />
    ) : icon !== undefined ? (
      icon
    ) : visualStatus === "active" ? (
      <span className="fynns-chat-activity-mark" aria-hidden />
    ) : (
      <WrenchIcon size={ICON_SIZE} />
    );
  const showArtifact = !holding && artifact != null;

  const onEnterEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    setEntering(false);
  };

  return (
    <div
      {...rest}
      ref={rootRef}
      className={join(
        "fynns-chat-activity-step",
        `fynns-chat-activity-step--${visualStatus}`,
        holding && "fynns-chat-activity-step--hold",
        entering && "fynns-chat-activity-step--enter",
        className,
      )}
      data-status={visualStatus}
      data-hold={holding ? "true" : undefined}
      onAnimationEnd={(event) => {
        onEnterEnd(event);
        onAnimationEnd?.(event);
      }}
    >
      <div className="fynns-chat-activity-step-row">
        <span className="fynns-chat-activity-node" aria-hidden>
          {leading}
        </span>
        <div className="fynns-chat-activity-headline">
          <span className="fynns-chat-activity-step-label">{label}</span>
          {showArtifact ? artifact : null}
        </div>
      </div>
      {description != null && description !== "" ? (
        <div className="fynns-chat-activity-desc">{description}</div>
      ) : null}
    </div>
  );
}

/**
 * Wave 2 multi-step agent / tool-call chain (Cursor-style status tree).
 * Collapsible header + vertical rail + step rows. Compose via
 * `ChatMessage.thinking` (alone or above `ChatThinking`) — UI chrome only.
 *
 * Open policy (uncontrolled): force open while `streaming` unless the user
 * pinned closed; trigger stays enabled so the tree can collapse mid-run.
 * A new streaming cycle clears the pin. Completed trees stay at last open
 * (`defaultOpen` true) — no post-stream auto-collapse.
 *
 * Instant-complete `done` steps still visualize while `streaming`: the
 * active mark holds for `--fynns-chatmessage-activity-step-min-busy`
 * (aliases `presentation-hint`) before the done glyph / artifact settle.
 * The hold finishes even if `streaming` flips off mid-pulse. Steps that
 * already painted as `active` skip the hold. Reduced-motion skips it.
 * Static (not streaming) trees show the final glyph immediately.
 * Only the newest (last) step plays a one-shot enter while streaming;
 * already-visible rows and same-commit older siblings do not. Callers
 * growing the tree must pass a stable `key` per logical step.
 *
 * Keep `ChatThinking` for single-block reasoning; do not overload it into a
 * timeline. This is the dedicated chain anatomy.
 *
 * @example
 * ```tsx
 * <ChatMessage role="assistant" thinking={
 *   <ChatActivity label="Updated plan with details" streaming={busy}>
 *     <ChatActivityStep
 *       status="done"
 *       icon={<FileIcon />}
 *       label="Updated memory file"
 *       artifact={<ChatActivityArtifact>plan.md</ChatActivityArtifact>}
 *     />
 *     <ChatActivityStep
 *       status="active"
 *       label="Updating the plan"
 *       description="Refining the outline…"
 *     />
 *   </ChatActivity>
 * }>
 *   Answer…
 * </ChatMessage>
 * ```
 */
export function ChatActivity({
  label,
  children,
  streaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  ...rest
}: ChatActivityProps) {
  const bodyId = useId();
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [userPinnedClosed, setUserPinnedClosed] = useState(false);
  const [streamCycle, setStreamCycle] = useState(0);
  const wasStreamingRef = useRef(streaming);

  useEffect(() => {
    if (streaming && !wasStreamingRef.current) {
      setStreamCycle((n) => n + 1);
      if (!isControlled) {
        setUserPinnedClosed(false);
        setInternalOpen(true);
      }
    }
    wasStreamingRef.current = streaming;
  }, [streaming, isControlled]);

  const isOpen = isControlled
    ? Boolean(open)
    : streaming && !userPinnedClosed
      ? true
      : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
      if (streaming) setUserPinnedClosed(!next);
    }
    onOpenChange?.(next);
  };

  const labelNode = (
    <span
      className={join(
        "fynns-chat-activity-label",
        streaming && "fynns-chat-activity-label--streaming",
      )}
    >
      {label}
    </span>
  );

  return (
    <div
      {...rest}
      className={join(
        "fynns-chat-activity",
        isOpen && "fynns-chat-activity--open",
        streaming && "fynns-chat-activity--streaming",
        className,
      )}
      data-streaming={streaming ? "true" : undefined}
      data-state={isOpen ? "open" : "closed"}
      aria-busy={streaming || undefined}
    >
      <button
        type="button"
        className="fynns-chat-activity-trigger"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setOpen(!isOpen)}
      >
        {labelNode}
        <ChevronRightIcon
          className="fynns-chat-activity-chevron"
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
            className="fynns-chat-activity-steps"
            inert={isOpen ? undefined : true}
          >
            {Children.toArray(children).map((child, index, list) => (
              <ChatActivityStream.Provider
                key={
                  isValidElement(child) && child.key != null
                    ? String(child.key)
                    : String(index)
                }
                value={{
                  streaming,
                  cycle: streamCycle,
                  enterOnMount: streaming && index === list.length - 1,
                }}
              >
                {child}
              </ChatActivityStream.Provider>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
