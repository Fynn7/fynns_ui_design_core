import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type SurfaceVariant = "outlined" | "filled" | "elevated" | "soft";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /** @default "outlined" */
  variant?: SurfaceVariant;
  /** Stretch to parent height (preview / stage wells). */
  fill?: boolean;
  /**
   * Inner pad. Default `false` (canvas-safe: iframe / charts sit flush).
   * `true` → equal `--fynns-layout-content-inset` on all edges.
   * Inside a nest host (`chrome="plain"` / `.fynns-nest`), prefer `padded` for
   * copy; leave `false` for canvas/iframe wells.
   */
  padded?: boolean;
  /**
   * Clickable well: M3 state-layer hover / press (same grammar as `Button`).
   * Use for empty-thread soft starters and other full-width prompt cards.
   * Works when the Surface is itself hovered **or** nested under a hovered
   * `button` / `a` / `[role="button"]`.
   */
  interactive?: boolean;
  children: ReactNode;
};

/**
 * Generic bordered / tonal well for any children (iframe, forms, BusyRegion, …).
 * No title/actions head — prefer `Card` when you need a static title / icon / actions row.
 * Not a revival of purged `Panel` / `Pane`.
 *
 * - `outlined` — app-bg + outline
 * - `filled` / `elevated` — surface-1 well (elevated adds shadow)
 * - `soft` — surface-2 well (same paint as Banner `default` strip; untitled)
 * - `interactive` — state-layer hover/press for large clickable wells
 */
export function Surface({
  variant = "outlined",
  fill = false,
  padded = false,
  interactive = false,
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <div
      {...rest}
      data-variant={variant}
      className={join(
        "fynns-surface",
        `fynns-surface--${variant}`,
        fill && "fynns-surface--fill",
        padded && "fynns-surface--padded",
        interactive && "fynns-surface--interactive",
        className,
      )}
    >
      {children}
    </div>
  );
}
