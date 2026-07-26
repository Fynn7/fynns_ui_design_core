import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type ControlStackProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Number of shared control columns after the label column (X).
   * Nested `ControlRow`s use CSS subgrid so every row shares these tracks
   * while each row still occupies its own stack line (a short Anatomy row
   * cannot steal the next label into an empty control column).
   * @default 2
   */
  columns?: number;
  /** Gap between rows and columns — `--fynns-space-*`. @default "sm" */
  gap?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children?: ReactNode;
};

/**
 * Shared X-column toolbar / settings stack.
 *
 * Parent defines `label | control₁ | … | controlₙ` tracks once; nested
 * `ControlRow`s span those tracks via subgrid (controls / `Grid` flatten with
 * `display: contents`) so column edges stay aligned across rows.
 */
export function ControlStack({
  columns = 2,
  gap = "sm",
  className,
  style,
  children,
  ...rest
}: ControlStackProps) {
  const cols = Number.isFinite(columns) && columns > 0 ? Math.floor(columns) : 2;
  const stackStyle = {
    ...style,
    gap: `var(--fynns-space-${gap})`,
    ["--fynns-control-stack-cols" as string]: String(cols),
  } as CSSProperties;

  return (
    <div
      className={["fynns-control-stack", className ?? ""].filter(Boolean).join(" ")}
      data-columns={cols}
      style={stackStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
