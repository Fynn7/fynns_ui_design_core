#!/usr/bin/env node
/**
 * Hard gate: consumer named imports from `@fynns/ui` must exist on the linked
 * `@fynn7/ui-design-core` barrel (src/index.ts + export * re-exports).
 *
 * Catches stale sibling checkouts before Vite serves a blank page with
 * "does not provide an export named ...".
 *
 * Usage:
 *   node scripts/check-ui-exports.mjs --target <consumer-pkg>
 *   node scripts/check-ui-exports.mjs --target ../my-app/apps/web --json
 *
 * Exit 1 when any imported symbol is missing from the linked barrel.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_NAME = "@fynn7/ui-design-core";
const ALIAS = "@fynns/ui";
const ENTRY_REL = path.join("node_modules", "@fynn7", "ui-design-core", "src", "index.ts");
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".vite",
  "playwright-report",
  "test-results",
]);

function usage() {
  return `Usage: node scripts/check-ui-exports.mjs --target <dir> [--json]

Scan consumer sources for named imports from ${ALIAS} and verify each symbol
exists on the linked ${PKG_NAME} barrel (${ENTRY_REL}).

Options:
  --target <dir>  Consumer package root (default: cwd)
  --json          Machine-readable result on stdout
  -h, --help
`;
}

function parseArgs(argv) {
  const out = { target: process.cwd(), json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v == null) throw new Error(`Missing value after ${a}`);
      return v;
    };
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--target") out.target = next();
    else if (a === "--json") out.json = true;
    else throw new Error(`Unknown argument: ${a}\n${usage()}`);
  }
  return out;
}

function findPkgRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function walkFiles(root, pred, out = []) {
  if (!fs.existsSync(root)) return out;
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const abs = path.join(root, ent.name);
    if (ent.isDirectory()) walkFiles(abs, pred, out);
    else if (pred(abs)) out.push(abs);
  }
  return out;
}

function stripComments(source) {
  return String(source || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Collect export names from a TS/JS module source (shallow). */
