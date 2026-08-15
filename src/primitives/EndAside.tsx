import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { readVarPx } from "./layoutMeasure";

export type EndAsideProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Controlled pane width in CSS pixels (desktop flex / overlay modes).
   * Written as a local `--fynns-layout-end-aside-width` on the aside.
   */
  width?: number;
  /** Uncontrolled initial width (px). Defaults to computed token width. */
  defaultWidth?: number;
  onWidthChange?: (widthPx: number) => void;
  /** Disable the leading-edge resize handle. Default `false`. */
  disableResize?: boolean;
};

function endAsideTransitionMs(): number {
  if (typeof window === "undefined") return 240;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-duration-base")
    .trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 240;
  if (raw.endsWith("ms")) return value;
  if (raw.endsWith("s")) return value * 1000;
  return 240;
}

/** Phone bottom-sheet path — horizontal resize is not applicable. */
function endAsideSheetMedia(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 56.25rem)").matches;
}

/**
 * End-edge supporting pane with **width** open/close (no translate) so the
 * canvas | aside seam stays a hard edge. Toggle lives in the consumer’s
 * `TopAppBar` trailing (IconButton) — not inside this component.
 *
 * Place beside the canvas inside `ClippedNavShell`’s main column (flex row).
 * Soft floor tokens (`--fynns-layout-end-aside-min-width` /
 * `--fynns-layout-main-min-width`) inform preferred size and crowding probes;
 * flex CSS uses `min-width: 0` (not `min(token, 100%)` of the full row).
 * Extreme squeeze (main ≤32rem) → end-edge overlay.
 *
 * Desktop: leading-edge drag resize (parity with `ClippedNavShell` drawer
 * trailing seam). Live paint via rAF; clamp by `end-aside-min-width` /
 * `end-aside-max-width` and remaining room for `main-min-width`. Hidden on the
 * ≤56.25rem bottom-sheet path.
 *
 * **Chat dual placement:** `ChatMessage` / composer may fill this pane —
 * host = 100% of aside content (rem ceiling dropped); user bubble ceiling
 * lifts to 100% of that host (matches composer shell on long turns); composer
 * 100%. Start-edge chat hosts use `.fynns-chat-host--fill` instead. See
 * AGENTS.md Feedback → ChatMessage.
 *
 * @example
 * ```tsx
 * <div className="app-main-row">
 *   <main>…</main>
 *   <EndAside open={inspectorOpen}>{inspector}</EndAside>
 * </div>
 * ```
 */
