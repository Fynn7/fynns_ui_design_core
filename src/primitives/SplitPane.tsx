import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { readVarPx } from "./layoutMeasure";

export type SplitPaneOrientation = "horizontal" | "vertical";

export type SplitPaneProps = {
  /** Start pane (inline-start for horizontal, block-start for vertical). */
  start: ReactNode;
  /** End pane (flex-grow remainder). */
  end: ReactNode;
  /**
   * `horizontal` = start | end side-by-side (default).
   * `vertical` = start above end.
   */
  orientation?: SplitPaneOrientation;
  /**
   * Controlled start-pane size in CSS pixels along the split axis.
   * Written as local `--fynns-split-size` on the root.
   */
  size?: number;
  /** Uncontrolled initial size (px). Defaults to ~50% of the host. */
  defaultSize?: number;
  onSizeChange?: (sizePx: number) => void;
  /** Override token min for the start pane (px). */
  minStart?: number;
  /** Override token min for the end pane (px). */
  minEnd?: number;
  /** Disable the drag / keyboard separator. Default `false`. */
  disableResize?: boolean;
  /** Accessible name for the separator. @default "Resize panes" */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

function axisExtent(
  el: HTMLElement,
  orientation: SplitPaneOrientation,
): number {
  const box = el.getBoundingClientRect();
  return orientation === "horizontal" ? box.width : box.height;
}

/**
 * In-content resizable two-pane split (editor | preview, list | detail).
 * Not `EndAside` / drawer shell chrome — those own destination / inspector
 * tracks. Live drag paints `--fynns-split-size` via rAF; React commits size
 * on pointerup (same discipline as EndAside).
 */
export function SplitPane({
  start,
  end,
  orientation = "horizontal",
  size: sizeProp,
  defaultSize,
  onSizeChange,
  minStart: minStartProp,
  minEnd: minEndProp,
  disableResize = false,
  label = "Resize panes",
  className,
  style,
}: SplitPaneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onSizeChangeRef = useRef(onSizeChange);
  onSizeChangeRef.current = onSizeChange;
  const liveSizeRef = useRef<number | null>(null);

  const [uncontrolledSize, setUncontrolledSize] = useState<number | null>(
    defaultSize ?? null,
  );
  const [dragging, setDragging] = useState(false);

  const controlled = sizeProp !== undefined;
  const sizePx = controlled ? sizeProp : uncontrolledSize;

  const setSizePx = useCallback(
    (next: number) => {
      const rounded = Math.round(next);
      if (!controlled) setUncontrolledSize(rounded);
      onSizeChangeRef.current?.(rounded);
    },
    [controlled],
  );

  const paintSize = useCallback((next: number, handle?: HTMLElement) => {
    const root = rootRef.current;
    if (!root) return;
    const rounded = Math.round(next);
    liveSizeRef.current = rounded;
    root.style.setProperty("--fynns-split-size", `${rounded}px`);
    if (handle) handle.setAttribute("aria-valuenow", String(rounded));
  }, []);

  useLayoutEffect(() => {
    if (controlled || uncontrolledSize != null || !rootRef.current) return;
    const root = rootRef.current;
    const extent = axisExtent(root, orientation);
    if (extent <= 0) return;
    const minStart =
      minStartProp ??
      (readVarPx(root, "--fynns-split-min-start") || 128);
    const minEnd =
      minEndProp ?? (readVarPx(root, "--fynns-split-min-end") || 128);
    const handle =
      readVarPx(root, "--fynns-split-handle-size") || 6;
    const maxStart = Math.max(minStart, extent - minEnd - handle);
    const half = Math.round(extent * 0.5);
    setUncontrolledSize(Math.min(maxStart, Math.max(minStart, half)));
  }, [controlled, uncontrolledSize, orientation, minStartProp, minEndProp]);

  useLayoutEffect(() => {
    if (!dragging || liveSizeRef.current == null) return;
    paintSize(liveSizeRef.current);
  }, [dragging, paintSize]);

  const clampSize = useCallback(
    (raw: number) => {
      const root = rootRef.current;
      if (!root) return raw;
      const extent = axisExtent(root, orientation);
      const minStart =
        minStartProp ??
        (readVarPx(root, "--fynns-split-min-start") || 128);
      const minEnd =
        minEndProp ?? (readVarPx(root, "--fynns-split-min-end") || 128);
      const handle =
        readVarPx(root, "--fynns-split-handle-size") || 6;
      const maxStart = Math.max(minStart, extent - minEnd - handle);
      return Math.min(maxStart, Math.max(minStart, raw));
    },
    [orientation, minStartProp, minEndProp],
  );

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startPane = root.querySelector(
      ".fynns-split-pane--start",
    ) as HTMLElement | null;
    const startSize = Math.round(
      startPane
        ? orientation === "horizontal"
          ? startPane.getBoundingClientRect().width
          : startPane.getBoundingClientRect().height
        : axisExtent(root, orientation) * 0.5,
    );
    let latest = startSize;
    liveSizeRef.current = startSize;
    paintSize(startSize, handle);
    setDragging(true);
    const origin =
      orientation === "horizontal" ? event.clientX : event.clientY;
    let raf = 0;

    const onMove = (ev: PointerEvent) => {
      const rtl =
        orientation === "horizontal" &&
        getComputedStyle(root).direction === "rtl";
      const client =
        orientation === "horizontal" ? ev.clientX : ev.clientY;
      const delta = rtl ? origin - client : client - origin;
      latest = clampSize(startSize + delta);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paintSize(latest, handle);
        if (controlled) setSizePx(latest);
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      paintSize(latest, handle);
      setSizePx(latest);
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      setDragging(false);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  const onResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 32 : 8;
    const rtl =
      orientation === "horizontal" &&
      rootRef.current != null &&
      getComputedStyle(rootRef.current).direction === "rtl";
    let delta = 0;
    if (orientation === "horizontal") {
      if (event.key === "ArrowLeft") delta = rtl ? step : -step;
      else if (event.key === "ArrowRight") delta = rtl ? -step : step;
      else return;
    } else {
      if (event.key === "ArrowUp") delta = -step;
      else if (event.key === "ArrowDown") delta = step;
      else return;
    }
    event.preventDefault();
    const root = rootRef.current;
    const startPane = root?.querySelector(
      ".fynns-split-pane--start",
    ) as HTMLElement | null;
    const current =
      Math.round(
        startPane
          ? orientation === "horizontal"
            ? startPane.getBoundingClientRect().width
            : startPane.getBoundingClientRect().height
          : 0,
      ) ||
      sizePx ||
      0;
    setSizePx(clampSize(current + delta));
  };

  const rootStyle: CSSProperties | undefined = (() => {
    const base = style;
    if (dragging || sizePx == null) return base;
    return {
      ...base,
      ["--fynns-split-size" as string]: `${sizePx}px`,
    };
  })();

  const rootClass = [
    "fynns-split",
    `fynns-split--${orientation}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const [ariaBounds, setAriaBounds] = useState({ min: 128, max: 512 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const minStart =
      minStartProp ??
      (readVarPx(root, "--fynns-split-min-start") || 128);
    const minEnd =
      minEndProp ?? (readVarPx(root, "--fynns-split-min-end") || 128);
    const handle =
      readVarPx(root, "--fynns-split-handle-size") || 6;
    const extent = axisExtent(root, orientation);
    const maxStart =
      extent > 0 ? Math.max(minStart, extent - minEnd - handle) : minStart;
    setAriaBounds({ min: Math.round(minStart), max: Math.round(maxStart) });
  }, [orientation, minStartProp, minEndProp, sizePx]);

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={rootStyle}
      data-orientation={orientation}
      data-resizing={dragging ? "true" : undefined}
    >
      <div className="fynns-split-pane fynns-split-pane--start">{start}</div>
      {!disableResize ? (
        <div
          className="fynns-split-handle"
          role="separator"
          aria-orientation={orientation}
          aria-label={label}
          aria-valuemin={ariaBounds.min}
          aria-valuemax={ariaBounds.max}
          aria-valuenow={
            sizePx != null ? Math.round(sizePx) : undefined
          }
          tabIndex={0}
          onPointerDown={onResizePointerDown}
          onKeyDown={onResizeKeyDown}
        />
      ) : null}
      <div className="fynns-split-pane fynns-split-pane--end">{end}</div>
    </div>
  );
}
