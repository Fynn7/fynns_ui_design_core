import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { DialogFrame } from "./Dialog";
import { IconButton } from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";
import { Tooltip } from "./Tooltip";

/** Calendar day as ISO `YYYY-MM-DD` (date-only, local). */
export type DateValue = string;

export type DatePickerLabels = {
  previousMonth?: string;
  nextMonth?: string;
  /** Sunday → Saturday short labels (7 entries). */
  weekdays?: readonly string[];
  /** January → December full names (12 entries). */
  months?: readonly string[];
};

const DEFAULT_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const DEFAULT_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format local Y/M/D as `YYYY-MM-DD`. */
export function formatDateValue(
  year: number,
  monthIndex: number,
  day: number,
): DateValue {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Parse `YYYY-MM-DD` into local calendar parts (null if invalid). */
export function parseDateValue(
  value: DateValue | null | undefined,
): { year: number; monthIndex: number; day: number } | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const dt = new Date(year, monthIndex, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== monthIndex ||
    dt.getDate() !== day
  ) {
    return null;
  }
  return { year, monthIndex, day };
}

function todayValue(): DateValue {
  const now = new Date();
  return formatDateValue(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthKey(year: number, monthIndex: number): string {
  return `${year}-${pad2(monthIndex + 1)}`;
}

function parseMonthKey(
  key: string | null | undefined,
): { year: number; monthIndex: number } | null {
  if (!key) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function compareDateValues(a: DateValue, b: DateValue): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

type DayCell = {
  value: DateValue;
  day: number;
  inMonth: boolean;
};

function buildMonthGrid(
  year: number,
  monthIndex: number,
  weekStartsOn: 0 | 1,
): DayCell[] {
  const first = new Date(year, monthIndex, 1);
  const inMonthCount = daysInMonth(year, monthIndex);
  let startWeekday = first.getDay(); // 0 = Sunday
  if (weekStartsOn === 1) {
    startWeekday = (startWeekday + 6) % 7;
  }
  const cells: DayCell[] = [];
  const prev = addMonths(year, monthIndex, -1);
  const prevCount = daysInMonth(prev.year, prev.monthIndex);
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const day = prevCount - i;
    cells.push({
      value: formatDateValue(prev.year, prev.monthIndex, day),
      day,
      inMonth: false,
    });
  }
  for (let day = 1; day <= inMonthCount; day += 1) {
    cells.push({
      value: formatDateValue(year, monthIndex, day),
      day,
      inMonth: true,
    });
  }
  const next = addMonths(year, monthIndex, 1);
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      value: formatDateValue(next.year, next.monthIndex, nextDay),
      day: nextDay,
      inMonth: false,
    });
    nextDay += 1;
  }
  return cells;
}

function resolveInitialMonth(
  defaultDisplayMonth: string | undefined,
  selected: DateValue | null,
): { year: number; monthIndex: number } {
  const fromProp = parseMonthKey(defaultDisplayMonth);
  if (fromProp) return fromProp;
  const fromSelected = parseDateValue(selected);
  if (fromSelected) {
    return { year: fromSelected.year, monthIndex: fromSelected.monthIndex };
  }
  const t = parseDateValue(todayValue())!;
  return { year: t.year, monthIndex: t.monthIndex };
}

export type DatePickerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  /** Selected day (`YYYY-MM-DD`), controlled. */
  value?: DateValue | null;
  /** Uncontrolled initial selection. */
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue) => void;
  /** Visible month as `YYYY-MM` (controlled). */
  displayMonth?: string;
  defaultDisplayMonth?: string;
  onDisplayMonthChange?: (month: string) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  isDateDisabled?: (date: DateValue) => boolean;
  /** `0` = Sunday (default), `1` = Monday. */
  weekStartsOn?: 0 | 1;
  labels?: DatePickerLabels;
  disabled?: boolean;
};

