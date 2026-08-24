import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { readRemPx, readVarPx } from "./layoutMeasure";

export type ClippedNavShellNavMode = "drawer" | "rail" | "hidden";

export type ClippedNavShellProps = {
  /**
   * Destination column mode. Drives `data-nav` and the body grid track
   * (`--fynns-navdrawer-width` / `--fynns-navrail-width` / `0` when hidden).
   *
   * TopAppBar leading toggle should flip **open ↔ closed** only (`drawer`|`rail`
   * ↔ `hidden`). Prefer `"rail"` for automatic crowding (`onNavCrowded`) **and**
   * for narrow viewports (≤56.25rem / ~900px) — keep destinations a side column
   * with `NavigationRail`. Core no longer stacks a rem-capped labeled drawer
   * above main; leaving `"drawer"` on narrow still sizes a full drawer track
   * and will fire `onNavCrowded` when wired.
   */
  navMode: ClippedNavShellNavMode;
  /**
   * Full-bleed top row — typically `TopAppBar` (leading = nav toggle,
   * title = brand, trailing = actions). Spans the window above the nav|main grid.
   */
  topBar: ReactNode;
  /**
   * Destination chrome for the current `navMode` — usually
   * `NavigationDrawer variant="standard"` or `NavigationRail`. Omit / null when
   * `navMode` is `"hidden"`.
   */
  nav: ReactNode;
  /** Main column (canvas + optional `EndAside`). */
  children: ReactNode;
  className?: string;
  /**
   * When `navMode` is `"drawer"` and a full labeled drawer would starve
   * canvas + `EndAside` mins (or force EndAside overlay), **or** the
   * viewport is ≤56.25rem (~900px), call this so the consumer can densify
   * to rail / icon mode (not hidden). Fired from `useLayoutEffect` using
   * **target** drawer width (not mid-transition layout) so open does not
   * paint full drawer then snap to rail.
   */
  onNavCrowded?: () => void;
  /**
   * Controlled drawer column width in CSS pixels (`navMode="drawer"` only).
   * Written as a local `--fynns-navdrawer-width` on the shell root.
   */
  drawerWidth?: number;
  /** Uncontrolled initial width (px). Defaults to computed token width. */
  defaultDrawerWidth?: number;
  onDrawerWidthChange?: (widthPx: number) => void;
  /** Disable the drawer trailing-edge resize handle. Default `false`. */
  disableDrawerResize?: boolean;
};

function readFlyoutMs(el: Element | null): number {
  if (!el || typeof window === "undefined") return 320;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  const raw = getComputedStyle(el).getPropertyValue("--fynns-duration-flyout").trim();
  if (!raw) return 320;
  if (raw.endsWith("ms")) return Math.max(0, Number.parseFloat(raw) || 320);
  if (raw.endsWith("s")) return Math.max(0, (Number.parseFloat(raw) || 0.32) * 1000);
  return 320;
}

/**
 * Whether a **target** labeled-drawer width would starve main / EndAside floors
 * (or force EndAside overlay) in `host` — ignores CSS transition mid-frames.
 * Use when opening destinations so apps can choose `rail` without painting a
 * full drawer first; `ClippedNavShell` also calls this from `useLayoutEffect`.
 *
 * @param host `.fynns-clipped-nav-shell` root (or any ancestor that carries the
 *   layout tokens and contains `.fynns-clipped-nav-shell-main`).
 * @param drawerWidthPx Target drawer column width; defaults to
 *   `--fynns-navdrawer-width` on `host`.
 */
export function wouldClippedNavDrawerCrowd(
  host: Element,
  drawerWidthPx?: number,
): boolean {
  const root =
    host instanceof Element && host.classList.contains("fynns-clipped-nav-shell")
      ? host
      : (host.querySelector(".fynns-clipped-nav-shell") ?? host);
  const drawerTarget =
    drawerWidthPx ?? (readVarPx(root, "--fynns-navdrawer-width") || 280);
  const mainMin = readVarPx(root, "--fynns-layout-main-min-width") || 160;
  const main = root.querySelector(".fynns-clipped-nav-shell-main");
  const aside = main?.querySelector(
    ".fynns-end-aside:not([data-state='closing'])",
  );
  const asideMin = aside
    ? readVarPx(root, "--fynns-layout-end-aside-min-width") || 192
    : 0;
  const shellW = root.clientWidth;
  if (shellW <= 0) return false;
  if (drawerTarget + mainMin + asideMin > shellW + 1) return true;
  if (!aside) return false;
  const mainTrack = Math.max(0, shellW - drawerTarget);
  /* Matches `@container fynns-shell-main (max-width: 32rem)` overlay path. */
  const overlayAt = readRemPx(root, 32);
  if (mainTrack <= overlayAt + 1) return true;
  if (mainTrack > 0 && drawerTarget >= mainTrack) return true;
  return false;
}

