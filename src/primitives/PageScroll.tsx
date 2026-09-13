import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { clearScrollEdgeFade, syncScrollEdgeFade } from "./scrollEdgeFade";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type PageScrollProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Catalog / form units inside `.fynns-content-column` (fills the scrollport;
   * dialog-inset on **inline and block**). Do **not** put `fynns-scroll` or
   * max-width on these children — the outer host is the only scrollport.
   * Do **not** invent consumer `padding-top` on the first Card — core already
   * clears the canvas ceiling. Do **not** wrap children in sheet/chat/dialog
   * max or a private reading-width column (≥ **0.5.186** content-column fills).
   */
  children?: ReactNode;
};

/**
 * Pane-edge page scroll for FillColumn / shell main catalogs.
 *
 * Renders `.fynns-page-scroll.fynns-scroll` → `.fynns-content-column` so the
 * overlay Y rail sits on the **pane** right edge (outside Cards), not on a
 * capped content column. The content column **fills** the scrollport (inset
 * pad only; ≥ **0.5.186** — no soft ~1180dp ceiling). Prefer this over a
 * private `.hub-scroll` + `max-width` on the same node (that paints the rail
 * on the Card).
 *
 * **Edge fade is built-in (≥ 0.5.247) — zero consumer config.** Core syncs
 * `data-fade-top` / `data-fade-bottom` on this host (same mask family as
 * NavigationDrawer body). Apps only render `<PageScroll>…</PageScroll>`; do
 * **not** add props, private `mask-image`, or scroll listeners for fade.
 * Live: sandbox `#page-scroll`.
 *
 * Authority: DESIGN_SYSTEM Hard rules / `llm/CONSUMER_TREATY.md`
 * **PageScroll mid-scroll hard clip (no edge fade)**.
 */
export function PageScroll({ className, children, ...rest }: PageScrollProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncScrollEdgeFade(el);
      });
    };
    syncScrollEdgeFade(el);
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const column = el.querySelector(":scope > .fynns-content-column");
    if (column instanceof HTMLElement) ro.observe(column);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
      clearScrollEdgeFade(el);
    };
  }, []);

  return (
    <div
      {...rest}
      ref={hostRef}
      className={join("fynns-page-scroll", "fynns-scroll", className)}
    >
      <div className="fynns-content-column">{children}</div>
    </div>
  );
}
