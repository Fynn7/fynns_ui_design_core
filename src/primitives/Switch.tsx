import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useId } from "react";

/**
 * Switch (toggle) primitive. Self-implemented `<button role="switch">` with
 * `data-state` so CSS drives the visual. Replaces the radix switch.
 *
 * Single dense size only (former `sm`: ~39×24dp track). The large M3 md
 * variant (52×32) was removed — do not reintroduce a `size` prop.
 *
 * Visuals: outlined unchecked / soft-filled checked with accent thumb;
 * handle morphs. No handle icon.
 */
export type SwitchProps = {
  /** Visible inline label; also the accessible name unless `ariaLabel` is set. */
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel?: string;
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
