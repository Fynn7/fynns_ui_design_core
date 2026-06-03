import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type IconButtonProps = Omit<ButtonProps, "iconOnly">;

/**
 * Icon-only button. Enforces square `iconOnly` layout; pass an `aria-label`
 * at the call site for accessibility.
 */
export const IconButton = forwardRef(function IconButton(
  props: IconButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return <Button {...props} ref={ref} iconOnly />;
});
