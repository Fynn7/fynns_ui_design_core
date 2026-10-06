import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import { BusyRegion } from "./Busy";
import { ContextMenu } from "./ContextMenu";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "./DropdownMenu";
import { EmptyState } from "./EmptyState";
import { InlineAlert } from "./InlineAlert";
import {
  NavigationDrawer, NavigationDrawerItem, NavigationDrawerNewChat,
  type NavigationDrawerProps,
} from "./NavigationDrawer";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, TrashIcon } from "./icons";
import { RevealMore } from "./RevealMore";
import { Tooltip } from "./Tooltip";
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
  sessionMenu: string;
  listMenu: string;
  emptyTitle: string;
  emptyDescription?: string;
  /** Accessible loading label only; never visible copy. */
  loading: string;
  revealMore: string;
};

export type ChatSessionsDrawerProps = Omit<NavigationDrawerProps, "children" | "onContextMenu"> & {
  sessions: readonly ChatSessionsDrawerSession[];
  activeSessionId?: string | null;
  labels: ChatSessionsDrawerLabels;
  /** Disables mutations and paints a content-position skeleton. */
  busy?: boolean;
  /** A short load failure. Takes precedence over the empty state. */
  error?: string | null;
  /** Optional pagination window; defaults to list density (5 / 5). */
  reveal?: Omit<UseRevealMoreOptions, "total">;
  onNewChat: () => void;
  onSelect: (sessionId: string) => void;
  /** Requests only: the consumer owns dialogs, confirmation and persistence. */
  onRename: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onDeleteAll: () => void;
};

type Target = { kind: "list" } | { kind: "session"; id: string };
type Flyout = { mode: "more"; target: Target } | { mode: "context"; target: Target; x: number; y: number };

function sameTarget(a: Target, b: Target) {
  return a.kind === b.kind && (a.kind === "list" || (b.kind === "session" && a.id === b.id));
}

/**
 * Session-history NavigationDrawer variant: row and blank-area context menus,
 * keyboard equivalents, hover-reveal More, one open flyout, and list states.
 * Live: #sandbox-chat-sessions-drawer. No product data or mutation UI is owned here.
 */
