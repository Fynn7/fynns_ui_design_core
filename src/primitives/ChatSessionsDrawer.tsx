import type { ReactNode } from "react";
import { BusyRegion } from "./Busy";
import { DropdownMenuItem, DropdownMenuSeparator } from "./DropdownMenu";
import { EmptyState } from "./EmptyState";
import { InlineAlert } from "./InlineAlert";
import {
  NavigationDrawer, NavigationDrawerItem, NavigationDrawerNewChat,
  type NavigationDrawerProps,
} from "./NavigationDrawer";
import { PencilIcon, PlusIcon, TrashIcon } from "./icons";
import { RevealMore } from "./RevealMore";
import { SelectionArea, type SelectionMenuContext } from "./SelectionArea";
import type { UseListSelectionOptions } from "./useListSelection";
import {
  useRevealMore, REVEAL_MORE_LIST_DEFAULT_INITIAL, REVEAL_MORE_LIST_DEFAULT_STEP,
  type UseRevealMoreOptions,
} from "./useRevealMore";

export type ChatSessionsDrawerSession = {
  /** Stable, unique session identity; display order is caller-owned. */
  id: string;
  /** Localized title, including any untitled fallback. */
  label: string;
  disabled?: boolean;
};

export type ChatSessionsDrawerLabels = {
  newChat: string;
  more: string;
  rename: string;
  delete: string;
  deleteAll: string;
  /** Required together with onDeleteSelected for the built-in bulk action. */
  deleteSelected?: string;
  sessionMenu: string;
  listMenu: string;
  emptyTitle: string;
  emptyDescription?: string;
  /** Accessible loading label only; never visible copy. */
  loading: string;
  revealMore: string;
};

export type ChatSessionsDrawerProps = Omit<NavigationDrawerProps, "children" | "onContextMenu" | "bodyProps"> & {
  sessions: readonly ChatSessionsDrawerSession[];
  activeSessionId?: string | null;
  labels: ChatSessionsDrawerLabels;
  busy?: boolean;
  error?: string | null;
  /** Pagination defaults to list density (5 / 5). Selection covers the full dataset. */
  reveal?: Omit<UseRevealMoreOptions, "total">;
  /** Selection is separate from the active conversation; optional controlled bindings. */
  selection?: Omit<UseListSelectionOptions, "items">;
  /** Overrides single / multiple / area menus with core menu items. */
  renderMenu?: (context: SelectionMenuContext) => ReactNode;
  onNewChat: () => void;
  onSelect: (sessionId: string) => void;
  /** Requests only: the consumer owns dialogs, confirmation and persistence. */
  onRename: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onDeleteAll: () => void;
  /** Bulk target snapshot; never confused with onDeleteAll. */
  onDeleteSelected?: (sessionIds: readonly string[]) => void;
};

/** Session-history drawer with scoped selection and shared context / More menus. */
export function ChatSessionsDrawer({
  sessions, activeSessionId, labels, busy = false, error, reveal, selection, renderMenu,
  onNewChat, onSelect, onRename, onDelete, onDeleteAll, onDeleteSelected,
  variant = "standard", open, onClose, ...drawerProps
}: ChatSessionsDrawerProps) {
  const listWindow = useRevealMore({
    initial: REVEAL_MORE_LIST_DEFAULT_INITIAL,
    step: REVEAL_MORE_LIST_DEFAULT_STEP,
    ...reveal,
    total: sessions.length,
  });
  const visible = sessions.slice(0, listWindow.visible);
  const unavailable = busy || Boolean(error);
  const menu = (context: SelectionMenuContext) => {
    if (renderMenu) return renderMenu(context);
    if (context.kind === "selection") {
      if (!onDeleteSelected || !labels.deleteSelected) return null;
      return <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={unavailable}
        onClick={() => onDeleteSelected(context.selectedIds)}>{labels.deleteSelected}</DropdownMenuItem>;
    }
    if (context.kind === "item" && context.targetId != null) {
      const id = context.targetId;
      return <>
        <DropdownMenuItem icon={<PencilIcon />} disabled={unavailable}
          onClick={() => onRename(id)}>{labels.rename}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={unavailable}
          onClick={() => onDelete(id)}>{labels.delete}</DropdownMenuItem>
      </>;
    }
    if (context.trigger === "more") return <DropdownMenuItem icon={<TrashIcon />} tone="danger"
      disabled={unavailable || sessions.length === 0} onClick={onDeleteAll}>{labels.deleteAll}</DropdownMenuItem>;
    return <>
      <DropdownMenuItem icon={<PlusIcon />} disabled={unavailable}
        onClick={onNewChat}>{labels.newChat}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={unavailable || sessions.length === 0}
        onClick={onDeleteAll}>{labels.deleteAll}</DropdownMenuItem>
    </>;
  };

  return <SelectionArea {...selection} items={sessions}
    label={labels.listMenu} menuLabel={labels.sessionMenu} moreLabel={labels.more}
    disabled={unavailable || (variant === "modal" && !open)} renderMenu={menu}>
    {(scope) => <NavigationDrawer {...drawerProps} variant={variant} open={open}
      bodyProps={scope.areaProps}
      onClose={() => { scope.closeMenu(); onClose?.(); }}>
      <NavigationDrawerNewChat label={labels.newChat} disabled={unavailable}
        onClick={() => { scope.closeMenu(); scope.clear(); onNewChat(); }}
        trailing={scope.menuTrigger(null)} />
      {busy ? <BusyRegion busy label={labels.loading} /> : error ?
        <InlineAlert severity="error" message={error} /> : sessions.length === 0 ?
        <EmptyState size="sm" title={labels.emptyTitle} description={labels.emptyDescription} /> : <>
          {visible.map((session) => <NavigationDrawerItem key={session.id}
            {...scope.getItemProps(session.id)}
            data-chat-session-id={session.id} label={session.label}
            active={session.id === activeSessionId} disabled={session.disabled}
            aria-haspopup="menu"
            onClick={() => { scope.closeMenu(); onSelect(session.id); }}
            trailing={scope.menuTrigger(session.id)} />)}
          <RevealMore canRevealMore={listWindow.canRevealMore} label={labels.revealMore}
            onRevealMore={() => { scope.closeMenu(); listWindow.revealMore(); }} />
        </>}
    </NavigationDrawer>}
  </SelectionArea>;
}
