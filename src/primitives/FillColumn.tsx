import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type FillColumnProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Top band sized to content (`flex: 0`). Preview / Collapsible / Banner…
   */
  header?: ReactNode;
  /**
   * Bottom band sized to content (`flex: 0`). Rare — prefer `ChatComposer`
   * inside a `Chat` in `children` so the composer docks with the thread.
   */
  footer?: ReactNode;
  /**
   * Middle band that absorbs remaining height (`flex: 1; min-height: 0`).
   * Put `<Chat>` here so the thread fills and the composer docks to the
   * column bottom — or `BusyRegion` `fill` while the pane is booting —
   * or `<PageScroll>` for Card / List catalogs (never a private
   * max-width `.hub-scroll` on this slot).
   * Do not stack Preview / EmptyState / Composer as siblings.
   */
  children: ReactNode;
};

/**
 * Vertical fill host for a height-resolved parent (ClippedNavShell main /
 * DestinationAppShell canvas / fixed demo stage).
 *
 * `header` / `footer` stay content-sized; `children` eats the leftover so a
 * nested `Chat` can dock its composer at the column bottom instead of leaving
 * a dead band under content-height stacks.
 *
 * Does **not** apply aside Chat bubble geometry (`.fynns-chat-host--fill`) —
 * main-column 70% / 48rem rules stay intact. Use `chat-host--fill` / EndAside
 * for full-pane aside chat.
 */
export function FillColumn({
  header,
  footer,
  className,
  children,
  ...rest
}: FillColumnProps) {
  return (
    <div {...rest} className={join("fynns-fill-column", className)}>
      {header != null ? (
        <div className="fynns-fill-column-header fynns-scroll">{header}</div>
      ) : null}
      <div className="fynns-fill-column-main">{children}</div>
      {footer != null ? (
        <div className="fynns-fill-column-footer">{footer}</div>
      ) : null}
    </div>
  );
}
