import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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
  /** Leading icon, avatar, or image. */
  leading?: ReactNode;
  /**
   * Trailing slot: decorative chevron **or** row actions (`IconButton` /
   * `.fynns-control-cluster`). On **interactive** rows the slot is a **sibling**
   * of the row `<button>` (valid nesting — never put buttons inside the row
   * button). Prefer `ghost` `sm` IconButtons; open/confirm destructive work in
   * `ConfirmDialog`, not a filled danger disk in the row.
   */
  trailing?: ReactNode;
  /** Compact meta at the trailing edge (time, count, …). */
  trailingSupportingText?: ReactNode;
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
 * Interactive rows keep trailing actions **outside** the main `<button>` so
 * `IconButton` / menus are valid HTML. Path / link catalogs: headline +
 * supporting path + trailing ghost actions — not a padded `Surface` per row.
 */
export const ListItem = forwardRef<
  HTMLButtonElement | HTMLDivElement,
  ListItemProps
>(function ListItem(
  {
    headline,
    supportingText,
    overline,
    leading,
    trailing,
    trailingSupportingText,
    lines: linesProp,
    selected = false,
    interactive: interactiveProp,
    disabled = false,
    className,
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

  /** Decorative / meta trailing kept inside the row control. */
  const innerTrailing =
    metaTrailing != null || (!interactive && trailing != null) ? (
      <span className="fynns-list-item-trailing">
        {metaTrailing}
        {!interactive && trailing != null ? (
          <span className="fynns-list-item-trailing-icon" aria-hidden>
            {trailing}
          </span>
        ) : null}
      </span>
    ) : null;

  /**
   * Interactive trailing (IconButtons, menus) must sit outside the `<button>`
   * — nested buttons are invalid HTML and force fat Surface workarounds.
   */
  const endTrailing =
    interactive && trailing != null ? (
      <span className="fynns-list-item-trailing fynns-list-item-trailing--end">
        {trailing}
      </span>
    ) : null;

  if (interactive) {
    return (
      <li
        className={join(
          "fynns-list-item-host",
          endTrailing != null && "fynns-list-item-host--with-end",
        )}
      >
        <button
          {...rest}
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={itemClass}
          disabled={disabled}
          aria-current={selected ? "true" : undefined}
          onClick={onClick}
        >
          {leadingNode}
          {contentNode}
          {innerTrailing}
        </button>
        {endTrailing}
      </li>
    );
  }

  return (
    <li className="fynns-list-item-host">
      <div
        {...(rest as HTMLAttributes<HTMLDivElement>)}
        ref={ref as Ref<HTMLDivElement>}
        className={itemClass}
        aria-disabled={disabled || undefined}
      >
        {leadingNode}
        {contentNode}
        {innerTrailing}
      </div>
    </li>
  );
});