/**
 * M3 clipped app shell: full-bleed top bar, then `nav | main` below (no
 * topbar×sidebar crosshair). Pair with `EndAside` inside `children` for a
 * supporting inspector pane. Destinations stay in the `nav` slot — this shell
 * only owns layout. Open/close **width-morphs** the destination track (same
 * idea as `EndAside`): keep two grid columns and animate the nav track to
 * `0px`; the shell holds the last `nav` node until the flyout duration ends so
 * consumers may pass `null` when `navMode="hidden"`. In `drawer` mode the
 * nav|main seam is draggable (paints `--fynns-navdrawer-width` live via rAF,
 * commits on pointerup; clamped by navdrawer min/max and remaining room for
 * main / EndAside mins). `onNavCrowded` uses target drawer width (see
 * `wouldClippedNavDrawerCrowd`) in `useLayoutEffect` so opening never paints a
 * full drawer then snaps to rail; also skips while resizing or while an
 * `EndAside` is closing.
 *
 * @example
 * ```tsx
 * <ClippedNavShell
 *   navMode={open ? (narrow || compact ? "rail" : "drawer") : "hidden"}
 *   onNavCrowded={() => setCompact(true)}
 *   topBar={<TopAppBar leading={…} title="App" trailing={…} />}
 *   nav={open ? (narrow || compact ? <NavigationRail …/> : <NavigationDrawer …/>) : null}
 * >
 *   <main>…</main>
 * </ClippedNavShell>
 * ```
 */
