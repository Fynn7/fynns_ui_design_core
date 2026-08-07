import type { ReactNode } from "react";
import type { CollapsibleChrome } from "./Collapsible";

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
  /**
   * Outer chrome. Default `card` — bordered shell for padded copy / forms.
   * `plain` — same outer shell; nest a surface-owning child inset by
   * `--fynns-layout-nest-gap` (pad + child gap). Not flush — do not cancel
   * nest-gap with negative margins. Same values as Collapsible `chrome`.
   */
  chrome?: CollapsibleChrome;
  className?: string;
  /** Always-visible body (not collapsible). */
  children: ReactNode;
};

/**
 * Static section card that shares Collapsible chrome (border, radius, surface,
 * head/body rhythm) but is **not** a disclosure: no head hover layer, no
 * chevron, no open/close. One-shot API — do not assemble head/body by hand.
 *
 * Pass `chrome="plain"` when nesting a surface-owning child (outer shell stays;
 * body uses `--fynns-layout-nest-gap`). Do not cancel nest-gap with negative
 * margins. `chrome="plain"` ≠ flush.
 *
 * @example
 * ```tsx
 * <Card title="Connection" icon={<PlugIcon aria-hidden />} actions={…}>
 *   {children}
 * </Card>
 *
 * <Card title="Preview" chrome="plain">
 *   <Surface fill padded>…</Surface>
 * </Card>
 * ```
 */
export function Card({ title, icon, actions, chrome = "card", className, children }: CardProps) {
  const plain = chrome === "plain";
  return (
    <div
      className={["fynns-card", plain ? "fynns-card--plain" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="fynns-card-head">
        <div className="fynns-card-lead">
          {icon != null ? (
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
