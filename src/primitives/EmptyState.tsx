import type { HTMLAttributes, ReactNode } from "react";

export type EmptyStateSize = "sm" | "md";

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional leading glyph (decorative). */
  icon?: ReactNode;
  /** Primary heading. */
  title: ReactNode;
  /** Supporting copy under the title. */
  description?: ReactNode;
  /** Action cluster (caller passes `Button`s). */
  actions?: ReactNode;
  /** @default "md" */
  size?: EmptyStateSize;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Layout-only empty / zero-result placeholder (icon + title + description +
 * actions). No Card chrome and no hover affordances — compose actions yourself.
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  size = "md",
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      {...rest}
      className={join(
        "fynns-empty-state",
        size === "sm" && "fynns-empty-state--sm",
        className,
      )}
    >
      {icon != null ? (
        <div className="fynns-empty-state-icon" aria-hidden>
          {icon}
        </div>
      ) : null}
      <div className="fynns-empty-state-title">{title}</div>
      {description != null ? (
        <div className="fynns-empty-state-description">{description}</div>
      ) : null}
      {actions != null ? (
        <div className="fynns-empty-state-actions">{actions}</div>
      ) : null}
    </div>
  );
}
