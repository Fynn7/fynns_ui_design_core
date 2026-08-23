import { Avatar, IconButton, SettingsIcon, Tooltip } from "@fynns/ui";
import type { ReactNode } from "react";

export type NavDrawerFooterAccountProps = {
  /** When false, only Avatar/initial + settings (identity in Tooltip on avatar). */
  showLabel?: boolean;
  /** Primary line (email / display name). */
  accountLabel: string;
  /** Derives Avatar initials when no image. */
  accountName?: string;
  settingsLabel: string;
  settingsTip?: ReactNode;
  onSettingsClick?: () => void;
};

/** Cursor-style drawer/rail footer account row — avatar (+ optional label) + settings end. */
export function NavDrawerFooterAccount({
  showLabel = true,
  accountLabel,
  accountName,
  settingsLabel,
  settingsTip,
  onSettingsClick,
}: NavDrawerFooterAccountProps) {
  const avatar = (
    <Avatar size="sm" name={accountName ?? accountLabel} alt={accountLabel} />
  );

  return (
    <div className="fynns-nav-drawer-footer-account">
      <div className="fynns-nav-drawer-footer-account-start">
        {showLabel ? (
          avatar
        ) : (
          <Tooltip content={accountLabel} side="right">
            <span className="fynns-nav-drawer-footer-account-avatar-wrap">
              {avatar}
            </span>
          </Tooltip>
        )}
        {showLabel ? (
          <span className="fynns-nav-drawer-footer-account-label">
            {accountLabel}
          </span>
        ) : null}
      </div>
      <Tooltip content={settingsTip ?? settingsLabel}>
        <IconButton aria-label={settingsLabel} onClick={onSettingsClick}>
          <SettingsIcon size={16} aria-hidden />
        </IconButton>
      </Tooltip>
    </div>
  );
}

/** Workspace / repo context row — lives in drawer **body**, not footer slots. */
export function NavDrawerWorkspaceRow({ label }: { label: string }) {
  return (
    <div className="fynns-nav-drawer-footer-slot fynns-nav-drawer-footer-slot--pill">
      <span className="fynns-nav-drawer-footer-slot-label">{label}</span>
    </div>
  );
}
