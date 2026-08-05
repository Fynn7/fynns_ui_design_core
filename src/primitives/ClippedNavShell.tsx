import type { ReactNode } from "react";

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
};

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
}: ClippedNavShellProps) {
  return (
    <div
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
