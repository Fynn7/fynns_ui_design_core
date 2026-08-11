import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { DialogFrame } from "./Dialog";
import { CloseIcon } from "./icons";

/** Clock time as `HH:mm` (24-hour, local). */
export type TimeValue = string;

export type TimeHourCycle = "h23" | "h12";

export type TimePickerLabels = {
  hour?: string;
  minute?: string;
  am?: string;
  pm?: string;
  periodAria?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format hours (0–23) and minutes (0–59) as `HH:mm`. */
export function formatTimeValue(hours: number, minutes: number): TimeValue {
  return `${pad2(hours)}:${pad2(minutes)}`;
}

/** Parse `HH:mm` into 24-hour parts (null if invalid). */
export function parseTimeValue(
  value: TimeValue | null | undefined,
): { hours: number; minutes: number } | null {
  if (!value) return null;
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function nowTimeValue(): TimeValue {
  const now = new Date();
  return formatTimeValue(now.getHours(), now.getMinutes());
}

function toDisplay12(hours23: number): { hour12: number; period: "am" | "pm" } {
  const period = hours23 < 12 ? "am" : "pm";
  const hour12 = hours23 % 12 === 0 ? 12 : hours23 % 12;
  return { hour12, period };
}

function fromDisplay12(hour12: number, period: "am" | "pm"): number {
  if (period === "am") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function wrap(n: number, min: number, max: number): number {
  const span = max - min + 1;
  return ((((n - min) % span) + span) % span) + min;
}

type FieldId = "hour" | "minute";

export type TimePickerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  /** Selected time (`HH:mm` 24-hour), controlled. */
  value?: TimeValue | null;
  /** Uncontrolled initial selection. */
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue) => void;
  /** `h23` = 00–23 (default). `h12` shows 1–12 + AM/PM. */
  hourCycle?: TimeHourCycle;
  /** Minute increment (1–30). Default `1`. */
  minuteStep?: number;
  labels?: TimePickerLabels;
  disabled?: boolean;
};

/**
 * M3 TimePicker — input (digital) variant for picking a clock time.
 * Values are `HH:mm` in 24-hour local time. Embed docked, or wrap with
 * `TimePickerDialog` for a modal confirm flow. Dial / clock face is out of scope.
 * @see https://m3.material.io/components/time-pickers/overview
 */
export function TimePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  hourCycle = "h23",
  minuteStep = 1,
  labels,
  disabled = false,
  className,
  ...rest
}: TimePickerProps) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState<TimeValue | null>(
    defaultValue,
  );
  const selected = valueProp !== undefined ? valueProp : uncontrolled;
  const parts = parseTimeValue(selected) ?? parseTimeValue(nowTimeValue())!;

  const step = clamp(Math.floor(minuteStep) || 1, 1, 30);
  const hourLabel = labels?.hour ?? "Hour";
  const minuteLabel = labels?.minute ?? "Minute";
  const amLabel = labels?.am ?? "AM";
  const pmLabel = labels?.pm ?? "PM";
  const periodAria = labels?.periodAria ?? "AM/PM";

  const [activeField, setActiveField] = useState<FieldId>("hour");
  const digitBuffer = useRef("");

  const display12 =
    hourCycle === "h12" ? toDisplay12(parts.hours) : null;
  const displayHour =
    hourCycle === "h12" ? display12!.hour12 : parts.hours;
  const displayMinute = parts.minutes;

  const commit = (hours: number, minutes: number) => {
    if (disabled) return;
    const next = formatTimeValue(
      clamp(hours, 0, 23),
      clamp(minutes - (minutes % step), 0, 59),
    );
    if (valueProp === undefined) setUncontrolled(next);
    onChange?.(next);
  };

  const setHours = (hours: number) => commit(hours, parts.minutes);
  const setMinutes = (minutes: number) => commit(parts.hours, minutes);

  const bumpHour = (delta: number) => {
    if (hourCycle === "h12") {
      const { hour12, period } = toDisplay12(parts.hours);
      const next12 = wrap(hour12 + delta, 1, 12);
      setHours(fromDisplay12(next12, period));
      return;
    }
    setHours(wrap(parts.hours + delta, 0, 23));
  };

  const bumpMinute = (delta: number) => {
    setMinutes(wrap(parts.minutes + delta * step, 0, 59));
  };

  const applyDigits = (field: FieldId, digit: string) => {
    const maxLen = 2;
    const nextBuf =
      digitBuffer.current.length >= maxLen
        ? digit
        : `${digitBuffer.current}${digit}`;
    digitBuffer.current = nextBuf;
    const n = Number(nextBuf);
    if (field === "hour") {
      if (hourCycle === "h12") {
        const capped = clamp(n, 0, 12);
        const period = toDisplay12(parts.hours).period;
        const hour12 = capped === 0 ? 12 : capped;
        setHours(fromDisplay12(hour12, period));
        if (nextBuf.length >= 2) {
          digitBuffer.current = "";
          setActiveField("minute");
        }
      } else {
        setHours(clamp(n, 0, 23));
        if (nextBuf.length >= 2 || n > 2) {
          digitBuffer.current = "";
          setActiveField("minute");
        }
      }
    } else {
      setMinutes(clamp(n, 0, 59));
      if (nextBuf.length >= 2 || n > 5) digitBuffer.current = "";
    }
  };

  const onFieldKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    field: FieldId,
  ) => {
    if (disabled) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      digitBuffer.current = "";
      if (field === "hour") bumpHour(1);
      else bumpMinute(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      digitBuffer.current = "";
      if (field === "hour") bumpHour(-1);
      else bumpMinute(-1);
    } else if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      digitBuffer.current = "";
      if (field === "hour") setActiveField("minute");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      digitBuffer.current = "";
      if (field === "minute") setActiveField("hour");
    } else if (event.key === "Backspace") {
      event.preventDefault();
      digitBuffer.current = "";
      if (field === "hour") {
        if (hourCycle === "h12") {
          setHours(fromDisplay12(12, toDisplay12(parts.hours).period));
        } else setHours(0);
      } else setMinutes(0);
    } else if (/^\d$/.test(event.key)) {
      event.preventDefault();
      applyDigits(field, event.key);
    }
  };

  const setPeriod = (period: "am" | "pm") => {
    const { hour12 } = toDisplay12(parts.hours);
    setHours(fromDisplay12(hour12, period));
  };

  const hourMax = hourCycle === "h12" ? 12 : 23;
  const hourMin = hourCycle === "h12" ? 1 : 0;

  return (
    <div
      {...rest}
      className={join(
        "fynns-timepicker",
        disabled && "fynns-timepicker--disabled",
        className,
      )}
      role="group"
      aria-disabled={disabled || undefined}
    >
      <div className="fynns-timepicker-fields">
        <div className="fynns-timepicker-field-wrap">
          <button
            type="button"
            id={`${baseId}-hour`}
            className={join(
              "fynns-timepicker-field",
              activeField === "hour" && "fynns-timepicker-field--active",
            )}
            role="spinbutton"
            aria-label={hourLabel}
            aria-valuemin={hourMin}
            aria-valuemax={hourMax}
            aria-valuenow={displayHour}
            aria-valuetext={pad2(displayHour)}
            disabled={disabled}
            onClick={() => {
              digitBuffer.current = "";
              setActiveField("hour");
            }}
            onFocus={() => {
              digitBuffer.current = "";
              setActiveField("hour");
            }}
            onKeyDown={(e) => onFieldKeyDown(e, "hour")}
          >
            {pad2(displayHour)}
          </button>
        </div>
        <span className="fynns-timepicker-colon" aria-hidden>
          <span className="fynns-timepicker-colon-dot" />
          <span className="fynns-timepicker-colon-dot" />
        </span>
        <div className="fynns-timepicker-field-wrap">
          <button
            type="button"
            id={`${baseId}-minute`}
            className={join(
              "fynns-timepicker-field",
              activeField === "minute" && "fynns-timepicker-field--active",
            )}
            role="spinbutton"
            aria-label={minuteLabel}
            aria-valuemin={0}
            aria-valuemax={59}
            aria-valuenow={displayMinute}
            aria-valuetext={pad2(displayMinute)}
            disabled={disabled}
            onClick={() => {
              digitBuffer.current = "";
              setActiveField("minute");
            }}
            onFocus={() => {
              digitBuffer.current = "";
              setActiveField("minute");
            }}
            onKeyDown={(e) => onFieldKeyDown(e, "minute")}
          >
            {pad2(displayMinute)}
          </button>
        </div>
        {hourCycle === "h12" && display12 ? (
          <div
            className="fynns-timepicker-period"
            role="radiogroup"
            aria-label={periodAria}
          >
            <button
              type="button"
              role="radio"
              className={join(
                "fynns-timepicker-period-btn",
                display12.period === "am" && "fynns-timepicker-period-btn--selected",
              )}
              aria-checked={display12.period === "am"}
              disabled={disabled}
              onClick={() => setPeriod("am")}
            >
              {amLabel}
            </button>
            <button
              type="button"
              role="radio"
              className={join(
                "fynns-timepicker-period-btn",
                display12.period === "pm" && "fynns-timepicker-period-btn--selected",
              )}
              aria-checked={display12.period === "pm"}
              disabled={disabled}
              onClick={() => setPeriod("pm")}
            >
              {pmLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type TimePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Confirmed selection when OK is pressed. */
  value?: TimeValue | null;
  onConfirm: (value: TimeValue) => void;
  title?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  closeAriaLabel?: string;
  hourCycle?: TimeHourCycle;
  minuteStep?: number;
  labels?: TimePickerLabels;
};

function formatSupportingTime(
  value: TimeValue,
  hourCycle: TimeHourCycle,
): string {
  const parts = parseTimeValue(value);
  if (!parts) return "";
  if (hourCycle === "h12") {
    const { hour12, period } = toDisplay12(parts.hours);
    const periodLabel = period === "am" ? "AM" : "PM";
    return `${pad2(hour12)}:${pad2(parts.minutes)} ${periodLabel}`;
  }
  return value;
}

/**
 * Modal TimePicker — temporary selection until Confirm; Cancel / Esc discards.
 * Same modal cues as DatePickerDialog (radius-3xl shell + supporting time line).
 */
export function TimePickerDialog({
  open,
  onOpenChange,
  value = null,
  onConfirm,
  title = "Select time",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  closeAriaLabel = "Close",
  hourCycle = "h23",
  minuteStep,
  labels,
}: TimePickerDialogProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<TimeValue>(
    value ?? nowTimeValue(),
  );
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (!open) return;
    setDraft(value ?? nowTimeValue());
    setSeed((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open transition only
  }, [open]);

  const cancel = () => onOpenChange(false);
  const confirm = () => {
    onConfirm(draft);
    onOpenChange(false);
  };

  const supporting = formatSupportingTime(draft, hourCycle);

  return (
    <DialogFrame
      open={open}
      onClose={cancel}
      variant="centered"
      labelledBy={titleId}
      panelClassName="fynns-timepicker-dialog"
    >
      <div className="fynns-dialog-head fynns-dialog-head--centered fynns-timepicker-dialog-head">
        <span aria-hidden />
        <div className="fynns-timepicker-dialog-titles">
          <h2 id={titleId} className="fynns-dialog-title">
            {title}
          </h2>
          <p className="fynns-timepicker-dialog-supporting" aria-live="polite">
            {supporting || "\u00a0"}
          </p>
        </div>
        <Button
          iconOnly
          variant="ghost"
          className="fynns-dialog-close"
          aria-label={closeAriaLabel}
          onClick={cancel}
        >
          <CloseIcon />
        </Button>
      </div>
      <div className="fynns-dialog-body fynns-scroll fynns-timepicker-dialog-body">
        <TimePicker
          key={seed}
          value={draft}
          onChange={setDraft}
          hourCycle={hourCycle}
          minuteStep={minuteStep}
          labels={labels}
        />
      </div>
      <div className="fynns-dialog-foot">
        <Button variant="ghost" onClick={cancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={confirm}>
          {confirmLabel}
        </Button>
      </div>
    </DialogFrame>
  );
}
