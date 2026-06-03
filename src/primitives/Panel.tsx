import type { HTMLAttributes, ReactNode } from "react";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Which edge the panel borders against. */
  side?: "left" | "right";
};

/** Sidebar panel (`<aside>`). `.fynns-panel-aside`. */
export function Panel({ children, className, side = "left", ...rest }: PanelProps) {
  return (
    <aside
      {...rest}
      className={[
        "fynns-panel-aside",
        side === "right" ? "fynns-panel-aside--right" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </aside>
  );
}
