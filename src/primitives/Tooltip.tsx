import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { floatingTransformForSide, useAnchoredPosition, type Align, type Side } from "./Popover";

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
  /** Single trigger element / content. Wrapped in an inline anchor. */
  children: ReactNode;
  /** Class for the inline trigger wrapper. */
  className?: string;
};

/**
 * Hover / focus tooltip. Self-positioned portal bubble (replaces the radix
 * tooltip). The trigger is wrapped in an inline anchor so it also works for
 * disabled buttons (which do not emit pointer events themselves).
 */
export function Tooltip({ content, side = "top", align = "center", children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [floatingEl, setFloatingEl] = useState<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const pos = useAnchoredPosition(anchorRef.current, floatingEl, open, { side, align, offset: 6 });

  useEffect(() => {
    if (!open) setFloatingEl(null);
  }, [open]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span
      ref={anchorRef}
      className={["fynns-tooltip-trigger", className ?? ""].filter(Boolean).join(" ")}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {open && pos
        ? createPortal(
            <div
              ref={setFloatingEl}
              id={tooltipId}
              role="tooltip"
              className="fynns-tooltip"
              data-side={pos.side}
              data-align={pos.align}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                transform: floatingTransformForSide(pos.side, pos.align),
              }}
            >
              {content}
              <span className="fynns-tooltip__caret" aria-hidden="true" />
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
