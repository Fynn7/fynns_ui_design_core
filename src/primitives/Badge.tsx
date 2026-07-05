import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "neutral" | "success" | "danger" | "warning" | "info" | "accent";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
};

/** Pill badge. `.fynns-badge` / `.fynns-badge--<variant>`. */
export function Badge({ variant = "neutral", icon, children, className, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={["fynns-badge", `fynns-badge--${variant}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? <span className="fynns-badge-icon">{icon}</span> : null}
      {children}
    </span>
  );
}
