import type { HTMLAttributes } from "react";

export type DividerOrientation = "horizontal" | "vertical";

export type DividerProps = Omit<HTMLAttributes<HTMLHRElement>, "color"> & {
  orientation?: DividerOrientation;
  /** Equal inset on both ends (M3 `inset`). */
  inset?: boolean;
  /** Inset on the leading edge (M3 `inset-start`). */
  insetStart?: boolean;
  /** Inset on the trailing edge (M3 `inset-end`). */
  insetEnd?: boolean;
};

/**
 * Thin separator line (M3 Divider). Uses `outline-subtle` + hairline thickness.
 * Horizontal fills the row; vertical stretches in a flex parent (`align-self: stretch`).
 */
export function Divider({
  orientation = "horizontal",
  inset = false,
  insetStart = false,
  insetEnd = false,
  className,
  ...rest
}: DividerProps) {
  const vertical = orientation === "vertical";
  const rootClass = [
    "fynns-divider",
    vertical ? "fynns-divider--vertical" : "",
    inset ? "fynns-divider--inset" : "",
    insetStart ? "fynns-divider--inset-start" : "",
    insetEnd ? "fynns-divider--inset-end" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <hr
      {...rest}
      className={rootClass}
      aria-orientation={vertical ? "vertical" : "horizontal"}
    />
  );
}
