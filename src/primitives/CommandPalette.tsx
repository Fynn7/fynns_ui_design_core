import type {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { DialogFrame } from "./Dialog";
import { SearchIcon } from "./icons";

export type CommandPaletteItem = {
  /** Stable id — used for `aria-activedescendant` and keys. */
  id: string;
  label: string;
  /** Optional secondary line under the label. */
  description?: string;
  /** Section heading when consecutive items share a group. */
  group?: string;
  icon?: ReactNode;
  /** Display-only accelerator (e.g. `⌘K` / `Ctrl+S`). Not wired by core. */
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandPaletteItem[];
  /**
   * Controlled filter text. When omitted, the palette keeps an internal draft
   * that resets when `open` becomes true.
   */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Search field placeholder. @default "Type a command…" */
  placeholder?: string;
  /** Empty-filter copy. @default "No results" */
  emptyLabel?: string;
  /** Dialog accessible name. @default "Command palette" */
  label?: string;
  /** Close after a successful select. @default true */
  closeOnSelect?: boolean;
  className?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function itemMatches(item: CommandPaletteItem, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const hay = `${item.label} ${item.description ?? ""} ${item.group ?? ""}`.toLowerCase();
  return hay.includes(q);
}

/** Cursor-style split key chips (`Ctrl Shift R` → three kbds). */
function CommandShortcut({ shortcut }: { shortcut: string }) {
  const keys = shortcut.trim().split(/\s+/u).filter(Boolean);
  if (keys.length === 0) return null;
  return (
    <span className="fynns-command-shortcuts" aria-hidden>
      {keys.map((key) => (
        <kbd key={key} className="fynns-command-shortcut">
          {key}
        </kbd>
      ))}
    </span>
  );
}

/**
 * Spotlight-style command palette (⌘K / Ctrl+K host). Modal filter + keyboard
 * list — not a DropdownMenu, not a SearchBar alone. Apps own the global
 * accelerator; pass `open` / `onOpenChange`.
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  query: queryProp,
  onQueryChange,
  placeholder = "Type a command…",
  emptyLabel = "No results",
  label = "Command palette",
  closeOnSelect = true,
  className,
}: CommandPaletteProps) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const controlled = queryProp !== undefined;
  const query = controlled ? queryProp : draft;

  useEffect(() => {
    if (!open) return;
    if (!controlled) setDraft("");
    setActiveIndex(0);
    // DialogFrame focuses the first focusable; re-assert after paint.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, controlled]);

  const filtered = useMemo(
    () => items.filter((item) => itemMatches(item, query)),
    [items, query],
  );

  const enabledIndexes = useMemo(
    () =>
      filtered
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0),
    [filtered],
  );

  useEffect(() => {
    setActiveIndex((prev) => {
      if (enabledIndexes.length === 0) return 0;
      if (enabledIndexes.includes(prev)) return prev;
      return enabledIndexes[0] ?? 0;
    });
  }, [enabledIndexes, query]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, filtered]);

  const setQuery = (next: string) => {
    if (!controlled) setDraft(next);
    onQueryChange?.(next);
  };

  const close = () => onOpenChange(false);

  const runSelect = (item: CommandPaletteItem | undefined) => {
    if (!item || item.disabled) return;
    item.onSelect?.();
    if (closeOnSelect) close();
  };

  const moveActive = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(activeIndex);
    const start = pos < 0 ? (dir === 1 ? -1 : 0) : pos;
    const nextPos =
      (start + dir + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPos] ?? enabledIndexes[0] ?? 0);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === "Home" && enabledIndexes.length > 0) {
      event.preventDefault();
      setActiveIndex(enabledIndexes[0] ?? 0);
      return;
    }
    if (event.key === "End" && enabledIndexes.length > 0) {
      event.preventDefault();
      setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runSelect(filtered[activeIndex]);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const activeId =
    filtered[activeIndex] != null
      ? `${reactId}-opt-${filtered[activeIndex].id}`
      : undefined;

  let lastGroup: string | undefined;

  return (
    <DialogFrame
      open={open}
      onClose={close}
      variant="centered"
      ariaLabel={label}
      panelClassName={join("fynns-command-palette", className)}
    >
      <div className="fynns-command-palette-search">
        <span className="fynns-command-palette-search-icon" aria-hidden>
          <SearchIcon size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={true}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-label={label}
          className="fynns-command-palette-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={label}
        className="fynns-command-palette-list fynns-scroll"
      >
        {filtered.length === 0 ? (
          <p className="fynns-command-palette-empty">{emptyLabel}</p>
        ) : (
          filtered.map((item, index) => {
            const showGroup =
              item.group != null &&
              item.group !== "" &&
              item.group !== lastGroup;
            if (showGroup) lastGroup = item.group;
            const optionId = `${reactId}-opt-${item.id}`;
            const selected = index === activeIndex;
            return (
              <Fragment key={item.id}>
                {showGroup ? (
                  <div className="fynns-command-palette-group" role="presentation">
                    {item.group}
                  </div>
                ) : null}
                <button
                  type="button"
                  id={optionId}
                  role="option"
                  data-command-index={index}
                  data-has-description={item.description ? "" : undefined}
                  aria-selected={selected}
                  disabled={item.disabled}
                  className={join(
                    "fynns-command-item",
                    selected && "fynns-command-item--active",
                    !!item.description && "fynns-command-item--described",
                  )}
                  onMouseEnter={() => {
                    if (!item.disabled) setActiveIndex(index);
                  }}
                  onClick={() => runSelect(item)}
                >
                  {item.icon != null ? (
                    <span className="fynns-command-item-icon" aria-hidden>
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="fynns-command-item-text">
                    <span className="fynns-command-item-label">{item.label}</span>
                    {item.description ? (
                      <span className="fynns-command-item-description">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {item.shortcut ? <CommandShortcut shortcut={item.shortcut} /> : null}
                </button>
              </Fragment>
            );
          })
        )}
      </div>
    </DialogFrame>
  );
}
