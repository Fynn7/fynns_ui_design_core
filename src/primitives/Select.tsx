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

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalize(option: string | SelectOption): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

/**
 * Dropdown that reuses `SearchBar` chrome end-to-end: same elevated capsule,
 * same docked results shell (`.fynns-search-bar--expanded` +
 * `.fynns-search-bar-results` / `.fynns-search-bar-result`), same type tokens,
 * and the same `.fynns-expand` open/close height morph.
 * Differences: no SearchIcon / leading slot; trailing chevron instead of clear.
 * Replaces native `<select>`.
 * @see https://m3.material.io/components/menus/overview
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
  const isDisabled = disabled || normalized.length === 0;

  const pick = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange],
  );

  const toggleOpen = useCallback(() => {
    if (isDisabled) return;
    setOpen((wasOpen) => !wasOpen);
  }, [isDisabled]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, selectedIndex]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
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
    <div
      ref={rootRef}
      className={join(
        "fynns-select",
        "fynns-search-bar",
        open && "fynns-search-bar--expanded",
        isDisabled && "fynns-search-bar--disabled",
        isDisabled && "fynns-select--disabled",
        className,
      )}
      data-expanded={open ? "true" : undefined}
    >
      <div className="fynns-search-bar-field fynns-select-shell">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={isDisabled}
          className={join(
            "fynns-search-bar-input",
            "fynns-select-trigger",
            open && "fynns-select-trigger--open",
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel}
          onClick={toggleOpen}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="fynns-select-trigger-text">{displayValue}</span>
        </button>
        <span
          className="fynns-search-bar-trailing fynns-select-chevron"
          aria-hidden="true"
          onMouseDown={(event) => {
            event.preventDefault();
            if (isDisabled) return;
            triggerRef.current?.focus();
            toggleOpen();
          }}
        >
          <ChevronDownIcon className="fynns-select-trigger-chevron" />
        </span>
      </div>
      {normalized.length > 0 ? (
        <div
          className="fynns-expand fynns-search-bar-panel"
          data-state={open ? "open" : "closed"}
        >
          <div className="fynns-expand-inner">
            <div
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              aria-hidden={!open}
              inert={open ? undefined : true}
              className={mergeScrollSurfaceClass(
                "fynns-search-bar-results fynns-select-list",
              )}
            >
              {normalized.map((option, index) => {
                const selected = option.value === value;
                const active = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    tabIndex={open ? undefined : -1}
                    className={join(
                      "fynns-search-bar-result",
                      (active || selected) && "fynns-search-bar-result--active",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => !option.disabled && pick(option.value)}
                  >
                    {option.label ?? option.value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
