import type { HTMLAttributes, ReactNode } from "react";
import { OverflowTip, overflowTipText } from "./OverflowTip";

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
 * strip — clusters **default end-pack** (≥ **0.5.158**); start only when the
 * product explicitly opts in (`controlsAlign="start"` / `--start-align`).
 * Preference how-to → trailing `InfoHint` on `label` (core styles
 * `:has(.fynns-info-hint-trigger)`); keep `__controls` to the Switch /
 * actions only — do not wrap tip+Switch in a wrapping cluster (≥ **0.5.292**).
 * String `label` uses `OverflowTip` when clipped (≥ **0.5.241**).
 */
export function ControlRow({ label, children, className, ...rest }: ControlRowProps) {
  const labelTip = overflowTipText(label);
  return (
    <div
      className={["fynns-control-row", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className="fynns-control-row__label">
        {labelTip != null ? (
          <OverflowTip content={labelTip} className="fynns-control-row__label-text">
            {label}
          </OverflowTip>
        ) : (
          label
        )}
      </div>
      <div className="fynns-control-row__controls">{children}</div>
    </div>
  );
}
