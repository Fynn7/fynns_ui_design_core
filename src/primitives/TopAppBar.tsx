import type { HTMLAttributes, ReactNode } from "react";

export type TopAppBarSize = "sm" | "md" | "lg";

export type TopAppBarProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Page / section title (M3 headline). */
  title?: ReactNode;
  /** Leading control — typically an `IconButton` (back / menu). */
  leading?: ReactNode;
  /** Trailing actions — typically one or more `IconButton`s. */
  trailing?: ReactNode;
  /**
   * Size: `sm` 40dp (inline title), `md` 80dp / `lg` 104dp (title below the
   * action row). Default `sm`. Denser than stock M3 for tool chrome.
   */
  size?: TopAppBarSize;
  /**
   * M3 on-scroll container: slightly elevated surface. Caller owns scroll
   * detection (e.g. `scrollTop > 0`).
   */
  scrolled?: boolean;
};

/**
 * Top app bar — page header with optional leading / trailing actions.
 * Dense heights (sm/row = `--fynns-layout-bar-height` 56dp; md 80 / lg 104).
 * Sticky positioning is left to the caller.
 * M3-informed layout, denser heights/type for desktop tool chrome.
 * Prefer `NavigationDrawer` / `NavigationRail` for destination chrome.
 * @see https://m3.material.io/components/top-app-bar/overview
 */
export function TopAppBar({
  title,
  leading,
  trailing,
  size = "sm",
  scrolled = false,
  className,
  ...rest
}: TopAppBarProps) {
  const stacked = size === "md" || size === "lg";
  const rootClass = [
    "fynns-top-app-bar",
    `fynns-top-app-bar--${size}`,
    scrolled ? "fynns-top-app-bar--scrolled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header {...rest} className={rootClass}>
      <div className="fynns-top-app-bar-row">
        {leading != null ? (
          <div className="fynns-top-app-bar-leading">{leading}</div>
        ) : null}
        {!stacked && title != null ? (
          <h1 className="fynns-top-app-bar-title">{title}</h1>
        ) : null}
        {stacked ? (
          <div className="fynns-top-app-bar-spacer" aria-hidden />
        ) : null}
        {trailing != null ? (
          <div className="fynns-top-app-bar-trailing">{trailing}</div>
        ) : null}
      </div>
      {stacked && title != null ? (
        <h1 className="fynns-top-app-bar-title">{title}</h1>
      ) : null}
    </header>
  );
}
