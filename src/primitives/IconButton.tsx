import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type IconButtonProps = Omit<ButtonProps, "iconOnly">;

/**
 * Icon-only button. Enforces `iconOnly` layout and defaults to `ghost` so the
 * control reads as the icon itself (no bordered tile). Pass `aria-label`.
 */
export const IconButton = forwardRef(function IconButton(
  { variant = "ghost", ...props }: IconButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return <Button {...props} ref={ref} variant={variant} iconOnly />;
});
