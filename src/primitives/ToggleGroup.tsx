import type { KeyboardEvent, ReactNode } from "react";
import { Fragment, useId } from "react";
import { CheckIcon } from "./icons";
import { Tooltip } from "./Tooltip.tsx";

export type ToggleGroupOption<V extends string> = {
  value: V;
  label: ReactNode;
  ariaLabel?: string;
  /** Hover/focus tooltip for this segment. */
  tip?: string;
  disabled?: boolean;
  /**
   * Optional leading glyph when unselected. When selected, M3 replaces it
   * with the checkmark (unless `showCheck` is false).
   */
  icon?: ReactNode;
};

export type ToggleGroupProps<V extends string> = {
  options: ToggleGroupOption<V>[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel?: string;
  className?: string;
  /**
   * Force the group to span its container's full width (M3 justified).
   * Segments stay equal-width either way; this stretches the group itself.
   */
  fullWidth?: boolean;
  /** Tighter height/padding for narrow panels. */
  size?: "default" | "compact";
  /**
   * Show the M3 selected checkmark (leading). Default true. When an option
   * provides `icon`, the check replaces that icon while selected.
   */
  showCheck?: boolean;
};

/**
 * M3 Segmented button — single-select outlined stadium group.
 * `.fynns-toggle-group`. Equal-width segments (longest label wins); pass
 * `fullWidth` to stretch (justified). Uses `radiogroup` / `radio` semantics.
 * @see https://m3.material.io/components/segmented-buttons/overview
 */
export function ToggleGroup<V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  fullWidth = false,
  size = "default",
  showCheck = true,
}: ToggleGroupProps<V>) {
  const baseId = useId();
  const enabled = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.disabled);

  const selectAt = (index: number) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
  };

  const move = (fromIndex: number, delta: number) => {
    if (enabled.length === 0) return;
    const pos = enabled.findIndex(({ i }) => i === fromIndex);
    const start = pos < 0 ? 0 : pos;
    const next = enabled[(start + delta + enabled.length) % enabled.length];
    selectAt(next.i);
    const el = document.getElementById(`${baseId}-seg-${next.i}`);
    el?.focus();
  };

  const onSegmentKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(index, -1);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (enabled[0]) selectAt(enabled[0].i);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = enabled[enabled.length - 1];
      if (last) selectAt(last.i);
    }
  };

  const count = options.length;

  return (
    <div
      className={[
        "fynns-toggle-group",
        fullWidth ? "fynns-toggle-group--full" : "",
        size === "compact" ? "fynns-toggle-group--compact" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const on = option.value === value;
        const pos =
          count === 1
            ? "only"
            : index === 0
              ? "start"
              : index === count - 1
                ? "end"
                : "middle";
        const showLeadingCheck = showCheck && on;
        const showOptionIcon = Boolean(option.icon) && !showLeadingCheck;

        const chip = (
          <button
            id={`${baseId}-seg-${index}`}
            type="button"
            role="radio"
            data-pos={pos}
            className={[
              "fynns-toggle-chip",
              on ? "fynns-toggle-chip--on" : "",
              showLeadingCheck || showOptionIcon
                ? "fynns-toggle-chip--with-icon"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-checked={on}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onSegmentKeyDown(e, index)}
          >
            {showLeadingCheck ? (
              <CheckIcon
                className="fynns-toggle-chip-check"
                size={18}
                aria-hidden
              />
            ) : null}
            {showOptionIcon ? (
              <span className="fynns-toggle-chip-icon" aria-hidden>
                {option.icon}
              </span>
            ) : null}
            <span className="fynns-toggle-chip-label">{option.label}</span>
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
