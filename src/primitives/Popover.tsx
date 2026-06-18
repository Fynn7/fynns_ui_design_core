import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export type AnchoredPosition = { top: number; left: number; side: Side; align: Align };

const VIEWPORT_MARGIN = 8;
const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** Fallback size before the floating node is measured (tooltips / small popovers). */
const ESTIMATED_FLOAT_SIZE = { width: 180, height: 40 };

export type FloatingSize = { width: number; height: number };

/** When align is center, snap to start/end near viewport edges (wide tooltips). */
export function resolveAlignForAnchor(anchorRect: DOMRect, vw: number, align: Align): Align {
  if (align !== "center") return align;
  const midX = anchorRect.left + anchorRect.width / 2;
  if (midX > vw * 0.72) return "end";
  if (midX < vw * 0.28) return "start";
  return "center";
}

/** CSS transform for a fixed anchor point + resolved placement side and align. */
export function floatingTransformForSide(side: Side, align: Align = "center"): string {
  if (side === "top" || side === "bottom") {
    const y = side === "top" ? "-100%" : "0";
    const x = align === "start" ? "0" : align === "end" ? "-100%" : "-50%";
    return `translate(${x}, ${y})`;
  }
  const x = side === "left" ? "-100%" : "0";
  const y = align === "start" ? "0" : align === "end" ? "-100%" : "-50%";
  return `translate(${x}, ${y})`;
}

function anchorPoint(
  rect: DOMRect,
  side: Side,
  align: Align,
  offset: number,
): { top: number; left: number } {
  let top = 0;
  let left = 0;
  if (side === "bottom") top = rect.bottom + offset;
  else if (side === "top") top = rect.top - offset;
  else top = rect.top + rect.height / 2;

  if (side === "left") left = rect.left - offset;
  else if (side === "right") left = rect.right + offset;
  else if (align === "start") left = rect.left;
  else if (align === "end") left = rect.right;
  else left = rect.left + rect.width / 2;

  return { top, left };
}

/** Viewport box of the floating layer given its anchor point, side, and align. */
export function floatingViewportRect(
  point: { top: number; left: number },
  side: Side,
  align: Align,
  size: FloatingSize,
): { top: number; left: number; right: number; bottom: number } {
  const { width, height } = size;
  switch (side) {
    case "top":
      if (align === "start") {
        return { top: point.top - height, left: point.left, right: point.left + width, bottom: point.top };
      }
      if (align === "end") {
        return { top: point.top - height, left: point.left - width, right: point.left, bottom: point.top };
      }
      return {
        top: point.top - height,
        left: point.left - width / 2,
        right: point.left + width / 2,
        bottom: point.top,
      };
    case "bottom":
      if (align === "start") {
        return { top: point.top, left: point.left, right: point.left + width, bottom: point.top + height };
      }
      if (align === "end") {
        return { top: point.top, left: point.left - width, right: point.left, bottom: point.top + height };
      }
      return {
        top: point.top,
        left: point.left - width / 2,
        right: point.left + width / 2,
        bottom: point.top + height,
      };
    case "left":
      if (align === "start") {
        return { top: point.top, left: point.left - width, right: point.left, bottom: point.top + height };
      }
      if (align === "end") {
        return {
          top: point.top - height,
          left: point.left - width,
          right: point.left,
          bottom: point.top,
        };
      }
      return {
        top: point.top - height / 2,
        left: point.left - width,
        right: point.left,
        bottom: point.top + height / 2,
      };
    case "right":
      if (align === "start") {
        return { top: point.top, left: point.left, right: point.left + width, bottom: point.top + height };
      }
      if (align === "end") {
        return {
          top: point.top - height,
          left: point.left,
          right: point.left + width,
          bottom: point.top,
        };
      }
      return {
        top: point.top - height / 2,
        left: point.left,
        right: point.left + width,
        bottom: point.top + height / 2,
      };
  }
}

function fitsViewport(
  box: { top: number; left: number; right: number; bottom: number },
  vw: number,
  vh: number,
  margin: number,
): boolean {
  return (
    box.top >= margin &&
    box.left >= margin &&
    box.bottom <= vh - margin &&
    box.right <= vw - margin
  );
}

