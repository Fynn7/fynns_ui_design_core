import type { CollapsibleCardRecipe } from "@fynns/ui";

export type ApplyRecipeFileDiff = {
  path: string;
  diff: string;
  changed: boolean;
};

export type ApplyRecipePreview = {
  ok: boolean;
  files: ApplyRecipeFileDiff[];
  error?: string;
};

export type ApplyRecipeResult = {
  ok: boolean;
  error?: string;
};

async function readJson<T>(res: Response): Promise<Partial<T> & { error?: string }> {
  try {
    return (await res.json()) as Partial<T> & { error?: string };
  } catch {
    return {};
  }
}

export async function previewRecipeDraft(
  recipe: CollapsibleCardRecipe,
): Promise<ApplyRecipePreview> {
  const res = await fetch("/__fynns/apply-recipe/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe }),
  });
  const data = await readJson<ApplyRecipePreview & { files?: ApplyRecipeFileDiff[] }>(res);
  if (!res.ok) {
    return {
      ok: false,
      files: data.files ?? [],
      error: data.error ?? `Preview failed (${res.status})`,
    };
  }
  return { ok: true, files: data.files ?? [] };
}

export async function applyRecipeDraft(recipe: CollapsibleCardRecipe): Promise<ApplyRecipeResult> {
  const res = await fetch("/__fynns/apply-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe }),
  });
  const data = await readJson<ApplyRecipeResult>(res);
  if (!res.ok) {
    return { ok: false, error: data.error ?? `Apply failed (${res.status})` };
  }
  return { ok: true };
}
