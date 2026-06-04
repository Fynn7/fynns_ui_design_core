import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { IconButton } from "./IconButton";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import { clampCounterValue, useCounterHoldRepeat } from "./counterHoldRepeat";

export type CounterProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  /** Class on the outer `.fynns-counter` wrapper. */
  className?: string;
};

type CounterContextValue = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
  id?: string;
  disabled: boolean;
  atMin: boolean;
  atMax: boolean;
};

const CounterContext = createContext<CounterContextValue | null>(null);

function useCounterContext(): CounterContextValue {
  const ctx = useContext(CounterContext);
  if (!ctx) {
    throw new Error("Counter parts must be used inside <Counter> or <CounterProvider>.");
  }
  return ctx;
}

export type CounterProviderProps = CounterProps & { children: ReactNode };

/** Supplies counter state for a custom layout built from CounterRoot / Field / Steppers. */
export function CounterProvider({
  value,
  onChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  ariaLabel = "Number",
  id,
  disabled = false,
  children,
}: CounterProviderProps) {
  const ctx = useMemo<CounterContextValue>(
    () => ({
      value,
      onChange,
      min,
      max,
      step,
      ariaLabel,
      id,
      disabled,
      atMin: value <= min,
      atMax: value >= max,
    }),
    [ariaLabel, disabled, id, max, min, onChange, step, value],
  );

  return <CounterContext.Provider value={ctx}>{children}</CounterContext.Provider>;
}

export type CounterRootProps = {
  children: ReactNode;
  className?: string;
};

/** Outer flex shell: field + vertical stepper column. */
export function CounterRoot({ children, className }: CounterRootProps) {
  return (
    <div className={["fynns-counter", className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export type CounterFieldProps = {
  className?: string;
};

/** Centered numeric field (no native browser spin buttons). */
export function CounterField({ className }: CounterFieldProps = {}) {
  const { value, onChange, min, max, step, ariaLabel, id, disabled } = useCounterContext();

  return (
    <input
      id={id}
      type="number"
      className={["fynns-input", "fynns-counter-field", className ?? ""].filter(Boolean).join(" ")}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(clampCounterValue(Number(event.target.value), min, max, step))
      }
      aria-label={ariaLabel}
    />
  );
}

export type CounterSteppersProps = {
  className?: string;
};

/** Vertical increment / decrement column. */
export function CounterSteppers({ className }: CounterSteppersProps = {}) {
  return (
    <div
      className={["fynns-counter-steppers", className ?? ""].filter(Boolean).join(" ")}
    >
      <CounterIncrement />
      <CounterDecrement />
    </div>
  );
}

export function CounterIncrement() {
  const { value, onChange, min, max, step, ariaLabel, disabled, atMax } = useCounterContext();
  const hold = useCounterHoldRepeat(step, disabled || atMax, value, min, max, step, onChange);

  return (
    <IconButton
      aria-label={`Increase ${ariaLabel}`}
      className="fynns-counter-step"
      size="sm"
      disabled={disabled || atMax}
      {...hold}
    >
      <ChevronUpIcon size={14} />
    </IconButton>
  );
}

export function CounterDecrement() {
  const { value, onChange, min, max, step, ariaLabel, disabled, atMin } = useCounterContext();
  const hold = useCounterHoldRepeat(-step, disabled || atMin, value, min, max, step, onChange);

  return (
    <IconButton
      aria-label={`Decrease ${ariaLabel}`}
      className="fynns-counter-step"
      size="sm"
      disabled={disabled || atMin}
      {...hold}
    >
      <ChevronDownIcon size={14} />
    </IconButton>
  );
}

/**
 * Numeric counter: centered field + press-and-hold steppers (accelerating repeat).
 * Composed from {@link CounterRoot}, {@link CounterField}, and {@link CounterSteppers}.
 */
export function Counter({
  className,
  ...props
}: CounterProps) {
  return (
    <CounterProvider {...props}>
      <CounterRoot className={className}>
        <CounterField />
        <CounterSteppers />
      </CounterRoot>
    </CounterProvider>
  );
}
