import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export type AnchoredPosition = { top: number; left: number };

/**
 * Compute fixed-viewport coordinates for a floating layer anchored to an
 * element, with a preferred side, alignment, offset, and basic viewport
 * collision flipping. Recomputes on open, scroll, and resize.
 */
export function useAnchoredPosition(
  anchorEl: HTMLElement | null,
  open: boolean,
  opts: { side?: Side; align?: Align; offset?: number } = {},
): AnchoredPosition | null {
  const { side = "bottom", align = "center", offset = 6 } = opts;
  const [pos, setPos] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPos(null);
      return;
    }
    const compute = () => {
      const rect = anchorEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let resolvedSide = side;
      // Flip vertically if not enough room.
      if (side === "bottom" && rect.bottom + offset > vh) resolvedSide = "top";
      if (side === "top" && rect.top - offset < 0) resolvedSide = "bottom";
      let top = 0;
      let left = 0;
      if (resolvedSide === "bottom") top = rect.bottom + offset;
      else if (resolvedSide === "top") top = rect.top - offset;
      else top = rect.top;
      if (resolvedSide === "left") left = rect.left - offset;
      else if (resolvedSide === "right") left = rect.right + offset;
      else if (align === "start") left = rect.left;
      else if (align === "end") left = rect.right;
      else left = rect.left + rect.width / 2;
      // Clamp into viewport with a small margin.
      left = Math.max(8, Math.min(left, vw - 8));
      top = Math.max(8, Math.min(top, vh - 8));
      setPos({ top, left });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchorEl, open, side, align, offset]);

  return pos;
}

export type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  side?: Side;
  align?: Align;
  offset?: number;
  className?: string;
  role?: string;
};

/**
 * Portal-rendered floating panel anchored to `anchorRef`, with outside-click
 * and Escape dismissal. Self-positioned (no third-party positioning engine).
 */
export function Popover({
  open,
  onOpenChange,
  anchorRef,
  children,
  side = "bottom",
  align = "start",
  offset = 6,
  className,
  role = "dialog",
}: PopoverProps) {
  const pos = useAnchoredPosition(anchorRef.current, open, { side, align, offset });
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelEl?.contains(target)) return;
      onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, anchorRef, panelEl]);

  if (!open || !pos) return null;
  return createPortal(
    <div
      ref={setPanelEl}
      role={role}
      className={["fynns-popover", className ?? ""].filter(Boolean).join(" ")}
      style={{ position: "fixed", top: pos.top, left: pos.left }}
    >
      {children}
    </div>,
    document.body,
  );
}
