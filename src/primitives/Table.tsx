import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { FieldHint } from "./FieldHint";
import { OverflowTip } from "./OverflowTip";

export type TableAlign = "start" | "center" | "end";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  /** Sticky `<thead>` while the table scrolls. */
  stickyHeader?: boolean;
};

/**
 * Native `<table>` with `fynns-table` chrome. Compose with `TableHead` /
 * `TableBody` / `TableRow` / `TableHeaderCell` / `TableCell` / `TableCaption`.
 *
 * Includes a `.fynns-table-wrap.fynns-scroll` host. Cells stay `nowrap` and
 * the table grows past the host when dense columns need horizontal scrolling.
 * Plain text cells cap their width and show an ellipsis with a Tooltip only
 * when clipped. Existing external `.fynns-table-wrap` hosts remain supported.
 * Overlay scrollbars map vertical wheel → `scrollLeft` when the wrap has H overflow
 * and cannot scroll further on Y (edge trap; opt out: `data-fynns-wheel-x="off"`).
 * Mid-scroll inline edges soft-mask via `data-fade-left` / `data-fade-right`
 * (≥ **0.5.296** — same family as PageScroll block fades). Live `#table`.
 */
export function Table({
  stickyHeader = false,
  className,
  ...rest
}: TableProps) {
  return (
    <div className="fynns-table-wrap fynns-scroll">
      <table
        {...rest}
        className={join(
          "fynns-table",
          stickyHeader && "fynns-table--sticky-header",
          className,
        )}
      />
    </div>
  );
}

/** Keep rich/interactive cell content intact; tip only text-only blocks. */
function tableCellText(children: ReactNode): ReactNode {
  if (typeof children === "string" || typeof children === "number") {
    return (
      <OverflowTip content={String(children)} tipClassName="fynns-table-text">
        {children}
      </OverflowTip>
    );
  }
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    const text = child.props.children;
    const isTextBlock =
      child.type === "div" ||
      child.type === "span" ||
      child.type === "p" ||
      child.type === FieldHint;
    if (!isTextBlock || (typeof text !== "string" && typeof text !== "number")) {
      return child;
    }
    return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
      children: (
        <OverflowTip content={String(text)} tipClassName="fynns-table-text">
          {text}
        </OverflowTip>
      ),
    });
  });
}

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHead({ className, ...rest }: TableHeadProps) {
  return (
    <thead {...rest} className={join("fynns-table-head", className)} />
  );
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, ...rest }: TableBodyProps) {
  return (
    <tbody {...rest} className={join("fynns-table-body", className)} />
  );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, ...rest }: TableRowProps) {
  return <tr {...rest} className={join("fynns-table-row", className)} />;
}

export type TableHeaderCellProps = Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableAlign;
};

export function TableHeaderCell({
  align = "start",
  className,
  children,
  ...rest
}: TableHeaderCellProps) {
  return (
    <th
      {...rest}
      className={join(
        "fynns-table-header-cell",
        `fynns-table-cell--align-${align}`,
        className,
      )}
    >
      {tableCellText(children)}
    </th>
  );
}

export type TableCellProps = Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  "align"
> & {
  align?: TableAlign;
};

export function TableCell({
  align = "start",
  className,
  children,
  ...rest
}: TableCellProps) {
  return (
    <td
      {...rest}
      className={join(
        "fynns-table-cell",
        `fynns-table-cell--align-${align}`,
        className,
      )}
    >
      {tableCellText(children)}
    </td>
  );
}

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return (
    <caption {...rest} className={join("fynns-table-caption", className)} />
  );
}
