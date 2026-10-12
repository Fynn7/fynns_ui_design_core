import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
 * FillColumn with its own TopAppBar anchors this control at the well edge,
 * without adding the content inset to the chrome inset.
 * Live: #layouts-demo-chat-session-menu / #layouts-demo-chat-product / #layouts-demo-chat-aside.
 */
export function ChatSessionMenu({
  activeSessionId,
  label = "Chat session options",
  disabled = false,
  renderMenu,
}: ChatSessionMenuProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [chromeHost, setChromeHost] = useState<Element | null>(null);
  useLayoutEffect(() => {
    const well = anchor.current?.closest(".fynns-fill-column-main");
    const shell = well?.closest(".fynns-clipped-nav-shell");
    if (!well || !shell) return;
    // Use this shell's bar, never a surrounding sandbox / nested workspace bar.
    const sync = () => setChromeHost(shell.querySelector(":scope > .fynns-top-app-bar") ? well : null);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(shell, { childList: true });
    return () => observer.disconnect();
  }, []);
  const items = activeSessionId == null ? null : renderMenu(activeSessionId);
  const unavailable = disabled || activeSessionId == null || !items;

  const menu = <div className={`fynns-chat-session-menu${chromeHost ? " fynns-chat-session-menu--chrome" : ""}`}>
    <Tooltip key={`${activeSessionId}:${unavailable}`} content={label} side="bottom">
      <DropdownMenu trigger={<MoreHorizontalIcon />} ariaLabel={label}
        iconOnly size={chromeHost ? "md" : "sm"} variant="ghost" align="end" disabled={unavailable}>
        {items}
      </DropdownMenu>
    </Tooltip>
  </div>;
  return <><span ref={anchor} hidden />{chromeHost ? createPortal(menu, chromeHost) : menu}</>;
}
