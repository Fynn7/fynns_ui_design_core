import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

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
 */
export function Table({
  stickyHeader = false,
  className,
  ...rest
}: TableProps) {
  return (
    <table
      {...rest}
      className={join(
        "fynns-table",
        stickyHeader && "fynns-table--sticky-header",
        className,
      )}
    />
  );
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
    />
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
    />
  );
}

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return (
    <caption {...rest} className={join("fynns-table-caption", className)} />
  );
}
