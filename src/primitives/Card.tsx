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
      data-variant={variant}
      data-interactive={isInteractive ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={join(
        "fynns-card",
        `fynns-card--${variant}`,
        isInteractive && "fynns-card--interactive",
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

export type CardMediaProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  /** CSS height for the media strip. Defaults to token-sized band. */
  height?: string;
};

export function CardMedia({ src, alt, height, className, style, ...rest }: CardMediaProps) {
  return (
    <div className={join("fynns-card-media", className)} style={height ? { height, ...style } : style}>
      <img {...rest} src={src} alt={alt} className="fynns-card-media-img" />
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
  children: ReactNode;
};

export function CardActions({ align = "start", className, children, ...rest }: CardActionsProps) {
  return (
    <div
      {...rest}
      data-align={align}
      className={join("fynns-card-actions", align === "end" && "fynns-card-actions--end", className)}
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
