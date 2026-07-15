import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { floatingTransformForSide, useAnchoredPosition, type Align, type Side } from "./Popover";

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

/**
 * Hover / focus tooltip. Self-positioned portal bubble (replaces the radix
 * tooltip). The trigger is wrapped in an inline anchor so it also works for
 * disabled buttons (which do not emit pointer events themselves).
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
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const pos = useAnchoredPosition(anchorRef.current, floatingEl, open, { side, align, offset: 6 });
  const [caretPos, setCaretPos] = useState<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const show = () => {
    clearHideTimer();
    setOpen(true);
  };

  const hideNow = () => {
    clearHideTimer();
    setOpen(false);
  };

  const scheduleHide = () => {
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

  useEffect(() => () => clearHideTimer(), []);

  useEffect(() => {
    if (!open) setFloatingEl(null);
  }, [open]);

  // Aim the caret at the anchor's center, clamped inside the bubble. When the
  // bubble is centered on the anchor (the common case, since alignment prefers
  // `center`) this lands dead-center; when the bubble had to shift to fit the
  // viewport (e.g. an icon near the edge), the caret follows the anchor so it
  // keeps pointing at the trigger instead of missing it.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!open || !pos || !floatingEl || !anchor) {
      setCaretPos(null);
      return;
    }
    const a = anchor.getBoundingClientRect();
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
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
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
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                transform: floatingTransformForSide(pos.side, pos.align),
              }}
              onMouseEnter={interactive ? show : undefined}
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
 * Compat passthrough. The fynns Tooltip needs no provider; this exists so
 * existing `<TooltipProvider>` wrappers continue to work after migration.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
