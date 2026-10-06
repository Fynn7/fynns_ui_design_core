import { useEffect, useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { ContextMenu } from "./ContextMenu";
import { DropdownMenu } from "./DropdownMenu";
import { MoreHorizontalIcon } from "./icons";
import { Tooltip } from "./Tooltip";
import { useListSelection, type ListSelection, type UseListSelectionOptions } from "./useListSelection";

export type SelectionMenuContext = {
  trigger: "context" | "more";
  /** The row that opened the menu, or null for the area / toolbar. */
  targetId: string | null;
  /** Exact action targets, in dataset order. A menu opening captures this snapshot. */
  selectedIds: readonly string[];
  kind: "item" | "selection" | "area";
  allSelected: boolean;
};

export type SelectionAreaState = ListSelection & {
  /** Spread onto the actual list host; no extra DOM wrapper is introduced. */
  areaProps: HTMLAttributes<HTMLElement> & { "data-fynns-selection-scope": string };
  /** Spread onto the row control, keeping its existing click / activation callback. */
  getItemProps: (id: string) => {
    "data-fynns-selection-id": string;
    "data-fynns-selected": "" | undefined;
    "aria-pressed": boolean;
  };
  /** Core-owned More + Tooltip. null targets the area / toolbar. */
  menuTrigger: (id: string | null) => ReactNode;
  closeMenu: () => void;
};

export type SelectionAreaProps = UseListSelectionOptions & {
  label: string;
  menuLabel?: string;
  moreLabel?: string;
  disabled?: boolean;
  /** Return core DropdownMenuItem / Separator etc.; null suppresses that menu. */
  renderMenu?: (context: SelectionMenuContext) => ReactNode;
  children: (selection: SelectionAreaState) => ReactNode;
};

type Flyout = {
  mode: "context" | "more";
  context: SelectionMenuContext;
  x: number;
  y: number;
};

function editable(target: Element) {
  return Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
}

/**
 * Selection / context-menu controller without a layout wrapper. Works with List,
 * NavigationDrawer.bodyProps and nested groups. Only the focused scope handles shortcuts.
 */
export function SelectionArea({
  label, menuLabel = label, moreLabel = menuLabel, disabled = false, renderMenu, children,
  ...options
}: SelectionAreaProps) {
  const scopeId = useId();
  const selection = useListSelection(options);
  const [flyout, setFlyout] = useState<Flyout | null>(null);
  const [lastContext, setLastContext] = useState<SelectionMenuContext | null>(null);
  const closeMenu = () => setFlyout(null);
  const validMenu = Boolean(flyout && !disabled &&
    (flyout.context.targetId == null || selection.isSelectable(flyout.context.targetId)) &&
    flyout.context.selectedIds.every(selection.isSelectable));

  useEffect(() => {
    if (!validMenu) setFlyout(null);
  }, [validMenu]);
  useEffect(() => { setFlyout(null); }, [options.resetKey]);

  const menuContext = (id: string | null, trigger: Flyout["mode"]): SelectionMenuContext => {
    let ids = [...selection.selectedIds];
    const retained = id == null || selection.isSelected(id);
    if (id != null && !retained) ids = selection.selectOnly(id);
    const bulk = retained && selection.multiple;
    return {
      trigger,
      targetId: id,
      selectedIds: id == null && !bulk ? [] : ids,
      kind: bulk ? "selection" : id == null ? "area" : "item",
      allSelected: retained && selection.allSelected,
    };
  };
  const openMenu = (id: string | null, mode: Flyout["mode"], x = 0, y = 0) => {
    if (disabled || !renderMenu || (id != null && !selection.isSelectable(id))) {
      closeMenu();
      return;
    }
    const context = menuContext(id, mode);
    setLastContext(context);
    setFlyout({ mode, context, x, y });
  };
  const belongs = (target: Element, root: HTMLElement) =>
    target.closest("[data-fynns-selection-scope]") === root;
  const rowFor = (target: Element, root: HTMLElement) => {
    const row = target.closest<HTMLElement>("[data-fynns-selection-id]") ??
      target.closest(".fynns-nav-drawer-item-host, .fynns-list-item-host")
        ?.querySelector<HTMLElement>("[data-fynns-selection-id]");
    const control = row?.matches("button, [role=button]") ? row :
      row?.closest(".fynns-nav-drawer-item-host, .fynns-list-item-host")
        ?.querySelector<HTMLElement>("button[data-fynns-selection-id], [role=button][data-fynns-selection-id]") ?? row;
    return control && root.contains(control) ? control : null;
  };
  const areaProps: SelectionAreaState["areaProps"] = {
    "data-fynns-selection-scope": scopeId,
    role: "group", "aria-label": label, tabIndex: 0,
    onClickCapture: (event) => {
      const target = event.target as Element;
      if (disabled || event.defaultPrevented || !belongs(target, event.currentTarget) || editable(target)) return;
      const row = rowFor(target, event.currentTarget);
      const id = row?.getAttribute("data-fynns-selection-id");
      if (!row || id == null || !selection.isSelectable(id)) return;
      // Nested controls / trailing More own their click, never activate the row.
      const control = target.closest("button, a, input, [role=button]");
      if (control && control !== row) return;
      closeMenu();
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        event.preventDefault(); event.stopPropagation();
        if (event.shiftKey) selection.selectRange(id, event.ctrlKey || event.metaKey);
        else selection.toggle(id);
      } else selection.selectOnly(id);
    },
    onContextMenu: (event) => {
      const target = event.target as Element;
      if (!belongs(target, event.currentTarget) || editable(target)) return;
      event.preventDefault(); event.stopPropagation();
      const row = rowFor(target, event.currentTarget);
      const id = row?.getAttribute("data-fynns-selection-id");
      if (id != null && row) {
        row.focus();
        openMenu(id, "context", event.clientX, event.clientY);
      } else if (target === event.currentTarget) {
        event.currentTarget.focus();
        openMenu(null, "context", event.clientX, event.clientY);
      } else closeMenu();
    },
    onKeyDown: (event) => {
      const target = event.target as Element;
      if (disabled || event.defaultPrevented || !belongs(target, event.currentTarget) || editable(target)) return;
      const row = rowFor(target, event.currentTarget);
      const id = row?.getAttribute("data-fynns-selection-id");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a" && !event.altKey) {
        event.preventDefault(); event.stopPropagation(); closeMenu(); selection.selectAll();
      } else if (id != null && (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) {
        event.preventDefault(); event.stopPropagation();
        const rect = row!.getBoundingClientRect();
        openMenu(id, "context", rect.left, rect.bottom);
      } else if (id != null && (event.ctrlKey || event.metaKey) && event.key === " ") {
        event.preventDefault(); event.stopPropagation(); closeMenu(); selection.toggle(id);
      } else if (event.key === "Escape" && selection.selectedIds.length) {
        event.preventDefault(); event.stopPropagation(); closeMenu(); selection.clear();
      }
    },
  };
  const content = (context: SelectionMenuContext | null) => context ? renderMenu?.(context) : null;
  const renderedMenu = content(flyout?.context ?? lastContext);

  return <>
    {children({
      ...selection, areaProps, closeMenu,
      getItemProps: (id) => ({
        "data-fynns-selection-id": id,
        "data-fynns-selected": selection.isSelected(id) ? "" : undefined,
        "aria-pressed": selection.isSelected(id),
      }),
      menuTrigger: (id) => {
        const bulk = selection.multiple && (id == null || selection.isSelected(id));
        const preview: SelectionMenuContext = {
          trigger: "more", targetId: id, kind: bulk ? "selection" : id == null ? "area" : "item",
          selectedIds: bulk ? selection.selectedIds : id == null ? [] : [id], allSelected: selection.allSelected,
        };
        if (!renderMenu || !content(preview)) return null;
        return <Tooltip content={moreLabel}>
          <span data-fynns-selection-id={id ?? undefined}>
            <DropdownMenu trigger={<MoreHorizontalIcon />} iconOnly size="sm" variant="ghost"
              align="end" ariaLabel={moreLabel} disabled={disabled || (id != null && !selection.isSelectable(id))}
              open={Boolean(validMenu && renderedMenu && flyout?.mode === "more" && flyout.context.targetId === id)}
              onOpenChange={(next) => {
                if (next) openMenu(id, "more");
                else setFlyout((prev) => prev?.mode === "more" && prev.context.targetId === id ? null : prev);
              }}>
              {flyout?.context.targetId === id ? renderedMenu : content(preview)}
            </DropdownMenu>
          </span>
        </Tooltip>;
      },
    })}
    <ContextMenu open={Boolean(validMenu && renderedMenu && flyout?.mode === "context")}
      x={flyout?.x ?? 0} y={flyout?.y ?? 0} ariaLabel={menuLabel}
      onOpenChange={(next) => { if (!next) setFlyout((prev) => prev?.mode === "context" ? null : prev); }}>
      {renderedMenu}
    </ContextMenu>
  </>;
}
