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
  /**
   * Stretch in a height-resolved parent (DestinationAppShell canvas /
   * FillColumn children / shell main) and center title + description in the
   * visible pane. Use for sole zero-result pane bodies — not inside Card /
   * List / ChatThread.empty (those stay content-sized).
   */
  fill?: boolean;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Layout-only empty / zero-result placeholder (icon + title + description +
 * actions). No Card chrome and no hover affordances — compose actions yourself.
 * Pane sole body → pass `fill` so copy centers in the visible canvas (same
 * host contract as `BusyRegion` `fill`).
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  size = "md",
  fill = false,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      {...rest}
      className={join(
        "fynns-empty-state",
        size === "sm" && "fynns-empty-state--sm",
        fill && "fynns-empty-state--fill",
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
