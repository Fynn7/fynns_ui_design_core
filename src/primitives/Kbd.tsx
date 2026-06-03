import type { HTMLAttributes, ReactNode } from "react";

export type KbdProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

/** Keyboard key cap. `.fynns-kbd`. */
export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <kbd {...rest} className={["fynns-kbd", className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </kbd>
  );
}
