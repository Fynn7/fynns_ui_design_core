export type ChartPointerTooltipClampOptions = {
  /** Inset from the chart host edges (px). */
  inset?: number;
  /** Gap between pointer and the nearest tooltip edge (px). */
  gap?: number;
  /** Prefer placing the flyout above the pointer; flip below when top overflows. */
  preferAbove?: boolean;
};

/**
 * Clamp a pointer-following chart tooltip so the full flyout stays inside the
 * plot host. Returns absolute `left` / `top` for `.fynns-chart-tooltip-shell`
 * (top-left box — no CSS translate centering).
 *
 * Callers must keep a **stable tip size** while the pointer moves (measure once
 * per open / category — do **not** clear the box and fall back to a smaller
 * estimate on every `mousemove`, or edge clamp will jitter between two widths).
 * Prefer a **stable horizontal anchor** (e.g. active column center) when the tip
 * is category-scoped; follow pointer Y only.
 */
export function clampChartPointerTooltipBox(
  pointer: { x: number; y: number },
  host: { width: number; height: number },
  tip: { width: number; height: number },
  options: ChartPointerTooltipClampOptions = {},
): { left: number; top: number } {
  const inset = options.inset ?? 8;
  const gap = options.gap ?? 8;
  const preferAbove = options.preferAbove ?? true;

  const tipW = Math.max(0, tip.width);
  const tipH = Math.max(0, tip.height);

  const maxLeft = Math.max(inset, host.width - inset - tipW);
  let left = pointer.x - tipW / 2;
  left = Math.min(Math.max(left, inset), maxLeft);

  let top = preferAbove ? pointer.y - tipH - gap : pointer.y + gap;

  if (preferAbove && top < inset) {
    top = pointer.y + gap;
  }

  const maxTop = Math.max(inset, host.height - inset - tipH);
  top = Math.min(Math.max(top, inset), maxTop);

  // Integer box — avoids subpixel left/top chatter with ResizeObserver remeasure.
  return { left: Math.round(left), top: Math.round(top) };
}
