import type { CollapsibleCardRecipe } from "@fynns/ui";
import { isSafeCssCustomProperty } from "../state/tokenDraft";

export const RECIPE_ID_COLLAPSIBLE_CARD = "collapsible-card" as const;

export type CollapsibleCardRecipeDraft = CollapsibleCardRecipe;

const VARIANTS = new Set(["elevated", "filled", "outlined"]);
const MEDIA = new Set(["always", "withBody"]);

export function validateRecipeDraft(
  draft: CollapsibleCardRecipeDraft,
): { ok: true } | { ok: false; error: string } {
  if (!VARIANTS.has(draft.defaultVariant)) {
    return { ok: false, error: "defaultVariant must be elevated, filled, or outlined" };
  }
  if (typeof draft.defaultOpen !== "boolean") {
    return { ok: false, error: "defaultOpen must be a boolean" };
  }
  if (!MEDIA.has(draft.mediaCollapse)) {
    return { ok: false, error: 'mediaCollapse must be "always" or "withBody"' };
  }
  if (
    typeof draft.cssOverrides !== "object" ||
    draft.cssOverrides === null ||
    Array.isArray(draft.cssOverrides)
  ) {
    return { ok: false, error: "cssOverrides must be an object" };
  }
  for (const [key, value] of Object.entries(draft.cssOverrides)) {
    if (typeof value !== "string") {
      return { ok: false, error: `cssOverrides value for ${key} must be a string` };
    }
    if (!key.startsWith("--fynns-")) {
      return { ok: false, error: `cssOverrides key must start with --fynns-: ${key}` };
    }
    if (!isSafeCssCustomProperty(key, value)) {
      return {
        ok: false,
        error: `Unsafe cssOverrides entry (expected safe --fynns-* declaration): ${key}`,
      };
    }
  }
  return { ok: true };
}

export function recipesEqual(a: CollapsibleCardRecipeDraft, b: CollapsibleCardRecipeDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
