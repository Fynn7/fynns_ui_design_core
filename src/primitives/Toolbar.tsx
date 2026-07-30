import type { HTMLAttributes, ReactNode } from "react";

export type ToolbarVariant = "docked" | "floating";
export type ToolbarOrientation = "horizontal" | "vertical";
export type ToolbarColor = "standard" | "vibrant";

export type ToolbarProps = HTMLAttributes<HTMLElement> & {
  /**
   * `docked` — full-width page chrome (M3 Expressive replacement for many
   * BottomAppBar uses). `floating` — wrap-content capsule over content
   * (default).
   */
  variant?: ToolbarVariant;
  /**
   * Action stack direction. Vertical only applies to `floating` (docked stays
   * horizontal).
   */
  orientation?: ToolbarOrientation;
  /**
   * `standard` — surface container. `vibrant` — accent-container fill
   * (Expressive).
   */
  color?: ToolbarColor;
  /**
   * Optional FAB. Docked: end of the bar (like BottomAppBar). Floating: sits
   * beside the capsule (not inside it).
   */
  floatingActionButton?: ReactNode;
  /** Action controls — typically `IconButton`s with Tooltip + aria-label. */
  children: ReactNode;
};

/**
 * M3 Expressive Toolbar — frequently used page / contextual actions.
 * Prefer `ControlStack` + `ControlRow` for labeled inspector form rhythm;
 * prefer `BottomAppBar` / `NavigationBar` when those roles fit better.
 * @see https://m3.material.io/components/toolbars/overview
 */
export function Toolbar({
  variant = "floating",
  orientation = "horizontal",
  color = "standard",
  floatingActionButton,
  children,
  className,
  ...rest
}: ToolbarProps) {
  const axis =
    variant === "floating" && orientation === "vertical"
      ? "vertical"
      : "horizontal";
  const barClass = [
    "fynns-toolbar",
    `fynns-toolbar--${variant}`,
    `fynns-toolbar--${axis}`,
    `fynns-toolbar--${color}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const bar = (
    <div {...rest} role="toolbar" className={barClass}>
      <div className="fynns-toolbar-actions">{children}</div>
      {variant === "docked" && floatingActionButton != null ? (
        <div className="fynns-toolbar-fab">{floatingActionButton}</div>
      ) : null}
    </div>
  );

  if (variant === "floating" && floatingActionButton != null) {
    return (
      <div
        className={[
          "fynns-toolbar-cluster",
          `fynns-toolbar-cluster--${axis}`,
        ].join(" ")}
      >
        {bar}
        <div className="fynns-toolbar-fab">{floatingActionButton}</div>
      </div>
    );
  }

  return bar;
}
