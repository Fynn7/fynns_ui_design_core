import type {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import { useId, useRef } from "react";

export type OtpInputProps = {
  /** Number of digit cells. @default 6 */
  length?: number;
  /** Concatenated OTP string (may be shorter than `length`). */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Marks cells invalid and sets `aria-invalid`. */
  invalid?: boolean;
  /** Accessible name for the group. @default "One-time code" */
  ariaLabel?: string;
  /** Muted helper under the control (ignored when `errorText` is set). */
  supportingText?: ReactNode;
  /** Danger helper under the control; implies invalid styling. */
  errorText?: ReactNode;
  className?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeChars(raw: string, length: number): string[] {
  const chars = Array.from(raw).slice(0, length);
  while (chars.length < length) chars.push("");
  return chars;
}

function charsToValue(chars: string[]): string {
  return chars.join("").replace(/\s+$/u, "");
}

/**
 * One-time-code digit row. Each cell is a single-character `.fynns-input`
 * (`fynns-otp-cell`); paste splits across cells; arrows move focus;
 * Backspace clears and steps back.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  invalid = false,
  ariaLabel = "One-time code",
  supportingText,
  errorText,
  className,
}: OtpInputProps) {
  const autoId = useId();
  const hintId = `${autoId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;
  const chars = normalizeChars(value, length);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const commit = (next: string[]) => {
    onChange(charsToValue(next));
  };

  const focusAt = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleInput = (index: number, event: FormEvent<HTMLInputElement>) => {
    const raw = event.currentTarget.value;
    const digit = (Array.from(raw).pop() ?? "").replace(/\D/gu, "");
    const next = [...chars];
    next[index] = digit;
    commit(next);
    if (digit && index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (index > 0) focusAt(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index < length - 1) focusAt(index + 1);
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...chars];
      if (next[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusAt(index - 1);
      }
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/gu, "");
    if (!pasted) return;
    const next = [...chars];
    const slice = Array.from(pasted);
    for (let i = 0; i < slice.length && index + i < length; i++) {
      next[index + i] = slice[i]!;
    }
    commit(next);
    const lastFilled = Math.min(index + slice.length, length) - 1;
    focusAt(Math.max(0, lastFilled));
  };

  return (
    <div
      className={join("fynns-otp", isInvalid && "fynns-otp--invalid", className)}
      role="group"
      aria-label={ariaLabel}
      aria-invalid={isInvalid || undefined}
      aria-describedby={hint ? hintId : undefined}
    >
      <div className="fynns-otp-cells">
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={char}
            disabled={disabled}
            aria-label={`${ariaLabel}, digit ${index + 1} of ${length}`}
            aria-invalid={isInvalid || undefined}
            className={join(
              "fynns-input",
              "fynns-otp-cell",
              isInvalid && "fynns-input--invalid",
            )}
            onInput={(event) => handleInput(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.currentTarget.select()}
          />
        ))}
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
}
