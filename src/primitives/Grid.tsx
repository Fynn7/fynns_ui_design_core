import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

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
  /**
   * When true, every cell uses the width and height of the largest cell
   * (measured). Default keeps max-content tracks.
   */
  equalCells?: boolean;
  children?: ReactNode;
};

function isFixed(axis: GridAxis | undefined): axis is number {
  return typeof axis === "number" && Number.isFinite(axis) && axis > 0;
}

type CellSize = { w: number; h: number };

function applyNaturalTracks(
  style: CSSProperties,
  xFixed: boolean,
  yFixed: boolean,
  x: GridAxis,
  y: GridAxis,
) {
  if (xFixed && !yFixed) {
    style.gridTemplateColumns = `repeat(${x}, max-content)`;
    style.gridAutoFlow = "row";
    style.gridAutoRows = "auto";
  } else if (yFixed && !xFixed) {
    style.gridTemplateRows = `repeat(${y}, auto)`;
    style.gridAutoFlow = "column";
    style.gridAutoColumns = "max-content";
  } else if (xFixed && yFixed) {
    style.gridTemplateColumns = `repeat(${x}, max-content)`;
    style.gridTemplateRows = `repeat(${y}, auto)`;
    style.gridAutoFlow = "row";
  } else {
    style.gridTemplateColumns = "repeat(auto-fill, max-content)";
    style.gridAutoFlow = "row";
    style.gridAutoRows = "auto";
  }
}

function applyEqualTracks(
  style: CSSProperties,
  xFixed: boolean,
  yFixed: boolean,
  x: GridAxis,
  y: GridAxis,
  cell: CellSize,
) {
  Object.assign(style, {
    ["--fynns-grid-equal-w"]: `${cell.w}px`,
    ["--fynns-grid-equal-h"]: `${cell.h}px`,
  });
  const w = "var(--fynns-grid-equal-w)";
  const h = "var(--fynns-grid-equal-h)";

  if (xFixed && !yFixed) {
    style.gridTemplateColumns = `repeat(${x}, ${w})`;
    style.gridAutoFlow = "row";
    style.gridAutoRows = h;
  } else if (yFixed && !xFixed) {
    style.gridTemplateRows = `repeat(${y}, ${h})`;
    style.gridAutoFlow = "column";
    style.gridAutoColumns = w;
  } else if (xFixed && yFixed) {
    style.gridTemplateColumns = `repeat(${x}, ${w})`;
    style.gridTemplateRows = `repeat(${y}, ${h})`;
    style.gridAutoFlow = "row";
  } else {
    style.gridTemplateColumns = `repeat(auto-fill, ${w})`;
    style.gridAutoFlow = "row";
    style.gridAutoRows = h;
  }
}

/**
 * X×Y layout grid. Axes may be fixed or `"unbounded"`:
 * - `x={2} y="unbounded"` → always 2 columns; more items add rows (Y grows).
 * - `x="unbounded" y={2}` → always 2 rows; more items add columns (X grows).
 * - both fixed → explicit `repeat` tracks on each axis.
 * - both unbounded → dense auto-fill of `max-content` columns, rows grow.
 * - `equalCells` → every cell matches the largest content box (measured).
 */
export function Grid({
  x = "unbounded",
  y = "unbounded",
  gap = "sm",
  equalCells = false,
  className,
  style,
  children,
  ...rest
}: GridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState<CellSize | null>(null);
  const xFixed = isFixed(x);
  const yFixed = isFixed(y);

  useLayoutEffect(() => {
    if (!equalCells) {
      setCell(null);
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      root.dataset.equalMeasuring = "true";
      let maxW = 0;
      let maxH = 0;
      for (const node of root.children) {
        const box = (node as HTMLElement).getBoundingClientRect();
        maxW = Math.max(maxW, Math.ceil(box.width));
        maxH = Math.max(maxH, Math.ceil(box.height));
      }
      delete root.dataset.equalMeasuring;
      if (maxW <= 0 || maxH <= 0) return;
      setCell((prev) =>
        prev && prev.w === maxW && prev.h === maxH ? prev : { w: maxW, h: maxH },
      );
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(root);
    for (const node of root.children) {
      ro.observe(node);
    }
    return () => {
      ro.disconnect();
      delete root.dataset.equalMeasuring;
    };
  }, [equalCells, x, y, children]);

  const gridStyle: CSSProperties = {
    gap: `var(--fynns-space-${gap})`,
    ...style,
  };

  if (equalCells && cell) {
    applyEqualTracks(gridStyle, xFixed, yFixed, x, y, cell);
  } else {
    applyNaturalTracks(gridStyle, xFixed, yFixed, x, y);
  }

  return (
    <div
      ref={rootRef}
      className={["fynns-grid", className ?? ""].filter(Boolean).join(" ")}
      data-x={xFixed ? String(x) : "unbounded"}
      data-y={yFixed ? String(y) : "unbounded"}
      data-equal-cells={equalCells ? "true" : undefined}
      style={gridStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
