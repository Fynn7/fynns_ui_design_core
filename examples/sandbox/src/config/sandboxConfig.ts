import type { FynnsThemeMode } from "@fynns/ui";
import { BASE_TOKENS_HASH } from "../state/baseline";
import { isSafeCssCustomProperty } from "../state/tokenDraft";

/** Stable kind marker for import validation. */
export const SANDBOX_CONFIG_KIND = "fynns-sandbox-config" as const;
export const SANDBOX_CONFIG_VERSION = 1 as const;

/**
 * Portable full sandbox configuration (token draft + theme).
 * Same shape is used for JSON export/import and user templates.
 */
export type SandboxConfigBundle = {
  kind: typeof SANDBOX_CONFIG_KIND;
  version: typeof SANDBOX_CONFIG_VERSION;
  exportedAt: string;
  theme: FynnsThemeMode;
  overrides: Record<string, string>;
  /** Hash of the baseline when the bundle was created (advisory). */
  baseTokensHash: string;
};

export type SandboxTemplate = SandboxConfigBundle & {
  id: string;
  name: string;
  description: string;
  savedAt: string;
};

export function buildConfigBundle(args: {
  overrides: Record<string, string>;
  theme: FynnsThemeMode;
  baseTokensHash?: string;
}): SandboxConfigBundle {
  return {
    kind: SANDBOX_CONFIG_KIND,
    version: SANDBOX_CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    theme: args.theme,
    overrides: { ...args.overrides },
    baseTokensHash: args.baseTokensHash ?? BASE_TOKENS_HASH,
  };
}

export function parseConfigBundle(raw: unknown):
  | { ok: true; bundle: SandboxConfigBundle }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Config must be a JSON object" };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.kind !== SANDBOX_CONFIG_KIND) {
    return { ok: false, error: `Expected kind "${SANDBOX_CONFIG_KIND}"` };
  }
  if (obj.version !== SANDBOX_CONFIG_VERSION) {
    return { ok: false, error: `Unsupported config version: ${String(obj.version)}` };
  }
  if (obj.theme !== "dark" && obj.theme !== "light") {
    return { ok: false, error: 'theme must be "dark" or "light"' };
  }
  if (!obj.overrides || typeof obj.overrides !== "object" || Array.isArray(obj.overrides)) {
    return { ok: false, error: "overrides must be an object" };
  }
  const overrides: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj.overrides as Record<string, unknown>)) {
    if (typeof key !== "string" || typeof value !== "string") {
      return { ok: false, error: "Each override must be a string CSS variable → value pair" };
    }
    if (!key.startsWith("--fynns-") && !key.startsWith("--sandbox-")) {
      return {
        ok: false,
        error: `Invalid override key (expected --fynns-* or --sandbox-*): ${key}`,
      };
    }
    if (!isSafeCssCustomProperty(key, value)) {
      return { ok: false, error: `Unsafe override for ${key}` };
    }
    overrides[key] = value;
  }
  return {
    ok: true,
    bundle: {
      kind: SANDBOX_CONFIG_KIND,
      version: SANDBOX_CONFIG_VERSION,
      exportedAt:
        typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
      theme: obj.theme,
      overrides,
      baseTokensHash:
        typeof obj.baseTokensHash === "string" ? obj.baseTokensHash : BASE_TOKENS_HASH,
    },
  };
}

export function configToJson(bundle: SandboxConfigBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function downloadConfigJson(bundle: SandboxConfigBundle, filename?: string): void {
  const stamp = bundle.exportedAt.slice(0, 10);
  const name = filename ?? `fynns-sandbox-config-${stamp}.json`;
  const blob = new Blob([configToJson(bundle)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readConfigFromFile(file: File): Promise<
  | { ok: true; bundle: SandboxConfigBundle }
  | { ok: false; error: string }
> {
  try {
    const text = await file.text();
    return parseConfigBundle(JSON.parse(text) as unknown);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to read JSON file",
    };
  }
}

export function bundleToTemplate(
  bundle: SandboxConfigBundle,
  args: { name: string; description?: string; id?: string },
): SandboxTemplate {
  const name = args.name.trim();
  return {
    ...bundle,
    id: args.id ?? `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Untitled template",
    description: (args.description ?? "").trim(),
    savedAt: new Date().toISOString(),
  };
}
