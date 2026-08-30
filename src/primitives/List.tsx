import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  trailingIsPinnedInspectorEnd,
  trailingIsRowAction,
  type CatalogTrailingMetaAlign,
} from "./catalogRowGeometry";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ListTrailingMetaAlign = CatalogTrailingMetaAlign;

export type ListProps = HTMLAttributes<HTMLUListElement> & {
  /**
   * Plain `trailingSupportingText` column across sibling rows. Pass `"start"`
   * for date / kind / timestamp catalogs: shared
   * `--fynns-list-trailing-meta-min-width` column (box **and** glyph start
   * edges align — **start-ink** ≥ **0.5.13**; not 0.4.148 end-ink that
   * staggered short dates). Ellipsizes when squeezed (≥ 0.4.145). Default
   * **omit** = content-width meta hugged to the trailing edge (short status
   * like “Current” stays next to actions — not stranded in a 17ch band).
   * Live: `#list` org+dates / run-summary
   * (`start`) vs Applications-style status+delete (default).
   */
  trailingMetaAlign?: ListTrailingMetaAlign;
};

/**
 * M3 content List — vertical index of text / images for main content,
 * search results, settings, etc. Sidebar destinations: prefer
 * `NavigationDrawer` / `NavigationRail` / `NavigationBar` (not deleted
 * `ListGroup` / `ListRow` — see `llm/BREAKING_PURGE.md`).
 *
 * **Catalog / path / link rows:** one `List` of `ListItem`s — never wrap each
 * entry in `Surface` / `Card` (fat cards). See AGENTS.md **Content density**.
 *
 * **Expandable trees:** `ListItem`s must be **direct** `ul` children. Nested
 * `List` / `.fynns-table-wrap` belong in `ListItem` `detail` (same `<li>`;
 * JSX `children` is an alias), not a wrapper `div` around the item — and
 * **never** a `Collapsible` / `Card` as a List child (`ul > div` + flex-shrink
 * crushes bordered shells to skeleton pills). Expand via the row `onClick`;
 * keep the leading chevron decorative (`aria-hidden`).
 * @see https://m3.material.io/components/lists/overview
 */
export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { className, trailingMetaAlign, ...rest },
  ref,
) {
  return (
    <ul
      {...rest}
      ref={ref}
      data-trailing-meta-align={trailingMetaAlign || undefined}
      className={join("fynns-list", className)}
    />
  );
});

export type ListItemLines = 1 | 2 | 3;

export type ListItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  /** Primary label (M3 headline / label text). */
  headline: ReactNode;
  /** Secondary body under the headline. */
  supportingText?: ReactNode;
  /** Small label above the headline (forces three-line height when present). */
  overline?: ReactNode;
  /**
   * Leading icon, avatar, or image. Always `aria-hidden` — do **not** put
   * buttons here (expand chevrons are decorative; the row `onClick` +
   * `aria-expanded` owns disclosure).
   */
  leading?: ReactNode;
  /**
   * Trailing slot: decorative chevron **or** row actions (`IconButton` /
   * `.fynns-control-cluster`). Action clusters stay a **sibling** of the row
   * control (valid HTML — never nest a button in a button). Decorative
   * chevrons / glyphs render **inside** the row so click + hover match the
   * host wash. Never park actions in `.fynns-list-item-trailing-icon` (16dp
   * crushes clusters). Prefer `ghost` **`md`** IconButtons on destination
   * catalog surfaces (same size as sibling ControlRow tool strips); dense-only
   * Card heads may use `sm` when no md strip shares the surface.
   */
  trailing?: ReactNode;
  /**
   * Compact meta at the trailing edge (duration, count, status, dates, …).
   * Optional `.fynns-control-cluster` of muted spans — not `ControlRow`.
   * Duration units are spaced (`1m 47s`, never `1m47s`) — consumer-owned
   * strings. Cross-row **column** for mixed-length dates / timestamps →
   * parent `List` `trailingMetaAlign="start"` (column ink **start**-aligned ≥
   * **0.5.13**); short status beside IconButton `--with-end` leave that prop
   * unset so meta hugs the end. **Inspector** rows (Select / labeled Button
   * trailing ≥ **0.5.56**): gap / status meta is co-located in the pinned
   * end strip (before the action cluster) so it stays glued to CTA|Select
   * when end widths vary — do not invent a second private status column.
   */
  trailingSupportingText?: ReactNode;
  /**
   * Nested catalog / table under this row. Renders **inside the same `<li>`**
   * so the parent `List` stays `ul > li`. Use a nested `List` or
   * `.fynns-table-wrap.fynns-scroll` — never wrap this `ListItem` in a `div`.
   * Prefer `detail` over JSX `children` (same slot; `detail` wins).
   */
  detail?: ReactNode;
  /** Alias of `detail` — nested tree / table in this `<li>`. */
  children?: ReactNode;
  /**
   * Extra class on the outer `<li>` (layout hooks only). Do **not** wrap
   * `ListItem` in a `div` — that breaks `ul > li` and clips the selected
   * pill. Do **not** paint start ticks, inset rails, or a second host wash
   * for builtin / readonly kind — use `leading` + `trailingSupportingText`.
   * `className` stays on the row control.
   */
  hostClassName?: string;
  /**
   * Row height band. Default inferred: overline → 3; supportingText → 2;
   * else 1 (56 / 72 / 88dp).
   */
  lines?: ListItemLines;
  /**
   * Selected / active row — `secondary-container` + `radius-3xl` (same
   * long-strip highlight as `NavigationDrawerItem` / Select / menu).
   */
  selected?: boolean;
  /**
   * When false, renders a non-interactive surface (`div`) instead of a
   * button. Default true when `onClick` is set; otherwise false.
   */
  interactive?: boolean;
};

