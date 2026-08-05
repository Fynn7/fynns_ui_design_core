import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type SurfaceVariant = "outlined" | "filled" | "elevated";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /** @default "outlined" */
  variant?: SurfaceVariant;
  /** Stretch to parent height (preview / stage wells). */
  fill?: boolean;
  /**
   * Inner pad. Default `false` (canvas-safe: iframe / charts sit flush).
   * `true` → `--fynns-layout-content-inset` inline + `--fynns-layout-content-pad-block`.
   */
  padded?: boolean;
  children: ReactNode;
};

/**
 * Generic bordered / tonal well for any children (iframe, forms, BusyRegion, …).
 * No title/actions head — prefer `Card` when you need a static title / icon / actions row.
 * Not a revival of purged `Panel` / `Pane`.
 */
export function Surface({
  variant = "outlined",
  fill = false,
  padded = false,
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
        className,
      )}
    >
      {children}
    </div>
  );
}
