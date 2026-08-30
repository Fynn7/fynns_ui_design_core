import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  /** Optional trailing control inside the field shell (before chevron) — M3 in-field icon slot. */
  trailing?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalize(option: string | SelectOption): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

/**
 * Dropdown that reuses SearchBar's docked results shell (`.fynns-expand` +
 * `.fynns-search-bar-results`), but **form density** matches Input (40dp /
 * `--fynns-size-icon-target`, outlined surface) — not chrome SearchBar 56dp.
 * Differences: no SearchIcon / leading slot; trailing chevron instead of clear.
 * Auxiliary row actions (refresh / reload) belong in a sibling
 * `.fynns-control-cluster--end-align` band — not `trailing` beside chevron
 * (see AGENTS.md / sandbox `#field-header`). Core pins the sibling action to
 * the 40dp trigger row when the docked list expands — not the list midpoint.
 * Replaces native `<select>`.
 *
 * Trigger width floors to the widest option (or placeholder) so switching
 * values does not resize the control when the host is content-sized.
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
  trailing,
}: SelectProps) {
  const normalized = options.map(normalize);
  const [open, setOpen] = useState(false);
  const selectedIndex = normalized.findIndex((o) => o.value === value);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, selectedIndex));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [minWidthPx, setMinWidthPx] = useState<number | null>(null);
  const listId = useId();
  const isDisabled = disabled || normalized.length === 0;
  /** In a FieldBlock control band the cluster is one flex row — no content min-width floor. */
  const shrinkInCluster =
    typeof className === "string" &&
    className.split(/\s+/).includes("fynns-control-cluster__grow");

  /** Remeasure when options / placeholder change (not on every selected value). */
  useLayoutEffect(() => {
    if (shrinkInCluster) {
      setMinWidthPx(null);
      return;
    }
    const host = measureRef.current;
    if (!host) return;
    let max = 0;
    for (const child of Array.from(host.children)) {
      max = Math.max(max, (child as HTMLElement).offsetWidth);
    }
    if (max > 0) setMinWidthPx(max);
  }, [options, placeholder, shrinkInCluster]);

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

  const measureLabels: ReactNode[] = [
    placeholder,
    ...normalized.map((o) => o.label ?? o.value),
  ];

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
      style={
        shrinkInCluster
          ? undefined
          : minWidthPx != null
            ? ({
                /* Floor for closed trigger; CSS applies `min(100%, …)` in
                 * form rows and a fixed px hug in List trailing (circular
                 * `min(100%, …)` was crushing the shell end radius). */
                ["--fynns-select-measure-min" as string]: `${minWidthPx}px`,
              } as CSSProperties)
            : undefined
      }
    >
      {/*
        Off-flow probe: one closed shell per option (+ placeholder) so the
        floor matches real chrome (field pad + trigger pad + label + chevron
        + hairline border).
      */}
      <div
        ref={measureRef}
        className="fynns-select-measure"
        aria-hidden="true"
      >
        {measureLabels.map((label, i) => (
          <div key={i} className="fynns-select-measure-row">
            <div className="fynns-search-bar-field fynns-select-shell">
              <span className="fynns-search-bar-input fynns-select-trigger">
                <span className="fynns-select-trigger-text">{label}</span>
              </span>
              <span className="fynns-search-bar-trailing fynns-select-chevron">
                <ChevronDownIcon className="fynns-select-trigger-chevron" />
              </span>
            </div>
          </div>
        ))}
      </div>
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
          className={join(
            "fynns-search-bar-trailing",
            trailing != null && "fynns-select-trailing-cluster",
          )}
        >
          {trailing != null ? (
            <span className="fynns-select-trailing-action">{trailing}</span>
          ) : null}
          <span
            className="fynns-select-chevron"
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
