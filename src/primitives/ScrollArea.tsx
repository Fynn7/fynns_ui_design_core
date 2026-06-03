import type { ForwardedRef, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { SCROLL_CONTAINER_CLASS, mergeScrollSurfaceClass } from "../theme/scrollbar";

export type ScrollAreaProps = HTMLAttributes<HTMLDivElement>;

/**
 * Block-level scrollable container with the shared custom scrollbar skin.
 * For surfaces that already manage their own overflow, opt in via
 * `mergeScrollSurfaceClass` instead.
 */
export const ScrollArea = forwardRef(function ScrollArea(
  { className, ...rest }: ScrollAreaProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={mergeScrollSurfaceClass(SCROLL_CONTAINER_CLASS, className)}
    />
  );
});
