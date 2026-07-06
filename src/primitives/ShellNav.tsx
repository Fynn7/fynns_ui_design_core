import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { forwardRef } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const NavItem = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>(
  function NavItem({ active = false, className, type = "button", ...rest }, ref) {
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={join("fynns-nav-item", active && "fynns-nav-item--active", className)}
      />
    );
  },
);

export function NavItemLabel({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={join("fynns-nav-item-label", className)} {...rest} />;
}

export function NavItemIcon({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={join("fynns-nav-item-icon", className)} {...rest} />;
}

export function NavCount({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={join("fynns-nav-count", className)} {...rest} />;
}

export const NavBrandButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function NavBrandButton({ className, type = "button", ...rest }, ref) {
    return <button {...rest} ref={ref} type={type} className={join("fynns-nav-brand-btn", className)} />;
  },
);

export const TextLinkButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function TextLinkButton({ className, type = "button", ...rest }, ref) {
    return <button {...rest} ref={ref} type={type} className={join("fynns-text-link-btn", className)} />;
  },
);

export type DottedLinkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "warning";
};

export const DottedLinkButton = forwardRef<HTMLButtonElement, DottedLinkButtonProps>(function DottedLinkButton(
  { tone = "default", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={join(
        "fynns-dotted-link-btn",
        tone === "warning" && "fynns-dotted-link-btn--warning",
        className,
      )}
    />
  );
});

export type PickListProps = HTMLAttributes<HTMLDivElement>;

export function PickList({ className, ...rest }: PickListProps) {
  return <div className={join("fynns-pick-list", className)} {...rest} />;
}

export const PickListItem = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PickListItem({ className, type = "button", ...rest }, ref) {
    return <button {...rest} ref={ref} type={type} className={join("fynns-pick-list-item", className)} />;
  },
);

export const CardOpenButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function CardOpenButton({ className, type = "button", ...rest }, ref) {
    return <button {...rest} ref={ref} type={type} className={join("fynns-card-open-btn", className)} />;
  },
);
