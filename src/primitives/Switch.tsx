import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useId } from "react";

/**
 * Switch (toggle) primitive. Self-implemented `<button role="switch">` with
 * `data-state` so CSS drives the visual. Replaces the radix switch.
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
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const state = checked ? "checked" : "unchecked";

  return (
    <label className={rootClass}>
      <span id={resolvedLabelId} className="fynns-switch-label">
        {label}
      </span>
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
    </label>
  );
});
