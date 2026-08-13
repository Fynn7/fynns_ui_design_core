import {
  Children,
  isValidElement,
  type AnimationEvent,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
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
  index: number;
  isLast: boolean;
  /**
   * True on the first paint where an earlier sibling is a newly mounted
   * instant-done row (will hold then complete). Later steps stay queued
   * until that settle finishes so complete + enter never overlap.
   */
  priorWillHold: boolean;
  /**
   * True on the first paint where an earlier sibling is flipping
   * `active` → `done` (complete one-shot, no hold).
   */
  priorWillComplete: boolean;
  /** True while any earlier sibling is still in the min-busy hold or complete. */
  priorHolding: boolean;
  reportHold: (index: number, holding: boolean) => void;
};

const ChatActivityStream = createContext<ChatActivityStreamValue>({
  streaming: false,
  cycle: 0,
  index: 0,
  isLast: false,
  priorWillHold: false,
  priorWillComplete: false,
  priorHolding: false,
  reportHold: () => {},
});

function childKey(child: ReactNode, index: number): string {
  return isValidElement(child) && child.key != null
    ? String(child.key)
    : String(index);
}

function childStepStatus(child: ReactNode): ChatActivityStepStatus | undefined {
  if (!isValidElement(child)) return undefined;
  return (child.props as ChatActivityStepProps).status ?? "done";
}

