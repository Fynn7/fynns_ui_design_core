import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

const HOLD_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 90;
const REPEAT_INTERVAL_FAST_MS = 45;
const REPEAT_ACCELERATE_AFTER_MS = 1200;

export function clampCounterValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  if (Number.isNaN(value)) return min;
  const snapped = step > 1 ? Math.round(value / step) * step : Math.round(value);
  return Math.min(max, Math.max(min, snapped));
}

export function useCounterHoldRepeat(
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
    const next = clampCounterValue(valueRef.current + delta, min, max, step);
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
