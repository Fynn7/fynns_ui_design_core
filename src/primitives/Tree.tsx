import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ChevronRightIcon, ICON_SIZE } from "./icons";

const TREE_TOGGLE_EVENT = "fynns-tree-toggle";

type TreeContextValue = {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  rootRef: RefObject<HTMLDivElement | null>;
};

type TreeItemNestContextValue = {
  depth: number;
};

const TreeContext = createContext<TreeContextValue | null>(null);
const TreeItemNestContext = createContext<TreeItemNestContextValue>({
  depth: 0,
});

function useTreeContext(component: string): TreeContextValue {
  const ctx = useContext(TreeContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside <Tree>`);
  }
  return ctx;
}

function visibleTreeItems(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('[role="treeitem"]'),
  ).filter((el) => {
    if (
      (el as HTMLButtonElement).disabled ||
      el.getAttribute("aria-disabled") === "true"
    ) {
      return false;
    }
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== root) {
      if (
        node.classList.contains("fynns-expand") &&
        node.getAttribute("data-state") === "closed"
      ) {
        return false;
      }
      if (node.hasAttribute("inert")) return false;
      node = node.parentElement;
    }
    return true;
  });
}

export type TreeProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Accessible name for the tree (`aria-label`). Prefer over a visible
   * caption unless the host already provides a labelled section.
   */
  label: string;
  /** Controlled selection id. */
  selectedId?: string | null;
  /** Uncontrolled initial selection. */
  defaultSelectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** `TreeItem` children (may nest). */
  children: ReactNode;
};

/**
 * Hierarchical file / settings tree (WAI-ARIA `tree`). Dense single-line
 * rows with indent + chevron disclose — **not** `NavigationDrawer` destinations
 * and **not** expandable catalog `List` / `ListItem` `detail` (session trees).
 *
 * Keyboard: ↑/↓ move among visible items; → expand / enter child; ← collapse /
 * leave to parent; Home/End; Enter/Space select. Branch **row** click selects
 * and toggles expand (not chevron-only). Leaves select only.
 */
export function Tree({
  label,
  selectedId: selectedIdProp,
  defaultSelectedId = null,
  onSelectedChange,
  children,
  className,
  onKeyDown,
  ...rest
}: TreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState<string | null>(
    defaultSelectedId,
  );
  const controlled = selectedIdProp !== undefined;
  const selectedId = controlled ? (selectedIdProp ?? null) : uncontrolled;

  const setSelectedId = useCallback(
    (id: string) => {
      if (!controlled) setUncontrolled(id);
      onSelectedChange?.(id);
    },
    [controlled, onSelectedChange],
  );

  const ctx = useMemo<TreeContextValue>(
    () => ({ selectedId, setSelectedId, rootRef }),
    [selectedId, setSelectedId],
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const root = rootRef.current;
    if (!root) return;
    const items = visibleTreeItems(root);
    if (items.length === 0) return;
    const active = document.activeElement;
    const idx = items.findIndex((el) => el === active || el.contains(active));
    if (idx < 0) return;

    const current = items[idx]!;
    const move = (nextIdx: number) => {
      e.preventDefault();
      items[nextIdx]?.focus();
    };
    const toggle = () => {
      e.preventDefault();
      current.dispatchEvent(new Event(TREE_TOGGLE_EVENT));
    };

    switch (e.key) {
      case "ArrowDown":
        if (idx < items.length - 1) move(idx + 1);
        break;
      case "ArrowUp":
        if (idx > 0) move(idx - 1);
        break;
      case "Home":
        move(0);
        break;
      case "End":
        move(items.length - 1);
        break;
      case "ArrowRight": {
        const expanded = current.getAttribute("aria-expanded");
        if (expanded === "false") {
          toggle();
        } else if (expanded === "true") {
          const next = items[idx + 1];
          if (
            next &&
            Number(next.dataset.depth) > Number(current.dataset.depth)
          ) {
            move(idx + 1);
          }
        }
        break;
      }
      case "ArrowLeft": {
        const expanded = current.getAttribute("aria-expanded");
        if (expanded === "true") {
          toggle();
        } else {
          const parentDepth = Number(current.dataset.depth) - 1;
          if (parentDepth < 0) break;
          for (let i = idx - 1; i >= 0; i -= 1) {
            if (Number(items[i]!.dataset.depth) === parentDepth) {
              move(i);
              break;
            }
          }
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <TreeContext.Provider value={ctx}>
      <div
        {...rest}
        ref={rootRef}
        role="tree"
        aria-label={label}
        className={["fynns-tree", className ?? ""].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </TreeContext.Provider>
  );
}

export type TreeItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "id" | "children"
> & {
  /** Stable id used for selection. */
  id: string;
  /** Visible row label. */
  label: string;
  /** Optional leading glyph (folder / file / …). */
  icon?: ReactNode;
  /** Nested `TreeItem`s — presence enables the disclose chevron. */
  children?: ReactNode;
  /** Controlled expand. */
  expanded?: boolean;
  /** Uncontrolled initial expand. Default `false`. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Optional end actions (ghost IconButtons). */
  trailing?: ReactNode;
};

/**
 * One node in a `Tree`. Nest children for folders; leaves omit `children`.
 */
export function TreeItem({
  id,
  label,
  icon,
  children,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  trailing,
  disabled = false,
  className,
  onClick,
  onKeyDown,
  ...rest
}: TreeItemProps) {
  const tree = useTreeContext("TreeItem");
  const nest = useContext(TreeItemNestContext);
  const bodyId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const hasChildren = children != null && children !== false;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultExpanded);
  const controlled = expandedProp !== undefined;
  const isOpen = hasChildren
    ? controlled
      ? Boolean(expandedProp)
      : uncontrolledOpen
    : false;
  const selected = tree.selectedId === id;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!hasChildren) return;
      if (!controlled) setUncontrolledOpen(next);
      onExpandedChange?.(next);
    },
    [controlled, hasChildren, onExpandedChange],
  );

  const toggleOpen = useCallback(() => {
    if (disabled || !hasChildren) return;
    setOpen(!isOpen);
  }, [disabled, hasChildren, isOpen, setOpen]);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || !hasChildren) return;
    const handler = () => toggleOpen();
    el.addEventListener(TREE_TOGGLE_EVENT, handler);
    return () => el.removeEventListener(TREE_TOGGLE_EVENT, handler);
  }, [hasChildren, toggleOpen]);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    tree.setSelectedId(id);
    if (hasChildren) toggleOpen();
    onClick?.(e);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tree.setSelectedId(id);
    }
  };

  const rowClass = [
    "fynns-tree-item",
    selected ? "fynns-tree-item--selected" : "",
    disabled ? "fynns-tree-item--disabled" : "",
    hasChildren ? "fynns-tree-item--branch" : "fynns-tree-item--leaf",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const padInlineStart = `calc(var(--fynns-tree-pad-inline) + var(--fynns-tree-indent) * ${nest.depth})`;

  const row = (
    <div className="fynns-tree-item-host">
      <button
        {...rest}
        ref={btnRef}
        type="button"
        role="treeitem"
        id={id}
        data-depth={nest.depth}
        className={rowClass}
        style={{ paddingInlineStart: padInlineStart }}
        disabled={disabled}
        tabIndex={selected ? 0 : -1}
        aria-selected={selected}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-owns={hasChildren ? bodyId : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {hasChildren ? (
          <span
            className={[
              "fynns-tree-item-chevron",
              isOpen ? "fynns-tree-item-chevron--open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-fynns-tree-chevron
            aria-hidden
          >
            <ChevronRightIcon size={ICON_SIZE} />
          </span>
        ) : (
          <span
            className="fynns-tree-item-chevron fynns-tree-item-chevron--spacer"
            aria-hidden
          />
        )}
        {icon != null ? (
          <span className="fynns-tree-item-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="fynns-tree-item-label">{label}</span>
      </button>
      {trailing != null ? (
        <span className="fynns-tree-item-trailing">{trailing}</span>
      ) : null}
    </div>
  );

  if (!hasChildren) return row;

  return (
    <div className="fynns-tree-branch">
      {row}
      <div
        className="fynns-expand"
        data-state={isOpen ? "open" : "closed"}
        aria-hidden={!isOpen}
      >
        <div className="fynns-expand-inner">
          <div
            id={bodyId}
            className="fynns-tree-group"
            role="group"
            inert={isOpen ? undefined : true}
          >
            <TreeItemNestContext.Provider value={{ depth: nest.depth + 1 }}>
              {children}
            </TreeItemNestContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
