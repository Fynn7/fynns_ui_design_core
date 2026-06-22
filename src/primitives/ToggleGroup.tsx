import type { ReactNode } from "react";

export type ToggleGroupOption<V extends string> = {
  value: V;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
};

export type ToggleGroupProps<V extends string> = {
  options: ToggleGroupOption<V>[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel?: string;
  className?: string;
  /**
   * Force the group to span its container's full width. Segments are always
   * equal-width when the group is stretched; this just opts in to stretching
   * even when the parent would otherwise leave the group at content width.
   */
  fullWidth?: boolean;
};

/**
 * Segmented control: a row of mutually-exclusive chips. `.fynns-toggle-group`.
 * Chips are equal-width segments that fill the group when it is stretched (a
 * flex/grid child or `fullWidth`), and stay content-width when it is inline.
 */
export function ToggleGroup<V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  fullWidth = false,
}: ToggleGroupProps<V>) {
  return (
    <div
      className={[
        "fynns-toggle-group",
        fullWidth ? "fynns-toggle-group--full" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={["fynns-toggle-chip", on ? "fynns-toggle-chip--on" : ""]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={on}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