export const ClippedNavShell = forwardRef<HTMLDivElement, ClippedNavShellProps>(
  function ClippedNavShell(
    {
      navMode,
      topBar,
      nav,
      children,
      className,
      onNavCrowded,
      drawerWidth: drawerWidthProp,
      defaultDrawerWidth,
      onDrawerWidthChange,
      disableDrawerResize = false,
    },
    forwardedRef,
  ) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
  const onNavCrowdedRef = useRef(onNavCrowded);
  onNavCrowdedRef.current = onNavCrowded;
  const onDrawerWidthChangeRef = useRef(onDrawerWidthChange);
  onDrawerWidthChangeRef.current = onDrawerWidthChange;

  /**
   * Last destination node for the close morph. `phase` moves open → closing on
   * the same render as `navMode="hidden"` (React render-time adjust) so
   * consumers that pass `nav={null}` do not flash an empty slot before the
   * effect runs. After `--fynns-duration-flyout`, phase → closed and unmounts.
   */
  const lastNavRef = useRef(nav);
  if (nav != null) lastNavRef.current = nav;
  const [phase, setPhase] = useState<"open" | "closing" | "closed">(
    navMode === "hidden" ? "closed" : "open",
  );

  if (navMode !== "hidden" && phase !== "open") {
    setPhase("open");
  } else if (navMode === "hidden" && phase === "open") {
    setPhase("closing");
  }

  const renderedNav =
    phase === "closed"
      ? null
      : navMode !== "hidden"
        ? nav
        : lastNavRef.current;

  const [uncontrolledWidth, setUncontrolledWidth] = useState<number | null>(
    defaultDrawerWidth ?? null,
  );
  const [dragging, setDragging] = useState(false);
  const controlled = drawerWidthProp !== undefined;
  const drawerWidthPx = controlled ? drawerWidthProp : uncontrolledWidth;

  useEffect(() => {
    if (phase !== "closing") return;
    const ms = readFlyoutMs(rootRef.current);
    const timer = window.setTimeout(() => setPhase("closed"), ms);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /**
   * Dev-only: `navMode` only sizes the grid track — consumers must swap
   * NavigationDrawer ↔ NavigationRail themselves. A rail track hosting a
   * labeled drawer is the “squashed drawer” failure (narrow strip + scrollbar).
   * Warn once per mismatch stretch (do not depend on `nav` — inline JSX
   * identity churn would spam the console every parent render).
   */
  const squashedDrawerWarnedRef = useRef(false);
  const narrowDrawerWarnedRef = useRef(false);
  useEffect(() => {
    // Avoid bare `process` (consumer tsc may lack @types/node).
    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv === "production") return;
    if (navMode !== "rail" || phase === "closed") {
      squashedDrawerWarnedRef.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const drawer = root.querySelector(
      ".fynns-clipped-nav-shell-nav .fynns-nav-drawer",
    );
    if (!drawer) {
      squashedDrawerWarnedRef.current = false;
      return;
    }
    if (squashedDrawerWarnedRef.current) return;
    squashedDrawerWarnedRef.current = true;
    console.warn(
      '[ClippedNavShell] navMode="rail" but nav still renders NavigationDrawer. ' +
        "Swap to NavigationRail / NavigationRailItem (see llm/CONSUMER_TREATY.md). " +
        "Leaving a labeled drawer in the rail track produces a squashed column and unexpected scrollbars.",
    );
  }, [navMode, phase]);

  useEffect(() => {
    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv === "production") return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 56.25rem)");
    const warn = () => {
      if (!mq.matches || navMode !== "drawer" || phase === "closed") {
        narrowDrawerWarnedRef.current = false;
        return;
      }
      if (narrowDrawerWarnedRef.current) return;
      narrowDrawerWarnedRef.current = true;
      console.warn(
        '[ClippedNavShell] navMode="drawer" on viewport ≤56.25rem. Densify to ' +
          '"rail" + NavigationRail (DestinationAppShell / onNavCrowded). Core keeps ' +
          "a side column — it no longer stacks a rem-capped drawer ribbon above main.",
      );
    };
    warn();
    mq.addEventListener("change", warn);
    return () => mq.removeEventListener("change", warn);
  }, [navMode, phase]);

  const setDrawerWidthPx = useCallback(
    (next: number) => {
      const rounded = Math.round(next);
      if (!controlled) setUncontrolledWidth(rounded);
      onDrawerWidthChangeRef.current?.(rounded);
    },
    [controlled],
  );

  useLayoutEffect(() => {
    if (controlled || uncontrolledWidth != null || !rootRef.current) return;
    const w = readVarPx(rootRef.current, "--fynns-navdrawer-width");
    if (w > 0) setUncontrolledWidth(w);
  }, [controlled, uncontrolledWidth]);

  useLayoutEffect(() => {
    if (!onNavCrowdedRef.current || navMode !== "drawer") return;
    const root = rootRef.current;
    if (!root) return;
    const body = root.querySelector<HTMLElement>(
      ":scope > .fynns-clipped-nav-shell-body",
    );

    const isCrowded = () => {
      /* Always read the live CSS var — this effect intentionally omits
       * drawerWidthPx from deps (drag stutter); a closed-over state would
       * go stale after pointerup / external width changes. */
      const drawerTarget = readVarPx(root, "--fynns-navdrawer-width") || 280;
      /* Prefer target width over mid-flyout interpolated columns — otherwise
       * open expands to full drawer then densifies after settleTimer. */
      if (wouldClippedNavDrawerCrowd(root, drawerTarget)) return true;

      /* Narrow viewport: densify drawer → rail (same ~900px as DestinationAppShell).
       * Core no longer stacks a rem-capped drawer above main. */
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 56.25rem)").matches
      ) {
        return true;
      }

      if (root.scrollWidth > root.clientWidth + 1) return true;
      if (body && body.scrollWidth > body.clientWidth + 1) return true;
      /* EndAside + canvas mins can overflow inside the main track while the
       * outer grid still fits (minmax(0,1fr) + min-width:0 on main). */
      const main = body?.querySelector(
        ":scope > .fynns-clipped-nav-shell-main",
      );
      if (main && main.scrollWidth > main.clientWidth + 1) return true;

      /*
       * Shrink-to-fit can hide overflow: the drawer track keeps its width while
       * main collapses below the soft floors (no scrollWidth growth). Detect
       * that starvation and densify destinations to rail.
       */
      if (body && main) {
        const mainW = main.clientWidth;
        const mainMin = readVarPx(root, "--fynns-layout-main-min-width");
        const aside = main.querySelector(
          ".fynns-end-aside:not([data-state='closing'])",
        );
        const asideMin = aside
          ? readVarPx(root, "--fynns-layout-end-aside-min-width")
          : 0;
        const floor = mainMin + asideMin;
        if (floor > 0 && mainW + 1 < floor) return true;

        const navCol = body.querySelector(
          ":scope > .fynns-clipped-nav-shell-nav > .fynns-nav-drawer, :scope > .fynns-clipped-nav-shell-nav > .fynns-nav-rail",
        );
        const navW = navCol?.getBoundingClientRect().width ?? 0;
        if (aside && navW > 0 && mainW > 0 && navW >= mainW) return true;

        /* Overlay + still-open drawer (common under CSS zoom / nested squeeze):
         * densify destinations so the canvas is not permanently covered. */
        if (
          aside &&
          navCol?.classList.contains("fynns-nav-drawer") &&
          getComputedStyle(aside).position === "absolute"
        ) {
          return true;
        }
      }
      return false;
    };

    const check = () => {
      /* Dragging rewrites the drawer track every frame — never densify mid-drag.
       * Closing EndAside keeps content min-width while the pane morphs to 0,
       * which falsely trips scrollWidth/floor checks and collapsed labeled
       * drawer → rail when the user only meant to hide the inspector. */
      if (root.getAttribute("data-drawer-resizing") === "true") return;
      const main = body?.querySelector(
        ":scope > .fynns-clipped-nav-shell-main",
      );
      if (main?.querySelector(".fynns-end-aside[data-state='closing']")) return;
      /* EndAside live-drag paints width every frame — never densify mid-drag. */
      if (main?.querySelector(".fynns-end-aside[data-resizing='true']")) return;
      if (isCrowded()) onNavCrowdedRef.current?.();
    };

    check();
    const raf = requestAnimationFrame(() => {
      check();
      requestAnimationFrame(check);
    });
    const settleTimer = window.setTimeout(check, readFlyoutMs(root) + 48);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(root);
    if (body) {
      ro?.observe(body);
      for (const child of body.children) {
        ro?.observe(child);
      }
      const main = body.querySelector(":scope > .fynns-clipped-nav-shell-main");
      if (main) {
        for (const child of main.children) {
          ro?.observe(child);
        }
      }
    }

    const onTransitionEnd = (event: TransitionEvent) => {
      if (
        event.target === body ||
        (event.target instanceof Element &&
          event.target.classList.contains("fynns-end-aside"))
      ) {
        check();
      }
    };
    body?.addEventListener("transitionend", onTransitionEnd);
    window.addEventListener("resize", check);

    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            const main = body?.querySelector(
              ":scope > .fynns-clipped-nav-shell-main",
            );
            if (main) {
              for (const child of main.children) ro?.observe(child);
            }
            requestAnimationFrame(check);
          })
        : null;
    mo?.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      ro?.disconnect();
      mo?.disconnect();
      body?.removeEventListener("transitionend", onTransitionEnd);
      window.removeEventListener("resize", check);
    };
    /* Width changes are observed via ResizeObserver — do not rebind this
     * effect on every drag pixel (that was the stutter source). */
  }, [navMode]);

  const clampDrawerWidth = useCallback((raw: number) => {
    const root = rootRef.current;
    if (!root) return raw;
    const min = readVarPx(root, "--fynns-navdrawer-min-width") || 192;
    const tokenMax = readVarPx(root, "--fynns-navdrawer-max-width") || 448;
    const mainMin = readVarPx(root, "--fynns-layout-main-min-width") || 160;
    const main = root.querySelector(".fynns-clipped-nav-shell-main");
    const hasAside = !!main?.querySelector(
      ".fynns-end-aside:not([data-state='closing'])",
    );
    const asideMin = hasAside
      ? readVarPx(root, "--fynns-layout-end-aside-min-width") || 192
      : 0;
    const roomMax = Math.max(min, root.clientWidth - mainMin - asideMin);
    const max = Math.min(tokenMax, roomMax);
    return Math.min(max, Math.max(min, raw));
  }, []);

  /** Paint drawer width without a React render (live drag feedback). */
  const paintDrawerWidth = useCallback((widthPx: number, handle?: HTMLElement) => {
    const root = rootRef.current;
    if (!root) return;
    const rounded = Math.round(widthPx);
    root.style.setProperty("--fynns-navdrawer-width", `${rounded}px`);
    if (handle) handle.setAttribute("aria-valuenow", String(rounded));
  }, []);

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(true);
    const originX = event.clientX;
    const startWidth =
      drawerWidthPx ?? (readVarPx(root, "--fynns-navdrawer-width") || 280);
    let latest = startWidth;
    let raf = 0;

    const onMove = (ev: PointerEvent) => {
      const rtl = getComputedStyle(root).direction === "rtl";
      const delta = rtl ? originX - ev.clientX : ev.clientX - originX;
      latest = clampDrawerWidth(startWidth + delta);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paintDrawerWidth(latest, handle);
        /* Controlled parents still need live updates; uncontrolled skips
         * setState until pointerup so the shell does not re-reconcile. */
        if (controlled) setDrawerWidthPx(latest);
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      paintDrawerWidth(latest, handle);
      setDrawerWidthPx(latest);
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
    const rtl = rootRef.current
      ? getComputedStyle(rootRef.current).direction === "rtl"
      : false;
    let delta = 0;
    if (event.key === "ArrowLeft") delta = rtl ? step : -step;
    else if (event.key === "ArrowRight") delta = rtl ? -step : step;
    else return;
    event.preventDefault();
    const root = rootRef.current;
    const current =
      drawerWidthPx ??
      ((root ? readVarPx(root, "--fynns-navdrawer-width") : 0) || 280);
    setDrawerWidthPx(clampDrawerWidth(current + delta));
  };

  const showResize = navMode === "drawer" && !disableDrawerResize;
  /* While dragging, `paintDrawerWidth` owns the inline CSS var — omit React
   * `style` so a parent re-render cannot clobber live drag feedback. */
  const rootStyle: CSSProperties | undefined =
    !dragging && drawerWidthPx != null && navMode === "drawer"
      ? ({ ["--fynns-navdrawer-width" as string]: `${drawerWidthPx}px` } as CSSProperties)
      : undefined;

  const resizeBounds = (() => {
    const root = rootRef.current;
    if (!root || !showResize) return null;
    const min = readVarPx(root, "--fynns-navdrawer-min-width") || 192;
    const tokenMax = readVarPx(root, "--fynns-navdrawer-max-width") || 448;
    const mainMin = readVarPx(root, "--fynns-layout-main-min-width") || 160;
    const main = root.querySelector(".fynns-clipped-nav-shell-main");
    const hasAside = !!main?.querySelector(
      ".fynns-end-aside:not([data-state='closing'])",
    );
    const asideMin = hasAside
      ? readVarPx(root, "--fynns-layout-end-aside-min-width") || 192
      : 0;
    const roomMax = Math.max(min, root.clientWidth - mainMin - asideMin);
    return { min, max: Math.min(tokenMax, roomMax) };
  })();

  return (
    <div
      ref={rootRef}
      className={["fynns-clipped-nav-shell", className ?? ""].filter(Boolean).join(" ")}
      data-nav={navMode}
      data-drawer-resizing={dragging ? "true" : undefined}
      style={rootStyle}
    >
      {topBar}
      <div className="fynns-clipped-nav-shell-body">
        <div
          className="fynns-clipped-nav-shell-nav"
          data-state={navMode === "hidden" ? "closed" : "open"}
          aria-hidden={navMode === "hidden" || undefined}
          {...(navMode === "hidden" ? ({ inert: true } as { inert: boolean }) : {})}
        >
          {renderedNav}
        </div>
        <div className="fynns-clipped-nav-shell-main">{children}</div>
        {showResize ? (
          <div
            className="fynns-clipped-nav-shell-resize"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize navigation drawer"
            aria-valuemin={
              resizeBounds != null ? Math.round(resizeBounds.min) : undefined
            }
            aria-valuemax={
              resizeBounds != null ? Math.round(resizeBounds.max) : undefined
            }
            aria-valuenow={
              drawerWidthPx != null ? Math.round(drawerWidthPx) : undefined
            }
            tabIndex={0}
            onPointerDown={onResizePointerDown}
            onKeyDown={onResizeKeyDown}
          />
        ) : null}
      </div>
    </div>
  );
  },
);
