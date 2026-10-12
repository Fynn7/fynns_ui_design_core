import type { ReactNode } from "react";
import { DropdownMenu } from "./DropdownMenu";
import { MoreHorizontalIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type ChatSessionMenuProps = {
  /** The active conversation, separate from sidebar multi-selection. */
  activeSessionId: string | null;
  /** Localized accessible name and tooltip for the fixed More trigger. */
  label?: string;
  disabled?: boolean;
  /** Compose core menu items / submenus; callbacks target this session ID. */
  renderMenu: (sessionId: string) => ReactNode;
};

/**
 * Place directly inside Chat, before ChatThread. Core reserves the top-right
 * seat outside the scrolling log and owns the trigger / portaled menu shell.
 * Consumers own actions, export formats and persistence. Changing the active
 * session or availability dismisses the previous menu and its submenus.
 * Live: #layouts-demo-chat-product / #layouts-demo-chat-aside.
 */
export function ChatSessionMenu({
  activeSessionId,
  label = "Chat session options",
  disabled = false,
  renderMenu,
}: ChatSessionMenuProps) {
  const items = activeSessionId == null ? null : renderMenu(activeSessionId);
  const unavailable = disabled || activeSessionId == null || !items;

  return <div className="fynns-chat-session-menu">
    <Tooltip key={`${activeSessionId}:${unavailable}`} content={label} side="bottom">
      <DropdownMenu trigger={<MoreHorizontalIcon />} ariaLabel={label}
        iconOnly size="sm" variant="ghost" align="end" disabled={unavailable}>
        {items}
      </DropdownMenu>
    </Tooltip>
  </div>;
}
