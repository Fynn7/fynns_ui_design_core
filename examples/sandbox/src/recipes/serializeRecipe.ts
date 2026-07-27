import type { CollapsibleCardRecipe } from "@fynns/ui";

export function serializeCollapsibleCardRecipeFile(recipe: CollapsibleCardRecipe): string {
  const cssEntries = Object.keys(recipe.cssOverrides)
    .sort()
    .map((key) => `    ${JSON.stringify(key)}: ${JSON.stringify(recipe.cssOverrides[key])},`)
    .join("\n");

  const cssBlock = cssEntries ? `${cssEntries}\n` : "";

  return `import type { CardVariant } from "../theme/tokens";

export type CollapsibleCardMediaCollapse = "always" | "withBody";

export type CollapsibleCardRecipe = {
  defaultVariant: CardVariant;
  defaultOpen: boolean;
  mediaCollapse: CollapsibleCardMediaCollapse;
  /** Component-local custom properties on \`.fynns-collapsible-card\` (--fynns-* only). */
  cssOverrides: Record<string, string>;
};

export const COLLAPSIBLE_CARD_RECIPE: CollapsibleCardRecipe = {
  defaultVariant: ${JSON.stringify(recipe.defaultVariant)},
  defaultOpen: ${recipe.defaultOpen},
  mediaCollapse: ${JSON.stringify(recipe.mediaCollapse)},
  cssOverrides: {${cssEntries ? `\n${cssEntries}\n  ` : ""}},
};
`;
}

const RECIPE_START = "/* @fynns-recipe collapsible-card start */";
const RECIPE_END = "/* @fynns-recipe collapsible-card end */";

export function patchCollapsibleCardRecipeCss(
  cssSource: string,
  cssOverrides: Record<string, string>,
): string {
  const startIdx = cssSource.indexOf(RECIPE_START);
  const endIdx = cssSource.indexOf(RECIPE_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error("CollapsibleCard recipe CSS markers not found in primitives.css");
  }

  const props = Object.keys(cssOverrides)
    .sort()
    .map((key) => `  ${key}: ${cssOverrides[key]};`)
    .join("\n");

  const inner = props
    ? `${RECIPE_START}\n.fynns-collapsible-card {\n${props}\n}\n${RECIPE_END}`
    : `${RECIPE_START}\n.fynns-collapsible-card {\n  /* Recipe-local custom properties (--fynns-*) are merged here on apply. */\n}\n${RECIPE_END}`;

  return cssSource.slice(0, startIdx) + inner + cssSource.slice(endIdx + RECIPE_END.length);
}
