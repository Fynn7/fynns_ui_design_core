import type { ReactNode } from "react";

export type CardProps = {
  /** Header title in the static lead row (same role as Collapsible `title`). */
  title: ReactNode;
  /**
   * Optional glyph in the disclose slot (~16dp / `--fynns-size-icon`).
   * Always visible — never swaps to a chevron. Decorative (`aria-hidden`);
   * put meaning in `title`.
   */
  icon?: ReactNode;
  /** Optional right-aligned header actions (e.g. IconButtons). */
  actions?: ReactNode;
  className?: string;
  /** Always-visible body (not collapsible). */
  children: ReactNode;
};

/**
 * Static section card that shares Collapsible chrome (border, radius, surface,
 * head/body rhythm) but is **not** a disclosure: no head hover layer, no
 * chevron, no open/close. One-shot API — do not assemble head/body by hand.
 *
 * @example
 * ```tsx
 * <Card title="Connection" icon={<PlugIcon aria-hidden />} actions={…}>
 *   {children}
 * </Card>
 * ```
 */
export function Card({ title, icon, actions, className, children }: CardProps) {
  const hasIcon = icon != null;
  return (
    <div
      className={["fynns-card", hasIcon ? "fynns-card--has-icon" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="fynns-card-head">
        <div className="fynns-card-lead">
          {hasIcon ? (
            <span className="fynns-card-disclose" aria-hidden>
              <span className="fynns-card-icon">{icon}</span>
            </span>
          ) : null}
          <span className="fynns-card-title">{title}</span>
        </div>
        {actions ? <div className="fynns-card-actions">{actions}</div> : null}
      </div>
      <div className="fynns-card-body">{children}</div>
    </div>
  );
}
