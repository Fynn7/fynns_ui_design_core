import { Collapsible, type CollapsibleProps } from "@fynns/ui";
import { useState, type ReactNode } from "react";

/**
 * Sandbox inspector helper: same chrome as `Collapsible`, but the body is
 * unmounted while closed. Core `Collapsible` keeps children mounted for height
 * animation — fine for product UI, but the property / globals inspectors host
 * dozens of Sliders + InfoHint/Tooltip wrappers that stay in the DOM (and on
 * the a11y tree) even when the section is collapsed, which makes hover feel
 * sluggish across the whole sandbox shell.
 */
export function LazyCollapsible({
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
  ...rest
}: CollapsibleProps & { children: ReactNode }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  return (
    <Collapsible
      {...rest}
      open={open}
      onOpenChange={(next) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {open ? children : null}
    </Collapsible>
  );
}
