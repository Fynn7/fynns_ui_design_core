import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useId } from "react";

/**
 * Switch (toggle) primitive. Self-implemented `<button role="switch">` with
 * `data-state` so CSS drives the visual. Replaces the radix switch.
 *
 * Visuals follow M3 Switch proportions (outlined unchecked / soft-filled
 * checked with accent thumb, fixed-size handle). No handle icon.
 *
 * Sizes: `md` (default, forms/settings) and `sm` (dense panel headers).
 */
export type SwitchSize = "md" | "sm";

export type SwitchProps = {
  /** Visible inline label; also the accessible name unless `ariaLabel` is set. */
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel?: string;
  size?: SwitchSize;
  /**
   * Where the text sits relative to the track.
   * - `start` (default): label then track — settings / form rows.
   * - `end`: track then label — dense toolbars so tracks share a left edge with
   *   sibling controls (ToggleGroup, etc.) instead of drifting with label length.
   */
  labelSide?: "start" | "end";
  className?: string;
  disabled?: boolean;
  labelId?: string;
};

export const Switch = forwardRef(function Switch(
  {
    label,
    checked,
    onCheckedChange,
    ariaLabel,
    size = "md",
    labelSide = "start",
    className,
    disabled = false,
    labelId,
  }: SwitchProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const autoId = useId();
  const resolvedLabelId = labelId ?? `${autoId}-label`;
  const rootClass = [
    "fynns-switch",
    size === "sm" ? "fynns-switch--sm" : "fynns-switch--md",
    labelSide === "end" ? "fynns-switch--label-end" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const state = checked ? "checked" : "unchecked";

  const labelEl = (
    <span id={resolvedLabelId} className="fynns-switch-label">
      {label}
    </span>
  );
  const trackEl = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : resolvedLabelId}
      disabled={disabled}
      data-state={state}
      className="fynns-switch-track"
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="fynns-switch-thumb" data-state={state} />
    </button>
  );

  return (
    <label className={rootClass}>
      {labelSide === "end" ? (
        <>
          {trackEl}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {trackEl}
        </>
      )}
    </label>
  );
});
