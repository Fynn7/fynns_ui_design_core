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

export type ClippedNavShellNavMode = "drawer" | "rail" | "hidden";

export type ClippedNavShellProps = {
  /**
   * Destination column mode. Drives `data-nav` and the body grid track
   * (`--fynns-navdrawer-width` / `--fynns-navrail-width` / `0` when hidden).
   *
   * TopAppBar leading toggle should flip **open ↔ closed** only (`drawer`|`rail`
   * ↔ `hidden`). Prefer `"rail"` for automatic crowding (`onNavCrowded`) **and**
   * for narrow viewports — keeping `"drawer"` below ~900px stacks labeled
   * destinations above the canvas and starves the main stage.
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
   * When `navMode` is `"drawer"` and the shell’s content width overflows
   * (e.g. canvas + `EndAside` both at their min clamps), call this so the
   * consumer can collapse destinations to rail / icon mode (not hidden).
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

/** Resolve a CSS custom-property length (rem / clamp / px) to CSS pixels. */
function readVarPx(host: Element, varName: string): number {
  const raw = getComputedStyle(host).getPropertyValue(varName).trim();
  if (!raw) return 0;
  if (raw.endsWith("px")) {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;height:0;width:" +
    raw;
  host.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
}

/**
 * M3 clipped app shell: full-bleed top bar, then `nav | main` below (no
 * topbar×sidebar crosshair). Pair with `EndAside` inside `children` for a
 * supporting inspector pane. Destinations stay in the `nav` slot — this shell
 * only owns layout. Open/close **width-morphs** the destination track (same
 * idea as `EndAside`): keep two grid columns and animate the nav track to
 * `0px`; the shell holds the last `nav` node until the flyout duration ends so
 * consumers may pass `null` when `navMode="hidden"`. In `drawer` mode the
 * nav|main seam is draggable (updates local `--fynns-navdrawer-width`, clamped
 * by navdrawer min/max and remaining room for main / EndAside mins).
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
export function ClippedNavShell({
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
}: ClippedNavShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
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
      if (event.target === body) check();
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
  }, [navMode, drawerWidthPx]);

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

    const onMove = (ev: PointerEvent) => {
      const rtl = getComputedStyle(root).direction === "rtl";
      const delta = rtl ? originX - ev.clientX : ev.clientX - originX;
      setDrawerWidthPx(clampDrawerWidth(startWidth + delta));
    };
    const onUp = (ev: PointerEvent) => {
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
  const rootStyle: CSSProperties | undefined =
    drawerWidthPx != null && navMode === "drawer"
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
}
