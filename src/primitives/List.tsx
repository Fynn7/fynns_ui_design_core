import {
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function elementName(type: unknown): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || "";
  }
  if (type && typeof type === "object" && "render" in type) {
    const render = (type as { render?: { displayName?: string; name?: string } }).render;
    return render?.displayName || render?.name || "";
  }
  return "";
}

/**
 * True when `trailing` must stay outside the row control (IconButton / cluster).
 * Prefer **outside** for unknown / minified composites so production builds
 * never nest `<button>` inside the interactive row (Vite name-mangling lesson).
 * Only leave clearly decorative leaves (text, svg, `*Icon`) inside.
 */
function trailingIsRowAction(node: ReactNode, depth = 0): boolean {
  if (node == null || typeof node === "boolean" || depth > 5) return false;
  if (typeof node === "string" || typeof node === "number") return false;
  if (Array.isArray(node)) return node.some((child) => trailingIsRowAction(child, depth));
  if (!isValidElement(node)) return false;

  if (node.type === "button" || node.type === "a") return true;
  if (typeof node.type === "string") {
    if (node.type === "svg" || node.type === "path" || node.type === "span") {
      return trailingIsRowAction(
        (node.props as { children?: ReactNode }).children,
        depth + 1,
      );
    }
    return true;
  }

  const name = elementName(node.type);
  const className = (node.props as { className?: unknown }).className;
  if (
    typeof className === "string" &&
    /fynns-btn|fynns-control-cluster/.test(className)
  ) {
    return true;
  }
  if (/IconButton|Button|SplitButton|DropdownMenu|Tooltip/.test(name)) {
    return true;
  }
  // Named decorative glyphs (ChevronRightIcon, …) stay inside the row.
  if (/Icon$/.test(name)) return false;
  // Fragment / anonymous wrappers: inspect children; empty → treat as action.
  const children = (node.props as { children?: ReactNode }).children;
  if (children != null && (name === "" || /Fragment/.test(name))) {
    return trailingIsRowAction(children, depth + 1);
  }
  // Unknown or minified component names → outside (safe nesting).
  return true;
}

export type ListProps = HTMLAttributes<HTMLUListElement>;

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
  { className, ...rest },
  ref,
) {
  return <ul {...rest} ref={ref} className={join("fynns-list", className)} />;
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
   * crushes clusters). Prefer `ghost` `sm` IconButtons; destructive work in
   * `ConfirmDialog`, not a filled danger disk in the row.
   */
  trailing?: ReactNode;
  /**
   * Compact meta at the trailing edge (duration, count, …). Optional
   * `.fynns-control-cluster` of muted spans — not `ControlRow`. Duration
   * units are spaced (`1m 47s`, never `1m47s`) — consumer-owned strings.
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
 * menus stay valid HTML **and** keep ghost-sm size — even when
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
  const chromeTrailing = trailing != null && !actionTrailing ? trailing : null;
  const innerTrailing =
    metaTrailing != null || chromeTrailing != null ? (
      <span className="fynns-list-item-trailing">
        {metaTrailing}
        {chromeTrailing}
      </span>
    ) : null;

  const endTrailing =
    actionTrailing && trailing != null ? (
      <span className="fynns-list-item-trailing fynns-list-item-trailing--end">
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
