import {
  forwardRef,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CloseIcon, SearchIcon } from "./icons";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";

export type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "children"
> & {
  /** Controlled query text. */
  value: string;
  onChange: (value: string) => void;
  /**
   * Called when the user submits search (Enter / IME search action).
   * Defaults to a no-op.
   */
  onSearch?: (value: string) => void;
  /** Leading control — defaults to a search glyph. Pass a back `IconButton` when expanded. */
  leading?: ReactNode;
  /** Trailing controls (avatar, filters, …). Clear is built in when `value` is non-empty. */
  trailing?: ReactNode;
  /**
   * Docked results open state. When omitted, the bar stays collapsed (input only).
   * Prefer controlled expand for suggestion panels.
   */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Accessible name for the search field (required when no visible label). */
  ariaLabel: string;
  /** Clear-button tooltip / aria-label. Default `"Clear"`. */
  clearAriaLabel?: string;
  /** Docked results body — shown under the bar when `expanded`. */
  children?: ReactNode;
  className?: string;
};

/**
 * M3 Search bar — elevated 56dp capsule for chrome search (not form fields).
 * Optional docked results via `expanded` + `children` merge into one shell
 * (Google-style). Expand/collapse animates via `.fynns-expand` (including
 * blur/Esc). Prefer `SearchInput` inside dense forms / toolbars.
 * @see https://m3.material.io/components/search/overview
 */
export const SearchBar = forwardRef(function SearchBar(
  {
    value,
    onChange,
    onSearch,
    leading,
    trailing,
    expanded,
    onExpandedChange,
    ariaLabel,
    clearAriaLabel = "Clear",
    children,
    className,
    placeholder,
    disabled,
    id,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
  }: SearchBarProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const resultsId = `${fieldId}-results`;
  const rootRef = useRef<HTMLDivElement>(null);
  const isExpanded = Boolean(expanded);
  const showClear = value.length > 0 && !disabled;

  const setExpanded = (next: boolean) => {
    onExpandedChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && isExpanded) {
      event.preventDefault();
      setExpanded(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch?.(value);
    }
  };

  const rootClass = [
    "fynns-search-bar",
    isExpanded ? "fynns-search-bar--expanded" : "",
    disabled ? "fynns-search-bar--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={rootClass}
      data-expanded={isExpanded ? "true" : undefined}
    >
      <div className="fynns-search-bar-field">
        <span className="fynns-search-bar-leading">
          {leading ?? <SearchIcon aria-hidden />}
        </span>
        <input
          {...rest}
          id={fieldId}
          ref={ref}
          type="search"
          role="searchbox"
          className="fynns-search-bar-input"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-expanded={onExpandedChange ? isExpanded : undefined}
          aria-controls={children != null ? resultsId : undefined}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            if (onExpandedChange && !isExpanded) setExpanded(true);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            if (onExpandedChange) setExpanded(true);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (!onExpandedChange || !rootRef.current) return;
            // relatedTarget is null when clicking non-focusable chrome; re-check
            // after the browser updates document.activeElement.
            const root = rootRef.current;
            const next = event.relatedTarget as Node | null;
            if (next && root.contains(next)) return;
            requestAnimationFrame(() => {
              if (!root.contains(document.activeElement)) {
                setExpanded(false);
              }
            });
          }}
          onKeyDown={handleKeyDown}
        />
        <span className="fynns-search-bar-trailing">
          {showClear ? (
            <Tooltip content={clearAriaLabel}>
              <IconButton
                type="button"
                aria-label={clearAriaLabel}
                disabled={disabled}
                onMouseDown={(event) => {
                  // Keep focus on the input / avoid blur-collapse before clear.
                  event.preventDefault();
                }}
                onClick={() => {
                  onChange("");
                  if (onExpandedChange) setExpanded(true);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          ) : null}
          {trailing}
        </span>
      </div>
      {children != null ? (
        <div
          className="fynns-expand fynns-search-bar-panel"
          data-state={isExpanded ? "open" : "closed"}
        >
          <div className="fynns-expand-inner">
            <div
              id={resultsId}
              className="fynns-search-bar-results fynns-scroll"
              role="group"
              aria-label={ariaLabel}
              aria-hidden={!isExpanded}
              inert={isExpanded ? undefined : true}
            >
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export type SearchBarResultProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Selected / highlighted result. */
  active?: boolean;
};

/** Single docked search suggestion row. */
export const SearchBarResult = forwardRef(function SearchBarResult(
  {
    active = false,
    className,
    type = "button",
    ...rest
  }: SearchBarResultProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={[
        "fynns-search-bar-result",
        active ? "fynns-search-bar-result--active" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
});
