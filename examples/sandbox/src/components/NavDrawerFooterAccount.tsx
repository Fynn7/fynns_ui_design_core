import { Avatar, IconButton, SettingsIcon, Tooltip } from "@fynns/ui";
import type { ReactNode } from "react";

export type NavDrawerFooterAccountProps = {
  /** When false, only Avatar/initial + settings (identity in Tooltip on avatar). */
  showLabel?: boolean;
  /**
   * Visible account / workspace line **and** Avatar initials source
   * (multi-word → first+last initials, ≥ 0.5.214). Do **not** pass a separate
   * truncated name for initials while this label stays full — Failure:
   * CONSUMER_TREATY NavDrawer footer Avatar initials ignore visible label.
   */
  accountLabel: string;
  settingsLabel: string;
  settingsTip?: ReactNode;
  onSettingsClick?: () => void;
};

/** Cursor-style drawer/rail footer account row — avatar (+ optional label) + settings end. */
export function NavDrawerFooterAccount({
  showLabel = true,
  accountLabel,
  settingsLabel,
  settingsTip,
  onSettingsClick,
}: NavDrawerFooterAccountProps) {
  const avatar = (
    <Avatar size="sm" name={accountLabel} alt={accountLabel} />
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
        <IconButton
          size="sm"
          aria-label={settingsLabel}
          onClick={onSettingsClick}
        >
          <SettingsIcon size={16} aria-hidden />
        </IconButton>
      </Tooltip>
    </div>
  );
}
