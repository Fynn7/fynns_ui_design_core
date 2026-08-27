import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DURATION_TOKENS } from "../theme/motionTokens";
import {
  anchorTargetRect,
  useFloatingBoxPosition,
  type Align,
  type Side,
} from "./floatingBox";
import {
  configureTooltipSkipDelay,
  isTooltipWarm,
  notifyTooltipClosed,
  notifyTooltipOpened,
} from "./tooltipWarmth";

/** Keep the caret clear of the bubble's rounded corners. */
const CARET_INSET = 12;

export type TooltipSide = Side;
export type TooltipAlign = Align;

export type TooltipProps = {
  /** Tooltip body shown on hover / focus of the trigger. */
  content: ReactNode;
  side?: TooltipSide;
  /**
   * Cross-axis alignment relative to the trigger. Defaults to `center` (the
   * expected convention for icon buttons). Use `start` for full-width rows /
   * truncated text so the bubble hugs the text instead of floating away.
   */
  align?: TooltipAlign;
  /**
   * When true, the bubble accepts pointer events and stays open while the
   * cursor moves from the trigger onto the tooltip (WCAG 1.4.13 hoverable).
   * Use for tooltips that contain buttons or other interactive content.
   */
  interactive?: boolean;
  /** Single trigger element / content. Wrapped in an inline anchor. */
  children: ReactNode;
  /** Class for the inline trigger wrapper. */
  className?: string;
};

/** Grace period to cross the trigger–bubble gap before closing (ms). */
const INTERACTIVE_HIDE_DELAY_MS = 200;

/** MDC plain-tooltip hover intent delay (`SHOW_DELAY_MS` / `--fynns-duration-tooltip-show-delay`). */
const SHOW_DELAY_MS = Number.parseFloat(DURATION_TOKENS["tooltip-show-delay"]);

/** Consecutive-hover skip window (`--fynns-duration-tooltip-skip-delay`). */
const SKIP_DELAY_MS = Number.parseFloat(DURATION_TOKENS["tooltip-skip-delay"]);
configureTooltipSkipDelay(SKIP_DELAY_MS);

/**
 * Hover / focus tooltip. Self-positioned portal bubble (replaces the radix
 * tooltip). The trigger is wrapped in an inline anchor so it also works for
 * disabled buttons (which do not emit pointer events themselves).
 *
 * Hover waits `SHOW_DELAY_MS` before opening (leave cancels), unless a tip was
 * recently open within `SKIP_DELAY_MS` — then the next tip opens instantly
 * (global warm state shared by all tooltips). Leave / blur hide immediately
 * (interactive tips keep a short hide grace). Focus opens at once.
 */
export function Tooltip({
  content,
  side = "top",
  align = "center",
  interactive = false,
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [floatingEl, setFloatingEl] = useState<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const pos = useFloatingBoxPosition(anchorRef.current, floatingEl, open, { side, align, offset: 6 });
  const placementReady = floatingEl != null && floatingEl.offsetWidth > 0;
  const [caretPos, setCaretPos] = useState<number | null>(null);

  const clearShowTimer = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const clearTimers = () => {
    clearShowTimer();
    clearHideTimer();
  };

  /** Open immediately (focus, warm consecutive hover, interactive re-enter, or after show delay). */
  const showNow = () => {
    clearTimers();
    setOpen(true);
  };

  /**
   * Hover intent: wait `SHOW_DELAY_MS`, unless the global tooltip pool is warm
   * (another tip is open or closed within the skip window) — then open now.
   */
  const scheduleShow = () => {
    clearHideTimer();
    if (open) return;
    if (isTooltipWarm()) {
      showNow();
      return;
    }
    if (showTimerRef.current) return;
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      setOpen(true);
    }, SHOW_DELAY_MS);
  };

  const hideNow = () => {
    clearTimers();
    setOpen(false);
  };

  const scheduleHide = () => {
    clearShowTimer();
    if (!interactive) {
      hideNow();
      return;
    }
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      const active = document.activeElement;
      if (active && floatingRef.current?.contains(active)) return;
      setOpen(false);
    }, INTERACTIVE_HIDE_DELAY_MS);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!open) {
      setFloatingEl(null);
      return;
    }
    notifyTooltipOpened();
    return () => notifyTooltipClosed();
  }, [open]);

  // Aim the caret at the trigger's visual center (prefer the child control over
  // the inline wrapper), clamped inside the bubble.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!open || !pos || !floatingEl || !anchor) {
      setCaretPos(null);
      return;
    }
    const a = anchorTargetRect(anchor);
    const b = floatingEl.getBoundingClientRect();
    if (pos.side === "left" || pos.side === "right") {
      const raw = a.top + a.height / 2 - b.top;
      setCaretPos(Math.max(CARET_INSET, Math.min(b.height - CARET_INSET, raw)));
    } else {
      const raw = a.left + a.width / 2 - b.left;
      setCaretPos(Math.max(CARET_INSET, Math.min(b.width - CARET_INSET, raw)));
    }
  }, [open, pos, floatingEl]);

  const isVerticalCaret = pos?.side === "left" || pos?.side === "right";
  const caretStyle: CSSProperties | undefined =
    caretPos == null
      ? undefined
      : isVerticalCaret
        ? { top: caretPos, bottom: "auto", transform: "translateY(-50%) rotate(45deg)" }
        : { left: caretPos, right: "auto", transform: "translateX(-50%) rotate(45deg)" };

  const onTriggerBlur = (e: FocusEvent<HTMLSpanElement>) => {
    if (!interactive) {
      hideNow();
      return;
    }
    const next = e.relatedTarget as Node | null;
    if (next && floatingRef.current?.contains(next)) return;
    scheduleHide();
  };

  return (
    <span
      ref={anchorRef}
      className={["fynns-tooltip-trigger", className ?? ""].filter(Boolean).join(" ")}
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      onFocus={showNow}
      onBlur={onTriggerBlur}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {open && pos
        ? createPortal(
            <div
              ref={(el) => {
                floatingRef.current = el;
                setFloatingEl(el);
              }}
              id={tooltipId}
              role="tooltip"
              className={["fynns-tooltip", interactive ? "fynns-tooltip--interactive" : ""]
                .filter(Boolean)
                .join(" ")}
              data-side={pos.side}
              data-align={pos.align}
              data-ready={placementReady ? "true" : "false"}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                // Tighten further when the viewport inset is smaller than the
                // CSS token (`min(14rem, 100vw − 1rem)`); never loosen it.
                maxWidth: `min(var(--fynns-layout-tooltip-max-width), ${pos.maxWidth}px)`,
                visibility: placementReady ? "visible" : "hidden",
              }}
              onMouseEnter={interactive ? showNow : undefined}
              onMouseLeave={interactive ? scheduleHide : undefined}
            >
              {content}
              <span className="fynns-tooltip__caret" aria-hidden="true" style={caretStyle} />
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

/**
 * Compat passthrough. Warm / skip-delay state is a document-wide module
 * singleton — no provider is required for consecutive-hover UX.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
