import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
} from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Headless combobox: search input + keyboard-navigable list. Owns the input,
 * active index + arrow navigation, aria wiring, Enter-to-pick, and scroll-into-
 * view of the active row. Visuals come from caller-provided `classes`, so the
 * home search and the command palette can share behavior while keeping framing.
 */
export type ComboboxRow<Item> = {
  item: Item;
  /** Stable key for React key + aria-activedescendant id. */
  key: string;
};

export type ComboboxRenderRowArgs<Item> = {
  row: ComboboxRow<Item>;
  index: number;
  active: boolean;
  id: string;
  query: string;
  onClick: () => void;
  onMouseEnter: () => void;
};

export type ComboboxClasses = {
  root?: string;
  inputWrap?: string;
  input?: string;
  list?: string;
  empty?: string;
};

export type ComboboxHandle = {
  focusInput: () => void;
  resetQuery: () => void;
};

export type ComboboxProps<Item> = {
  query?: string;
  onQueryChange?: (next: string) => void;
  filter: (query: string) => ComboboxRow<Item>[];
  onPick: (item: Item, index: number) => void;
  renderRow: (args: ComboboxRenderRowArgs<Item>) => ReactNode;
  renderEmpty?: () => ReactNode;
  listVisible?: boolean;
  autoFocus?: boolean;
  open?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  classes?: ComboboxClasses;
  disabled?: boolean;
  onInputFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onInputBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  inputExtraProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "role" | "aria-expanded" | "aria-controls" | "aria-activedescendant"
  >;
  leadingSlot?: ReactNode;
  rowIdPrefix?: string;
};

function ComboboxInner<Item>(props: ComboboxProps<Item>, ref: Ref<ComboboxHandle>) {
  const {
    query: controlledQuery,
    onQueryChange,
    filter,
    onPick,
    renderRow,
    renderEmpty,
    listVisible = true,
    autoFocus = false,
    open,
    placeholder,
    ariaLabel,
    classes,
    disabled = false,
    onInputFocus,
    onInputBlur,
    inputExtraProps,
    leadingSlot,
    rowIdPrefix,
  } = props;

  const autoId = useId();
  const listId = `${autoId}-list`;
  const prefix = rowIdPrefix ?? autoId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery ?? internalQuery;
  const setQuery = useCallback(
    (next: string) => {
      if (onQueryChange) onQueryChange(next);
      else setInternalQuery(next);
    },
    [onQueryChange],
  );

  const filtered = useMemo(() => filter(query), [filter, query]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((i) => (filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1)));
  }, [filtered]);

  useEffect(() => {
    if (open === undefined) return;
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open, setQuery]);

  useEffect(() => {
    if (!autoFocus) return;
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, [autoFocus]);

  useImperativeHandle(
    ref,
    () => ({
      focusInput: () => inputRef.current?.focus(),
      resetQuery: () => {
        setQuery("");
        setActiveIndex(0);
      },
    }),
    [setQuery],
  );

  const activeRow = filtered[activeIndex];
  const activeOptionId = activeRow ? `${prefix}-opt-${activeRow.key}` : undefined;

  useLayoutEffect(() => {
    if (!listVisible || filtered.length === 0) return;
    const row = filtered[activeIndex];
    if (!row) return;
    const el = document.getElementById(`${prefix}-opt-${row.key}`);
    if (typeof el?.scrollIntoView === "function") el.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered, listVisible, prefix]);

  const pickAt = (index: number) => {
    const row = filtered[index];
    if (!row) return;
    onPick(row.item, index);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickAt(activeIndex);
    }
  };

  const preventMouseDownBlur = (e: MouseEvent) => e.preventDefault();

  return (
    <div className={classes?.root}>
      <div className={classes?.inputWrap}>
        {leadingSlot}
        <input
          {...inputExtraProps}
          ref={inputRef}
          type="search"
          value={query}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={listVisible && filtered.length > 0}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={listVisible ? activeOptionId : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          className={classes?.input}
        />
      </div>
      {listVisible ? (
        <div id={listId} role="listbox" aria-label={ariaLabel} className={classes?.list}>
          {filtered.length === 0
            ? renderEmpty
              ? renderEmpty()
              : null
            : filtered.map((row, index) => {
                const id = `${prefix}-opt-${row.key}`;
                const active = index === activeIndex;
                return (
                  <div
                    key={row.key}
                    id={id}
                    role="option"
                    aria-selected={active}
                    onMouseDown={preventMouseDownBlur}
                  >
                    {renderRow({
                      row,
                      index,
                      active,
                      id,
                      query,
                      onClick: () => pickAt(index),
                      onMouseEnter: () => setActiveIndex(index),
                    })}
                  </div>
                );
              })}
        </div>
      ) : null}
    </div>
  );
}

export const Combobox = forwardRef(ComboboxInner) as <Item>(
  props: ComboboxProps<Item> & { ref?: Ref<ComboboxHandle> },
) => ReturnType<typeof ComboboxInner<Item>>;
