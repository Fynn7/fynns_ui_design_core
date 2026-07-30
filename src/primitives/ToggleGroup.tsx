import type { KeyboardEvent, ReactNode } from "react";
import { useId } from "react";
import { CheckIcon } from "./icons";
import { Tooltip } from "./Tooltip";

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
 * `.fynns-toggle-group`. Equal-width segments; pass `fullWidth` to stretch.
 * Leading check/icon slides open/closed (width + opacity) so labels stay
 * optically centered when unselected. Uses `radiogroup` / `radio` semantics.
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
  /** Mount leading slot when checks or option icons can appear (for slide). */
  const useLeadingSlot = showCheck || options.some((o) => Boolean(o.icon));

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
      if (enabled[0]) {
        selectAt(enabled[0].i);
        document.getElementById(`${baseId}-seg-${enabled[0].i}`)?.focus();
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const last = enabled[enabled.length - 1];
      if (last) {
        selectAt(last.i);
        document.getElementById(`${baseId}-seg-${last.i}`)?.focus();
      }
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
        const showOptionIcon = Boolean(option.icon) && !(showCheck && on);
        const leadingOpen = showLeadingCheck || showOptionIcon;

        const chip = (
          <button
            id={`${baseId}-seg-${index}`}
            type="button"
            role="radio"
            data-pos={pos}
            className={[
              "fynns-toggle-chip",
              on ? "fynns-toggle-chip--on" : "",
              useLeadingSlot ? "fynns-toggle-chip--with-icon" : "",
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
            {useLeadingSlot ? (
              <span
                className={[
                  "fynns-toggle-chip-leading",
                  leadingOpen ? "fynns-toggle-chip-leading--open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              >
                {showCheck ? (
                  <CheckIcon
                    className={[
                      "fynns-toggle-chip-check",
                      showLeadingCheck ? "fynns-toggle-chip-check--on" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    size={18}
                    aria-hidden
                  />
                ) : null}
                {option.icon ? (
                  <span
                    className={[
                      "fynns-toggle-chip-icon",
                      showOptionIcon ? "fynns-toggle-chip-icon--on" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {option.icon}
                  </span>
                ) : null}
              </span>
            ) : null}
            <span className="fynns-toggle-chip-label">{option.label}</span>
          </button>
        );

        if (!option.tip) {
          return (
            <div key={option.value} className="fynns-toggle-group__segment">
              {chip}
            </div>
          );
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
