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

export type FillColumnProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Top band sized to content (`flex: 0`). Preview / Collapsible / Banner…
   * On `DestinationAppShell` canvas the band soft-caps
   * (`--fynns-layout-fill-column-header-max-height`) and scrolls **only when
   * content exceeds that cap** — it does **not** flex-shrink under Chat
   * pressure (that would put a nested scrollbar on short guide Surfaces).
   * **Edge fade is built-in** (≥ **0.5.278**), same `data-fade-top` /
   * `data-fade-bottom` family as `PageScroll`. Prefer short soft `Surface` /
   * compact preview; for tall catalogs put `<PageScroll>` inside (PageScroll
   * owns the mask).
   */
  header?: ReactNode;
  /**
   * Bottom band sized to content (`flex: 0`). Rare — prefer `ChatComposer`
   * inside a `Chat` in `children` so the composer docks with the thread.
   */
  footer?: ReactNode;
  /**
   * Middle band that absorbs remaining height (`flex: 1; min-height: 0`).
   * Put `<Chat>` here so the thread fills and the composer docks to the
   * column bottom — or `BusyRegion` `fill` while the pane is booting —
   * or `<PageScroll>` for Card / List catalogs (never a private
   * max-width `.hub-scroll` on this slot).
   * Do not stack Preview / EmptyState / Composer as siblings.
   */
  children: ReactNode;
};

/**
 * Vertical fill host for a height-resolved parent (ClippedNavShell main /
 * DestinationAppShell canvas / fixed demo stage).
 *
 * `header` / `footer` stay content-sized; `children` eats the leftover so a
 * nested `Chat` can dock its composer at the column bottom instead of leaving
 * a dead band under content-height stacks.
 *
 * Above-chat chrome (short soft `Surface` forms, compact preview Card) →
 * **`header`**. Do **not** stack that chrome as a `children` sibling of Chat
 * with `paddingBottom: 0` — core ≥ **0.5.277** gaps header↔main and main
 * siblings with `unit-stack-gap` (16dp). Live: `#layouts-demo-fill-column`.
 *
 * **Header mid-scroll edge fade is built-in (≥ 0.5.278) — zero consumer
 * config.** Canvas-capped `.fynns-fill-column-header` syncs soft mask attrs
 * (same family as `PageScroll`). Do **not** invent private `mask-image` on
 * the header. Live: `#sandbox-fill-column-guide` (scroll the guide Surface).
 *
 * Does **not** apply aside Chat bubble geometry (`.fynns-chat-host--fill`) —
 * main-column 70% / 48rem rules stay intact. Use `chat-host--fill` / EndAside
 * for full-pane aside chat.
 */
export function FillColumn({
  header,
  footer,
  className,
  children,
  ...rest
}: FillColumnProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncScrollEdgeFade(el);
      });
    });
    const observeChildren = () => {
      ro.disconnect();
      ro.observe(el);
      for (const child of el.children) {
        if (child instanceof HTMLElement) ro.observe(child);
      }
    };
    const sync = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncScrollEdgeFade(el);
      });
    };
    observeChildren();
    syncScrollEdgeFade(el);
    el.addEventListener("scroll", sync, { passive: true });
    // Header swaps / conditional Surface remounts — re-observe direct children
    // (same childList pattern as NavigationDrawer body; avoid deep subtree thrash).
    const mo = new MutationObserver(() => {
      observeChildren();
      sync();
    });
    mo.observe(el, { childList: true, subtree: false });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
      mo.disconnect();
      clearScrollEdgeFade(el);
    };
  }, [header != null]);

  return (
    <div {...rest} className={join("fynns-fill-column", className)}>
      {header != null ? (
        <div
          ref={headerRef}
          className="fynns-fill-column-header fynns-scroll"
        >
          {header}
        </div>
      ) : null}
      <div className="fynns-fill-column-main">{children}</div>
      {footer != null ? (
        <div className="fynns-fill-column-footer">{footer}</div>
      ) : null}
    </div>
  );
}
