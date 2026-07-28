import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "neutral" | "success" | "danger" | "warning" | "info" | "accent";
export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
};

/** Pill badge. `.fynns-badge` / `.fynns-badge--<variant>`. */
export function Badge({
  variant = "neutral",
  size = "md",
  icon,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={[
        "fynns-badge",
        `fynns-badge--${variant}`,
        size === "sm" ? "fynns-badge--sm" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? <span className="fynns-badge-icon">{icon}</span> : null}
      {children}
    </span>
  );
}
