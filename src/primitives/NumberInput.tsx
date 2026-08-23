import type {
  ChangeEvent,
  FocusEvent,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { forwardRef, useEffect, useId, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

export type NumberInputSize = "sm" | "md";
export type NumberInputVariant = "filled" | "outlined";

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "defaultValue" | "onChange"
> & {
  /** Controlled numeric value. */
  value: number;
  onChange: (value: number) => void;
  /** Lower clamp (inclusive). */
  min?: number;
  /** Upper clamp (inclusive). */
  max?: number;
  /** Step for steppers / ArrowUp / ArrowDown. @default 1 */
  step?: number;
  /** Marks the field invalid and sets `aria-invalid`. */
  invalid?: boolean;
  size?: NumberInputSize;
  /** @default "outlined" */
  variant?: NumberInputVariant;
  /** Muted helper under the control (ignored when `errorText` is set). */
  supportingText?: ReactNode;
  /** Danger helper under the control; implies invalid styling. */
  errorText?: ReactNode;
  /** Accessible name when no visible label wraps the control. */
  "aria-label"?: string;
  /** Increment button accessible name. @default "Increment" */
  incrementLabel?: string;
  /** Decrement button accessible name. @default "Decrement" */
  decrementLabel?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function clamp(n: number, min?: number, max?: number): number {
  let next = n;
  if (min != null && Number.isFinite(min)) next = Math.max(min, next);
  if (max != null && Number.isFinite(max)) next = Math.min(max, next);
  return next;
}

function parseDraft(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function formatValue(n: number): string {
  return String(n);
}

/**
 * Numeric field with trailing up/down steppers (`role="spinbutton"`).
 * Discrete steps for inspectors / forms — not a Slider substitute, not a
 * RangeSlider. ArrowUp / ArrowDown / Home / End match native spinbutton.
 */
export const NumberInput = forwardRef(function NumberInput(
  {
    className,
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    readOnly = false,
    invalid = false,
    size = "md",
    variant = "outlined",
    supportingText,
    errorText,
    id,
    incrementLabel = "Increment",
    decrementLabel = "Decrement",
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    onBlur,
    onFocus,
    ...rest
  }: NumberInputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;
  const stepAbs = Math.abs(step) || 1;
  const locked = disabled || readOnly;

  const [draft, setDraft] = useState(() => formatValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(formatValue(value));
  }, [value, focused]);

  const commit = (next: number) => {
    const clamped = clamp(next, min, max);
    if (clamped !== value) onChange(clamped);
    setDraft(formatValue(clamped));
  };

  const nudge = (dir: 1 | -1) => {
    if (locked) return;
    commit(value + dir * stepAbs);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const raw = event.target.value;
    if (raw !== "" && !/^-?\d*\.?\d*$/u.test(raw)) return;
    // Keep draft free while typing; clamp + commit on blur / steppers.
    setDraft(raw);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (!locked) {
      const parsed = parseDraft(draft);
      commit(parsed == null ? value : parsed);
    } else {
      setDraft(formatValue(value));
    }
    onBlur?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      nudge(1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      nudge(-1);
      return;
    }
    if (event.key === "Home" && min != null && Number.isFinite(min)) {
      event.preventDefault();
      commit(min);
      return;
    }
    if (event.key === "End" && max != null && Number.isFinite(max)) {
      event.preventDefault();
      commit(max);
    }
  };

  const atMin = min != null && Number.isFinite(min) && value <= min;
  const atMax = max != null && Number.isFinite(max) && value >= max;

  return (
    <div className={join("fynns-field", isInvalid && "fynns-field--invalid", className)}>
      <div
        className={join(
          "fynns-field-shell",
          "fynns-number-input-shell",
          size === "sm" && "fynns-field-shell--sm",
          variant === "filled" && "fynns-field-shell--filled",
          isInvalid && "fynns-field-shell--invalid",
        )}
      >
        <input
          {...rest}
          id={inputId}
          ref={ref}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-label={ariaLabel}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hint ? join(ariaDescribedBy, hintId) : ariaDescribedBy}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          disabled={disabled}
          readOnly={readOnly}
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={join(
            "fynns-input",
            "fynns-number-input",
            size === "sm" && "fynns-input--sm",
            "fynns-input--in-shell",
            isInvalid && "fynns-input--invalid",
          )}
        />
        <div className="fynns-number-input-steppers" role="presentation">
          <button
            type="button"
            className="fynns-number-input-step"
            tabIndex={-1}
            disabled={locked || atMax}
            aria-label={incrementLabel}
            onClick={() => nudge(1)}
          >
            <ChevronUpIcon size={12} aria-hidden />
          </button>
          <button
            type="button"
            className="fynns-number-input-step"
            tabIndex={-1}
            disabled={locked || atMin}
            aria-label={decrementLabel}
            onClick={() => nudge(-1)}
          >
            <ChevronDownIcon size={12} aria-hidden />
          </button>
        </div>
      </div>
      {hint ? (
        <p
          id={hintId}
          className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});
