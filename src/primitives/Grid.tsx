import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/** Fixed track count, or grow with items along that axis. */
export type GridAxis = number | "unbounded";

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * Column count (X). A number locks the column count; `"unbounded"` lets
   * columns grow as items are added (with a fixed `y`, uses column auto-flow).
   * @default "unbounded"
   */
  x?: GridAxis;
  /**
   * Row count (Y). A number locks the row count; `"unbounded"` lets rows grow
   * as items are added (with a fixed `x`, uses row auto-flow).
   * @default "unbounded"
   */
  y?: GridAxis;
  /** Gap between cells — maps to `--fynns-space-*` when a t-shirt key is passed. */
  gap?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children?: ReactNode;
};

function isFixed(axis: GridAxis | undefined): axis is number {
  return typeof axis === "number" && Number.isFinite(axis) && axis > 0;
}

/**
 * X×Y layout grid. Axes may be fixed or `"unbounded"`:
 * - `x={2} y="unbounded"` → always 2 columns; more items add rows (Y grows).
 * - `x="unbounded" y={2}` → always 2 rows; more items add columns (X grows).
 * - both fixed → explicit `repeat` tracks on each axis.
 * - both unbounded → dense auto-fill of `max-content` columns, rows grow.
 */
export function Grid({
  x = "unbounded",
  y = "unbounded",
  gap = "sm",
  className,
  style,
  children,
  ...rest
}: GridProps) {
  const xFixed = isFixed(x);
  const yFixed = isFixed(y);

  const gridStyle: CSSProperties = {
    gap: `var(--fynns-space-${gap})`,
    ...style,
  };

  if (xFixed && !yFixed) {
    // 2 × Y(unbounded): lock columns, rows grow with items.
    // max-content tracks — never shrink labels into overflow/ellipsis.
    gridStyle.gridTemplateColumns = `repeat(${x}, max-content)`;
    gridStyle.gridAutoFlow = "row";
    gridStyle.gridAutoRows = "auto";
  } else if (yFixed && !xFixed) {
    // X(unbounded) × 2: lock rows, columns grow with items.
    gridStyle.gridTemplateRows = `repeat(${y}, auto)`;
    gridStyle.gridAutoFlow = "column";
    gridStyle.gridAutoColumns = "max-content";
  } else if (xFixed && yFixed) {
    gridStyle.gridTemplateColumns = `repeat(${x}, max-content)`;
    gridStyle.gridTemplateRows = `repeat(${y}, auto)`;
    gridStyle.gridAutoFlow = "row";
  } else {
    // Both unbounded: pack as many max-content columns as fit, then wrap.
    gridStyle.gridTemplateColumns = "repeat(auto-fill, max-content)";
    gridStyle.gridAutoFlow = "row";
  }

  return (
    <div
      className={["fynns-grid", className ?? ""].filter(Boolean).join(" ")}
      data-x={xFixed ? String(x) : "unbounded"}
      data-y={yFixed ? String(y) : "unbounded"}
      style={gridStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
