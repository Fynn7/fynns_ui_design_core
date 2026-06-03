import type { HTMLAttributes, ReactNode } from "react";

/**
 * Card panel with a header (title + actions) and a body. `.fynns-panel*`.
 * Compose this instead of re-writing the panel shell markup.
 */
export type PanelCardProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Fills the parent block. Defaults to true. */
  fill?: boolean;
  /** Disables internal body scroll. */
  noScroll?: boolean;
  /** Body uses column flex layout (fills vertical space). */
  fillBody?: boolean;
  children: ReactNode;
};

export function PanelCard({
  title,
  actions,
  className,
  fill = true,
  noScroll = false,
  fillBody = false,
  children,
  ...rest
}: PanelCardProps) {
  const rootClass = ["fynns-panel", fill ? "fynns-panel--full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const bodyClass = [
    "fynns-panel-body",
    noScroll ? "fynns-panel-body--no-scroll" : "",
    fillBody ? "fynns-panel-body--fill" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div {...rest} className={rootClass}>
      <div className="fynns-panel-head">
        <span className="fynns-panel-head-title">{title}</span>
        {actions ? <div className="fynns-panel-head-actions">{actions}</div> : null}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
