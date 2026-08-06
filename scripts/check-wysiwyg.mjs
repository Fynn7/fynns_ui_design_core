/**
 * WYSIWYG allowlist: every value export from src/index.ts must appear in
 * sandbox Globals / Preview / Shell imports, or in llm/wysiwyg-companion.json.
 *
 * Usage: node scripts/check-wysiwyg.mjs
 * Exit 1 when uncovered symbols remain.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEMO_FILES = [
  "examples/sandbox/src/pages/GlobalsPage.tsx",
  "examples/sandbox/src/pages/CardPreviewCanvas.tsx",
  "examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx",
  "examples/sandbox/src/shell/SandboxShell.tsx",
];

const COMPANION_PATH = "llm/wysiwyg-companion.json";

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/** Collect value binding names from export declarations (not `export type`). */
function namedValueExports(src) {
  const names = new Set();

  // export { A, B as C }  — skip type-only members
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/gs)) {
    const block = m[0];
    if (/^export\s+type\s*\{/.test(block)) continue;
    for (const part of m[1].split(",")) {
      let t = part.trim();
      if (!t || t.startsWith("type ")) continue;
      const name = t.includes(" as ")
        ? t.split(/\s+as\s+/).pop().trim()
        : t.split(/\s+/)[0];
      if (name && /^[A-Za-z_$]/.test(name)) names.add(name);
    }
  }

  for (const m of src.matchAll(
    /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
  )) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/export\s+class\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/export\s+enum\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }

  return names;
}

function resolveStarTargets(src, fromDirAbs) {
  const out = [];
  for (const m of src.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    let p = path.resolve(fromDirAbs, m[1]);
    if (!fs.existsSync(p)) {
      if (fs.existsSync(`${p}.ts`)) p = `${p}.ts`;
      else if (fs.existsSync(`${p}.tsx`)) p = `${p}.tsx`;
      else if (fs.existsSync(path.join(p, "index.ts")))
        p = path.join(p, "index.ts");
      else continue;
    }
    out.push(p);
  }
  return out;
}

function collectBarrelValues() {
  const indexPath = path.join(ROOT, "src/index.ts");
  const index = fs.readFileSync(indexPath, "utf8");
  const values = namedValueExports(index);
  for (const abs of resolveStarTargets(index, path.dirname(indexPath))) {
    for (const n of namedValueExports(fs.readFileSync(abs, "utf8"))) {
      values.add(n);
    }
  }
  // Drop accidental type-only names from `export type { … }` blocks already skipped,
  // and standalone `export type Foo =`.
  for (const m of index.matchAll(/export\s+type\s+([A-Za-z_$][\w$]*)/g)) {
    values.delete(m[1]);
  }
  return values;
}

function importsFromFynnsUi(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["']@fynns\/ui["']/gs,
  )) {
    for (const part of m[1].split(",")) {
      let t = part.trim();
      if (!t || t.startsWith("type ")) continue;
      const name = t.includes(" as ")
        ? t.split(/\s+as\s+/)[0].trim()
        : t.split(/\s+/)[0];
      if (name && /^[A-Za-z_$]/.test(name)) names.add(name);
    }
  }
  return names;
}

function loadCompanion() {
  if (!exists(COMPANION_PATH)) {
    return { symbols: [], notes: {} };
  }
  return JSON.parse(read(COMPANION_PATH));
}

const values = collectBarrelValues();
const demos = new Set();
for (const rel of DEMO_FILES) {
  if (!exists(rel)) continue;
  for (const n of importsFromFynnsUi(read(rel))) demos.add(n);
}

const companion = loadCompanion();
const companionSet = new Set(companion.symbols ?? []);

const missing = [...values]
  .filter((v) => !demos.has(v) && !companionSet.has(v))
  .sort();

const unusedCompanion = [...companionSet]
  .filter((v) => !values.has(v))
  .sort();

if (unusedCompanion.length) {
  console.warn(
    `[check-wysiwyg] companion symbols not in barrel (stale):\n  ${unusedCompanion.join("\n  ")}`,
  );
}

if (missing.length) {
  console.error(
    `[check-wysiwyg] ${missing.length} public value(s) lack Globals/Preview/Shell import and companion allowlist:\n  ${missing.join("\n  ")}`,
  );
  process.exit(1);
}

console.log(
  `[check-wysiwyg] ok — ${values.size} barrel values; ${demos.size} demo imports; ${companionSet.size} companions`,
);
