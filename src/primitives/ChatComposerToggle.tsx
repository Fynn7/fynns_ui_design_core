import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { BrainIcon } from "./icons";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ChatComposerToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "aria-pressed" | "onChange"
> & {
  /** Visible label (e.g. Thinking / Vision). */
  children: ReactNode;
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  /**
   * Leading glyph. Defaults to `BrainIcon` for reasoning-mode recipes;
   * pass `EyeIcon` (or other) for vision / context modes.
   */
  leadingIcon?: ReactNode;
  /**
   * Accessible name. Prefer always passing this for icon-only CQ (≤36rem);
   * when omitted and `children` is a string, that string is used as
   * `aria-label` so the narrow visually-hidden label still names the control.
   */
  ariaLabel?: string;
};

/**
 * Compact ChatGPT-style mode pill for `ChatComposer` `endActions`
 * (Thinking / Vision / …). Height matches composer controls
 * (`--fynns-chat-composer-control-size`). Prefer wrapping in `Tooltip`
 * for the “smarter answers” tip. Live `#sandbox-chat-composer-thinking-toggle`
 * (≥ **0.5.289**).
 *
 * Do **not** park these modes in the leading `+` Menu, or invent a consumer
 * chip CSS clone — use this keep-set toggle.
 */
export const ChatComposerToggle = forwardRef<
  HTMLButtonElement,
  ChatComposerToggleProps
>(function ChatComposerToggle(
  {
    children,
    pressed,
    onPressedChange,
    leadingIcon,
    ariaLabel,
    disabled = false,
    className,
    onClick,
    ...rest
  },
  ref,
) {
  const resolvedAriaLabel =
    ariaLabel ?? (typeof children === "string" ? children : undefined);
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={resolvedAriaLabel}
      disabled={disabled}
      data-pressed={pressed ? "true" : "false"}
      className={join(
        "fynns-chat-composer-toggle",
        pressed && "fynns-chat-composer-toggle--pressed",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented && !disabled) {
          onPressedChange(!pressed);
        }
      }}
    >
      <span className="fynns-chat-composer-toggle-leading" aria-hidden>
        {leadingIcon ?? <BrainIcon size={16} />}
      </span>
      <span className="fynns-chat-composer-toggle-label">{children}</span>
    </button>
  );
});

ChatComposerToggle.displayName = "ChatComposerToggle";
