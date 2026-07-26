import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export type AnchoredPosition = { top: number; left: number; side: Side; align: Align };

const VIEWPORT_MARGIN = 8;
/** Sub-pixel slack when comparing layout math to rendered bounds. */
const VIEWPORT_EPSILON = 1;
const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** Matches `--fynns-layout-tooltip-max-width`: min(14rem, 85vw). */
export function estimatedFloatSize(vw: number): FloatingSize {
  return { width: Math.min(224, vw * 0.85), height: 48 };
}

/** Prefer the visible child control over the inline trigger wrapper when measuring. */
export function anchorTargetRect(anchorEl: HTMLElement): DOMRect {
  const child = anchorEl.firstElementChild;
  if (child instanceof HTMLElement) {
    const childRect = child.getBoundingClientRect();
    if (childRect.width > 0 && childRect.height > 0) return childRect;
  }
  return anchorEl.getBoundingClientRect();
}

/** Top-left viewport coordinates for the floating box (no CSS transform). */
export function resolveFloatingBox(
  anchorRect: DOMRect,
  floatingSize: FloatingSize | null,
  opts: { side?: Side; align?: Align; offset?: number } = {},
): { top: number; left: number; side: Side; align: Align } {
  const pos = resolveAnchoredPosition(anchorRect, floatingSize, opts);
  const vw = window.innerWidth;
  const size = floatingSize ?? estimatedFloatSize(vw);
  const box = floatingViewportRect({ top: pos.top, left: pos.left }, pos.side, pos.align, size);
  return { top: box.top, left: box.left, side: pos.side, align: pos.align };
}

export type FloatingSize = { width: number; height: number };

/**
 * When align is center, snap to start/end near the relevant viewport edge.
 * The cross-axis depends on `side`: top/bottom tooltips snap along X (midX vs
 * viewport width); left/right tooltips snap along Y (midY vs viewport height).
 * Using the wrong axis (e.g. midX for a right-side tooltip in a narrow sidebar)
 * forces a bogus "start", which pushes the caret off the bubble's center.
 */
export function resolveAlignForAnchor(
  anchorRect: DOMRect,
  vw: number,
  vh: number,
  side: Side,
  align: Align,
): Align {
  if (align !== "center") return align;
  if (side === "left" || side === "right") {
    const midY = anchorRect.top + anchorRect.height / 2;
    if (midY > vh * 0.72) return "end";
    if (midY < vh * 0.28) return "start";
    return "center";
  }
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
    box.top >= margin - VIEWPORT_EPSILON &&
    box.left >= margin - VIEWPORT_EPSILON &&
    box.bottom <= vh - margin + VIEWPORT_EPSILON &&
    box.right <= vw - margin + VIEWPORT_EPSILON
  );
}

/** Whether the floating box intrudes into the anchor along the placement axis. */
export function coversAnchor(
  box: { top: number; left: number; right: number; bottom: number },
  anchorRect: DOMRect,
  side: Side,
  offset: number,
): boolean {
  if (side === "top") return box.bottom > anchorRect.top - offset;
  if (side === "bottom") return box.top < anchorRect.bottom + offset;
  if (side === "left") return box.right > anchorRect.left - offset;
  return box.left < anchorRect.right + offset;
}

/** Minimal translation so a floating viewport box stays inside the margin inset. */
export function computeViewportShift(
  box: { top: number; left: number; right: number; bottom: number },
  vw: number,
  vh: number,
  margin: number,
): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  const maxW = vw - margin * 2;
  const maxH = vh - margin * 2;
  const boxW = box.right - box.left;
  const boxH = box.bottom - box.top;
  if (boxW > maxW) {
    dx = margin - box.left;
  } else {
    if (box.left < margin) dx = margin - box.left;
    if (box.right > vw - margin) dx = vw - margin - box.right;
  }
  if (boxH > maxH) {
    dy = margin - box.top;
  } else {
    if (box.top < margin) dy = margin - box.top;
    if (box.bottom > vh - margin) dy = vh - margin - box.bottom;
  }
  return { dx, dy };
}

/** Shift an anchor point so the resolved floating box fits inside the viewport. */
export function shiftIntoViewport(
  point: { top: number; left: number },
  side: Side,
  align: Align,
  size: FloatingSize,
  vw: number,
  vh: number,
  margin: number,
): { top: number; left: number } {
  const box = floatingViewportRect(point, side, align, size);
  const { dx, dy } = computeViewportShift(box, vw, vh, margin);
  return { top: point.top + dy, left: point.left + dx };
}

function sideCandidates(preferred: Side): Side[] {
  const opposite = OPPOSITE_SIDE[preferred];
  const rest = (["top", "bottom", "left", "right"] as Side[]).filter(
    (s) => s !== preferred && s !== opposite,
  );
  return [preferred, opposite, ...rest];
}

