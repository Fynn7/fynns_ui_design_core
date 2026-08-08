import type { HTMLAttributes, ReactNode } from "react";

export type ControlRowProps = HTMLAttributes<HTMLDivElement> & {
  /** Row caption (short section / field name — preserve caller casing). */
  label: ReactNode;
  /** Controls that share one aligned column (Switch, ToggleGroup, …). */
  children: ReactNode;
};

/**
 * Labeled control row for toolbars / labeled strips.
 *
 * Uses a fixed label column (`--fynns-layout-control-row-label`) so every row's
 * controls share the same left edge — avoids the recurring consumer patch of
 * ad-hoc `flex-basis` labels that still expand with content (`min-width: auto`).
 */
export function ControlRow({ label, children, className, ...rest }: ControlRowProps) {
  return (
    <div
      className={["fynns-control-row", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="fynns-control-row__label">{label}</div>
      <div className="fynns-control-row__controls">{children}</div>
    </div>
  );
}
