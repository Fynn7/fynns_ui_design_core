import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";
import { mergeScrollSurfaceClass } from "../theme/scrollbar";

export type SelectOption = {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  value: string;
  /** Options as plain strings or `{ value, label }` objects. */
  options: Array<string | SelectOption>;
  onChange: (value: string) => void;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function normalize(option: string | SelectOption): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

/**
 * Custom single-select (listbox) with keyboard support. Self-positioned
 * dropdown; replaces native `<select>` and the radix-popover-based variant
 * selects. `.fynns-select-*`.
 */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  id,
  disabled = false,
  placeholder = "Select",
  className,
}: SelectProps) {
  const normalized = options.map(normalize);
  const [open, setOpen] = useState(false);
  const selectedIndex = normalized.findIndex((o) => o.value === value);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, selectedIndex));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const pick = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, selectedIndex]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || normalized.length === 0) return;
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % normalized.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + normalized.length) % normalized.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const next = normalized[activeIndex];
      if (next && !next.disabled) pick(next.value);
    }
  };

  const selectedOption = normalized[selectedIndex];
  const displayValue: ReactNode = selectedOption
    ? (selectedOption.label ?? selectedOption.value)
    : placeholder;

  return (
    <div ref={rootRef} className={["fynns-select", className ?? ""].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled || normalized.length === 0}
        className={["fynns-select-trigger", open ? "fynns-select-trigger--open" : ""]
          .filter(Boolean)
          .join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => {
          if (disabled || normalized.length === 0) return;
          setOpen((wasOpen) => !wasOpen);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="fynns-select-trigger-text">{displayValue}</span>
        <ChevronDownIcon size={14} className="fynns-select-trigger-chevron" />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={mergeScrollSurfaceClass("fynns-select-list")}
        >
          {normalized.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  className={[
                    "fynns-select-option",
                    selected ? "fynns-select-option--selected" : "",
                    active ? "fynns-select-option--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => !option.disabled && pick(option.value)}
                >
                  {option.label ?? option.value}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
