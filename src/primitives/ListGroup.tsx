import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { ChevronRightIcon } from "./icons";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ListGroupProps = HTMLAttributes<HTMLDivElement>;

/** Vertical stack for a sidebar list group and its child rows. */
export function ListGroup({ className, ...rest }: ListGroupProps) {
  return <div className={join("fynns-list-group", className)} {...rest} />;
}

export type ListGroupHeadProps = HTMLAttributes<HTMLDivElement> & {
  /** Wider gap between checkbox, chevron, and title (bulk-select rows). */
  spaced?: boolean;
};

/** One-line header row: optional checkbox, disclosure control, title, actions. */
export function ListGroupHead({ className, spaced = false, ...rest }: ListGroupHeadProps) {
  return (
    <div
      className={join("fynns-list-group-head", spaced && "fynns-list-group-head--spaced", className)}
      {...rest}
    />
  );
}

export type ListGroupTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  expanded?: boolean;
  /** When false, render title-only trigger (external `ListDisclosureToggle`). */
  showChevron?: boolean;
  active?: boolean;
  grow?: boolean;
};

/**
 * Full-width sidebar group title button with optional chevron, hover, and
 * selected styling. Use for project/chat/workflow group headers.
 */
export const ListGroupTrigger = forwardRef<HTMLButtonElement, ListGroupTriggerProps>(
  function ListGroupTrigger(
    { expanded = false, showChevron = true, active = false, grow = false, className, children, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={join(
          "fynns-list-group-trigger",
          active && "fynns-list-group-trigger--active",
          grow && "fynns-list-group-trigger--grow",
          className,
        )}
        aria-expanded={rest["aria-expanded"] ?? expanded}
      >
        {showChevron ? (
          <ChevronRightIcon
            size={14}
            className={join("fynns-list-disclosure-chevron", expanded && "fynns-list-disclosure-chevron--open")}
          />
        ) : null}
        {children}
      </button>
    );
  },
);

export type ListDisclosureToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  expanded?: boolean;
  /** Accessible name for the icon-only control. */
  label: string;
};

/** Compact chevron-only expand/collapse control for tree rows or split headers. */
export const ListDisclosureToggle = forwardRef<HTMLButtonElement, ListDisclosureToggleProps>(
  function ListDisclosureToggle(
    { expanded = false, label, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={join("fynns-list-disclosure-toggle", className)}
        aria-expanded={rest["aria-expanded"] ?? expanded}
        aria-label={label}
      >
        <ChevronRightIcon
          size={14}
          className={join("fynns-list-disclosure-chevron", expanded && "fynns-list-disclosure-chevron--open")}
        />
      </button>
    );
  },
);

/** Placeholder matching `ListDisclosureToggle` width when a row has no children. */
export function ListDisclosureToggleSpacer({ className }: { className?: string }) {
  return <span className={join("fynns-list-disclosure-toggle", "fynns-list-disclosure-toggle--spacer", className)} aria-hidden />;
}

export type ListTreeProps = HTMLAttributes<HTMLDivElement>;

/** Wrapper for one tree node (parent row + optional nested branch). */
export function ListTree({ className, ...rest }: ListTreeProps) {
  return <div className={join("fynns-list-tree", className)} {...rest} />;
}

export type ListTreeRowProps = HTMLAttributes<HTMLDivElement>;

/** Horizontal row: disclosure toggle + primary list content. */
export function ListTreeRow({ className, ...rest }: ListTreeRowProps) {
  return <div className={join("fynns-list-tree-row", className)} {...rest} />;
}

export type ListTreeBranchProps = HTMLAttributes<HTMLDivElement>;

/** Indented nested items under a tree parent. */
export function ListTreeBranch({ className, ...rest }: ListTreeBranchProps) {
  return <div className={join("fynns-list-tree-branch", className)} {...rest} />;
}

export type ListTreeSlotProps = HTMLAttributes<HTMLDivElement>;

/** Flex slot for the primary row content beside a disclosure toggle. */
export function ListTreeSlot({ className, ...rest }: ListTreeSlotProps) {
  return <div className={join("fynns-list-tree-slot", className)} {...rest} />;
}

export type ListRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  layout?: "stack" | "row";
  anchor?: boolean;
};

/** Selectable sidebar list row (master/detail lists). */
export const ListRow = forwardRef<HTMLButtonElement, ListRowProps>(function ListRow(
  { active = false, layout = "stack", anchor = false, className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={join(
        "fynns-list-row",
        active && "fynns-list-row--active",
        layout === "row" && "fynns-list-row--row",
        anchor && "fynns-list-row--anchor",
        className,
      )}
    />
  );
});

export type ListRowSelectableProps = HTMLAttributes<HTMLDivElement> & {
  checked?: boolean;
};

/** Bulk-select row shell: checkbox + interactive body. */
export function ListRowSelectable({ checked = false, className, ...rest }: ListRowSelectableProps) {
  return (
    <div
      className={join("fynns-list-row", "fynns-list-row--selectable", checked && "fynns-list-row--checked", className)}
      {...rest}
    />
  );
}

export type ListRowBodyProps = HTMLAttributes<HTMLDivElement>;

export function ListRowBody({ className, ...rest }: ListRowBodyProps) {
  return <div className={join("fynns-list-row-body", className)} {...rest} />;
}

export function ListRowTitle({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("fynns-list-row-title", className)} {...rest} />;
}

export function ListRowBadges({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("fynns-list-row-badges", className)} {...rest} />;
}

export function ListRowMain({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("fynns-list-row-main", className)} {...rest} />;
}

export function ListRowName({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={join("fynns-list-row-name", className)} {...rest} />;
}

export function ListRowSub({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("fynns-list-row-sub", className)} {...rest} />;
}
