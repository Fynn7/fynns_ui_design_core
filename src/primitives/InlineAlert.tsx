import type { HTMLAttributes, ReactNode } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
} from "./icons";

export type InlineAlertSeverity = "warning" | "error" | "info" | "success";

export type InlineAlertProps = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  severity: InlineAlertSeverity;
  message?: ReactNode;
  icon?: ReactNode;
  role?: "alert" | "status";
  children?: ReactNode;
};

function defaultIcon(severity: InlineAlertSeverity): ReactNode {
  if (severity === "error") return <AlertCircleIcon size={16} />;
  if (severity === "warning") return <AlertTriangleIcon size={16} />;
  if (severity === "success") return <CheckCircleIcon size={16} />;
  return <InfoIcon size={16} />;
}

function defaultRole(severity: InlineAlertSeverity): "alert" | "status" {
  return severity === "error" ? "alert" : "status";
}

/**
 * In-panel severity strip (fynns utility — **not** M3): soft tonal fill,
 * icon tinted by severity, body on-surface. Pad / gap / icon size share Banner
 * strip tokens (`--fynns-banner-pad-*` / `gap` / `icon-size`). Long paths wrap.
 * M3 maps: chrome `Banner` under TopAppBar, or `snackbar` for transient feedback.
 * `.fynns-inline-alert` / `.fynns-inline-alert--<severity>`.
 */
export function InlineAlert({
  severity,
  message,
  icon,
  role,
  className,
  children,
  ...rest
}: InlineAlertProps) {
  const content = children ?? message;
  if (content == null) return null;
  return (
    <div
      className={[
        "fynns-inline-alert",
        `fynns-inline-alert--${severity}`,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={role ?? defaultRole(severity)}
      {...rest}
    >
      <span className="fynns-inline-alert__icon" aria-hidden>
        {icon ?? defaultIcon(severity)}
      </span>
      <span className="fynns-inline-alert__text">{content}</span>
    </div>
  );
}
