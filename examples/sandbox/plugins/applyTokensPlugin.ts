import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Connect, Plugin } from "vite";

const execFileAsync = promisify(execFile);

/** CSS var prefix → `tokens.ts` table name (sandbox-editable groups only). */
const TABLE_BY_PREFIX: Array<{ prefix: string; table: string }> = [
  { prefix: "--fynns-font-size-", table: "FONT_SIZE_TOKENS" },
  { prefix: "--fynns-color-", table: "COLOR_TOKENS" },
  { prefix: "--fynns-radius-", table: "RADIUS_TOKENS" },
  { prefix: "--fynns-shadow-", table: "SHADOW_TOKENS" },
  { prefix: "--fynns-state-", table: "STATE_LAYER_TOKENS" },
  { prefix: "--fynns-space-", table: "SPACE_TOKENS" },
];

function mapCssVar(cssVar: string): { table: string; key: string } | null {
  for (const { prefix, table } of TABLE_BY_PREFIX) {
    if (cssVar.startsWith(prefix)) {
      const key = cssVar.slice(prefix.length);
      if (key) return { table, key };
    }
  }
  return null;
}

function keyLiteral(key: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
}

function replaceInTable(
  source: string,
  table: string,
  key: string,
  value: string,
): { ok: true; source: string } | { ok: false; reason: string } {
  const tableRe = new RegExp(
    `(export const ${table} = \\{)([\\s\\S]*?)(\\n\\} as const;)`,
  );
  const match = source.match(tableRe);
  if (!match) return { ok: false, reason: `table ${table} not found` };

  const keyLit = keyLiteral(key);
  const escapedKey = keyLit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match `key: "…"` / `"key": "…"` — values in tokens.ts are double-quoted.
  const entryRe = new RegExp(`(\\n\\s*${escapedKey}\\s*:\\s*)("[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`);
  if (!entryRe.test(match[2])) {
    return { ok: false, reason: `key ${key} not found in ${table}` };
  }

  const newBody = match[2].replace(entryRe, `$1${JSON.stringify(value)}`);
  return { ok: true, source: source.replace(tableRe, `$1${newBody}$3`) };
}

/**
 * Mirror color overrides into `LIGHT_THEME_OVERRIDES` when the key exists there
 * (accent family, surfaces, …) so Apply + gen:theme keeps light mode in sync.
 */
function replaceInLightThemeColor(
  source: string,
  key: string,
  value: string,
): { ok: true; source: string } | { ok: false } {
  const blockRe =
    /(export const LIGHT_THEME_OVERRIDES[\s\S]*?\[\s*"color"\s*,\s*\{)([\s\S]*?)(\n\s*\}\s*,)/;
  const match = source.match(blockRe);
  if (!match) return { ok: false };

  const keyLit = keyLiteral(key);
  const escapedKey = keyLit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entryRe = new RegExp(`(\\n\\s*${escapedKey}\\s*:\\s*)("[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`);
  if (!entryRe.test(match[2])) return { ok: false };

  const newBody = match[2].replace(entryRe, `$1${JSON.stringify(value)}`);
  return { ok: true, source: source.replace(blockRe, `$1${newBody}$3`) };
}

function applyOverridesToSource(
  source: string,
  overrides: Record<string, string>,
): { source: string; applied: string[]; skipped: Array<{ cssVar: string; reason: string }> } {
  let next = source;
  const applied: string[] = [];
  const skipped: Array<{ cssVar: string; reason: string }> = [];

  for (const cssVar of Object.keys(overrides).sort()) {
    const value = overrides[cssVar];
    const mapped = mapCssVar(cssVar);
    if (!mapped) {
      skipped.push({ cssVar, reason: "unsupported token group" });
      continue;
    }
    const result = replaceInTable(next, mapped.table, mapped.key, value);
    if (!result.ok) {
      skipped.push({ cssVar, reason: result.reason });
      continue;
    }
    next = result.source;
    if (mapped.table === "COLOR_TOKENS") {
      const light = replaceInLightThemeColor(next, mapped.key, value);
      if (light.ok) next = light.source;
    }
    if (mapped.table === "SHADOW_TOKENS") {
      // Light theme also overrides some shadows (e.g. glow-accent).
      const lightShadow = replaceInLightThemeShadow(next, mapped.key, value);
      if (lightShadow.ok) next = lightShadow.source;
    }
    applied.push(cssVar);
  }

  return { source: next, applied, skipped };
}

function replaceInLightThemeShadow(
  source: string,
  key: string,
  value: string,
): { ok: true; source: string } | { ok: false } {
  const blockRe =
    /(export const LIGHT_THEME_OVERRIDES[\s\S]*?\[\s*"shadow"\s*,\s*\{)([\s\S]*?)(\n\s*\}\s*,)/;
  const match = source.match(blockRe);
  if (!match) return { ok: false };

  const keyLit = keyLiteral(key);
  const escapedKey = keyLit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entryRe = new RegExp(`(\\n\\s*${escapedKey}\\s*:\\s*)("[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`);
  if (!entryRe.test(match[2])) return { ok: false };

  const newBody = match[2].replace(entryRe, `$1${JSON.stringify(value)}`);
  return { ok: true, source: source.replace(blockRe, `$1${newBody}$3`) };
}

function readJsonBody(req: Connect.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(
  res: Connect.ServerResponse,
  status: number,
  body: Record<string, unknown>,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * Dev-only: POST `/__fynns/apply-tokens` with `{ overrides }` writes
 * `src/theme/tokens.ts` and runs `npm run gen:theme`.
 */
export function applyTokensPlugin(repoRoot: string): Plugin {
  const tokensPath = path.join(repoRoot, "src/theme/tokens.ts");

  return {
    name: "fynns-apply-tokens",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/__fynns/apply-tokens") {
          next();
          return;
        }
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = (await readJsonBody(req)) as { overrides?: Record<string, string> };
          const overrides = body.overrides ?? {};
          if (typeof overrides !== "object" || Array.isArray(overrides)) {
            sendJson(res, 400, { error: "overrides must be an object" });
            return;
          }

          const entries = Object.entries(overrides).filter(
            ([k, v]) => typeof k === "string" && typeof v === "string",
          );
          if (entries.length === 0) {
            sendJson(res, 400, { error: "No overrides to apply" });
            return;
          }

          const patch = Object.fromEntries(entries);
          const original = readFileSync(tokensPath, "utf8");
          const { source, applied, skipped } = applyOverridesToSource(original, patch);

          if (applied.length === 0) {
            sendJson(res, 400, {
              error: "No overrides could be written to tokens.ts",
              skipped,
            });
            return;
          }

          if (source !== original) {
            writeFileSync(tokensPath, source, "utf8");
          }

          await execFileAsync(
            process.execPath,
            [path.join(repoRoot, "scripts/gen-theme.mjs")],
            {
              cwd: repoRoot,
              windowsHide: true,
            },
          );

          sendJson(res, 200, { ok: true, applied, skipped });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
