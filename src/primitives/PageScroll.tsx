import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type PageScrollProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Catalog / form units inside `.fynns-content-column` (max-width +
   * dialog-inset). Do **not** put `fynns-scroll` or max-width on these
   * children — the outer host is the only scrollport.
   */
  children?: ReactNode;
};

/**
 * Pane-edge page scroll for FillColumn / shell main catalogs.
 *
 * Renders `.fynns-page-scroll.fynns-scroll` → `.fynns-content-column` so the
 * overlay Y rail sits on the **pane** right edge (outside Cards), not on a
 * max-width content column. Prefer this over a private `.hub-scroll` +
 * `max-width` on the same node (that paints the rail on the Card).
 *
 * Live: sandbox `#page-scroll`. Authority: AGENTS.md Content density /
 * `llm/CONSUMER_TREATY.md` **page-scroll host flush with Card**.
 */
export function PageScroll({ className, children, ...rest }: PageScrollProps) {
  return (
    <div
      {...rest}
      className={join("fynns-page-scroll", "fynns-scroll", className)}
    >
      <div className="fynns-content-column">{children}</div>
    </div>
  );
}
