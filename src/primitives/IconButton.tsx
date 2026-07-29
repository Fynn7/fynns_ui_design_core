import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type IconButtonProps = Omit<ButtonProps, "iconOnly">;

/**
 * Icon-only button. Enforces `iconOnly` layout. Defaults to `ghost` (M3
 * standard icon button). Filled / tonal / outlined via `variant`. Pass
 * `aria-label`. Target is 40dp (md) with 16dp glyph unless size overrides.
 */
export const IconButton = forwardRef(function IconButton(
  { variant = "ghost", size = "md", ...props }: IconButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return <Button {...props} ref={ref} variant={variant} size={size} iconOnly />;
});
