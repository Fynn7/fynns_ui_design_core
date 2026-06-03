import type { HTMLAttributes, ReactNode } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
} from "./icons";

export type AlertSeverity = "warning" | "error" | "info" | "success";

const DEFAULT_ICON_SIZE = 16;

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  severity: AlertSeverity;
  message?: ReactNode;
  icon?: ReactNode;
  role?: "alert" | "status";
  children?: ReactNode;
};

function defaultIcon(severity: AlertSeverity): ReactNode {
  if (severity === "error") return <AlertCircleIcon size={DEFAULT_ICON_SIZE} />;
  if (severity === "warning") return <AlertTriangleIcon size={DEFAULT_ICON_SIZE} />;
  if (severity === "success") return <CheckCircleIcon size={DEFAULT_ICON_SIZE} />;
  return <InfoIcon size={DEFAULT_ICON_SIZE} />;
}

/** Inline alert banner. `.fynns-alert` / `.fynns-alert--<severity>`. */
export function AlertMessageBase({
  severity,
  message,
  icon,
  role,
  className,
  children,
  ...rest
}: AlertProps) {
  const content = children ?? message;
  if (content == null) return null;
  return (
    <div
      className={["fynns-alert", `fynns-alert--${severity}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      role={role}
      {...rest}
    >
      <span className="fynns-alert__icon">{icon ?? defaultIcon(severity)}</span>
      <span className="fynns-alert__text">{content}</span>
    </div>
  );
}

type BannerProps = Omit<AlertProps, "severity" | "role">;

export function WarningBanner(props: BannerProps) {
  return <AlertMessageBase severity="warning" role="status" {...props} />;
}
export function ErrorBanner(props: BannerProps) {
  return <AlertMessageBase severity="error" role="alert" {...props} />;
}
export function InfoBanner(props: BannerProps) {
  return <AlertMessageBase severity="info" role="status" {...props} />;
}
export function SuccessBanner(props: BannerProps) {
  return <AlertMessageBase severity="success" role="status" {...props} />;
}
