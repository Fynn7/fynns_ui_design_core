import type { HTMLAttributes, ReactNode } from "react";

export type BottomAppBarProps = HTMLAttributes<HTMLElement> & {
  /**
   * Leading / mid action icons (typically `IconButton`s). Laid out start-aligned.
   * Prefer `NavigationBar` when the bottom edge is for destinations.
   */
  actions?: ReactNode;
  /**
   * Optional FAB at the end of the bar (M3: inside the bar, not cradled).
   * Usually a `Fab` (`size="sm"` or default).
   */
  floatingActionButton?: ReactNode;
  /**
   * Freeform body when not using `actions` / `floatingActionButton` slots.
   * Ignored when either slot is provided.
   */
  children?: ReactNode;
};

/**
 * M3 Bottom app bar — dense 56dp surface for key actions + optional FAB.
 * Prefer `NavigationBar` for bottom destinations; use this for action chrome
 * on compact layouts. Sticky positioning is left to the caller.
 * M3-informed layout, denser than stock 80dp (same densification as TopAppBar).
 * @see https://m3.material.io/components/bottom-app-bar/overview
 */
export function BottomAppBar({
  actions,
  floatingActionButton,
  children,
  className,
  ...rest
}: BottomAppBarProps) {
  const useSlots = actions != null || floatingActionButton != null;
  const rootClass = ["fynns-bottom-app-bar", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <footer {...rest} className={rootClass}>
      {useSlots ? (
        <>
          <div className="fynns-bottom-app-bar-actions">
            {actions}
          </div>
          {floatingActionButton != null ? (
            <div className="fynns-bottom-app-bar-fab">{floatingActionButton}</div>
          ) : null}
        </>
      ) : (
        children
      )}
    </footer>
  );
}