function readTokenMs(
  el: Element | null,
  prop: string,
  fallback: number,
): number {
  if (!el || typeof window === "undefined") return fallback;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  const style = getComputedStyle(el);
  let raw = style.getPropertyValue(prop).trim();
  const nested = raw.match(/^var\((--[^),]+)/);
  if (nested) raw = style.getPropertyValue(nested[1]).trim();
  if (!raw) return fallback;
  if (raw.endsWith("ms")) return Math.max(0, Number.parseFloat(raw) || fallback);
  if (raw.endsWith("s")) {
    return Math.max(0, (Number.parseFloat(raw) || fallback / 1000) * 1000);
  }
  return fallback;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
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
 * Icon | headline share a dedicated `step-row` band (form-style floor +
 * measured max height across open steps) so glyph, label, and artifact
 * vertically center together. Description sits under that band, indented
 * to the copy column. New streaming rows snap `.fynns-expand` `0fr`/`1fr`
 * (no height transition) and fade the **whole step** (opacity only —
 * no translateY). Animating `0fr`→`1fr` inside `overflow: hidden`
 * clip-wipes the tree top-to-bottom and reads as a bounce. Node + rail
 * stay in the layout box. Hold keeps the artifact in layout
 * (`visibility: hidden`) so the row does not jump when the capsule
 * appears. Hold → done (and active → done) plays a complete one-shot on
 * the glyph + artifact.
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
  const prevStatusRef = useRef(status);
  const cycleSeenRef = useRef(stream.cycle);
  const streamingRef = useRef(stream.streaming);
  streamingRef.current = stream.streaming;
  const completeTimerRef = useRef<number | null>(null);
  const [holding, setHolding] = useState(
    () =>
      stream.streaming &&
      status === "done" &&
      !(stream.priorWillHold || stream.priorWillComplete),
  );
  const [completing, setCompleting] = useState(false);
  const [queued, setQueued] = useState(
    () =>
      stream.streaming && (stream.priorWillHold || stream.priorWillComplete),
  );
  const initiallyQueued =
    stream.streaming &&
    (stream.priorWillHold || stream.priorWillComplete);
  const [entering, setEntering] = useState(
    () => stream.streaming && !initiallyQueued && !prefersReducedMotion(),
  );
  const [expandOpen, setExpandOpen] = useState(() => !initiallyQueued);
  const enterPlayedRef = useRef(false);
  const enteringRef = useRef(false);
  enteringRef.current = entering;
  const pendingCompleteRef = useRef(false);

  const busy =
    !queued &&
    (holding || completing || (entering && status === "done"));
  const priorBusy =
    stream.priorHolding || stream.priorWillHold || stream.priorWillComplete;
  const waitForPrior = stream.streaming && priorBusy;

  const clearCompleteTimer = () => {
    if (completeTimerRef.current == null) return;
    window.clearTimeout(completeTimerRef.current);
    completeTimerRef.current = null;
  };

  const beginComplete = () => {
    setHolding(false);
    seenActiveRef.current = true;
    const ms = readTokenMs(
      rootRef.current,
      "--fynns-chatmessage-activity-complete",
      360,
    );
    if (ms <= 0) {
      setCompleting(false);
      return;
    }
    setCompleting(true);
    clearCompleteTimer();
    completeTimerRef.current = window.setTimeout(() => {
      completeTimerRef.current = null;
      setCompleting(false);
    }, ms);
  };

  useEffect(() => {
    stream.reportHold(stream.index, busy);
    return () => stream.reportHold(stream.index, false);
  }, [busy, stream.index, stream.reportHold]);

  useEffect(() => () => clearCompleteTimer(), []);

  useLayoutEffect(() => {
    if (waitForPrior) {
      enterPlayedRef.current = false;
      setEntering(false);
      setExpandOpen(false);
      if (!queued) setQueued(true);
      return;
    }
    if (queued) {
      setQueued(false);
      setExpandOpen(true);
      if (
        !enterPlayedRef.current &&
        stream.streaming &&
        !prefersReducedMotion()
      ) {
        enterPlayedRef.current = true;
        setEntering(true);
      } else {
        enterPlayedRef.current = true;
      }
      return;
    }
    if (!expandOpen) {
      setExpandOpen(true);
      if (
        stream.streaming &&
        !enterPlayedRef.current &&
        !prefersReducedMotion()
      ) {
        enterPlayedRef.current = true;
        setEntering(true);
        return;
      }
    }
    if (!enterPlayedRef.current) enterPlayedRef.current = true;
  }, [queued, expandOpen, stream.streaming, waitForPrior]);

  useEffect(() => {
    if (stream.cycle !== cycleSeenRef.current) {
      cycleSeenRef.current = stream.cycle;
      seenActiveRef.current = status === "active";
      prevStatusRef.current = status;
      clearCompleteTimer();
      setCompleting(false);
    }
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (queued) {
      return;
    }
    if (status === "active") {
      seenActiveRef.current = true;
      setHolding(false);
      setCompleting(false);
      clearCompleteTimer();
      return;
    }
    if (status !== "done") {
      setHolding(false);
      setCompleting(false);
      clearCompleteTimer();
      return;
    }
    if (seenActiveRef.current) {
      if (prevStatus === "active" && streamingRef.current) {
        if (enteringRef.current) {
          pendingCompleteRef.current = true;
          const enterMs = readTokenMs(
            rootRef.current,
            "--fynns-chatmessage-activity-enter",
            360,
          );
          if (enterMs <= 0) {
            pendingCompleteRef.current = false;
            setEntering(false);
            beginComplete();
            return () => clearCompleteTimer();
          }
          const id = window.setTimeout(() => {
            if (!pendingCompleteRef.current) return;
            pendingCompleteRef.current = false;
            setEntering(false);
            enteringRef.current = false;
            beginComplete();
          }, enterMs);
          return () => window.clearTimeout(id);
        }
        beginComplete();
        return () => clearCompleteTimer();
      }
      setHolding(false);
      return;
    }
    if (!streamingRef.current) {
      setHolding(false);
      return;
    }
    setHolding(true);
    const holdMs = readTokenMs(
      rootRef.current,
      "--fynns-chatmessage-activity-step-min-busy",
      1200,
    );
    if (holdMs <= 0) {
      beginComplete();
      return () => clearCompleteTimer();
    }
    const id = window.setTimeout(() => {
      beginComplete();
    }, holdMs);
    return () => {
      window.clearTimeout(id);
      clearCompleteTimer();
    };
  }, [stream.cycle, status, queued]);

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

  const onStepAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      const name = event.animationName;
      if (
        name.includes("activity-step-enter") ||
        name.includes("activity-copy-enter")
      ) {
        setEntering(false);
        enteringRef.current = false;
        if (pendingCompleteRef.current) {
          pendingCompleteRef.current = false;
          beginComplete();
        }
      }
    }
    onAnimationEnd?.(event);
  };

  return (
    <div
      className="fynns-expand fynns-chat-activity-step-shell"
      data-state={expandOpen ? "open" : "closed"}
      data-queued={queued ? "true" : undefined}
      aria-hidden={expandOpen ? undefined : true}
    >
      <div className="fynns-expand-inner">
        <div
          {...rest}
          ref={rootRef}
          className={join(
            "fynns-chat-activity-step",
            `fynns-chat-activity-step--${visualStatus}`,
            holding && "fynns-chat-activity-step--hold",
            completing && "fynns-chat-activity-step--complete",
            queued && "fynns-chat-activity-step--queued",
            entering && "fynns-chat-activity-step--enter",
            className,
          )}
          data-status={visualStatus}
          data-hold={holding ? "true" : undefined}
          data-complete={completing ? "true" : undefined}
          data-queued={queued ? "true" : undefined}
          onAnimationEnd={onStepAnimationEnd}
        >
          <div className="fynns-chat-activity-step-row">
            <span className="fynns-chat-activity-node" aria-hidden>
              {leading}
            </span>
            <div className="fynns-chat-activity-headline">
              <span className="fynns-chat-activity-step-label">{label}</span>
              {artifact}
            </div>
          </div>
          {description != null && description !== "" ? (
            <div className="fynns-chat-activity-desc">{description}</div>
          ) : null}
        </div>
      </div>
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
 * (aliases `presentation-hint`) then the done glyph / artifact play a
 * complete one-shot (`--fynns-chatmessage-activity-complete`, aliases
 * `duration-activity`).
 * `active` → `done` on the same row skips the hold and plays complete
 * (waits if that row is still entering).
 * Artifact stays in layout, `visibility: hidden` during hold.
 * The hold + complete finish even if `streaming` flips off mid-pulse;
 * steps that already painted as `active` skip the hold.
 * `prefers-reduced-motion` skips hold / enter / complete. Static (not
 * streaming) trees show the final glyph immediately.
 * Complete then enter: a later step (including a stable-key tail) stays
 * queued (`0fr`) until earlier instant-done holds *and* complete
 * one-shots finish, then snaps open (`.fynns-expand`, no height
 * transition) while the whole step fades over
 * `--fynns-chatmessage-activity-enter` (aliases `duration-activity`). Node /
 * rail / label do not translate. Already-visible rows stay still unless
 * a prior sibling starts playing — then they snap closed and wait.
 * Callers growing the tree must pass a stable `key` per logical step.
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
  const stepsRef = useRef<HTMLDivElement>(null);
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [userPinnedClosed, setUserPinnedClosed] = useState(false);
  const [streamCycle, setStreamCycle] = useState(0);
  const [holds, setHolds] = useState<ReadonlySet<number>>(() => new Set());
  const wasStreamingRef = useRef(streaming);
  const prevKeysRef = useRef<Set<string>>(new Set());
  const prevStatusByKeyRef = useRef<Map<string, ChatActivityStepStatus>>(
    new Map(),
  );

  const reportHold = useCallback((index: number, holding: boolean) => {
    setHolds((prev) => {
      const has = prev.has(index);
      if (has === holding) return prev;
      const next = new Set(prev);
      if (holding) next.add(index);
      else next.delete(index);
      return next;
    });
  }, []);

  const childList = Children.toArray(children);
  const childKeys = childList.map((child, index) => childKey(child, index));
  const predictedHold = new Set<number>();
  const predictedComplete = new Set<number>();
  if (streaming) {
    childList.forEach((child, index) => {
      const key = childKeys[index];
      const st = childStepStatus(child) ?? "done";
      const prev = prevStatusByKeyRef.current.get(key);
      if (!prevKeysRef.current.has(key) && st === "done") {
        predictedHold.add(index);
      }
      if (prev === "active" && st === "done") predictedComplete.add(index);
    });
  }

  useLayoutEffect(() => {
    prevKeysRef.current = new Set(childKeys);
    const next = new Map<string, ChatActivityStepStatus>();
    childList.forEach((child, index) => {
      next.set(childKeys[index], childStepStatus(child) ?? "done");
    });
    prevStatusByKeyRef.current = next;
  }, [childKeys.join("\u0001")]);

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

  /*
   * Form-like list rhythm: natural height per open step-row → take max →
   * apply as min-height on every open row (Grid `equalCells` / choice-stack
   * floor). Attribute-only paint on our steps root — ClippedNavShell MO is
   * childList-only, so no observer thrash. Clear the var while measuring.
   */
  useLayoutEffect(() => {
    const root = stepsRef.current;
    if (!root || !isOpen) return;

    const measure = () => {
      root.style.removeProperty("--fynns-chat-activity-step-row-height");
      root.dataset.equalMeasuring = "true";
      let maxH = 0;
      for (const shell of root.querySelectorAll(
        ":scope > .fynns-chat-activity-step-shell",
      )) {
        if ((shell as HTMLElement).dataset.state !== "open") continue;
        const row = shell.querySelector(
          ":scope .fynns-chat-activity-step-row",
        ) as HTMLElement | null;
        if (!row) continue;
        maxH = Math.max(maxH, Math.ceil(row.getBoundingClientRect().height));
      }
      delete root.dataset.equalMeasuring;
      if (maxH > 0) {
        root.style.setProperty(
          "--fynns-chat-activity-step-row-height",
          `${maxH}px`,
        );
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(root);
    for (const row of root.querySelectorAll(".fynns-chat-activity-step-row")) {
      ro.observe(row);
    }
    return () => {
      ro.disconnect();
      root.style.removeProperty("--fynns-chat-activity-step-row-height");
      delete root.dataset.equalMeasuring;
    };
  }, [isOpen, childKeys.join("\u0001"), streaming]);

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
      if (streaming) setUserPinnedClosed(!next);
    }
    onOpenChange?.(next);
  };

  const labelKey =
    typeof label === "string" || typeof label === "number"
      ? String(label)
      : undefined;
  const labelNode = (
    <span
      key={labelKey}
      className={join(
        "fynns-chat-activity-label",
        streaming && "fynns-chat-activity-label--streaming",
        "fynns-chat-activity-label--swap",
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
            ref={stepsRef}
            id={bodyId}
            className="fynns-chat-activity-steps"
            inert={isOpen ? undefined : true}
          >
            {childList.map((child, index, list) => {
              const last = index === list.length - 1;
              let priorWillHold = false;
              let priorWillComplete = false;
              let priorHolding = false;
              for (const i of predictedHold) {
                if (i < index) priorWillHold = true;
              }
              for (const i of predictedComplete) {
                if (i < index) priorWillComplete = true;
              }
              for (const i of holds) {
                if (i < index) priorHolding = true;
              }
              return (
                <ChatActivityStream.Provider
                  key={childKeys[index]}
                  value={{
                    streaming,
                    cycle: streamCycle,
                    index,
                    isLast: last,
                    priorWillHold: streaming && priorWillHold,
                    priorWillComplete: streaming && priorWillComplete,
                    priorHolding,
                    reportHold,
                  }}
                >
                  {child}
                </ChatActivityStream.Provider>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