/**
 * Pick placement side and anchor coordinates so the floating layer stays inside
 * the viewport. Uses measured size when available; otherwise a small estimate.
 */
function alignCandidates(
  anchorRect: DOMRect,
  vw: number,
  vh: number,
  side: Side,
  align: Align,
  size: FloatingSize,
  offset: number,
): Align[] {
  if (align !== "center") return [align];
  // Prefer true center so the bubble straddles the anchor and the caret lands
  // on the bubble's midpoint. Only fall back to edge-snapped align when a
  // centered bubble would overflow even after viewport shift.
  const point = anchorPoint(anchorRect, side, "center", offset);
  const shifted = shiftIntoViewport(point, side, "center", size, vw, vh, VIEWPORT_MARGIN);
  const centered = floatingViewportRect(shifted, side, "center", size);
  if (fitsViewport(centered, vw, vh, VIEWPORT_MARGIN)) return ["center"];
  const resolved = resolveAlignForAnchor(anchorRect, vw, vh, side, align);
  const list: Align[] = [];
  for (const extra of [resolved, "end", "start", "center"] as const) {
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
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = floatingSize ?? estimatedFloatSize(vw);

  type Candidate = AnchoredPosition & { score: number };
  let best: Candidate | null = null;

  for (const trySide of sideCandidates(preferred)) {
    const aligns = alignCandidates(anchorRect, vw, vh, trySide, align, size, offset);
    for (const tryAlign of aligns) {
      const point = anchorPoint(anchorRect, trySide, tryAlign, offset);
      const shifted = shiftIntoViewport(point, trySide, tryAlign, size, vw, vh, VIEWPORT_MARGIN);
      const box = floatingViewportRect(shifted, trySide, tryAlign, size);
      if (!fitsViewport(box, vw, vh, VIEWPORT_MARGIN)) continue;
      // Viewport shift can push a "top" bubble down over the trigger; skip those
      // so we flip to the opposite side (e.g. bottom + upward caret near the top edge).
      if (coversAnchor(box, anchorRect, trySide, offset)) continue;

      let score = 0;
      if (trySide === preferred) score += 100;
      if (tryAlign === align || (align === "center" && tryAlign === "center")) score += 10;
      score += 50;

      const candidate: Candidate = { ...shifted, side: trySide, align: tryAlign, score };
      if (!best || candidate.score > best.score) best = candidate;
    }
  }

  if (best) {
    return { top: best.top, left: best.left, side: best.side, align: best.align };
  }

  const fallbackSide = preferred;
  const fallbackAlign = resolveAlignForAnchor(anchorRect, vw, vh, fallbackSide, align);
  const fallbackPoint = anchorPoint(anchorRect, fallbackSide, fallbackAlign, offset);
  const shifted = shiftIntoViewport(
    fallbackPoint,
    fallbackSide,
    fallbackAlign,
    size,
    vw,
    vh,
    VIEWPORT_MARGIN,
  );
  return { ...shifted, side: fallbackSide, align: fallbackAlign };
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
      const w = floatingEl?.offsetWidth ?? 0;
      const h = floatingEl?.offsetHeight ?? 0;
      const floatingSize = w > 0 && h > 0 ? { width: w, height: h } : null;
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

/**
 * Like {@link useAnchoredPosition} but returns the floating box's top-left
 * corner so consumers can position with `top`/`left` only (no CSS transform).
 */
export function useFloatingBoxPosition(
  anchorEl: HTMLElement | null,
  floatingEl: HTMLElement | null,
  open: boolean,
  opts: { side?: Side; align?: Align; offset?: number } = {},
): { top: number; left: number; side: Side; align: Align } | null {
  const { side = "bottom", align = "center", offset = 6 } = opts;
  const [box, setBox] = useState<{ top: number; left: number; side: Side; align: Align } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setBox(null);
      return;
    }
    const compute = () => {
      const rect = anchorTargetRect(anchorEl);
      const w = floatingEl?.offsetWidth ?? 0;
      const h = floatingEl?.offsetHeight ?? 0;
      const floatingSize = w > 0 && h > 0 ? { width: w, height: h } : null;
      setBox(resolveFloatingBox(rect, floatingSize, { side, align, offset }));
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

  return box;
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
  // Use box top-left (not the raw anchor attachment point) so align=end/center
  // stay inside the viewport without a CSS transform.
  const pos = useFloatingBoxPosition(anchorRef.current, panelEl, open, { side, align, offset });

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
      data-side={pos.side}
      style={{ position: "fixed", top: pos.top, left: pos.left }}
    >
      {children}
    </div>,
    document.body,
  );
}
