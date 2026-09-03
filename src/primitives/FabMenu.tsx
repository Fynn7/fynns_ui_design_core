import type {
  ButtonHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Fab, type FabVariant } from "./Fab";
import { useFloatingBoxPosition, type Side } from "./floatingBox";
import { CloseIcon, PlusIcon } from "./icons";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Matches `--fynns-duration-base`. */
const FABMENU_ITEM_MS = 240;
/** Matches `--fynns-fabmenu-stagger-exit` (exit unmount budget). */
const FABMENU_STAGGER_EXIT_MS = 25;
const FABMENU_MAX_ITEMS = 6;
/** Matches `--fynns-fabmenu-gap` at 16px rem (`0.75rem`). */
const FABMENU_GAP_PX = 12;
/** FabMenu stays a vertical M3 stack — never left/right of the toggle. */
const FABMENU_SIDES: Side[] = ["top", "bottom"];

function fabMenuExitMs(itemCount: number): number {
  const n = Math.max(1, Math.min(itemCount, FABMENU_MAX_ITEMS));
  return FABMENU_ITEM_MS + FABMENU_STAGGER_EXIT_MS * (n - 1);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function menuItemButtons(root: HTMLElement | null): HTMLButtonElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
  );
}

export type FabMenuItemProps = {
  /** Leading glyph inside the small FAB. */
  icon: ReactNode;
  /** Visible label chip + accessible name for the item FAB. */
  label: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
  className?: string;
  /**
   * Color role for the small FAB. Defaults to the menu’s `itemVariant`
   * (usually `secondary` for contrast against a primary toggle).
   */
  variant?: FabVariant;
};

/**
 * One FAB menu row: label chip + small FAB.
 * Use only as a child of `FabMenu`.
 */
export function FabMenuItem({
  icon,
  label,
  onClick,
  disabled = false,
  className,
  variant = "secondary",
}: FabMenuItemProps) {
  return (
    <div className={join("fynns-fab-menu-item", className)} role="none">
      <span className="fynns-fab-menu-item-label" aria-hidden>
        {label}
      </span>
      <Fab
        size="sm"
        variant={variant}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        role="menuitem"
        tabIndex={-1}
        className="fynns-fab-menu-item-fab"
      >
        {icon}
      </Fab>
    </div>
  );
}

export type FabMenuProps = {
  children: ReactNode;
  /** Accessible name for the toggle when collapsed. */
  ariaLabel: string;
  /** Accessible name for the toggle when expanded. Default `"Close"`. */
  closeAriaLabel?: string;
  /** Toggle glyph when collapsed. Default `PlusIcon`. */
  icon?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Toggle FAB color role. Default `primary`. */
  variant?: FabVariant;
  /** Default color role for item FABs. Default `secondary`. */
  itemVariant?: FabVariant;
  /** Horizontal alignment of the item stack. Default `end`. */
  align?: "start" | "end";
  disabled?: boolean;
  className?: string;
  /** Collapse after an item is activated. Default `true`. */
  closeOnSelect?: boolean;
};

/**
 * M3 Expressive FAB menu — toggle FAB expands a short stack of labeled
 * secondary actions above it (typically 2–6). Items portal to `document.body`
 * so overflow ancestors (e.g. Collapsible) cannot clip them. Enter/exit uses
 * staggered fade+scale (presence lifecycle); Esc / outside click dismiss.
 * @see https://m3.material.io/components/fab-menu/overview
 */
