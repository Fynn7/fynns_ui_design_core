import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  trailingIsRowAction,
  type CatalogTrailingMetaAlign,
} from "./catalogRowGeometry";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type TimelineTrailingMetaAlign = CatalogTrailingMetaAlign;

export type TimelineProps = HTMLAttributes<HTMLOListElement> & {
  /**
   * Plain `trailingSupportingText` column across sibling items. Pass
   * `"start"` for date catalogs (shared min-width column; **start**-aligned
   * ink so short and long dates share one glyph start edge — ≥ 0.5.13).
   * Live: `#timeline`.
   */
  trailingMetaAlign?: TimelineTrailingMetaAlign;
};

/**
 * Chronological timeline for experience / history catalogs.
 *
 * Vertical rail + nodes — **not** List `radius-3xl` pills, **not**
 * ChatActivity tool status, **not** Tree. Do **not** paint List start
 * ticks / inset rails to fake this. Live: sandbox `#timeline`.
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, trailingMetaAlign, ...rest }, ref) {
    return (
      <ol
        {...rest}
        ref={ref}
        data-trailing-meta-align={trailingMetaAlign || undefined}
        className={join("fynns-timeline", className)}
      />
    );
  },
);

export type TimelineItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  /** Primary label (role / title). */
  headline: ReactNode;
  /** Secondary line (organization only for role / org history rows). */
  supportingText?: ReactNode;
  /**
   * Node content (icon). Omit → default disc. Always `aria-hidden` —
   * do **not** put buttons here.
   */
  leading?: ReactNode;
  /**
   * Trailing actions (`IconButton` / cluster) or decorative chrome.
   * Action clusters stay a **sibling** of the row control.
   * **Catalog edit:** prefer Dialog foot actions over `--with-end`
   * hover IconButtons — see sandbox `#timeline`.
   */
  trailing?: ReactNode;
  /** Compact meta (dates). Prefer parent `trailingMetaAlign="start"`. */
  trailingSupportingText?: ReactNode;
  /**
   * Nested detail under this item (bullets, nested List). Renders inside
   * the same `<li>` when expanded. Prefer `detail` over JSX `children`.
   */
  detail?: ReactNode;
  /** Alias of `detail`. */
  children?: ReactNode;
  /** Controlled expand when `detail` is set. */
  expanded?: boolean;
  /** Uncontrolled initial expand when `detail` is set. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  hostClassName?: string;
  /**
   * When false, non-interactive surface. Default true when `onClick` or
   * expandable detail is set.
   */
  interactive?: boolean;
};

/**
 * One timeline entry. Expandable when `detail` / `children` is set —
 * row click toggles expand.
 *
 * **Catalog edit (recommended):** flat row `onClick` → `Dialog`; put
 * edit / delete in the Dialog foot (`ConfirmDialog` for destroy) — do
 * **not** park `--with-end` hover IconButtons on the rail. Prefer omit
 * `leading` (default disc). Two-line rows center the disc on the full
 * `.fynns-timeline-item-copy` stack (`copy-band-2` rail, ≥ 0.5.16).
 * Expandable chevron tucks into `pad-inline-start` so flat ↔ detail
 * headlines share one start (≥ 0.5.15). Live: sandbox `#timeline`.
 */
export const TimelineItem = forwardRef<
  HTMLButtonElement | HTMLDivElement,
  TimelineItemProps
>(function TimelineItem(
  {
    headline,
    supportingText,
    leading,
    trailing,
    trailingSupportingText,
    detail,
    children,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    interactive: interactiveProp,
    disabled = false,
    className,
    hostClassName,
    onClick,
    ...rest
  },
  ref,
) {
  const nested = detail ?? children;
  const expandable = nested != null && nested !== false;
  const controlled = expandedProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultExpanded);
  const open = expandable ? (controlled ? Boolean(expandedProp) : uncontrolledOpen) : false;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!expandable) return;
      if (!controlled) setUncontrolledOpen(next);
      onExpandedChange?.(next);
    },
    [controlled, expandable, onExpandedChange],
  );

  const interactive =
    interactiveProp ?? (onClick != null || expandable);
  const detailId = useId();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (expandable && !disabled) setOpen(!open);
    onClick?.(event);
  };

  const leadingNode = (
    <span className="fynns-timeline-node" aria-hidden>
      {leading != null ? (
        <span className="fynns-timeline-node-glyph">{leading}</span>
      ) : (
        <span className="fynns-timeline-node-disc" />
      )}
    </span>
  );

  const contentNode = (
    <span className="fynns-timeline-item-content">
      {expandable ? (
        <span
          className={join(
            "fynns-timeline-item-chevron",
            open && "fynns-timeline-item-chevron--open",
          )}
          aria-hidden
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
      <span className="fynns-timeline-item-copy">
        <span className="fynns-timeline-item-headline">{headline}</span>
        {supportingText != null ? (
          <span className="fynns-timeline-item-supporting">{supportingText}</span>
        ) : null}
      </span>
    </span>
  );

  const metaTrailing =
    trailingSupportingText != null ? (
      <span className="fynns-timeline-item-trailing-text">
        {trailingSupportingText}
      </span>
    ) : null;

  const actionTrailing = trailing != null && trailingIsRowAction(trailing);
  const chromeTrailing = trailing != null && !actionTrailing ? trailing : null;
  const innerTrailing =
    metaTrailing != null || chromeTrailing != null ? (
      <span className="fynns-timeline-item-trailing">
        {metaTrailing}
        {chromeTrailing}
      </span>
    ) : null;

  const endTrailing =
    actionTrailing && trailing != null ? (
      <span className="fynns-timeline-item-trailing fynns-timeline-item-trailing--end">
        {trailing}
      </span>
    ) : null;

  const itemClass = join(
    "fynns-timeline-item",
    supportingText != null && "fynns-timeline-item--2",
    interactive && "fynns-timeline-item--interactive",
    disabled && "fynns-timeline-item--disabled",
    open && "fynns-timeline-item--expanded",
    className,
  );

  const rowControl = interactive ? (
    <button
      {...rest}
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      className={itemClass}
      disabled={disabled}
      aria-expanded={expandable ? open : undefined}
      aria-controls={expandable && open ? detailId : undefined}
      onClick={handleClick}
    >
      {leadingNode}
      {contentNode}
      {innerTrailing}
    </button>
  ) : (
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
  );

  const row = (
    <>
      {rowControl}
      {endTrailing}
    </>
  );

  const liveInteractive = interactive && !disabled;
  const rowShellClass = join(
    "fynns-timeline-item-row",
    liveInteractive && "fynns-timeline-item-row--interactive",
  );

  return (
    <li
      className={join(
        "fynns-timeline-item-host",
        liveInteractive && "fynns-timeline-item-host--interactive",
        endTrailing != null && "fynns-timeline-item-host--with-end",
        expandable && "fynns-timeline-item-host--with-detail",
        open && "fynns-timeline-item-host--expanded",
        hostClassName,
      )}
    >
      {expandable ? <div className={rowShellClass}>{row}</div> : row}
      {expandable && open ? (
        <div id={detailId} className="fynns-timeline-item-detail">
          {nested}
        </div>
      ) : null}
    </li>
  );
});
