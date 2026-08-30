import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { readVarPx } from "./layoutMeasure";

export type EndAsideProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Controlled pane width in CSS pixels (desktop flex / overlay modes).
   * Written as a local `--fynns-layout-end-aside-width` on the morph track.
   */
  width?: number;
  /** Uncontrolled initial width (px). Defaults to computed token width. */
  defaultWidth?: number;
  onWidthChange?: (widthPx: number) => void;
  /** Disable the leading-edge resize handle. Default `false`. */
  disableResize?: boolean;
};

export type EndAsideMorphTrackProps = {
  open: boolean;
  width?: number;
  defaultWidth?: number;
  onWidthChange?: (widthPx: number) => void;
  children: ReactNode;
};

type EndAsideTrackContextValue = {
  trackRef: RefObject<HTMLDivElement | null>;
  entered: boolean;
  dragging: boolean;
  setDragging: (next: boolean) => void;
  widthPx: number | null;
  setWidthPx: (next: number) => void;
  controlled: boolean;
  liveWidthRef: RefObject<number | null>;
  paintWidth: (next: number, handle?: HTMLElement) => void;
};

const EndAsideTrackContext = createContext<EndAsideTrackContextValue | null>(
  null,
);

/** Survives `EndAsideMorphTrack` remount during consumer reconcile (StrictMode). */
const endAsideMorphMemory = {
  wasVisible: false,
};

/** Clear morph memory when `DestinationAppShell` drops `aside`. */
export function endAsideMorphMemoryReset() {
  endAsideMorphMemory.wasVisible = false;
}

function useEndAsideTrack() {
  const ctx = useContext(EndAsideTrackContext);
  if (!ctx) {
    throw new Error("EndAsidePane must render inside EndAsideMorphTrack.");
  }
  return ctx;
}

/** Phone bottom-sheet path — horizontal resize is not applicable. */
function endAsideSheetMedia(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 56.25rem)").matches;
}

/**
 * Width-morph flex track for `EndAside` — stays mounted in `DestinationAppShell`
 * while the inner pane may reconcile. Same grammar as `ClippedNavShell` drawer
 * column (`0px` morph, not unmount).
 */
export function EndAsideMorphTrack({
  open,
  width: widthProp,
  defaultWidth,
  onWidthChange,
  children,
}: EndAsideMorphTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  onWidthChangeRef.current = onWidthChange;
  const liveWidthRef = useRef<number | null>(null);

  const [entered, setEntered] = useState(() =>
    open || (!open && endAsideMorphMemory.wasVisible),
  );
  const [uncontrolledWidth, setUncontrolledWidth] = useState<number | null>(
    defaultWidth ?? null,
  );
  const [dragging, setDragging] = useState(false);

  const controlled = widthProp !== undefined;
  const widthPx = controlled ? widthProp : uncontrolledWidth;

  useLayoutEffect(() => {
    if (open) {
      endAsideMorphMemory.wasVisible = true;
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    if (!endAsideMorphMemory.wasVisible) {
      setEntered(false);
      return;
    }
    /* Close: paint one frame at open width (incl. after remount) then morph. */
    setEntered(true);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setEntered(false);
        endAsideMorphMemory.wasVisible = false;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open && !entered && trackRef.current) {
      endAsideMorphMemory.wasVisible = false;
    }
  }, [open, entered]);

  const setWidthPx = useCallback(
    (next: number) => {
      const rounded = Math.round(next);
      if (!controlled) setUncontrolledWidth(rounded);
      onWidthChangeRef.current?.(rounded);
    },
    [controlled],
  );

  useLayoutEffect(() => {
    if (controlled || uncontrolledWidth != null || !trackRef.current) return;
    const w = readVarPx(trackRef.current, "--fynns-layout-end-aside-width");
    if (w > 0) setUncontrolledWidth(w);
  }, [controlled, uncontrolledWidth]);

  const paintWidth = useCallback((next: number, handle?: HTMLElement) => {
    const track = trackRef.current;
    if (!track) return;
    const rounded = Math.round(next);
    liveWidthRef.current = rounded;
    track.style.setProperty("--fynns-layout-end-aside-width", `${rounded}px`);
    if (handle) handle.setAttribute("aria-valuenow", String(rounded));
  }, []);

  useLayoutEffect(() => {
    if (!dragging || liveWidthRef.current == null) return;
    paintWidth(liveWidthRef.current);
  }, [dragging, paintWidth]);

  const trackStyle: CSSProperties | undefined =
    dragging || widthPx == null
      ? undefined
      : ({
          ["--fynns-layout-end-aside-width" as string]: `${widthPx}px`,
        } as CSSProperties);

  const ctx = useMemo(
    () => ({
      trackRef,
      entered,
      dragging,
      setDragging,
      widthPx,
      setWidthPx,
      controlled,
      liveWidthRef,
      paintWidth,
    }),
    [
      entered,
      dragging,
      widthPx,
      setWidthPx,
      controlled,
      paintWidth,
    ],
  );

  return (
    <EndAsideTrackContext.Provider value={ctx}>
      <div
        ref={trackRef}
        className="fynns-end-aside-track"
        data-state={entered ? "open" : "closing"}
        data-resizing={dragging ? "true" : undefined}
        style={trackStyle}
      >
        {children}
      </div>
    </EndAsideTrackContext.Provider>
  );
}