function resolveLines(
  lines: ListItemLines | undefined,
  overline: ReactNode | undefined,
  supportingText: ReactNode | undefined,
): ListItemLines {
  if (lines != null) return lines;
  if (overline != null) return 3;
  if (supportingText != null) return 2;
  return 1;
}

/**
 * M3 ListItem — one-, two-, or three-line content row with optional
 * leading / trailing slots. Use inside `List`.
 *
 * Trailing **actions** sit **outside** the row control so `IconButton` /
 * menus stay valid HTML **and** keep ghost-md size — even when
 * `interactive={false}` (static row + end actions). Decorative chevrons
 * stay **inside** the row. The **host** paints one `radius-3xl` hover /
 * selected wash (including trailing actions via host `:hover`) so actions
 * are not a floating island. Path / link catalogs: headline + supporting
 * path + trailing ghost actions — not a padded `Surface` per row.
 * Expandable trees: `detail` stays in this `<li>`; set `aria-expanded` on
 * the row. Long `headline` / `supportingText` ellipsize (including copy
 * wrapped in `Tooltip`). Do not put `Divider` between ListItem rows —
 * sibling gap + pills separate rows.
 */
export const ListItem = forwardRef<HTMLButtonElement | HTMLDivElement, ListItemProps>(function ListItem(
  {
    headline,
    supportingText,
    overline,
    leading,
    trailing,
    trailingSupportingText,
    detail,
    children,
    lines: linesProp,
    selected = false,
    interactive: interactiveProp,
    disabled = false,
    className,
    hostClassName,
    onClick,
    ...rest
  },
  ref,
) {
  const lines = resolveLines(linesProp, overline, supportingText);
  const interactive = interactiveProp ?? onClick != null;
  const itemClass = join(
    "fynns-list-item",
    `fynns-list-item--${lines}`,
    selected && "fynns-list-item--selected",
    interactive && "fynns-list-item--interactive",
    disabled && "fynns-list-item--disabled",
    className,
  );

  const leadingNode =
    leading != null ? (
      <span className="fynns-list-item-leading" aria-hidden>
        {leading}
      </span>
    ) : null;

  const contentNode = (
    <span className="fynns-list-item-content">
      {overline != null ? (
        <span className="fynns-list-item-overline">{overline}</span>
      ) : null}
      <span className="fynns-list-item-headline">{headline}</span>
      {supportingText != null ? (
        <span className="fynns-list-item-supporting">{supportingText}</span>
      ) : null}
    </span>
  );

  const metaTrailing =
    trailingSupportingText != null ? (
      <span className="fynns-list-item-trailing-text">{trailingSupportingText}</span>
    ) : null;

  const actionTrailing = trailing != null && trailingIsRowAction(trailing);
  const pinnedInspectorEnd =
    actionTrailing && trailing != null && trailingIsPinnedInspectorEnd(trailing);
  /*
   * Pinned inspector end (Select / labeled Button): park gap meta in the end
   * strip so status|CTA|Select share one nowrap band. IconButton overlay keep
   * meta inside the row (always visible; end opacity:0 until hover).
   */
  const endMeta = pinnedInspectorEnd ? metaTrailing : null;
  const rowMeta = pinnedInspectorEnd ? null : metaTrailing;
  const chromeTrailing = trailing != null && !actionTrailing ? trailing : null;
  const innerTrailing =
    rowMeta != null || chromeTrailing != null ? (
      <span className="fynns-list-item-trailing">
        {rowMeta}
        {chromeTrailing}
      </span>
    ) : null;

  const endTrailing =
    actionTrailing && trailing != null ? (
      <span className="fynns-list-item-trailing fynns-list-item-trailing--end">
        {endMeta}
        {trailing}
      </span>
    ) : null;

  const nested = detail ?? children;
  const hasDetail = nested != null && nested !== false;
  const rowClass = itemClass;

  const rowControl = interactive ? (
    <button
      {...rest}
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      className={rowClass}
      disabled={disabled}
      aria-current={selected ? "true" : undefined}
      onClick={onClick}
    >
      {leadingNode}
      {contentNode}
      {innerTrailing}
    </button>
  ) : (
    <div
      {...(rest as HTMLAttributes<HTMLDivElement>)}
      ref={ref as Ref<HTMLDivElement>}
      className={rowClass}
      aria-disabled={disabled || undefined}
    >
      {leadingNode}
      {contentNode}
      {innerTrailing}
    </div>
  );

  const row = (
    <>
      {rowControl}
      {endTrailing}
    </>
  );

  const liveInteractive = interactive && !disabled;
  const hostStateClass = join(
    liveInteractive && "fynns-list-item-host--interactive",
    selected && "fynns-list-item-host--selected",
  );
  const rowShellClass = join(
    "fynns-list-item-row",
    liveInteractive && "fynns-list-item-row--interactive",
    selected && "fynns-list-item-row--selected",
  );

  return (
    <li
      className={join(
        "fynns-list-item-host",
        hostStateClass,
        endTrailing != null && "fynns-list-item-host--with-end",
        hasDetail && "fynns-list-item-host--with-detail",
        hostClassName,
      )}
    >
      {hasDetail ? <div className={rowShellClass}>{row}</div> : row}
      {hasDetail ? <div className="fynns-list-item-detail">{nested}</div> : null}
    </li>
  );
});
