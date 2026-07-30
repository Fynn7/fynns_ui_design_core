import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";
import { mergeScrollSurfaceClass } from "../theme/scrollbar";

export type AutocompleteOption = {
  value: string;
  label?: string;
  disabled?: boolean;
};

export type AutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | AutocompleteOption>;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Shown when the filter yields no rows. */
  emptyText?: string;
  invalid?: boolean;
  supportingText?: ReactNode;
  errorText?: ReactNode;
  className?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalize(option: string | AutocompleteOption): AutocompleteOption {
  return typeof option === "string" ? { value: option } : option;
}

function optionLabel(option: AutocompleteOption): string {
  return option.label ?? option.value;
}

/**
 * M3 Autocomplete — filterable text field + docked suggestion list.
 * Chrome matches `Select` / `SearchBar` (elevated capsule + results). Prefer
 * `Select` when typing is not needed; prefer headless `Combobox` for custom UI.
 */
export function Autocomplete({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  disabled = false,
  placeholder = "Search",
  emptyText = "No matches",
  invalid = false,
  supportingText,
  errorText,
  className,
}: AutocompleteProps) {
  const normalized = useMemo(() => options.map(normalize), [options]);
  const selected = normalized.find((o) => o.value === value);
  const selectedLabel = selected ? optionLabel(selected) : "";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedLabel);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const hintId = useId();
  const isDisabled = disabled || normalized.length === 0;
  const hint = errorText ?? supportingText;
  const describedBy = hint != null ? hintId : undefined;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return normalized.filter((option) => {
      if (option.disabled) return false;
      if (!needle) return true;
      const label = optionLabel(option).toLowerCase();
      return label.includes(needle) || option.value.toLowerCase().includes(needle);
    });
  }, [normalized, query]);

  useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [selectedLabel, open]);

  useEffect(() => {
    setActiveIndex((i) =>
      filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1),
    );
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || filtered.length === 0) return;
    const option = filtered[activeIndex];
    if (!option) return;
    const el = document.getElementById(`${listId}-opt-${option.value}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered, listId, open]);

  const pick = useCallback(
    (option: AutocompleteOption) => {
      onChange(option.value);
      setQuery(optionLabel(option));
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange],
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setQuery(next);
    setOpen(true);
    setActiveIndex(0);
    if (value && next !== selectedLabel) onChange("");
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const next = filtered[activeIndex];
      if (next) pick(next);
    }
  };

  const toggleOpen = () => {
    if (isDisabled) return;
    setOpen((was) => !was);
    inputRef.current?.focus();
  };

  const activeOption = filtered[activeIndex];
  const activeOptionId = activeOption
    ? `${listId}-opt-${activeOption.value}`
    : undefined;

  return (
    <div className={join("fynns-autocomplete-field", className)}>
      <div
        ref={rootRef}
        className={join(
          "fynns-autocomplete",
          "fynns-search-bar",
          open && "fynns-search-bar--expanded",
          isDisabled && "fynns-search-bar--disabled",
          isDisabled && "fynns-autocomplete--disabled",
          invalid && "fynns-autocomplete--invalid",
        )}
        data-expanded={open ? "true" : undefined}
      >
        <div className="fynns-search-bar-field fynns-autocomplete-shell">
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            className="fynns-search-bar-input fynns-autocomplete-input"
            value={query}
            disabled={isDisabled}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={open ? activeOptionId : undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            onFocus={() => {
              if (!isDisabled) setOpen(true);
            }}
          />
          <span
            className="fynns-search-bar-trailing fynns-autocomplete-chevron"
            aria-hidden="true"
            onMouseDown={(event) => {
              event.preventDefault();
              toggleOpen();
            }}
          >
            <ChevronDownIcon className="fynns-select-trigger-chevron" />
          </span>
        </div>
        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className={mergeScrollSurfaceClass(
              "fynns-search-bar-results fynns-autocomplete-list",
            )}
          >
            {filtered.length === 0 ? (
              <div className="fynns-autocomplete-empty">{emptyText}</div>
            ) : (
              filtered.map((option, index) => {
                const selectedRow = option.value === value;
                const active = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    id={`${listId}-opt-${option.value}`}
                    type="button"
                    role="option"
                    aria-selected={selectedRow || active}
                    className={join(
                      "fynns-search-bar-result",
                      (active || selectedRow) && "fynns-search-bar-result--active",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pick(option)}
                  >
                    {optionLabel(option)}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
      {hint != null ? (
        <div
          id={hintId}
          className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
