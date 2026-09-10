import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "./icons";
import { mergeScrollSurfaceClass } from "../theme/scrollbar";
import { useFloatingBoxPosition } from "./floatingBox";

/** Keep in sync with `--fynns-duration-flyout` / DropdownMenu `FLYOUT_TRANSITION_MS`. */
const FLYOUT_TRANSITION_MS = 160;

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

function flyoutExitMs(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return FLYOUT_TRANSITION_MS;
}

/**
 * M3 Exposed Dropdown / Select — form-density field (40dp outlined shell) +
 * **portaled** elevated listbox (temporary surface). Trigger stays in-flow;
 * the menu does **not** push layout (not SearchBar’s docked joined capsule).
 * Autocomplete / SearchBar keep the Google-style docked shell.
 * Auxiliary row actions (refresh / reload) belong in a sibling
 * `.fynns-control-cluster--end-align` band — not `trailing` beside chevron
 * (see docs/DESIGN_SYSTEM.md / sandbox `#field-header`).
 * Replaces native `<select>`.
 *
 * Trigger width floors to the widest option (or placeholder) so switching
 * values does not resize the control when the host is content-sized — and so
 * the shell stays aligned under Grid / form fill (≥ **0.5.210** absolute
 * `--fynns-select-measure-min`, not `min(100%, …)`).
 * Open menu: **min-width = max(option-measure floor, trigger shell width)**
 * (≥ **0.5.220** — M3 Exposed Dropdown matches the field; retires the
 * 0.5.216 “hug short labels under a wide shell” chip). Still grows past a
 * narrow trigger when labels are long (`width: max-content`, viewport-capped).
 * @see https://m3.material.io/components/menus/overview
 * @see https://developer.android.com/reference/kotlin/androidx/compose/material3/ExposedDropdownMenuBox.composable
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
  const shellRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [minWidthPx, setMinWidthPx] = useState<number | null>(null);
  const [shellWidthPx, setShellWidthPx] = useState<number | null>(null);
  const listId = useId();
  const isDisabled = disabled || normalized.length === 0;
  /** In a FieldBlock control band the cluster is one flex row — no content min-width floor. */
  const shrinkInCluster =
    typeof className === "string" &&
    className.split(/\s+/).includes("fynns-control-cluster__grow");

  const pos = useFloatingBoxPosition(
    shellRef.current ?? rootRef.current,
    menuEl,
    open,
    {
      side: "bottom",
      align: "start",
      offset: 4,
      anchorMode: "element",
      estimateWhenUnmeasured: true,
    },
  );
  const lastPosRef = useRef(pos);
  if (pos) lastPosRef.current = pos;
  const displayPos = pos ?? lastPosRef.current;

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

  /** While open, track the live shell width so the menu matches a stretched field. */
  useLayoutEffect(() => {
    if (shrinkInCluster) {
      setShellWidthPx(null);
      return;
    }
    /* Keep last shell width through the exit animation (`open` false but still
     * `mounted`) so the menu does not flash to option-measure chip width. */
    if (!open) return;
    const shell = shellRef.current;
    if (!shell) return;
    const sync = () => {
      const w = shell.getBoundingClientRect().width;
      if (w > 0) setShellWidthPx(w);
    };
    sync();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    ro?.observe(shell);
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [open, shrinkInCluster]);

  useEffect(() => {
    if (!mounted) setShellWidthPx(null);
  }, [mounted]);

  const menuMinWidthPx = (() => {
    if (shrinkInCluster) return null;
    const parts = [minWidthPx, shellWidthPx].filter(
      (n): n is number => n != null && n > 0,
    );
    if (parts.length === 0) return null;
    return Math.max(...parts);
  })();

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPresenting(true);
      return;
    }
    if (!mounted) return;
    setPresenting(false);
    const timer = setTimeout(() => setMounted(false), flyoutExitMs());
    return () => clearTimeout(timer);
  }, [open, mounted]);

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

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuEl?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, selectedIndex, menuEl, close]);

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

  const menuSide = displayPos?.side === "top" ? "top" : "bottom";

  const listbox =
    mounted && typeof document !== "undefined" && normalized.length > 0
      ? createPortal(
          <div
            ref={setMenuEl}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            aria-hidden={!presenting}
            {...(!presenting ? { inert: true } : {})}
            data-side={menuSide}
            data-state={presenting ? "open" : "closing"}
            className={join(
              "fynns-select-menu",
              mergeScrollSurfaceClass("fynns-select-list"),
            )}
            style={
              displayPos
                ? ({
                    top: displayPos.top,
                    left: displayPos.left,
                    /* Floor = max(option-measure, live shell width) so a
                     * stretched FieldBlock does not spawn a short-label
                     * floating chip under the trigger (≥ **0.5.220**). Long
                     * labels still grow past a narrow trigger via CSS
                     * `width: max-content`. */
                    ...(menuMinWidthPx != null
                      ? { minWidth: `${menuMinWidthPx}px` }
                      : null),
                    ...(displayPos.maxWidth
                      ? { maxWidth: `${displayPos.maxWidth}px` }
                      : null),
                  } as CSSProperties)
                : undefined
            }
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
                  tabIndex={presenting ? undefined : -1}
                  className={join(
                    "fynns-search-bar-result",
                    "fynns-select-option",
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={join(
        "fynns-select",
        "fynns-search-bar",
        open && "fynns-select--open",
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
                /* Floor for closed trigger + open shell. Absolute px — CSS must
                 * not wrap with `min(100%, …)` (crushes under Grid max-content). */
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
      <div ref={shellRef} className="fynns-search-bar-field fynns-select-shell">
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
      {listbox}
    </div>
  );
}