export function FabMenu({
  children,
  ariaLabel,
  closeAriaLabel = "Close",
  icon,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  variant = "primary",
  itemVariant = "secondary",
  align = "end",
  disabled = false,
  className,
  closeOnSelect = true,
}: FabMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const wasExpandedRef = useRef(expandedProp ?? defaultExpanded);
  const [itemsEl, setItemsEl] = useState<HTMLDivElement | null>(null);
  const menuId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const controlled = expandedProp !== undefined;
  const expanded = controlled ? expandedProp : uncontrolled;

  const itemCount = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === FabMenuItem,
  ).length;

  const [rendered, setRendered] = useState(expanded);
  const [entered, setEntered] = useState(false);

  const setExpanded = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  useEffect(() => {
    if (expanded) {
      setRendered(true);
      return;
    }
    setEntered(false);
    const delay = prefersReducedMotion() ? 0 : fabMenuExitMs(itemCount);
    const timer = setTimeout(() => setRendered(false), delay);
    return () => clearTimeout(timer);
  }, [expanded, itemCount]);

  const pos = useFloatingBoxPosition(
    toggleRef.current,
    itemsEl,
    rendered,
    {
      side: "top",
      align,
      offset: FABMENU_GAP_PX,
      anchorMode: "element",
      // M3 FAB stack stays vertical; never park left/right of the toggle.
      sides: FABMENU_SIDES,
      // Wait for measured height before flipping (old useFabMenuBox guard).
      estimateWhenUnmeasured: false,
    },
  );

  // Wait until the portal is measured/positioned, then paint `closed` for a
  // frame and flip to `open` so the enter animation starts from opacity 0 —
  // never mount as `closing` (that keyframe begins at opacity 1 → flash).
  useEffect(() => {
    if (!expanded || !rendered || !pos) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [expanded, rendered, pos]);

  const dataState = entered ? "open" : expanded ? "closed" : "closing";

  useEffect(() => {
    if (entered && expanded) {
      const first = menuItemButtons(itemsRef.current)[0];
      first?.focus();
    }
  }, [entered, expanded]);

  useEffect(() => {
    if (wasExpandedRef.current && !expanded) {
      toggleRef.current?.focus();
    }
    wasExpandedRef.current = expanded;
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (itemsRef.current?.contains(target)) return;
      setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, controlled, onExpandedChange]);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const buttons = menuItemButtons(itemsRef.current);
    if (buttons.length === 0) return;
    const current = document.activeElement;
    const index = buttons.findIndex((btn) => btn === current);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[(index + 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      buttons[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setExpanded(false);
    }
  };

  const onToggleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!expanded && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      setExpanded(true);
    }
  };

  const items = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== FabMenuItem) return child;
    const item = child as ReactElement<FabMenuItemProps>;
    const itemVariantResolved = item.props.variant ?? itemVariant;
    return cloneElement(item, {
      variant: itemVariantResolved,
      onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
        item.props.onClick?.(event);
        if (!event.defaultPrevented && closeOnSelect) setExpanded(false);
      },
    });
  });

  const defaultPlus = !icon;
  const menu =
    rendered && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={(node) => {
              itemsRef.current = node;
              setItemsEl(node);
            }}
            id={menuId}
            className={join(
              "fynns-fab-menu-items",
              `fynns-fab-menu-items--align-${align}`,
            )}
            role="menu"
            aria-label={ariaLabel}
            data-state={dataState}
            aria-hidden={!expanded}
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            style={
              pos
                ? { position: "fixed", top: pos.top, left: pos.left }
                : { position: "fixed", top: 0, left: 0, visibility: "hidden" }
            }
          >
            {items}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={join(
        "fynns-fab-menu",
        `fynns-fab-menu--align-${align}`,
        className,
      )}
      data-expanded={expanded ? "true" : "false"}
    >
      {menu}
      <Fab
        ref={toggleRef}
        variant={variant}
        disabled={disabled}
        aria-label={expanded ? closeAriaLabel : ariaLabel}
        aria-expanded={expanded}
        aria-haspopup="menu"
        aria-controls={rendered ? menuId : undefined}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={onToggleKeyDown}
        className="fynns-fab-menu-toggle"
      >
        <span
          className="fynns-fab-menu-toggle-icon"
          data-expanded={expanded ? "true" : "false"}
          data-morph={defaultPlus ? "plus" : "swap"}
        >
          {defaultPlus ? (
            <PlusIcon />
          ) : expanded ? (
            <CloseIcon />
          ) : (
            icon
          )}
        </span>
      </Fab>
    </div>
  );
}