export function EndAside({
  open,
  children,
  className,
  style,
  width: widthProp,
  defaultWidth,
  onWidthChange,
  disableResize = false,
}: EndAsideProps) {
  const asideRef = useRef<HTMLElement>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  onWidthChangeRef.current = onWidthChange;
  /** Live drag width — survives React clearing the style prop while `dragging`. */
  const liveWidthRef = useRef<number | null>(null);

  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(open);
  const [sheet, setSheet] = useState(endAsideSheetMedia);
  const [uncontrolledWidth, setUncontrolledWidth] = useState<number | null>(
    defaultWidth ?? null,
  );
  const [dragging, setDragging] = useState(false);

  const controlled = widthProp !== undefined;
  const widthPx = controlled ? widthProp : uncontrolledWidth;

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = window.setTimeout(
      () => setRendered(false),
      endAsideTransitionMs(),
    );
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 56.25rem)");
    const sync = () => setSheet(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const setWidthPx = useCallback(
    (next: number) => {
      const rounded = Math.round(next);
      if (!controlled) setUncontrolledWidth(rounded);
      onWidthChangeRef.current?.(rounded);
    },
    [controlled],
  );

  useLayoutEffect(() => {
    if (controlled || uncontrolledWidth != null || !asideRef.current) return;
    const w = readVarPx(asideRef.current, "--fynns-layout-end-aside-width");
    if (w > 0) setUncontrolledWidth(w);
  }, [controlled, uncontrolledWidth, rendered]);

  const paintWidth = useCallback((next: number, handle?: HTMLElement) => {
    const aside = asideRef.current;
    if (!aside) return;
    const rounded = Math.round(next);
    liveWidthRef.current = rounded;
    aside.style.setProperty(
      "--fynns-layout-end-aside-width",
      `${rounded}px`,
    );
    if (handle) handle.setAttribute("aria-valuenow", String(rounded));
  }, []);

  /*
   * While dragging, React `style` omits the width var so setProperty owns it.
   * A drag-start setState would otherwise wipe that inline var before paint —
   * re-apply after commit so a bare click does not flash to the token/max width.
   */
  useLayoutEffect(() => {
    if (!dragging || liveWidthRef.current == null) return;
    paintWidth(liveWidthRef.current);
  }, [dragging, paintWidth]);

  const clampWidth = useCallback((raw: number) => {
    const aside = asideRef.current;
    if (!aside) return raw;
    const min = readVarPx(aside, "--fynns-layout-end-aside-min-width") || 192;
    const tokenMax =
      readVarPx(aside, "--fynns-layout-end-aside-max-width") || 640;
    const mainMin = readVarPx(aside, "--fynns-layout-main-min-width") || 160;
    const row = aside.parentElement;
    const roomMax =
      row != null
        ? Math.max(min, row.clientWidth - mainMin)
        : tokenMax;
    const max = Math.min(tokenMax, roomMax);
    return Math.min(max, Math.max(min, raw));
  }, []);

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const aside = asideRef.current;
    if (!aside) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    /*
     * Prefer the **rendered** box — flex / max-width can shrink below the
     * preferred CSS var; using the token here jumps to “max” on click.
     */
    const startWidth = Math.round(aside.getBoundingClientRect().width);
    let latest = startWidth;
    liveWidthRef.current = startWidth;
    paintWidth(startWidth, handle);
    setDragging(true);
    const originX = event.clientX;
    let raf = 0;

    const onMove = (ev: PointerEvent) => {
      const rtl = getComputedStyle(aside).direction === "rtl";
      /* Leading edge: drag toward start grows the pane (mirror of drawer). */
      const delta = rtl ? ev.clientX - originX : originX - ev.clientX;
      latest = clampWidth(startWidth + delta);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paintWidth(latest, handle);
        if (controlled) setWidthPx(latest);
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      paintWidth(latest, handle);
      setWidthPx(latest);
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
    const aside = asideRef.current;
    const rtl = aside ? getComputedStyle(aside).direction === "rtl" : false;
    let delta = 0;
    /* Arrow toward the start edge grows the pane. */
    if (event.key === "ArrowLeft") delta = rtl ? -step : step;
    else if (event.key === "ArrowRight") delta = rtl ? step : -step;
    else return;
    event.preventDefault();
    const current =
      Math.round(aside?.getBoundingClientRect().width ?? 0) ||
      widthPx ||
      ((aside ? readVarPx(aside, "--fynns-layout-end-aside-width") : 0) ||
        352);
    setWidthPx(clampWidth(current + delta));
  };

  if (!rendered) return null;

  const showResize = entered && !disableResize && !sheet;
  const asideStyle: CSSProperties | undefined = (() => {
    const base = style;
    if (dragging || widthPx == null) return base;
    return {
      ...base,
      ["--fynns-layout-end-aside-width" as string]: `${widthPx}px`,
    };
  })();

  const resizeBounds = (() => {
    const aside = asideRef.current;
    if (!aside || !showResize) return null;
    const min = readVarPx(aside, "--fynns-layout-end-aside-min-width") || 192;
    const tokenMax =
      readVarPx(aside, "--fynns-layout-end-aside-max-width") || 640;
    const mainMin = readVarPx(aside, "--fynns-layout-main-min-width") || 160;
    const row = aside.parentElement;
    const roomMax =
      row != null
        ? Math.max(min, row.clientWidth - mainMin)
        : tokenMax;
    return { min, max: Math.min(tokenMax, roomMax) };
  })();

  return (
    <aside
      ref={asideRef}
      className={["fynns-end-aside", className ?? ""].filter(Boolean).join(" ")}
      data-state={entered ? "open" : "closing"}
      data-resizing={dragging ? "true" : undefined}
      aria-hidden={!open || undefined}
      inert={!open ? true : undefined}
      style={asideStyle}
    >
      {showResize ? (
        <div
          className="fynns-end-aside-resize"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize end aside"
          aria-valuemin={
            resizeBounds != null ? Math.round(resizeBounds.min) : undefined
          }
          aria-valuemax={
            resizeBounds != null ? Math.round(resizeBounds.max) : undefined
          }
          aria-valuenow={widthPx != null ? Math.round(widthPx) : undefined}
          tabIndex={0}
          onPointerDown={onResizePointerDown}
          onKeyDown={onResizeKeyDown}
        />
      ) : null}
      {children}
    </aside>
  );
}
