import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

export type FileDiff = {
  path: string;
  /** Unified diff text; empty when the file is unchanged. */
  diff: string;
  changed: boolean;
};

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
  const entryRe = new RegExp(`(\\n\\s*${escapedKey}\\s*:\\s*)("[^"\\\\]*(?:\\\\.[^"\\\\]*)*")`);
  if (!entryRe.test(match[2])) {
    return { ok: false, reason: `key ${key} not found in ${table}` };
  }

  const newBody = match[2].replace(entryRe, `$1${JSON.stringify(value)}`);
  return { ok: true, source: source.replace(tableRe, `$1${newBody}$3`) };
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
    // Do not mirror into LIGHT_THEME_OVERRIDES — light palette values differ
    // from dark; live draft already targets light via CSS injection.
    applied.push(cssVar);
  }

  return { source: next, applied, skipped };
}

async function unifiedDiff(fileLabel: string, before: string, after: string): Promise<string> {
  if (before === after) return "";
  const dir = mkdtempSync(path.join(tmpdir(), "fynns-apply-diff-"));
  const a = path.join(dir, "a");
  const b = path.join(dir, "b");
  try {
    writeFileSync(a, before, "utf8");
    writeFileSync(b, after, "utf8");
    try {
      const { stdout } = await execFileAsync(
        "git",
        ["diff", "--no-index", "--unified=3", "--", a, b],
        { encoding: "utf8", windowsHide: true },
      );
      return rewriteDiffPaths(stdout, fileLabel);
    } catch (err) {
      const e = err as { code?: number; stdout?: string; stderr?: string };
      // git diff --no-index exits 1 when files differ.
      if (e.code === 1 && typeof e.stdout === "string") {
        return rewriteDiffPaths(e.stdout, fileLabel);
      }
      throw err;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rewriteDiffPaths(diff: string, fileLabel: string): string {
  return diff
    .replace(/^diff --git .*$/m, `diff --git a/${fileLabel} b/${fileLabel}`)
    .replace(/^--- .*$/m, `--- a/${fileLabel}`)
    .replace(/^\+\+\+ .*$/m, `+++ b/${fileLabel}`);
}

async function runGenTheme(repoRoot: string): Promise<void> {
  await execFileAsync(process.execPath, [path.join(repoRoot, "scripts/gen-theme.mjs")], {
    cwd: repoRoot,
    windowsHide: true,
  });
}

function parseOverrides(body: unknown): Record<string, string> | { error: string } {
  const overrides = (body as { overrides?: unknown })?.overrides ?? {};
  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    return { error: "overrides must be an object" };
  }
  const entries = Object.entries(overrides as Record<string, unknown>).filter(
    ([k, v]) => typeof k === "string" && typeof v === "string",
  );
  if (entries.length === 0) return { error: "No overrides to apply" };
  return Object.fromEntries(entries) as Record<string, string>;
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
 * Dev-only middleware:
 * - POST `/__fynns/apply-tokens/preview` → per-file unified diffs (no write)
 * - POST `/__fynns/apply-tokens` → write tokens.ts + gen:theme
 */
export function applyTokensPlugin(repoRoot: string): Plugin {
  const tokensPath = path.join(repoRoot, "src/theme/tokens.ts");
  const themePath = path.join(repoRoot, "src/theme/theme.css");
  const tokensLabel = "src/theme/tokens.ts";
  const themeLabel = "src/theme/theme.css";

  /** Serialize preview/apply so temp writes cannot race a real apply. */
  let gate: Promise<void> = Promise.resolve();
  function withGate<T>(fn: () => Promise<T>): Promise<T> {
    const run = gate.then(fn, fn);
    gate = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  return {
    name: "fynns-apply-tokens",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/__fynns/apply-tokens" && url !== "/__fynns/apply-tokens/preview") {
          next();
          return;
        }
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        const isPreview = url === "/__fynns/apply-tokens/preview";

        try {
          await withGate(async () => {
            const body = await readJsonBody(req);
            const parsed = parseOverrides(body);
            if ("error" in parsed) {
              sendJson(res, 400, { error: parsed.error });
              return;
            }

            const originalTokens = readFileSync(tokensPath, "utf8");
            const originalTheme = readFileSync(themePath, "utf8");
            const { source: nextTokens, applied, skipped } = applyOverridesToSource(
              originalTokens,
              parsed,
            );

            if (applied.length === 0) {
              sendJson(res, 400, {
                error: "No overrides could be written to tokens.ts",
                skipped,
              });
              return;
            }

            if (isPreview) {
              let nextTheme = originalTheme;
              // Temporarily materialize tokens + gen:theme to preview theme.css,
              // then always restore both files.
              try {
                if (nextTokens !== originalTokens) {
                  writeFileSync(tokensPath, nextTokens, "utf8");
                  await runGenTheme(repoRoot);
                  nextTheme = readFileSync(themePath, "utf8");
                }
              } finally {
                writeFileSync(tokensPath, originalTokens, "utf8");
                writeFileSync(themePath, originalTheme, "utf8");
              }

              const files: FileDiff[] = [
                {
                  path: tokensLabel,
                  diff: await unifiedDiff(tokensLabel, originalTokens, nextTokens),
                  changed: nextTokens !== originalTokens,
                },
                {
                  path: themeLabel,
                  diff: await unifiedDiff(themeLabel, originalTheme, nextTheme),
                  changed: nextTheme !== originalTheme,
                },
              ];

              sendJson(res, 200, {
                ok: true,
                applied,
                skipped,
                files,
              });
              return;
            }

            if (nextTokens !== originalTokens) {
              writeFileSync(tokensPath, nextTokens, "utf8");
            }
            await runGenTheme(repoRoot);

            sendJson(res, 200, { ok: true, applied, skipped });
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
