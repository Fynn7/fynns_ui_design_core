import type { CardVariant } from "../theme/tokens";

export type CollapsibleCardMediaCollapse = "always" | "withBody";

export type CollapsibleCardRecipe = {
  defaultVariant: CardVariant;
  defaultOpen: boolean;
  mediaCollapse: CollapsibleCardMediaCollapse;
  /** Component-local custom properties on `.fynns-collapsible-card` (--fynns-* only). */
  cssOverrides: Record<string, string>;
};

export const COLLAPSIBLE_CARD_RECIPE: CollapsibleCardRecipe = {
  defaultVariant: "elevated",
  defaultOpen: false,
  mediaCollapse: "always",
  cssOverrides: {},
};