export function ChatSessionsDrawer({
  sessions, activeSessionId, labels, busy = false, error, reveal,
  onNewChat, onSelect, onRename, onDelete, onDeleteAll,
  variant = "standard", open, onClose, ...drawerProps
}: ChatSessionsDrawerProps) {
  const [flyout, setFlyout] = useState<Flyout | null>(null);
  const listWindow = useRevealMore({
    initial: REVEAL_MORE_LIST_DEFAULT_INITIAL,
    step: REVEAL_MORE_LIST_DEFAULT_STEP,
    ...reveal,
    total: sessions.length,
  });
  const visible = sessions.slice(0, listWindow.visible);
  const unavailable = busy || Boolean(error);
  const canDeleteAll = sessions.length > 0 && !unavailable;
  const menuTarget = flyout?.target;
  const menuSession = menuTarget?.kind === "session"
    ? visible.find((session) => session.id === menuTarget.id)
    : undefined;
  const menuAvailable = !unavailable && (variant !== "modal" || open) &&
    (flyout?.target.kind === "list" || (menuSession != null && !menuSession.disabled));

  useEffect(() => {
    if (!menuAvailable) setFlyout(null);
  }, [menuAvailable]);

  const run = (action: () => void) => {
    setFlyout(null);
    action();
  };
  const newChat = () => { if (!unavailable) run(onNewChat); };
  const deleteAll = () => { if (canDeleteAll) run(onDeleteAll); };
  const sessionActions = (id: string) => {
    const disabled = unavailable || !sessions.some((session) => session.id === id && !session.disabled);
    return <>
      <DropdownMenuItem icon={<PencilIcon />} disabled={disabled} onClick={() => {
        if (!disabled) run(() => onRename(id));
      }}>{labels.rename}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={disabled} onClick={() => {
        if (!disabled) run(() => onDelete(id));
      }}>{labels.delete}</DropdownMenuItem>
    </>;
  };
  const more = (target: Target) => <Tooltip content={labels.more}>
    <DropdownMenu
      trigger={<MoreHorizontalIcon />} ariaLabel={labels.more} align="end"
      iconOnly size="sm" variant="ghost"
      disabled={unavailable || (target.kind === "session" && sessions.find((s) => s.id === target.id)?.disabled)}
      open={Boolean(menuAvailable && flyout?.mode === "more" && sameTarget(flyout.target, target))}
      onOpenChange={(next) => setFlyout((prev) => next ? { mode: "more", target }
        : prev?.mode === "more" && sameTarget(prev.target, target) ? null : prev)}
    >
      {target.kind === "session" ? sessionActions(target.id) :
        <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={!canDeleteAll} onClick={deleteAll}>
          {labels.deleteAll}
        </DropdownMenuItem>}
    </DropdownMenu>
  </Tooltip>;

  const openContext = (target: Target, x: number, y: number) => {
    if (unavailable || (target.kind === "session" && !visible.some((s) => s.id === target.id && !s.disabled))) {
      setFlyout(null);
      return;
    }
    setFlyout({ mode: "context", target, x, y });
  };
  const bodyContext = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.target === event.currentTarget) {
      openContext({ kind: "list" }, event.clientX, event.clientY);
      return;
    }
    const target = event.target as Element;
    const row = target.closest(".fynns-nav-drawer-item-host")
      ?.querySelector<HTMLButtonElement>("[data-chat-session-id]");
    const id = row?.getAttribute("data-chat-session-id");
    if (id != null && row && event.currentTarget.contains(row)) {
      row.focus();
      openContext({ kind: "session", id }, event.clientX, event.clientY);
    } else setFlyout(null);
  };
  const rowKey = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    openContext({ kind: "session", id }, rect.left, rect.bottom);
  };

  return <>
    <NavigationDrawer {...drawerProps} variant={variant} open={open}
      onClose={() => { setFlyout(null); onClose?.(); }} onContextMenu={bodyContext}>
      <NavigationDrawerNewChat label={labels.newChat} disabled={unavailable}
        onClick={newChat} trailing={more({ kind: "list" })} />
      {busy ? <BusyRegion busy label={labels.loading} /> : error ?
        <InlineAlert severity="error" message={error} /> : sessions.length === 0 ?
        <EmptyState size="sm" title={labels.emptyTitle} description={labels.emptyDescription} /> : <>
          {visible.map((session) => <NavigationDrawerItem key={session.id}
            data-chat-session-id={session.id} label={session.label}
            active={session.id === activeSessionId} disabled={session.disabled}
            aria-haspopup="menu" onKeyDown={(event) => rowKey(event, session.id)}
            onClick={() => run(() => onSelect(session.id))}
            trailing={more({ kind: "session", id: session.id })} />)}
          <RevealMore canRevealMore={listWindow.canRevealMore} label={labels.revealMore}
            onRevealMore={() => run(listWindow.revealMore)} />
        </>}
    </NavigationDrawer>
    <ContextMenu open={Boolean(menuAvailable && flyout?.mode === "context")}
      x={flyout?.mode === "context" ? flyout.x : 0}
      y={flyout?.mode === "context" ? flyout.y : 0}
      ariaLabel={flyout?.target.kind === "session" ? labels.sessionMenu : labels.listMenu}
      onOpenChange={(next) => { if (!next) setFlyout((prev) => prev?.mode === "context" ? null : prev); }}>
      {menuSession ? sessionActions(menuSession.id) : <>
        <DropdownMenuItem icon={<PlusIcon />} disabled={unavailable} onClick={newChat}>{labels.newChat}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<TrashIcon />} tone="danger" disabled={!canDeleteAll} onClick={deleteAll}>{labels.deleteAll}</DropdownMenuItem>
      </>}
    </ContextMenu>
  </>;
}