function collectLocalExportNames(source) {
  const names = new Set();
  const text = stripComments(source);

  for (const m of text.matchAll(
    /\bexport\s+(?:async\s+)?(?:function|class|const|let|var|enum|type|interface)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    names.add(m[1]);
  }

  for (const m of text.matchAll(/\bexport\s+(?:type\s+)?\{([^}]+)\}/g)) {
    const body = m[1];
    for (const part of body.split(",")) {
      const chunk = part.trim();
      if (!chunk || chunk.startsWith("type ")) {
        // bare `type Foo` inside a value export block
        const typeOnly = chunk.match(/^type\s+([A-Za-z_$][\w$]*)$/);
        if (typeOnly) names.add(typeOnly[1]);
        continue;
      }
      const asMatch = chunk.match(/^(?:type\s+)?[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (asMatch) {
        names.add(asMatch[1]);
        continue;
      }
      const typeAs = chunk.match(/^type\s+[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (typeAs) {
        names.add(typeAs[1]);
        continue;
      }
      const plain = chunk.match(/^([A-Za-z_$][\w$]*)$/);
      if (plain) names.add(plain[1]);
    }
  }

  return names;
}

/** Resolve `./foo` / `./foo.ts` relative to fromFile -> absolute path that exists. */
function resolveImportPath(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Walk barrel + `export * from` / named `export { ... } from` to build the public
 * name set. Depth-limited to avoid cycles.
 */
export function collectBarrelExports(entryFile, { maxDepth = 8 } = {}) {
  const names = new Set();
  const visited = new Set();

  function visit(file, depth) {
    if (!file || depth > maxDepth) return;
    let real;
    try {
      real = fs.realpathSync(file);
    } catch {
      real = path.resolve(file);
    }
    if (visited.has(real)) return;
    visited.add(real);
    if (!fs.existsSync(real)) return;

    const source = fs.readFileSync(real, "utf8");
    const text = stripComments(source);

    for (const n of collectLocalExportNames(source)) names.add(n);

    for (const m of text.matchAll(/\bexport\s*\*\s*from\s*["']([^"']+)["']/g)) {
      const resolved = resolveImportPath(real, m[1]);
      if (resolved) visit(resolved, depth + 1);
    }

    for (const m of text.matchAll(
      /\bexport\s+(?:type\s+)?\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
    )) {
      const body = m[1];
      const resolved = resolveImportPath(real, m[2]);
      for (const part of body.split(",")) {
        const chunk = part.trim();
        if (!chunk) continue;
        const asMatch = chunk.match(
          /^(?:type\s+)?[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/,
        );
        if (asMatch) {
          names.add(asMatch[1]);
          continue;
        }
        const typePlain = chunk.match(/^type\s+([A-Za-z_$][\w$]*)$/);
        if (typePlain) {
          names.add(typePlain[1]);
          continue;
        }
        const plain = chunk.match(/^([A-Za-z_$][\w$]*)$/);
        if (plain) names.add(plain[1]);
      }
      // Named re-exports are already recorded; no need to visit target for names
      // unless we want verification - names come from the clause itself.
      void resolved;
    }
  }

  visit(entryFile, 0);
  return names;
}

/** Parse named imports from `@fynns/ui` in a source string. */
export function collectFynnsUiImports(source) {
  const names = new Set();
  const text = stripComments(source);
  const re =
    /\bimport\s*(?:type\s*)?\{([^}]+)\}\s*from\s*["']@fynns\/ui["']/g;
  for (const m of text.matchAll(re)) {
    for (const part of m[1].split(",")) {
      const chunk = part.trim();
      if (!chunk) continue;
      const asMatch = chunk.match(/^(?:type\s+)?[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (asMatch) {
        // Local binding name is what the app uses; barrel must export the left side
        const left = chunk.match(/^(?:type\s+)?([A-Za-z_$][\w$]*)/);
        if (left) names.add(left[1]);
        continue;
      }
      const typePlain = chunk.match(/^type\s+([A-Za-z_$][\w$]*)$/);
      if (typePlain) {
        names.add(typePlain[1]);
        continue;
      }
      const plain = chunk.match(/^([A-Za-z_$][\w$]*)$/);
      if (plain) names.add(plain[1]);
    }
  }
  return names;
}

export function scanConsumerImports(pkgRoot) {
  const roots = ["src", "apps", "gui", "web", "client", "app"].map((d) =>
    path.join(pkgRoot, d),
  );
  // Also scan package root for flat layouts (rare)
  roots.push(pkgRoot);

  const files = [];
  const seen = new Set();
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const f of walkFiles(root, (p) => /\.(tsx?|jsx?|mjs|cjs)$/.test(p))) {
      const real = path.resolve(f);
      if (seen.has(real)) continue;
      // Avoid scanning linked core under node_modules (already skipped) and
      // avoid scanning this package's own scripts when target is core itself.
      if (real.includes(`${path.sep}node_modules${path.sep}`)) continue;
      seen.add(real);
      files.push(real);
    }
  }

  const byFile = new Map();
  const all = new Set();
  for (const file of files) {
    let source;
    try {
      source = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!source.includes(ALIAS)) continue;
    const names = collectFynnsUiImports(source);
    if (names.size === 0) continue;
    byFile.set(file, [...names].sort());
    for (const n of names) all.add(n);
  }
  return { files: byFile, imports: all };
}

export function resolveLinkedBarrel(pkgRoot) {
  const entry = path.join(pkgRoot, ENTRY_REL);
  if (fs.existsSync(entry)) return entry;
  // Walk up for monorepo nests
  let dir = pkgRoot;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, ENTRY_REL);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function checkUiExports(pkgRoot) {
  const barrelPath = resolveLinkedBarrel(pkgRoot);
  if (!barrelPath) {
    return {
      ok: false,
      error: `linked ${PKG_NAME} barrel not found (expected ${ENTRY_REL} under ${pkgRoot}). Run ensure-sibling --install.`,
      missing: [],
      imports: [],
      exports: [],
      barrelPath: null,
    };
  }

  const exports = collectBarrelExports(barrelPath);
  const { imports, files } = scanConsumerImports(pkgRoot);
  const missing = [...imports].filter((n) => !exports.has(n)).sort();

  return {
    ok: missing.length === 0,
    missing,
    imports: [...imports].sort(),
    exportsCount: exports.size,
    barrelPath,
    files: Object.fromEntries(
      [...files.entries()].map(([f, names]) => [path.relative(pkgRoot, f) || f, names]),
    ),
    error:
      missing.length === 0
        ? null
        : `${ALIAS} imports missing from linked ${PKG_NAME}: ${missing.join(", ")}\n` +
          `Barrel: ${barrelPath}\n` +
          `Fix: sync sibling UI core then retry:\n` +
          `  node node_modules/@fynn7/ui-design-core/scripts/ensure-sibling-ui-core.mjs --target "${pkgRoot}" --update\n` +
          `  (or: git -C ../fynns_ui_design_core pull)\n` +
          `Skip auto-sync only while editing core locally: FYNNS_UI_SKIP_SIBLING_SYNC=1`,
  };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }
  if (opts.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }

  const pkgRoot = findPkgRoot(opts.target);
  const result = checkUiExports(pkgRoot);

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({ pkgRoot, ...result }, null, 2)}\n`);
  } else if (result.ok) {
    console.log(
      `[fynns-ui] export gate ok: ${result.imports.length} @fynns/ui import(s) match barrel (${result.exportsCount} symbols)`,
    );
  } else {
    console.error(`[fynns-ui] ${result.error}`);
  }

  process.exit(result.ok ? 0 : 1);
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  try {
    return (
      fs.realpathSync(process.argv[1]).toLowerCase() ===
      fs.realpathSync(fileURLToPath(import.meta.url)).toLowerCase()
    );
  } catch {
    return false;
  }
})();

if (isDirectRun) main();
