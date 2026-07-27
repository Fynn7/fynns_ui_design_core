import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import type { CardVariant } from "../theme/tokens";
import { Card, CardMedia } from "./Card";
import { ChevronDownIcon } from "./icons";
import {
  COLLAPSIBLE_CARD_RECIPE,
  type CollapsibleCardMediaCollapse,
} from "./collapsible-card.recipe";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type CollapsibleCardContextValue = {
  isOpen: boolean;
  toggle: () => void;
  bodyId: string;
  disabled: boolean;
  mediaCollapse: CollapsibleCardMediaCollapse;
};

const CollapsibleCardContext = createContext<CollapsibleCardContextValue | null>(null);

export function useCollapsibleCardContext(): CollapsibleCardContextValue {
  const ctx = useContext(CollapsibleCardContext);
  if (!ctx) {
    throw new Error("CollapsibleCard subcomponents must be used within CollapsibleCard");
  }
  return ctx;
}

export type CollapsibleCardProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** @default recipe defaultVariant */
  variant?: CardVariant;
  disabled?: boolean;
  open?: boolean;
  /** @default recipe defaultOpen */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default recipe mediaCollapse */
  mediaCollapse?: CollapsibleCardMediaCollapse;
  /** Overrides recipe cssOverrides for preview / app-specific tuning. */
  cssOverrides?: Record<string, string>;
  children: ReactNode;
};

/**
 * Card shell with a collapsible header and optional Media / Content / Actions anatomy.
 * Compose with `CollapsibleCardHeader`, `CardMedia`, `CardContent`, and `CardActions`.
 */
export function CollapsibleCard({
  variant = COLLAPSIBLE_CARD_RECIPE.defaultVariant,
  disabled = false,
  open,
  defaultOpen = COLLAPSIBLE_CARD_RECIPE.defaultOpen,
  onOpenChange,
  mediaCollapse = COLLAPSIBLE_CARD_RECIPE.mediaCollapse,
  cssOverrides,
  className,
  style,
  children,
  ...rest
}: CollapsibleCardProps) {
  const bodyId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [disabled, isOpen, isControlled, onOpenChange]);

  const mergedOverrides = useMemo(
    () => ({ ...COLLAPSIBLE_CARD_RECIPE.cssOverrides, ...cssOverrides }),
    [cssOverrides],
  );

  const rootStyle: CSSProperties = {
    ...style,
    ...mergedOverrides,
  };

  const ctx = useMemo(
    () => ({
      isOpen,
      toggle,
      bodyId,
      disabled,
      mediaCollapse,
    }),
    [isOpen, toggle, bodyId, disabled, mediaCollapse],
  );

  const childArray = Children.toArray(children);
  const header = childArray.find(
    (child) => isValidElement(child) && child.type === CollapsibleCardHeader,
  );
  const media = childArray.find(
    (child) => isValidElement(child) && child.type === CardMedia,
  );
  const bodyChildren = childArray.filter(
    (child) =>
      !isValidElement(child) ||
      (child.type !== CollapsibleCardHeader && child.type !== CardMedia),
  );

  const showMedia =
    media != null && (mediaCollapse === "always" || isOpen);

  return (
    <CollapsibleCardContext.Provider value={ctx}>
      <Card
        {...rest}
        variant={variant}
        disabled={disabled}
        data-open={isOpen ? "true" : undefined}
        className={join("fynns-collapsible-card", isOpen && "fynns-collapsible-card--open", className)}
        style={rootStyle}
      >
        {showMedia ? media : null}
        {header}
        {isOpen ? (
          <div id={bodyId} className="fynns-collapsible-card-body">
            {bodyChildren}
          </div>
        ) : null}
      </Card>
    </CollapsibleCardContext.Provider>
  );
}

export type CollapsibleCardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  /** Shown outside the toggle button (e.g. icon buttons). */
  action?: ReactNode;
};

export function CollapsibleCardHeader({
  title,
  subtitle,
  avatar,
  action,
  className,
  ...rest
}: CollapsibleCardHeaderProps) {
  const { isOpen, toggle, bodyId, disabled } = useCollapsibleCardContext();

  return (
    <div {...rest} className={join("fynns-collapsible-card-header", className)}>
      <button
        type="button"
        className="fynns-collapsible-card-trigger"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        disabled={disabled}
        onClick={toggle}
      >
        <ChevronDownIcon className="fynns-collapsible-card-chevron" size={18} aria-hidden />
        {avatar ? <div className="fynns-collapsible-card-header-avatar">{avatar}</div> : null}
        <div className="fynns-collapsible-card-header-text">
          <div className="fynns-collapsible-card-header-title">{title}</div>
          {subtitle != null ? (
            <div className="fynns-collapsible-card-header-subtitle">{subtitle}</div>
          ) : null}
        </div>
      </button>
      {action ? <div className="fynns-collapsible-card-header-action">{action}</div> : null}
    </div>
  );
}

/** Type guard helper for composition tests. */
export function isCollapsibleCardHeader(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.type === CollapsibleCardHeader;
}