function rectsOverlap(
  a: { top: number; left: number; right: number; bottom: number },
  b: DOMRect,
): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function clampAnchorPoint(
  point: { top: number; left: number },
  side: Side,
  align: Align,
  size: FloatingSize,
  anchorRect: DOMRect,
  vw: number,
  vh: number,
  margin: number,
  offset: number,
): { top: number; left: number } {
  const box = floatingViewportRect(point, side, align, size);
  let dx = 0;
  let dy = 0;
  if (box.left < margin) dx = margin - box.left;
  if (box.right > vw - margin) dx = vw - margin - box.right;
  if (box.top < margin) dy = margin - box.top;
  if (box.bottom > vh - margin) dy = vh - margin - box.bottom;
  let top = point.top + dy;
  const left = point.left + dx;
  // Never slide a top/bottom tooltip down/up through the anchor (clamp dy abuse).
  if (side === "top") top = Math.min(top, anchorRect.top - offset);
  if (side === "bottom") top = Math.max(top, anchorRect.bottom + offset);

  const clamped = { top, left };
  if (!rectsOverlap(floatingViewportRect(clamped, side, align, size), anchorRect)) {
    return clamped;
  }
  return point;
}

/**
 * Pick placement side and anchor coordinates so the floating layer stays inside
 * the viewport. Uses measured size when available; otherwise a small estimate.
 */
function alignCandidates(anchorRect: DOMRect, vw: number, align: Align): Align[] {
  const resolved = resolveAlignForAnchor(anchorRect, vw, align);
  if (align !== "center") return [align];
  const list: Align[] = [resolved];
  for (const extra of ["end", "start", "center"] as const) {
    if (!list.includes(extra)) list.push(extra);
  }
  return list;
}

export function resolveAnchoredPosition(
  anchorRect: DOMRect,
  floatingSize: FloatingSize | null,
  opts: { side?: Side; align?: Align; offset?: number } = {},
): AnchoredPosition {
  const { side: preferred = "bottom", align = "center", offset = 6 } = opts;
  const size = floatingSize ?? ESTIMATED_FLOAT_SIZE;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sides: Side[] = [preferred, OPPOSITE_SIDE[preferred]];
  const aligns = alignCandidates(anchorRect, vw, align);

  for (const trySide of sides) {
    for (const tryAlign of aligns) {
      const point = anchorPoint(anchorRect, trySide, tryAlign, offset);
      const box = floatingViewportRect(point, trySide, tryAlign, size);
      if (!fitsViewport(box, vw, vh, VIEWPORT_MARGIN)) continue;
      if (rectsOverlap(box, anchorRect)) continue;
      const clamped = clampAnchorPoint(
        point,
        trySide,
        tryAlign,
        size,
        anchorRect,
        vw,
        vh,
        VIEWPORT_MARGIN,
        offset,
      );
      const clampedBox = floatingViewportRect(clamped, trySide, tryAlign, size);
      if (rectsOverlap(clampedBox, anchorRect)) continue;
      return { ...clamped, side: trySide, align: tryAlign };
    }
  }

  const fallbackSide = preferred;
  const fallbackAlign = resolveAlignForAnchor(anchorRect, vw, align);
  const fallbackPoint = anchorPoint(anchorRect, fallbackSide, fallbackAlign, offset);
  const clamped = clampAnchorPoint(
    fallbackPoint,
    fallbackSide,
    fallbackAlign,
    size,
    anchorRect,
    vw,
    vh,
    VIEWPORT_MARGIN,
    offset,
  );
  return { ...clamped, side: fallbackSide, align: fallbackAlign };
}

/**
 * Compute fixed-viewport coordinates for a floating layer anchored to an
 * element, with a preferred side, alignment, offset, and viewport collision
 * flipping based on the floating element's measured size. Recomputes on open,
 * scroll, resize, and when the floating node mounts or changes size.
 */
export function useAnchoredPosition(
  anchorEl: HTMLElement | null,
  floatingEl: HTMLElement | null,
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
      const floatingSize = floatingEl
        ? { width: floatingEl.offsetWidth, height: floatingEl.offsetHeight }
        : null;
      setPos(resolveAnchoredPosition(rect, floatingSize, { side, align, offset }));
    };
    compute();
    const ro =
      floatingEl && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(compute)
        : null;
    ro?.observe(floatingEl as Element);
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchorEl, floatingEl, open, side, align, offset]);

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
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const pos = useAnchoredPosition(anchorRef.current, panelEl, open, { side, align, offset });

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
