import type { ReactNode } from "react";
import { Fragment } from "react";
import { Tooltip } from "./Tooltip.tsx";

export type ToggleGroupOption<V extends string> = {
  value: V;
  label: ReactNode;
  ariaLabel?: string;
  /** Hover/focus tooltip for this segment. */
  tip?: string;
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
  /** Tighter padding and font size for narrow containers. */
  size?: "default" | "compact";
  /**
   * `equal` (default): segments share width evenly when stretched.
   * `content`: each segment sizes to its label.
   */
  segmentLayout?: "equal" | "content";
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
  size = "default",
  segmentLayout = "equal",
}: ToggleGroupProps<V>) {
  return (
    <div
      className={[
        "fynns-toggle-group",
        fullWidth ? "fynns-toggle-group--full" : "",
        size === "compact" ? "fynns-toggle-group--compact" : "",
        segmentLayout === "content" ? "fynns-toggle-group--content" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const on = option.value === value;
        const chip = (
          <button
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

        if (!option.tip) {
          return <Fragment key={option.value}>{chip}</Fragment>;
        }

        return (
          <Tooltip
            key={option.value}
            content={option.tip}
            className="fynns-toggle-group__segment"
          >
            {chip}
          </Tooltip>
        );
      })}
    </div>
  );
}
