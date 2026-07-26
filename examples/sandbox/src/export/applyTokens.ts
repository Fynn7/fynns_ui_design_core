export type ApplyTokensResult = {
  ok: boolean;
  applied: string[];
  skipped: Array<{ cssVar: string; reason: string }>;
  error?: string;
};

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

  let data: Partial<ApplyTokensResult> & { error?: string } = {};
  try {
    data = (await res.json()) as ApplyTokensResult;
  } catch {
    data = {};
  }

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
