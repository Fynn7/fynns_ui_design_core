import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "./icons";
import {
  floatingViewportRect,
  useAnchoredPosition,
  type AnchoredPosition,
} from "./Popover";
import { mergeScrollSurfaceClass } from "../theme/scrollbar";
import type { InputSize, InputVariant } from "./Input";

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
  /** Matches `Input` — @default "outlined" */
  variant?: InputVariant;
  /** Matches `Input` — @default "md" */
  size?: InputSize;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalize(option: string | SelectOption): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

function listBoxOrigin(
  pos: AnchoredPosition,
  size: { width: number; height: number },
): { top: number; left: number } {
  const box = floatingViewportRect(
    { top: pos.top, left: pos.left },
    pos.side,
    pos.align,
    size,
  );
  return { top: box.top, left: box.left };
}

/**
 * M3 exposed dropdown menu — text-field trigger (reuses `Input` / field-shell
 * chrome) + portal listbox. Replaces native `<select>`. `.fynns-select-*`.
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
  variant = "outlined",
  size = "md",
}: SelectProps) {
  const normalized = options.map(normalize);
  const [open, setOpen] = useState(false);
  const selectedIndex = normalized.findIndex((o) => o.value === value);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, selectedIndex));
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [listEl, setListEl] = useState<HTMLUListElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const listId = useId();
  const isDisabled = disabled || normalized.length === 0;
  const pos = useAnchoredPosition(shellRef.current, listEl, open, {
    side: "bottom",
    align: "start",
    offset: 5,
  });

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
    if (!open) setListEl(null);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !shellRef.current) {
      setTriggerWidth(null);
      return;
    }
    setTriggerWidth(shellRef.current.getBoundingClientRect().width);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listEl?.contains(target)) return;
      setOpen(false);
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
  }, [open, selectedIndex, listEl]);

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

  const listSize =
    listEl != null
      ? { width: listEl.offsetWidth, height: listEl.offsetHeight }
      : triggerWidth != null
        ? { width: triggerWidth, height: 40 }
        : null;
  const origin =
    pos && listSize ? listBoxOrigin(pos, listSize) : null;

  const listStyle: CSSProperties | undefined =
    origin && triggerWidth != null
      ? {
          position: "fixed",
          top: origin.top,
          left: origin.left,
          width: triggerWidth,
        }
      : undefined;

  return (
    <div
      ref={rootRef}
      className={join("fynns-select", isDisabled && "fynns-select--disabled", className)}
    >
      <div
        ref={shellRef}
        className={join(
          "fynns-field-shell",
          "fynns-select-shell",
          variant === "filled" && "fynns-field-shell--filled",
          open && "fynns-select-shell--open",
        )}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={isDisabled}
          className={join(
            "fynns-input",
            "fynns-input--in-shell",
            "fynns-select-trigger",
            size === "sm" && "fynns-input--sm",
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
          className="fynns-field-affix fynns-select-chevron"
          aria-hidden="true"
          onMouseDown={(event) => {
            // Keep focus on the trigger; toggle without stealing the click.
            event.preventDefault();
            if (isDisabled) return;
            triggerRef.current?.focus();
            toggleOpen();
          }}
        >
          <ChevronDownIcon size={14} className="fynns-select-trigger-chevron" />
        </span>
      </div>
      {open && pos && listStyle
        ? createPortal(
            <ul
              ref={setListEl}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              data-side={pos.side}
              className={mergeScrollSurfaceClass("fynns-select-list")}
              style={listStyle}
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
                      className={join(
                        "fynns-search-bar-result",
                        "fynns-select-option",
                        active && "fynns-search-bar-result--active",
                        selected && "fynns-select-option--selected",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => !option.disabled && pick(option.value)}
                    >
                      <span className="fynns-select-option-leading" aria-hidden>
                        {selected ? (
                          <CheckIcon
                            className="fynns-select-option-check"
                            size={18}
                          />
                        ) : null}
                      </span>
                      <span className="fynns-select-option-label">
                        {option.label ?? option.value}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