export type EndAsidePaneProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  disableResize?: boolean;
};

/** Inner aside shell — resize handle + children. Requires `EndAsideMorphTrack`. */
export function EndAsidePane({
  open,
  children,
  className,
  style,
  disableResize = false,
}: EndAsidePaneProps) {
  const asideRef = useRef<HTMLElement>(null);
  const {
    trackRef,
    entered,
    setDragging,
    widthPx,
    setWidthPx,
    controlled,
    liveWidthRef,
    paintWidth,
  } = useEndAsideTrack();

  const [sheet, setSheet] = useState(endAsideSheetMedia);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 56.25rem)");
    const sync = () => setSheet(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const clampWidth = useCallback((raw: number) => {
    const track = trackRef.current;
    if (!track) return raw;
    const min = readVarPx(track, "--fynns-layout-end-aside-min-width") || 192;
    const tokenMax =
      readVarPx(track, "--fynns-layout-end-aside-max-width") || 640;
    const mainMin = readVarPx(track, "--fynns-layout-main-min-width") || 160;
    const row = track.parentElement;
    const roomMax =
      row != null ? Math.max(min, row.clientWidth - mainMin) : tokenMax;
    const max = Math.min(tokenMax, roomMax);
    return Math.min(max, Math.max(min, raw));
  }, [trackRef]);

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startWidth = Math.round(track.getBoundingClientRect().width);
    let latest = startWidth;
    liveWidthRef.current = startWidth;
    paintWidth(startWidth, handle);
    setDragging(true);
    const originX = event.clientX;
    let raf = 0;

    const onMove = (ev: PointerEvent) => {
      const rtl = getComputedStyle(track).direction === "rtl";
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
    const track = trackRef.current;
    const rtl = track ? getComputedStyle(track).direction === "rtl" : false;
    let delta = 0;
    if (event.key === "ArrowLeft") delta = rtl ? -step : step;
    else if (event.key === "ArrowRight") delta = rtl ? step : -step;
    else return;
    event.preventDefault();
    const current =
      Math.round(track?.getBoundingClientRect().width ?? 0) ||
      widthPx ||
      ((track ? readVarPx(track, "--fynns-layout-end-aside-width") : 0) || 352);
    setWidthPx(clampWidth(current + delta));
  };

  const showResize = open && entered && !disableResize && !sheet;

  const resizeBounds = (() => {
    const track = trackRef.current;
    if (!track || !showResize) return null;
    const min = readVarPx(track, "--fynns-layout-end-aside-min-width") || 192;
    const tokenMax =
      readVarPx(track, "--fynns-layout-end-aside-max-width") || 640;
    const mainMin = readVarPx(track, "--fynns-layout-main-min-width") || 160;
    const row = track.parentElement;
    const roomMax =
      row != null ? Math.max(min, row.clientWidth - mainMin) : tokenMax;
    return { min, max: Math.min(tokenMax, roomMax) };
  })();

  return (
    <aside
      ref={asideRef}
      className={["fynns-end-aside", className ?? ""].filter(Boolean).join(" ")}
      aria-hidden={!open || undefined}
      inert={!open ? true : undefined}
      style={style}
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

/**
 * End-edge supporting pane with **width** open/close (no translate) so the
 * canvas | aside seam stays a hard edge. Toggle lives in the consumer’s
 * `TopAppBar` trailing (IconButton) — not inside this component.
 *
 * **Width morph (hard ≥ 0.5.86):** `EndAsideMorphTrack` stays mounted while
 * `aside` is set — same grammar as `ClippedNavShell` drawer track (`0px` morph,
 * not unmount). `DestinationAppShell` composes morph track + pane so inner
 * reconcile does not reset the close animation. Do **not** conditionally mount
 * `{open && <EndAside>}`.
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
  return (
    <EndAsideMorphTrack
      open={open}
      width={widthProp}
      defaultWidth={defaultWidth}
      onWidthChange={onWidthChange}
    >
      <EndAsidePane
        open={open}
        className={className}
        style={style}
        disableResize={disableResize}
      >
        {children}
      </EndAsidePane>
    </EndAsideMorphTrack>
  );
}