/**
 * M3 DatePicker — month calendar for picking a single day. Embed docked in a
 * form / popover, or wrap with `DatePickerDialog` for a modal flow.
 * Values are ISO date-only strings (`YYYY-MM-DD`) in local calendar time.
 * @see https://m3.material.io/components/date-pickers/overview
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  displayMonth: displayMonthProp,
  defaultDisplayMonth,
  onDisplayMonthChange,
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn = 0,
  labels,
  disabled = false,
  className,
  ...rest
}: DatePickerProps) {
  const headingId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState<DateValue | null>(
    defaultValue,
  );
  const selected = valueProp !== undefined ? valueProp : uncontrolledValue;

  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    resolveInitialMonth(defaultDisplayMonth, selected ?? defaultValue),
  );
  const controlledMonth = parseMonthKey(displayMonthProp);
  const { year, monthIndex } = controlledMonth ?? uncontrolledMonth;

  const setMonth = (next: { year: number; monthIndex: number }) => {
    onDisplayMonthChange?.(monthKey(next.year, next.monthIndex));
    if (displayMonthProp === undefined) setUncontrolledMonth(next);
  };

  const weekdays =
    labels?.weekdays?.length === 7 ? labels.weekdays : DEFAULT_WEEKDAYS;
  const months =
    labels?.months?.length === 12 ? labels.months : DEFAULT_MONTHS;
  const prevLabel = labels?.previousMonth ?? "Previous month";
  const nextLabel = labels?.nextMonth ?? "Next month";

  const orderedWeekdays = useMemo(() => {
    if (weekStartsOn === 0) return [...weekdays];
    return [...weekdays.slice(1), weekdays[0]];
  }, [weekStartsOn, weekdays]);

  const cells = useMemo(
    () => buildMonthGrid(year, monthIndex, weekStartsOn),
    [year, monthIndex, weekStartsOn],
  );
  const today = todayValue();
  const gridId = `${headingId}-grid`;

  const isOutOfRange = (date: DateValue) => {
    if (minDate && compareDateValues(date, minDate) < 0) return true;
    if (maxDate && compareDateValues(date, maxDate) > 0) return true;
    return false;
  };

  const isDayDisabled = (date: DateValue) =>
    disabled || isOutOfRange(date) || Boolean(isDateDisabled?.(date));

  /** Roving tabindex target: selected → today → first enabled cell in view. */
  const tabbableValue = useMemo(() => {
    const dayDisabled = (date: DateValue) =>
      disabled ||
      (minDate != null && compareDateValues(date, minDate) < 0) ||
      (maxDate != null && compareDateValues(date, maxDate) > 0) ||
      Boolean(isDateDisabled?.(date));
    const enabled = cells.filter((c) => !dayDisabled(c.value));
    if (enabled.length === 0) return null;
    if (selected && enabled.some((c) => c.value === selected)) return selected;
    if (enabled.some((c) => c.value === today && c.inMonth)) return today;
    const inMonth = enabled.find((c) => c.inMonth);
    return (inMonth ?? enabled[0]).value;
  }, [cells, selected, today, disabled, minDate, maxDate, isDateDisabled]);

  const [focusValue, setFocusValue] = useState<DateValue | null>(null);
  const restoreFocusRef = useRef(false);
  const activeFocus =
    focusValue &&
    cells.some((c) => c.value === focusValue && !isDayDisabled(c.value))
      ? focusValue
      : tabbableValue;

  useEffect(() => {
    if (!restoreFocusRef.current || !activeFocus) return;
    restoreFocusRef.current = false;
    document.getElementById(`${gridId}-day-${activeFocus}`)?.focus();
  }, [activeFocus, gridId, year, monthIndex]);

  const focusDay = (date: DateValue) => {
    const parsed = parseDateValue(date);
    if (parsed && (parsed.year !== year || parsed.monthIndex !== monthIndex)) {
      setMonth({ year: parsed.year, monthIndex: parsed.monthIndex });
    }
    setFocusValue(date);
    restoreFocusRef.current = true;
  };

  const pick = (date: DateValue) => {
    if (disabled) return;
    if (isOutOfRange(date) || isDateDisabled?.(date)) return;
    if (valueProp === undefined) setUncontrolledValue(date);
    onChange?.(date);
    focusDay(date);
  };

  const moveFocusByDays = (from: DateValue, delta: number) => {
    const parts = parseDateValue(from);
    if (!parts) return;
    const step = delta >= 0 ? 1 : -1;
    let candidate = formatDateValue(
      parts.year,
      parts.monthIndex,
      parts.day + delta,
    );
    for (let i = 0; i < 62; i += 1) {
      if (!isDayDisabled(candidate)) {
        focusDay(candidate);
        return;
      }
      const cp = parseDateValue(candidate);
      if (!cp) return;
      const d = new Date(cp.year, cp.monthIndex, cp.day + step);
      candidate = formatDateValue(d.getFullYear(), d.getMonth(), d.getDate());
    }
  };

  const shiftMonthKeepDay = (deltaMonths: number) => {
    const anchor = parseDateValue(activeFocus ?? selected ?? today);
    if (!anchor) return;
    const target = addMonths(year, monthIndex, deltaMonths);
    const dim = daysInMonth(target.year, target.monthIndex);
    const day = Math.min(anchor.day, dim);
    focusDay(formatDateValue(target.year, target.monthIndex, day));
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!activeFocus || disabled) return;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocusByDays(activeFocus, -1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveFocusByDays(activeFocus, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocusByDays(activeFocus, -7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocusByDays(activeFocus, 7);
        break;
      case "Home": {
        event.preventDefault();
        const idx = cells.findIndex((c) => c.value === activeFocus);
        if (idx < 0) break;
        const rowStart = idx - (idx % 7);
        for (let i = rowStart; i < rowStart + 7; i += 1) {
          const c = cells[i];
          if (c && !isDayDisabled(c.value)) {
            focusDay(c.value);
            break;
          }
        }
        break;
      }
      case "End": {
        event.preventDefault();
        const idx = cells.findIndex((c) => c.value === activeFocus);
        if (idx < 0) break;
        const rowStart = idx - (idx % 7);
        for (let i = rowStart + 6; i >= rowStart; i -= 1) {
          const c = cells[i];
          if (c && !isDayDisabled(c.value)) {
            focusDay(c.value);
            break;
          }
        }
        break;
      }
      case "PageUp":
        event.preventDefault();
        shiftMonthKeepDay(-1);
        break;
      case "PageDown":
        event.preventDefault();
        shiftMonthKeepDay(1);
        break;
      default:
        break;
    }
  };

  const prevMonth = addMonths(year, monthIndex, -1);
  const nextMonth = addMonths(year, monthIndex, 1);
  const prevMonthEnd = formatDateValue(
    prevMonth.year,
    prevMonth.monthIndex,
    daysInMonth(prevMonth.year, prevMonth.monthIndex),
  );
  const nextMonthStart = formatDateValue(
    nextMonth.year,
    nextMonth.monthIndex,
    1,
  );
  const prevDisabled =
    disabled ||
    (minDate != null && compareDateValues(prevMonthEnd, minDate) < 0);
  const nextDisabled =
    disabled ||
    (maxDate != null && compareDateValues(nextMonthStart, maxDate) > 0);

  return (
    <div
      {...rest}
      className={join(
        "fynns-datepicker",
        disabled && "fynns-datepicker--disabled",
        className,
      )}
      role="group"
      aria-labelledby={headingId}
    >
      <div className="fynns-datepicker-header">
        <h2 id={headingId} className="fynns-datepicker-title">
          {months[monthIndex]} {year}
        </h2>
        <div className="fynns-datepicker-nav">
          <Tooltip content={prevLabel}>
            <IconButton
              type="button"
              aria-label={prevLabel}
              disabled={prevDisabled}
              onClick={() => setMonth(prevMonth)}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={nextLabel}>
            <IconButton
              type="button"
              aria-label={nextLabel}
              disabled={nextDisabled}
              onClick={() => setMonth(nextMonth)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className="fynns-datepicker-weekdays" aria-hidden>
        {orderedWeekdays.map((label, i) => (
          <span key={`${label}-${i}`} className="fynns-datepicker-weekday">
            {label}
          </span>
        ))}
      </div>
      <div
        id={gridId}
        className="fynns-datepicker-grid"
        role="grid"
        aria-labelledby={headingId}
        onKeyDown={onGridKeyDown}
      >
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <div key={row} className="fynns-datepicker-row" role="row">
            {cells.slice(row * 7, row * 7 + 7).map((cell) => {
              const selectedDay = selected != null && cell.value === selected;
              const isToday = cell.value === today;
              const dayDisabled = isDayDisabled(cell.value);
              const isTabbable = !dayDisabled && cell.value === activeFocus;
              return (
                <button
                  key={cell.value}
                  id={`${gridId}-day-${cell.value}`}
                  type="button"
                  role="gridcell"
                  className={join(
                    "fynns-datepicker-day",
                    !cell.inMonth && "fynns-datepicker-day--outside",
                    selectedDay && "fynns-datepicker-day--selected",
                    isToday && "fynns-datepicker-day--today",
                  )}
                  aria-selected={selectedDay}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={cell.value}
                  disabled={dayDisabled}
                  tabIndex={isTabbable ? 0 : -1}
                  onClick={() => pick(cell.value)}
                  onFocus={() => setFocusValue(cell.value)}
                >
                  <span className="fynns-datepicker-day-label">{cell.day}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export type DatePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Confirmed selection when OK is pressed. */
  value?: DateValue | null;
  onConfirm: (value: DateValue) => void;
  title?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  closeAriaLabel?: string;
  minDate?: DateValue;
  maxDate?: DateValue;
  isDateDisabled?: (date: DateValue) => boolean;
  weekStartsOn?: 0 | 1;
  labels?: DatePickerLabels;
};

function formatSupportingDate(value: DateValue): string {
  const parts = parseDateValue(value);
  if (!parts) return "";
  const date = new Date(parts.year, parts.monthIndex, parts.day);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Modal DatePicker — temporary selection until Confirm; Cancel / Esc discards.
 * Minimal M3 modal cues: extra-large corners + supporting selected-date line.
 */
export function DatePickerDialog({
  open,
  onOpenChange,
  value = null,
  onConfirm,
  title = "Select date",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  closeAriaLabel = "Close",
  minDate,
  maxDate,
  isDateDisabled,
  weekStartsOn,
  labels,
}: DatePickerDialogProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<DateValue | null>(value);
  const [monthSeed, setMonthSeed] = useState(0);

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    setMonthSeed((n) => n + 1);
    // Capture `value` only when opening; do not reset draft while the dialog stays open.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open transition only
  }, [open]);

  const cancel = () => onOpenChange(false);
  const confirm = () => {
    if (draft == null) return;
    onConfirm(draft);
    onOpenChange(false);
  };

  const supporting = draft ? formatSupportingDate(draft) : null;

  return (
    <DialogFrame
      open={open}
      onClose={cancel}
      variant="centered"
      labelledBy={titleId}
      panelClassName="fynns-datepicker-dialog"
    >
      <div className="fynns-dialog-head fynns-dialog-head--centered fynns-datepicker-dialog-head">
        <span aria-hidden />
        <div className="fynns-datepicker-dialog-titles">
          <h2 id={titleId} className="fynns-dialog-title">
            {title}
          </h2>
          <p
            className="fynns-datepicker-dialog-supporting"
            aria-live="polite"
          >
            {supporting ?? "\u00a0"}
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
      <div className="fynns-dialog-body fynns-datepicker-dialog-body">
        <DatePicker
          key={monthSeed}
          value={draft}
          onChange={setDraft}
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          labels={labels}
        />
      </div>
      <div className="fynns-dialog-foot">
        <Button variant="ghost" onClick={cancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={confirm} disabled={draft == null}>
          {confirmLabel}
        </Button>
      </div>
    </DialogFrame>
  );
}
