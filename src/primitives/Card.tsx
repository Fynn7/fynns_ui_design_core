import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import type { CardVariant } from "../theme/tokens";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** @default "elevated" */
  variant?: CardVariant;
  /** Renders as a single clickable region with state-layer feedback + focus ring. */
  interactive?: boolean;
  /** Selected / emphasized container (accent-container). */
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

/**
 * Subject card with M3-informed variants (`elevated` / `filled` / `outlined`).
 * Compose with `CardMedia`, `CardHeader`, `CardContent`, `CardActions`, and
 * optional `CardActionArea`. Distinct from `PanelCard` (layout shell).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "elevated",
    interactive = false,
    selected = false,
    disabled = false,
    className,
    children,
    tabIndex,
    role,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isInteractive = interactive && !disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick?.(event as unknown as MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(event);
  };

  return (
    <div
      {...rest}
      ref={ref}
      role={role ?? (isInteractive ? "button" : undefined)}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      aria-disabled={disabled || undefined}
      aria-pressed={isInteractive && selected ? true : undefined}
      data-variant={variant}
      data-interactive={isInteractive ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={join(
        "fynns-card",
        `fynns-card--${variant}`,
        isInteractive && "fynns-card--interactive",
        selected && "fynns-card--selected",
        disabled && "fynns-card--disabled",
        className,
      )}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
});

export type CardMediaProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "children"> & {
  /** Image URL. Omit when providing custom `children` (video, picture, etc.). */
  src?: string;
  alt?: string;
  /** CSS height for the media strip. Defaults to token-sized band. */
  height?: string;
  /** Custom media node when not using a plain `<img>` (MUI `component` minimal subset). */
  children?: ReactNode;
};

export function CardMedia({
  src,
  alt = "",
  height,
  className,
  style,
  children,
  ...rest
}: CardMediaProps) {
  return (
    <div className={join("fynns-card-media", className)} style={height ? { height, ...style } : style}>
      {children != null ? (
        children
      ) : src ? (
        <img {...rest} src={src} alt={alt} className="fynns-card-media-img" />
      ) : null}
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
};

export function CardHeader({ title, subtitle, avatar, action, className, ...rest }: CardHeaderProps) {
  return (
    <div {...rest} className={join("fynns-card-header", className)}>
      {avatar ? <div className="fynns-card-header-avatar">{avatar}</div> : null}
      <div className="fynns-card-header-text">
        <div className="fynns-card-header-title">{title}</div>
        {subtitle != null ? <div className="fynns-card-header-subtitle">{subtitle}</div> : null}
      </div>
      {action ? <div className="fynns-card-header-action">{action}</div> : null}
    </div>
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CardContent({ className, children, ...rest }: CardContentProps) {
  return (
    <div {...rest} className={join("fynns-card-content", className)}>
      {children}
    </div>
  );
}

export type CardActionsProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
  /** When true, removes the default gap / padding increment (MUI `disableSpacing`). */
  disableSpacing?: boolean;
  children: ReactNode;
};

export function CardActions({
  align = "start",
  disableSpacing = false,
  className,
  children,
  ...rest
}: CardActionsProps) {
  return (
    <div
      {...rest}
      data-align={align}
      data-disable-spacing={disableSpacing ? "true" : undefined}
      className={join(
        "fynns-card-actions",
        align === "end" && "fynns-card-actions--end",
        disableSpacing && "fynns-card-actions--dense",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type CardActionAreaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Clickable content region inside a non-interactive Card shell. */
export const CardActionArea = forwardRef<HTMLButtonElement, CardActionAreaProps>(
  function CardActionArea({ className, type = "button", children, ...rest }, ref) {
    return (
      <button {...rest} ref={ref} type={type} className={join("fynns-card-action-area", className)}>
        {children}
      </button>
    );
  },
);
