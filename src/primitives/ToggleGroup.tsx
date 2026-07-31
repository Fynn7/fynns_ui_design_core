import type { KeyboardEvent, ReactElement, ReactNode } from "react";
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

type ToggleGroupSharedProps<V extends string> = {
  options: ToggleGroupOption<V>[];
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

export type ToggleGroupSingleProps<V extends string> = ToggleGroupSharedProps<V> & {
  /** Single-select (default). Omit or pass `false`. */
  multiple?: false;
  value: V;
  onChange: (value: V) => void;
};

export type ToggleGroupMultipleProps<V extends string> =
  ToggleGroupSharedProps<V> & {
    /** Multi-select: `value` / `onChange` use `V[]`; segments use `aria-pressed`. */
    multiple: true;
    value: V[];
    onChange: (value: V[]) => void;
  };

export type ToggleGroupProps<V extends string> =
  | ToggleGroupSingleProps<V>
  | ToggleGroupMultipleProps<V>;

/**
 * M3 Segmented button — outlined stadium group.
 * `.fynns-toggle-group`. Equal-width segments; pass `fullWidth` to stretch.
 * Leading check/icon fades/scales in; slot width is always reserved so equal
 * columns (and ControlStack max-content tracks) do not reflow. Unselected
 * labels stay optically centered via content translate.
 *
 * Default: single-select (`radiogroup` / `radio`, arrows select).
 * `multiple`: multi-select (`group` / `aria-pressed`, Space toggles, arrows
 * move focus only).
 * @see https://m3.material.io/components/segmented-buttons/overview
 */
export function ToggleGroup<V extends string>(
  props: ToggleGroupSingleProps<V>,
): ReactElement;
export function ToggleGroup<V extends string>(
  props: ToggleGroupMultipleProps<V>,
): ReactElement;
export function ToggleGroup<V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  fullWidth = false,
  size = "default",
  showCheck = true,
  multiple = false,
}: ToggleGroupProps<V>) {
  const baseId = useId();
  const enabled = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.disabled);
  /** Mount leading slot when checks or option icons can appear (for slide). */
  const useLeadingSlot = showCheck || options.some((o) => Boolean(o.icon));

  const isSelected = (v: V) =>
    multiple ? (value as V[]).includes(v) : (value as V) === v;

  const selectSingle = (index: number) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    (onChange as (value: V) => void)(opt.value);
  };

  const toggleMultiple = (index: number) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    const current = value as V[];
    const next = current.includes(opt.value)
      ? current.filter((v) => v !== opt.value)
      : [...current, opt.value];
    (onChange as (value: V[]) => void)(next);
  };

  const focusAt = (index: number) => {
    document.getElementById(`${baseId}-seg-${index}`)?.focus();
  };

  /** Arrow/Home/End: multi = focus only; single = select + focus. */
  const move = (fromIndex: number, delta: number) => {
    if (enabled.length === 0) return;
    const pos = enabled.findIndex(({ i }) => i === fromIndex);
    const start = pos < 0 ? 0 : pos;
    const next = enabled[(start + delta + enabled.length) % enabled.length];
    if (multiple) {
      focusAt(next.i);
    } else {
      selectSingle(next.i);
      focusAt(next.i);
    }
  };

  const jumpToEnabled = (enabledIndex: number) => {
    const target = enabled[enabledIndex];
    if (!target) return;
    if (multiple) {
      focusAt(target.i);
    } else {
      selectSingle(target.i);
      focusAt(target.i);
    }
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
      jumpToEnabled(0);
    } else if (event.key === "End") {
      event.preventDefault();
      jumpToEnabled(enabled.length - 1);
    } else if (multiple && (event.key === " " || event.key === "Spacebar")) {
      event.preventDefault();
      toggleMultiple(index);
    }
  };

  const count = options.length;

  /** Roving tabindex: selected (first match) or first enabled. */
  const focusIndex = (() => {
    if (multiple) {
      const selected = enabled.find(({ o }) => (value as V[]).includes(o.value));
      return selected?.i ?? enabled[0]?.i ?? 0;
    }
    const selected = options.findIndex((o) => o.value === (value as V));
    return selected >= 0 ? selected : (enabled[0]?.i ?? 0);
  })();

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
      role={multiple ? "group" : "radiogroup"}
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const on = isSelected(option.value);
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
            role={multiple ? undefined : "radio"}
            data-pos={pos}
            className={[
              "fynns-toggle-chip",
              on ? "fynns-toggle-chip--on" : "",
              useLeadingSlot ? "fynns-toggle-chip--with-icon" : "",
              leadingOpen ? "fynns-toggle-chip--leading-open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-checked={multiple ? undefined : on}
            aria-pressed={multiple ? on : undefined}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() =>
              multiple ? toggleMultiple(index) : selectSingle(index)
            }
            onKeyDown={(e) => onSegmentKeyDown(e, index)}
          >
            <span className="fynns-toggle-chip-content">
              {useLeadingSlot ? (
                <span className="fynns-toggle-chip-leading" aria-hidden>
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
            </span>
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
