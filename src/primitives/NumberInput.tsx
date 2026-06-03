import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { IconButton } from "./IconButton";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

/**
 * Numeric input with press-and-hold steppers (accelerating repeat). Generic
 * port of the batch "repeat count" control. `.fynns-number-*`.
 */
export type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

const HOLD_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 90;
const REPEAT_INTERVAL_FAST_MS = 45;
const REPEAT_ACCELERATE_AFTER_MS = 1200;

function clamp(value: number, min: number, max: number, step: number): number {
  if (Number.isNaN(value)) return min;
  const snapped = step > 1 ? Math.round(value / step) * step : Math.round(value);
  return Math.min(max, Math.max(min, snapped));
}

function useHoldRepeatStep(
  delta: number,
  disabled: boolean,
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void,
) {
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accelerateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePointerRef = useRef<number | null>(null);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const clearTimers = useCallback(() => {
    if (delayRef.current !== null) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (accelerateRef.current !== null) {
      clearTimeout(accelerateRef.current);
      accelerateRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const stepOnce = useCallback(() => {
    const next = clamp(valueRef.current + delta, min, max, step);
    if (next === valueRef.current) {
      clearTimers();
      return;
    }
    valueRef.current = next;
    onChangeRef.current(next);
  }, [clearTimers, delta, max, min, step]);

  const startInterval = useCallback(
    (intervalMs: number) => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => stepOnce(), intervalMs);
    },
    [stepOnce],
  );

  const beginRepeat = useCallback(() => {
    clearTimers();
    delayRef.current = setTimeout(() => {
      delayRef.current = null;
      startInterval(REPEAT_INTERVAL_MS);
      accelerateRef.current = setTimeout(() => {
        accelerateRef.current = null;
        startInterval(REPEAT_INTERVAL_FAST_MS);
      }, REPEAT_ACCELERATE_AFTER_MS);
    }, HOLD_DELAY_MS);
  }, [clearTimers, startInterval]);

  const stop = useCallback(() => {
    activePointerRef.current = null;
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerRef.current = event.pointerId;
      stepOnce();
      beginRepeat();
    },
    [beginRepeat, disabled, stepOnce],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (activePointerRef.current !== event.pointerId) return;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      stop();
    },
    [stop],
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onLostPointerCapture: stop,
  };
}

export function NumberInput({
  value,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  ariaLabel = "Number",
  id,
  disabled = false,
  className,
}: NumberInputProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const increaseHold = useHoldRepeatStep(step, disabled || atMax, value, min, max, step, onChange);
  const decreaseHold = useHoldRepeatStep(-step, disabled || atMin, value, min, max, step, onChange);

  return (
    <div className={["fynns-number-input-wrap", className ?? ""].filter(Boolean).join(" ")}>
      <input
        id={id}
        type="number"
        className="fynns-input fynns-number-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max, step))}
        aria-label={ariaLabel}
      />
      <div className="fynns-number-input-steppers">
        <IconButton
          aria-label={`Increase ${ariaLabel}`}
          className="fynns-number-input-step"
          size="sm"
          disabled={disabled || atMax}
          {...increaseHold}
        >
          <ChevronUpIcon size={14} />
        </IconButton>
        <IconButton
          aria-label={`Decrease ${ariaLabel}`}
          className="fynns-number-input-step"
          size="sm"
          disabled={disabled || atMin}
          {...decreaseHold}
        >
          <ChevronDownIcon size={14} />
        </IconButton>
      </div>
    </div>
  );
}
