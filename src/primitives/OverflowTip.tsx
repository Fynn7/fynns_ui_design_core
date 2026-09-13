import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Tooltip, type TooltipSide } from "./Tooltip";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type OverflowTipAxis = "x" | "y" | "both";

export type OverflowTipProps = {
  /** Full string shown in the Tooltip when the label is truncated. */
  content: string;
  /** Visible label (defaults to `content`). */
  children?: ReactNode;
  side?: TooltipSide;
  /** Class on the truncating label span. */
  className?: string;
  /** Class on the Tooltip trigger wrapper. */
  tipClassName?: string;
  /**
   * Overflow measure axis. Default `"x"` = single-line ellipsis
   * (`scrollWidth` vs `clientWidth`). `"y"` / `"both"` also compare
   * `scrollHeight` (line-clamp / multi-line clip, e.g. Snackbar).
   */
  overflowAxis?: OverflowTipAxis;
};

function isOverflowing(el: HTMLElement, axis: OverflowTipAxis): boolean {
  const x = el.scrollWidth > el.clientWidth + 1;
  const y = el.scrollHeight > el.clientHeight + 1;
  if (axis === "x") return x;
  if (axis === "y") return y;
  return x || y;
}

/**
 * Truncating label: shows `…` when overflowed, and a **Tooltip** with the
 * full `content` only while truncated (never `title=`).
 * Trigger wrapper stays mounted so flex ellipsis measure does not thrash.
 */
export function OverflowTip({
  content,
  children,
  side = "top",
  className,
  tipClassName,
  overflowAxis = "x",
}: OverflowTipProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const sync = () => {
      setOverflowing(isOverflowing(el, overflowAxis));
    };
    sync();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    const parent = el.parentElement;
    if (parent) ro?.observe(parent);
    const host = parent?.parentElement;
    if (host) ro?.observe(host);
    const raf = requestAnimationFrame(() => {
      sync();
      requestAnimationFrame(sync);
    });
    return () => {
      ro?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [content, children, overflowAxis]);

  return (
    <Tooltip
      content={content}
      side={side}
      align="start"
      disabled={!overflowing || !content}
      className={join("fynns-overflow-tip", tipClassName)}
    >
      <span
        ref={labelRef}
        className={join("fynns-overflow-tip-label", className)}
        data-overflowing={overflowing ? "true" : "false"}
      >
        {children ?? content}
      </span>
    </Tooltip>
  );
}

/** Tip body for a string-or-ReactNode label (prefer string; else fallback). */
export function overflowTipText(
  label: ReactNode,
  fallback?: string,
): string | null {
  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }
  if (fallback != null && fallback !== "") return fallback;
  return null;
}
