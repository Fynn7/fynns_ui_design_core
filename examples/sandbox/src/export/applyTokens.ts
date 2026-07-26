export type ApplyTokensResult = {
  ok: boolean;
  applied: string[];
  skipped: Array<{ cssVar: string; reason: string }>;
  error?: string;
};

export type ApplyFileDiff = {
  path: string;
  diff: string;
  changed: boolean;
};

export type ApplyTokensPreview = ApplyTokensResult & {
  files: ApplyFileDiff[];
};

async function readJson<T>(res: Response): Promise<Partial<T> & { error?: string }> {
  try {
    return (await res.json()) as Partial<T> & { error?: string };
  } catch {
    return {};
  }
}

/**
 * Dry-run: return unified diffs for `tokens.ts` and regenerated `theme.css`
 * without leaving those files modified.
 */
export async function previewTokenOverrides(
  overrides: Record<string, string>,
): Promise<ApplyTokensPreview> {
  const res = await fetch("/__fynns/apply-tokens/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides }),
  });
  const data = await readJson<ApplyTokensPreview>(res);
  if (!res.ok) {
    return {
      ok: false,
      applied: data.applied ?? [],
      skipped: data.skipped ?? [],
      files: data.files ?? [],
      error: data.error ?? `Preview failed (${res.status})`,
    };
  }
  return {
    ok: true,
    applied: data.applied ?? [],
    skipped: data.skipped ?? [],
    files: data.files ?? [],
  };
}

/**
 * Persist sandbox draft overrides into `src/theme/tokens.ts` (+ gen:theme)
 * via the Vite apply-tokens middleware (dev server only).
 */
export async function applyTokenOverrides(
  overrides: Record<string, string>,
): Promise<ApplyTokensResult> {
  const res = await fetch("/__fynns/apply-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides }),
  });
  const data = await readJson<ApplyTokensResult>(res);
  if (!res.ok) {
    return {
      ok: false,
      applied: data.applied ?? [],
      skipped: data.skipped ?? [],
      error: data.error ?? `Apply failed (${res.status})`,
    };
  }
  return {
    ok: true,
    applied: data.applied ?? [],
    skipped: data.skipped ?? [],
  };
}
