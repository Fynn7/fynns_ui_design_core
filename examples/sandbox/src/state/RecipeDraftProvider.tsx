import { COLLAPSIBLE_CARD_RECIPE, type CollapsibleCardRecipe } from "@fynns/ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { recipesEqual, validateRecipeDraft } from "../recipes/recipeSchema";

const RECIPE_DRAFT_STORAGE_KEY = "fynns-sandbox-recipe-draft";

type RecipeDraftContextValue = {
  baseline: CollapsibleCardRecipe;
  draft: CollapsibleCardRecipe;
  isDirty: boolean;
  patch: (patch: Partial<CollapsibleCardRecipe>) => void;
  setCssOverride: (cssVar: string, value: string) => void;
  reset: () => void;
  /** After successful apply — treat current draft as the new baseline. */
  commit: () => void;
};

const RecipeDraftContext = createContext<RecipeDraftContextValue | null>(null);

function normalizeRecipe(raw: unknown): CollapsibleCardRecipe | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const candidate: CollapsibleCardRecipe = {
    ...COLLAPSIBLE_CARD_RECIPE,
    ...(raw as Partial<CollapsibleCardRecipe>),
    cssOverrides: {
      ...COLLAPSIBLE_CARD_RECIPE.cssOverrides,
      ...((raw as Partial<CollapsibleCardRecipe>).cssOverrides ?? {}),
    },
  };
  return validateRecipeDraft(candidate).ok ? candidate : null;
}

function loadStoredDraft(): CollapsibleCardRecipe | null {
  try {
    const raw = localStorage.getItem(RECIPE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRecipe(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function RecipeDraftProvider({ children }: { children: ReactNode }) {
  const [baseline, setBaseline] = useState<CollapsibleCardRecipe>(COLLAPSIBLE_CARD_RECIPE);
  const [draft, setDraft] = useState<CollapsibleCardRecipe>(
    () => loadStoredDraft() ?? COLLAPSIBLE_CARD_RECIPE,
  );

  useEffect(() => {
    localStorage.setItem(RECIPE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const patch = useCallback((partial: Partial<CollapsibleCardRecipe>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const setCssOverride = useCallback((cssVar: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      cssOverrides: { ...(prev.cssOverrides ?? {}), [cssVar]: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setDraft(baseline);
  }, [baseline]);

  const commit = useCallback(() => {
    setBaseline(draft);
  }, [draft]);

  const isDirty = useMemo(() => !recipesEqual(draft, baseline), [draft, baseline]);

  const value = useMemo(
    () => ({ baseline, draft, isDirty, patch, setCssOverride, reset, commit }),
    [baseline, draft, isDirty, patch, setCssOverride, reset, commit],
  );

  return <RecipeDraftContext.Provider value={value}>{children}</RecipeDraftContext.Provider>;
}

export function useRecipeDraft(): RecipeDraftContextValue {
  const ctx = useContext(RecipeDraftContext);
  if (!ctx) {
    throw new Error("useRecipeDraft must be used within RecipeDraftProvider");
  }
  return ctx;
}
