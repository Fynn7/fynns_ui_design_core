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
 * Inside `ControlStack`, uses a fixed label column
 * (`--fynns-layout-control-row-label`) via subgrid so sibling rows share one
 * control edge. **Standalone** (catalog “Name (n/m)” chrome, etc.) fills the
 * host: label `1fr`, controls `max-content` end-hug — same as form-host
 * Card / Dialog rows. Prefer one `.fynns-control-cluster` for the action
 * strip.
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
