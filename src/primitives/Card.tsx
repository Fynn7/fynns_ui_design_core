import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { forwardRef, useRef, useState } from "react";
import { CheckCircleIcon } from "./icons";

export type CardVariant = "filled" | "elevated" | "outlined" | "panel";
export type CardLayout = "vertical" | "horizontal";

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  variant?: CardVariant;
  layout?: CardLayout;
  clickable?: boolean;
  checkable?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  dragged?: boolean;
  onDraggedChange?: (dragged: boolean) => void;
  disabled?: boolean;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isNestedInteractiveTarget(target: EventTarget | null, currentTarget: HTMLElement) {
  if (!(target instanceof Element) || target === currentTarget) return false;
  return Boolean(
    target.closest(
      "a,button,input,select,textarea,[role='button'],[role='checkbox'],[role='link'],[tabindex]",
    ),
  );
}

/**
 * Material 3 card surface. Use `CardActionArea` for a primary action when the
 * card also contains supplemental actions; `clickable` is for simple cards
 * whose whole surface is the only action.
 */
export const Card = forwardRef(function Card(
  {
    variant = "filled",
    layout = "vertical",
    clickable = false,
    checkable = false,
    checked = false,
    onCheckedChange,
    dragged = false,
    onDraggedChange,
    disabled = false,
    className,
    children,
    role,
    tabIndex,
    onClick,
    onKeyDown,
    onDragStart,
    onDragEnd,
    ...rest
  }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const actionable = clickable || checkable;
  const resolvedRole = role ?? (checkable ? "checkbox" : clickable ? "button" : undefined);
  const resolvedTabIndex = tabIndex ?? (actionable && !disabled ? 0 : undefined);

  const activate = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;
    if (checkable) onCheckedChange?.(!checked);
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || !actionable || event.target !== event.currentTarget) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={joinClasses(
        "fynns-card",
        `fynns-card--${variant}`,
        `fynns-card--${layout}`,
        actionable && "fynns-card--actionable",
        checked && "fynns-card--checked",
        dragged && "fynns-card--dragged",
        disabled && "fynns-card--disabled",
        className,
      )}
      role={resolvedRole}
      tabIndex={disabled ? -1 : resolvedTabIndex}
      aria-checked={checkable ? checked : undefined}
      aria-disabled={actionable && disabled ? true : undefined}
      data-variant={variant}
      data-layout={layout}
      data-checked={checkable ? checked : undefined}
      data-dragged={dragged || undefined}
      data-disabled={disabled || undefined}
      onClick={actionable ? activate : onClick}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => {
        onDraggedChange?.(true);
        onDragStart?.(event);
      }}
      onDragEnd={(event) => {
        onDraggedChange?.(false);
        onDragEnd?.(event);
      }}
    >
      {children}
      {checkable && checked ? (
        <span className="fynns-card-selected-indicator" aria-hidden="true">
          <CheckCircleIcon size={20} />
        </span>
      ) : null}
    </div>
  );
});

export type CardMediaProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  orientation?: "top" | "start" | "end";
  fit?: "cover" | "contain";
};

/** Semantic image/video/custom-media region that inherits the card shape. */
export const CardMedia = forwardRef(function CardMedia(
  {
    src,
    alt = "",
    orientation = "top",
    fit = "cover",
    className,
    children,
    ...rest
  }: CardMediaProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={joinClasses(
        "fynns-card-media",
        `fynns-card-media--${orientation}`,
        className,
      )}
      data-orientation={orientation}
    >
      {src ? (
        <img
          className={joinClasses("fynns-card-media-image", `fynns-card-media-image--${fit}`)}
          src={src}
          alt={alt}
        />
      ) : (
        children
      )}
    </div>
  );
});

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "default" | "compact" | "none";
};

export const CardContent = forwardRef(function CardContent(
  { padding = "default", className, ...rest }: CardContentProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={joinClasses(
        "fynns-card-content",
        padding !== "default" && `fynns-card-content--${padding}`,
        className,
      )}
    />
  );
});

export type CardHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  subheader?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  titleAs?: "h2" | "h3" | "h4" | "div";
};

export const CardHeader = forwardRef(function CardHeader(
  {
    title,
    subheader,
    avatar,
    action,
    titleAs: Title = "h3",
    className,
    ...rest
  }: CardHeaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div {...rest} ref={ref} className={joinClasses("fynns-card-header", className)}>
      {avatar ? <div className="fynns-card-header-avatar">{avatar}</div> : null}
      <div className="fynns-card-header-copy">
        <Title className="fynns-card-title">{title}</Title>
        {subheader ? <div className="fynns-card-subheader">{subheader}</div> : null}
      </div>
      {action ? <div className="fynns-card-header-action">{action}</div> : null}
    </div>
  );
});

export type CardActionsProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end" | "between";
  padding?: "default" | "compact" | "none";
};

export const CardActions = forwardRef(function CardActions(
  { align = "start", padding = "default", className, ...rest }: CardActionsProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={joinClasses(
        "fynns-card-actions",
        `fynns-card-actions--${align}`,
        padding !== "default" && `fynns-card-actions--${padding}`,
        className,
      )}
    />
  );
});

type CardActionAreaBaseProps = Omit<
  HTMLAttributes<HTMLElement>,
  "onClick" | "onPointerDown"
> & {
  children: ReactNode;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
};

export type CardActionAreaProps = CardActionAreaBaseProps;

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

/**
 * Primary card action with keyboard semantics, state layer, and an optional
 * token-controlled contained ripple. Supplemental controls belong in a sibling
 * `CardActions`, never inside this element.
 */
export const CardActionArea = forwardRef(function CardActionArea(
  {
    href,
    target,
    rel,
    type = "button",
    disabled = false,
    className,
    children,
    onClick,
    onPointerDown,
    ...rest
  }: CardActionAreaProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = {
      id: ++rippleId.current,
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
      size,
    };
    setRipples((current) => [...current, ripple]);
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const content = (
    <>
      {children}
      <span className="fynns-card-action-state-layer" aria-hidden="true" />
      <span className="fynns-card-ripple-layer" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="fynns-card-ripple"
            onAnimationEnd={() => {
              setRipples((current) => current.filter((item) => item.id !== ripple.id));
            }}
            style={
              {
                "--fynns-card-ripple-x": `${ripple.x}px`,
                "--fynns-card-ripple-y": `${ripple.y}px`,
                "--fynns-card-ripple-size": `${ripple.size}px`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </>
  );

  const commonProps = {
    ...rest,
    className: joinClasses("fynns-card-action-area", className),
    "aria-disabled": disabled || undefined,
    onClick: handleClick,
    onPointerDown: handlePointerDown,
  };

  if (href) {
    return (
      <a
        {...(commonProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        tabIndex={disabled ? -1 : rest.tabIndex}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...(commonProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type}
      disabled={disabled}
    >
      {content}
    </button>
  );
});
