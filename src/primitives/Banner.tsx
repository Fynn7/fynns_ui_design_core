import type { HTMLAttributes, ReactNode } from "react";
import { CloseIcon } from "./icons";
import { IconButton } from "./IconButton";

export type BannerVariant = "default" | "tonal";

export type BannerProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Primary message (single line preferred). */
  text: ReactNode;
  /** Optional secondary line under `text`. */
  supportingText?: ReactNode;
  /** Leading icon (decorative). Defaults to none. */
  icon?: ReactNode;
  /**
   * Trailing text actions (typically `Button` `variant="ghost"`).
   * Laid out before the dismiss control.
   */
  actions?: ReactNode;
  /** When set, shows a trailing dismiss `IconButton`. */
  onDismiss?: () => void;
  /** Dismiss tooltip / aria-label. Default `"Dismiss"`. */
  dismissAriaLabel?: string;
  /**
   * `default` — surface-2 strip. `tonal` — accent-container emphasis
   * (M3 primary / secondary container roles).
   */
  variant?: BannerVariant;
};

/**
 * M3 Banner — full-width strip for persistent messages under a TopAppBar.
 * For in-panel severity use `InlineAlert` (soft tonal fill; fynns utility, not M3).
 * @see https://m3.material.io/components/banners/overview
 */
export function Banner({
  text,
  supportingText,
  icon,
  actions,
  onDismiss,
  dismissAriaLabel = "Dismiss",
  variant = "default",
  className,
  ...rest
}: BannerProps) {
  const rootClass = [
    "fynns-banner",
    `fynns-banner--${variant}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...rest} className={rootClass} role="status">
      {icon != null ? (
        <span className="fynns-banner-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <div className="fynns-banner-body">
        <div className="fynns-banner-text">{text}</div>
        {supportingText != null ? (
          <div className="fynns-banner-supporting">{supportingText}</div>
        ) : null}
      </div>
      {actions != null || onDismiss != null ? (
        <div className="fynns-banner-trailing">
          {actions != null ? (
            <div className="fynns-banner-actions">{actions}</div>
          ) : null}
          {onDismiss != null ? (
            <IconButton
              type="button"
              size="sm"
              aria-label={dismissAriaLabel}
              onClick={onDismiss}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
