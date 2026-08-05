import { useLayoutEffect, useRef, type ReactNode } from "react";

export type ClippedNavShellNavMode = "drawer" | "rail";

export type ClippedNavShellProps = {
  /**
   * Destination column mode. Drives `data-nav` and the body grid track
   * (`--fynns-navdrawer-width` vs `--fynns-navrail-width`).
   */
  navMode: ClippedNavShellNavMode;
  /**
   * Full-bleed top row — typically `TopAppBar` (leading = nav toggle,
   * title = brand, trailing = actions). Spans the window above the nav|main grid.
   */
  topBar: ReactNode;
  /**
   * Destination chrome for the current `navMode` — usually
   * `NavigationDrawer variant="standard"` or `NavigationRail`.
   */
  nav: ReactNode;
  /** Main column (canvas + optional `EndAside`). */
  children: ReactNode;
  className?: string;
  /**
   * When `navMode` is `"drawer"` and the shell’s content width overflows
   * (e.g. canvas + `EndAside` both at their min clamps), call this so the
   * consumer can collapse destinations to rail / icon mode.
   */
  onNavCrowded?: () => void;
};

function readFlyoutMs(el: Element): number {
  const raw = getComputedStyle(el).getPropertyValue("--fynns-duration-flyout").trim();
  if (!raw) return 320;
  if (raw.endsWith("ms")) return Math.max(0, Number.parseFloat(raw) || 320);
  if (raw.endsWith("s")) return Math.max(0, (Number.parseFloat(raw) || 0.32) * 1000);
  return 320;
}

/**
 * M3 clipped app shell: full-bleed top bar, then `nav | main` below (no
 * topbar×sidebar crosshair). Pair with `EndAside` inside `children` for a
 * supporting inspector pane. Destinations stay in the `nav` slot — this shell
 * only owns layout.
 *
 * @example
 * ```tsx
 * <ClippedNavShell
 *   navMode={expanded ? "drawer" : "rail"}
 *   onNavCrowded={() => setExpanded(false)}
 *   topBar={<TopAppBar leading={…} title="App" trailing={…} />}
 *   nav={expanded ? <NavigationDrawer …/> : <NavigationRail …/>}
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
}: ClippedNavShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onNavCrowdedRef = useRef(onNavCrowded);
  onNavCrowdedRef.current = onNavCrowded;

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

    // EndAside (or other main chrome) can mount while still in drawer mode —
    // re-check after DOM mutations + observe new flex children.
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
  }, [navMode]);

  return (
    <div
      ref={rootRef}
      className={["fynns-clipped-nav-shell", className ?? ""].filter(Boolean).join(" ")}
      data-nav={navMode}
    >
      {topBar}
      <div className="fynns-clipped-nav-shell-body">
        {nav}
        <div className="fynns-clipped-nav-shell-main">{children}</div>
      </div>
    </div>
  );
}
