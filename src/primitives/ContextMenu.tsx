import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { MenuSurface } from "./DropdownMenu";
import { resolveFloatingBox, type FloatingBoxPosition } from "./floatingBox";

export type ContextMenuProps = {
  /** Controlled open state. Parent owns open / x / y — no document listener required. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Client X where the menu should appear. */
  x: number;
  /** Client Y where the menu should appear. */
  y: number;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

/**
 * Controlled context menu at client coordinates. Reuses `DropdownMenuItem` /
 * Group / CheckboxItem / Separator via shared `MenuSurface` + MenuContext.
 * Escape and outside-click dismiss; arrow keys page items.
 */
export function ContextMenu({
  open,
  onOpenChange,
  x,
  y,
  children,
  ariaLabel = "Context menu",
  className,
}: ContextMenuProps) {
  const menuId = useId();
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Pick<FloatingBoxPosition, "left" | "top" | "side">>({ left: x, top: y, side: "bottom" });
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useLayoutEffect(() => {
    if (open) {
      const active = document.activeElement;
      if (active instanceof HTMLElement) restoreFocusRef.current = active;
      return;
    }
    const prev = restoreFocusRef.current;
    restoreFocusRef.current = null;
    // A callback may already have focused a rename/confirmation dialog.
    if (prev && document.contains(prev) &&
      (document.activeElement === document.body || document.getElementById(menuId)?.contains(document.activeElement))) {
      prev.focus();
    }
  }, [open, x, y, menuId]);

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const point = new DOMRect(x, y, 0, 0);
      const box = resolveFloatingBox(point, menuEl?.getBoundingClientRect() ?? null, {
        side: "bottom", align: "start", offset: 0, sides: ["bottom", "top"],
      });
      setPos({ left: box.left, top: box.top, side: box.side });
    };
    sync();
    const observer = new ResizeObserver(sync);
    if (menuEl) observer.observe(menuEl);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [open, x, y, menuEl]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuEl?.contains(event.target as Node)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, menuEl, close]);

  return (
    <MenuSurface
      open={open}
      onClose={close}
      id={menuId}
      ariaLabel={ariaLabel}
      className={className}
      dataSide={pos.side}
      onPanelElement={setMenuEl}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </MenuSurface>
  );
}

export type ContextMenuTriggerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  /** Receives client coordinates from the contextmenu event. */
  onPositionChange: (x: number, y: number) => void;
};

/**
 * Wraps children and opens a controlled `ContextMenu` on right-click
 * (`preventDefault` + position).
 */
export function ContextMenuTrigger({
  children,
  onOpenChange,
  onPositionChange,
  onContextMenu,
  className,
  ...rest
}: ContextMenuTriggerProps) {
  return (
    <div
      {...rest}
      className={["fynns-context-menu-trigger", className].filter(Boolean).join(" ")}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onPositionChange(event.clientX, event.clientY);
        onOpenChange(true);
      }}
    >
      {children}
    </div>
  );
}
