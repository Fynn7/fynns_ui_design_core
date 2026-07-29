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
 * search results, settings, etc. Prefer `ListGroup` / `ListRow` for
 * sidebar master/detail chrome.
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
  /** Trailing icon or control (decorative when non-interactive). */
  trailing?: ReactNode;
  /** Compact meta at the trailing edge (time, count, …). */
  trailingSupportingText?: ReactNode;
  /**
   * Row height band. Default inferred: overline → 3; supportingText → 2;
   * else 1 (56 / 72 / 88dp).
   */
  lines?: ListItemLines;
  /** Selected / active row (tonal container). */
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
 * leading / trailing slots. Use inside `List`. Not a sidebar `ListRow`.
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

  const body = (
    <>
      {leading != null ? (
        <span className="fynns-list-item-leading" aria-hidden>
          {leading}
        </span>
      ) : null}
      <span className="fynns-list-item-content">
        {overline != null ? (
          <span className="fynns-list-item-overline">{overline}</span>
        ) : null}
        <span className="fynns-list-item-headline">{headline}</span>
        {supportingText != null ? (
          <span className="fynns-list-item-supporting">{supportingText}</span>
        ) : null}
      </span>
      {trailingSupportingText != null || trailing != null ? (
        <span className="fynns-list-item-trailing">
          {trailingSupportingText != null ? (
            <span className="fynns-list-item-trailing-text">
              {trailingSupportingText}
            </span>
          ) : null}
          {trailing != null ? (
            <span className="fynns-list-item-trailing-icon" aria-hidden>
              {trailing}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  return (
    <li className="fynns-list-item-host">
      {interactive ? (
        <button
          {...rest}
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={itemClass}
          disabled={disabled}
          aria-current={selected ? "true" : undefined}
          onClick={onClick}
        >
          {body}
        </button>
      ) : (
        <div
          {...(rest as HTMLAttributes<HTMLDivElement>)}
          ref={ref as Ref<HTMLDivElement>}
          className={itemClass}
          aria-disabled={disabled || undefined}
        >
          {body}
        </div>
      )}
    </li>
  );
});
