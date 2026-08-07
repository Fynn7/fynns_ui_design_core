/**
 * WYSIWYG + public-surface sync gate.
 *
 * 1. Every value export from src/index.ts must appear in sandbox Globals /
 *    Preview / Shell `@fynns/ui` imports, or in llm/wysiwyg-companion.json.
 * 2. Symbols listed as Removed in llm/BREAKING_PURGE.md must not reappear in
 *    the barrel (value or type exports).
 * 3. Companion allowlist must not park visual primitives (src/primitives/*.tsx
 *    whose basename matches the symbol) — demo them or delete the export.
 * 4. globalsCatalog labels must not name purged symbols.
 * 5. SANDBOX_DEFAULT_OVERRIDES empty; radius-md tokens ↔ theme.css synced.
 *
 * Usage: node scripts/check-wysiwyg.mjs
 * Exit 1 when any check fails.
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
const PURGE_PATH = "llm/BREAKING_PURGE.md";
const CATALOG_PATH = "examples/sandbox/src/catalog/globalsCatalog.ts";
const PRIMITIVES_DIR = "src/primitives";

/** Fail the process after printing all error blocks (collect-then-exit). */
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/** Collect value binding names from export declarations (not `export type`). */
function namedValueExports(src) {
  const names = new Set();

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

/** Type-only export names from `export type { A, B }` and `export type Foo =`. */
function namedTypeExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+type\s*\{([^}]+)\}/gs)) {
    for (const part of m[1].split(",")) {
      let t = part.trim();
      if (!t) continue;
      const name = t.includes(" as ")
        ? t.split(/\s+as\s+/).pop().trim()
        : t.split(/\s+/)[0];
      if (name && /^[A-Za-z_$]/.test(name)) names.add(name);
    }
  }
  for (const m of src.matchAll(
    /export\s+type\s+([A-Za-z_$][\w$]*)\s*(?:=|<)/g,
  )) {
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

function collectBarrel() {
  const indexPath = path.join(ROOT, "src/index.ts");
  const index = fs.readFileSync(indexPath, "utf8");
  const values = namedValueExports(index);
  const types = namedTypeExports(index);
  for (const abs of resolveStarTargets(index, path.dirname(indexPath))) {
    const src = fs.readFileSync(abs, "utf8");
    for (const n of namedValueExports(src)) values.add(n);
    for (const n of namedTypeExports(src)) types.add(n);
  }
  // Drop accidental type-only names from value set.
  for (const m of index.matchAll(/export\s+type\s+([A-Za-z_$][\w$]*)/g)) {
    values.delete(m[1]);
  }
  for (const t of types) values.delete(t);
  return { values, types, all: new Set([...values, ...types]) };
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

/**
 * Parse Removed-table **first column** identifiers from BREAKING_PURGE.md.
 * Exact names (`Badge`) and prefixes (`ListGroup*`). Ignores the Consumer-fix
 * column (which cites replacement APIs that stay public).
 * Skips CSS selectors (`.fynns-…`) and prop-ish fragments with spaces/`=`.
 */
function parsePurgedPatterns(md) {
  const exact = new Set();
  const prefixes = [];
  const suffixes = [];
  const section = md.split(/^## Restored after purge/m)[0] ?? md;
  const afterRemoved = section.split(/^## Removed → how consumers should fix/m)[1];
  if (!afterRemoved) {
    fail(
      `[check-wysiwyg] could not find "## Removed → how consumers should fix" in ${PURGE_PATH}`,
    );
    return { exact, prefixes, suffixes };
  }
  // Stop before companion / other sections so replacement APIs stay public.
  const table =
    afterRemoved.split(/^## Still public/m)[0] ??
    afterRemoved.split(/^## /m)[0] ??
    afterRemoved;
  for (const line of table.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*Removed\s*\|/i.test(line) || /^\|\s*---/.test(line)) continue;
    const cells = line.split("|").slice(1, -1);
    if (cells.length < 2) continue;
    const removedCell = cells[0];
    for (const m of removedCell.matchAll(/`([^`]+)`/g)) {
      const raw = m[1].trim();
      if (!raw || raw.startsWith(".")) continue;
      if (/\s|=/.test(raw)) continue;
      if (raw.endsWith("*") && !raw.startsWith("*")) {
        const p = raw.slice(0, -1);
        if (/^[A-Za-z_$][\w$]*$/.test(p)) prefixes.push(p);
        continue;
      }
      if (raw.startsWith("*") && !raw.endsWith("*")) {
        const s = raw.slice(1);
        if (/^[A-Za-z_$][\w$]*$/.test(s)) suffixes.push(s);
        continue;
      }
      if (/^[A-Za-z_$][\w$]*$/.test(raw)) {
        // Skip prop fragments accidentally backticked in the Removed cell.
        if (
          /^(size|md|sm|xs|lg|xl|variant|interactive|selected|type|prop)$/.test(
            raw,
          )
        ) {
          continue;
        }
        exact.add(raw);
      }
    }
  }
  return { exact, prefixes, suffixes };
}

function matchesPurged(name, { exact, prefixes, suffixes }) {
  if (exact.has(name)) return true;
  if (prefixes.some((p) => name.startsWith(p))) return true;
  if (suffixes.some((s) => name.endsWith(s))) return true;
  return false;
}

/** Primitive basenames that look like public components (PascalCase .tsx). */
function primitiveComponentFiles() {
  const dir = path.join(ROOT, PRIMITIVES_DIR);
  if (!fs.existsSync(dir)) return new Set();
  const out = new Set();
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    const m = ent.name.match(/^([A-Z][A-Za-z0-9]*)\.tsx$/);
    if (m) out.add(m[1]);
  }
  return out;
}

function catalogLabels(src) {
  const labels = [];
  for (const m of src.matchAll(/\blabel:\s*"([^"]+)"/g)) {
    labels.push(m[1]);
  }
  return labels;
}

/** Split catalog labels like "Dialog / Drawer / Sheet" into tokens. */
function catalogTokens(label) {
  return label
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter((s) => /^[A-Z][A-Za-z0-9]*$/.test(s));
}

// —— run checks ——

const { values, types, all: barrelAll } = collectBarrel();
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
    `[check-wysiwyg] companion symbols not in barrel (stale):\n  ${unusedCompanion.join("\n  ")}\n` +
      "  Remove them from llm/wysiwyg-companion.json.",
  );
}

if (missing.length) {
  fail(
    `[check-wysiwyg] ${missing.length} public value(s) lack Globals/Preview/Shell import and companion allowlist:\n` +
      missing.map((s) => `  ${s}`).join("\n") +
      "\n\n" +
      "  Sandbox and barrel must stay aligned. Fix by ONE of:\n" +
      "  (A) Demo: import the symbol in GlobalsPage / Preview / SandboxShell, or\n" +
      "  (B) Atomic delete (never sandbox-only):\n" +
      "      • remove export from src/index.ts\n" +
      "      • delete primitive TSX + .fynns-* CSS\n" +
      "      • drop Globals demo + catalog + i18n\n" +
      "      • update AGENTS.md / keep-set rules\n" +
      "      • add a row to llm/BREAKING_PURGE.md Removed table\n" +
      "  Do NOT drop a Globals demo while the symbol stays exported — CI will fail here.\n" +
      "  Do NOT park visual components in llm/wysiwyg-companion.json.",
  );
}

// Companion must not hide visual primitives.
const primitiveFiles = primitiveComponentFiles();
const companionPrimitives = [...companionSet]
  .filter((s) => primitiveFiles.has(s))
  .sort();
if (companionPrimitives.length) {
  fail(
    `[check-wysiwyg] companion allowlist parks visual primitive(s):\n` +
      companionPrimitives.map((s) => `  ${s} (src/primitives/${s}.tsx)`).join("\n") +
      "\n  Demo in Globals/Preview or delete the export (atomic). Never companion-park components.",
  );
}

// Purged symbols must not return to the barrel.
if (!exists(PURGE_PATH)) {
  fail(`[check-wysiwyg] missing ${PURGE_PATH}`);
} else {
  const purged = parsePurgedPatterns(read(PURGE_PATH));
  const revived = [...barrelAll]
    .filter((n) => matchesPurged(n, purged))
    .sort();
  if (revived.length) {
    fail(
      `[check-wysiwyg] purged symbol(s) still exported from src/index.ts:\n` +
        revived.map((s) => `  ${s}`).join("\n") +
        `\n  Remove the export (and source) or drop the row from ${PURGE_PATH}.`,
    );
  }

  // Catalog must not advertise purged components.
  if (exists(CATALOG_PATH)) {
    const staleCatalog = [];
    for (const label of catalogLabels(read(CATALOG_PATH))) {
      for (const tok of catalogTokens(label)) {
        if (matchesPurged(tok, purged)) {
          staleCatalog.push(`${label} → ${tok}`);
        }
      }
    }
    if (staleCatalog.length) {
      fail(
        `[check-wysiwyg] globalsCatalog still names purged symbol(s):\n` +
          staleCatalog.map((s) => `  ${s}`).join("\n") +
          "\n  Remove the catalog entry in the same change as the export delete.",
      );
    }
  }
}

/**
 * Sandbox resting aesthetics must equal shipped tokens. Non-empty
 * `SANDBOX_DEFAULT_OVERRIDES` (e.g. former `--fynns-radius-md: 20px`) makes
 * Globals look approved while consumers still get the old token values.
 */
function assertSandboxOverridesEmpty() {
  const src = read("examples/sandbox/src/state/baseline.ts");
  const m = src.match(
    /export const SANDBOX_DEFAULT_OVERRIDES\s*:\s*Record<string,\s*string>\s*=\s*\{([^}]*)\}/,
  );
  if (!m) {
    fail("[check-wysiwyg] SANDBOX_DEFAULT_OVERRIDES not found in baseline.ts");
    return;
  }
  const body = m[1]
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .trim();
  if (body.length > 0) {
    fail(
      "[check-wysiwyg] SANDBOX_DEFAULT_OVERRIDES must stay empty (WYSIWYG).\n" +
        "  Promote any nodded sandbox look into src/theme/tokens.ts + npm run gen:theme.\n" +
        `  Non-empty body:\n${body}`,
    );
  }
}

assertSandboxOverridesEmpty();

/**
 * Shipped theme.css must match tokens.ts for radius-md (WYSIWYG pin).
 */
function assertRadiusMdThemeSynced() {
  const tokensSrc = read("src/theme/tokens.ts");
  const themeSrc = read("src/theme/theme.css");
  const tokenMd = tokensSrc.match(
    /export const RADIUS_TOKENS[\s\S]*?\bmd:\s*"([^"]+)"/,
  )?.[1];
  const themeMd = themeSrc.match(/--fynns-radius-md:\s*([^;]+);/)?.[1]?.trim();
  if (!tokenMd || !themeMd) {
    fail(
      "[check-wysiwyg] could not parse RADIUS_TOKENS.md or --fynns-radius-md",
    );
    return;
  }
  if (tokenMd !== themeMd) {
    fail(
      `[check-wysiwyg] --fynns-radius-md drift: tokens.ts="${tokenMd}" theme.css="${themeMd}".\n` +
        "  Run: npm run gen:theme",
    );
  }
}

assertRadiusMdThemeSynced();

if (errors.length) {
  for (const e of errors) console.error(`${e}\n`);
  process.exit(1);
}

console.log(
  `[check-wysiwyg] ok — ${values.size} barrel values; ${types.size} type exports; ${demos.size} demo imports; ${companionSet.size} companions; purge table enforced; sandbox overrides empty; radius-md=${read("src/theme/theme.css").match(/--fynns-radius-md:\s*([^;]+);/)?.[1]?.trim()}`,
);
