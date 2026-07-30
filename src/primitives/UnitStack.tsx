import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type UnitStackGap =
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export type UnitStackProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Gap between child units.
   * Omit to use `--fynns-layout-unit-stack-gap`. Pass a `--fynns-space-*`
   * t-shirt key only for a deliberate density override.
   */
  gap?: UnitStackGap;
  children?: ReactNode;
};

/**
 * Vertical stack of UI *units* (inspector fields, help + control blocks,
 * Collapsible body sections). Default rhythm:
 * `--fynns-layout-unit-stack-gap` (see AGENTS.md “Toolbar / unit rhythm”).
 *
 * Prefer this over ad-hoc `margin` / inventing gaps. For labeled
 * `label | control` toolbar rows use `ControlStack` + `ControlRow` instead.
 */
export function UnitStack({
  gap,
  className,
  style,
  children,
  ...rest
}: UnitStackProps) {
  const stackStyle = {
    ...style,
    ...(gap != null ? { gap: `var(--fynns-space-${gap})` } : null),
  } as CSSProperties;

  return (
    <div
      className={["fynns-unit-stack", className ?? ""].filter(Boolean).join(" ")}
      style={stackStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
