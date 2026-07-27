import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Connect, Plugin } from "vite";
import type { CollapsibleCardRecipe } from "../../../src/primitives/collapsible-card.recipe";
import {
  patchCollapsibleCardRecipeCss,
  serializeCollapsibleCardRecipeFile,
} from "../src/recipes/serializeRecipe";
import { validateRecipeDraft } from "../src/recipes/recipeSchema";

const execFileAsync = promisify(execFile);

export type ApplyRecipeFileDiff = {
  path: string;
  diff: string;
  changed: boolean;
};

async function unifiedDiff(fileLabel: string, before: string, after: string): Promise<string> {
  if (before === after) return "";
  const dir = mkdtempSync(path.join(tmpdir(), "fynns-recipe-diff-"));
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
      const e = err as { code?: number; stdout?: string };
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

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function parseRecipe(body: unknown): CollapsibleCardRecipe | { error: string } {
  const recipe = (body as { recipe?: unknown })?.recipe;
  if (typeof recipe !== "object" || recipe === null || Array.isArray(recipe)) {
    return { error: "recipe must be an object" };
  }
  const draft = recipe as CollapsibleCardRecipe;
  const validation = validateRecipeDraft(draft);
  if (!validation.ok) return { error: validation.error };
  return draft;
}

/**
 * Dev-only middleware:
 * - POST `/__fynns/apply-recipe/preview` → unified diffs (no write)
 * - POST `/__fynns/apply-recipe` → write recipe + CSS recipe block
 */
export function applyRecipePlugin(repoRoot: string): Plugin {
  const recipeLabel = "src/primitives/collapsible-card.recipe.ts";
  const cssLabel = "src/primitives/primitives.css";

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
    name: "fynns-apply-recipe",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/__fynns/apply-recipe" && url !== "/__fynns/apply-recipe/preview") {
          next();
          return;
        }
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        const isPreview = url === "/__fynns/apply-recipe/preview";

        try {
          await withGate(async () => {
            const body = await readJsonBody(req);
            const parsed = parseRecipe(body);
            if ("error" in parsed) {
              sendJson(res, 400, { error: parsed.error });
              return;
            }

            const recipePath = path.join(repoRoot, "src/primitives/collapsible-card.recipe.ts");
            const cssPath = path.join(repoRoot, "src/primitives/primitives.css");
            const originalRecipe = readFileSync(recipePath, "utf8");
            const originalCss = readFileSync(cssPath, "utf8");
            const nextRecipe = serializeCollapsibleCardRecipeFile(parsed);
            const nextCss = patchCollapsibleCardRecipeCss(originalCss, parsed.cssOverrides);

            if (nextRecipe === originalRecipe && nextCss === originalCss) {
              sendJson(res, 400, { error: "No changes to apply" });
              return;
            }

            const files: ApplyRecipeFileDiff[] = [
              {
                path: recipeLabel,
                diff: await unifiedDiff(recipeLabel, originalRecipe, nextRecipe),
                changed: nextRecipe !== originalRecipe,
              },
              {
                path: cssLabel,
                diff: await unifiedDiff(cssLabel, originalCss, nextCss),
                changed: nextCss !== originalCss,
              },
            ];

            if (isPreview) {
              sendJson(res, 200, { ok: true, files });
              return;
            }

            writeFileSync(recipePath, nextRecipe, "utf8");
            writeFileSync(cssPath, nextCss, "utf8");
            sendJson(res, 200, { ok: true, files });
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
