import type { ButtonHTMLAttributes } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";

export type RevealMoreProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "type"
> & {
  /** When false, renders nothing (fully revealed or short list). */
  canRevealMore: boolean;
  onRevealMore: () => void;
  /** Visible label. @default "Show more" — pass localized strings from the app. */
  label?: string;
  /**
   * @default "md" — standard labeled Button height (40dp). Optional `lg` if a
   * product wants a larger foot.
   */
  size?: ButtonSize;
  /**
   * @default "tonal" — mid emphasis for a catalog expand CTA (M3 Text/ghost
   * is lowest emphasis; tonal sits between text and filled).
   */
  variant?: ButtonVariant;
};

/**
 * Foot CTA for `useRevealMore` — place **outside** `.fynns-table-wrap` as a
 * Card / unit-stack sibling (not inside the horizontal scroll host). Default
 * **tonal** + **md** labeled Button, centered; disappears when
 * `canRevealMore` is false. Live: `#table` / `#list`.
 */
export function RevealMore({
  canRevealMore,
  onRevealMore,
  label = "Show more",
  size = "md",
  variant = "tonal",
  className,
  disabled,
  ...rest
}: RevealMoreProps) {
  if (!canRevealMore) return null;

  const classes = ["fynns-reveal-more", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <Button
        {...rest}
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onRevealMore}
      >
        {label}
      </Button>
    </div>
  );
}
