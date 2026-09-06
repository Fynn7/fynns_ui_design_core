import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type ControlStackGap =
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export type ControlStackControlsAlign = "end" | "start";

export type ControlStackProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Number of shared control columns after the label column (X).
   * Nested `ControlRow`s use CSS subgrid so every row shares these tracks
   * while each row still occupies its own stack line (a short Anatomy row
   * cannot steal the next label into an empty control column).
   * @default 2
   */
  columns?: number;
  /**
   * Form-host (Card / Dialog / padded Surface) packing of control cells.
   * - `end` (default when omitted) — preference / Switch / action rows: shared
   *   track + `.fynns-control-cluster` hug the **trailing** edge (AGENTS
   *   form-host end-hug; cluster default flex-end ≥ **0.5.158**).
   * - `start` — probe / path / outcome meta: cells share a **start** edge so
   *   sibling rows read as a value grid (≥ **0.5.154**). Pair with `columns`
   *   equal to the cell count; do **not** wrap unequal cells in one
   *   `.fynns-control-cluster` when you need cross-row column alignment.
   *   Start packing is **opt-in only** — never the default for Buttons /
   *   action clusters.
   */
  controlsAlign?: ControlStackControlsAlign;
  /**
   * Gap between rows (and columns when applicable).
   * Omit to use the semantic toolbar rhythm token
   * `--fynns-layout-control-stack-gap`. Pass a t-shirt key only for a
   * deliberate density override.
   */
  gap?: ControlStackGap;
  children?: ReactNode;
};

/**
 * Shared X-column toolbar / labeled ControlStack.
 *
 * Parent defines `label | control₁ | … | controlₙ` tracks once; nested
 * `ControlRow`s span those tracks via subgrid (controls / `Grid` flatten with
 * `display: contents`) so column edges stay aligned across rows.
 *
 * Default row rhythm: `--fynns-layout-control-stack-gap` (see AGENTS.md).
 */
export function ControlStack({
  columns = 2,
  controlsAlign,
  gap,
  className,
  style,
  children,
  ...rest
}: ControlStackProps) {
  const cols = Number.isFinite(columns) && columns > 0 ? Math.floor(columns) : 2;
  const stackStyle = {
    ...style,
    ...(gap != null ? { gap: `var(--fynns-space-${gap})` } : null),
    ["--fynns-control-stack-cols" as string]: String(cols),
  } as CSSProperties;

  return (
    <div
      className={[
        "fynns-control-stack",
        controlsAlign === "start" ? "fynns-control-stack--controls-start" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-columns={cols}
      {...(controlsAlign ? { "data-controls-align": controlsAlign } : null)}
      style={stackStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
