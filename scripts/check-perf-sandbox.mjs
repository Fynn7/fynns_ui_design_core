/**
 * Sandbox performance regressions gate (see llm/PERF.md).
 *
 * - Inspectors must not LazyCollapsible defaultOpen (tip/slider forests).
 * - ClippedNavShell must not append measure probes to an observed host.
 * - LazyCollapsible + PERF.md must exist.
 *
 * Usage: node scripts/check-perf-sandbox.mjs
 * Exit 1 on regression.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const errors = [];

if (!exists("llm/PERF.md")) {
  errors.push("missing llm/PERF.md (authoritative performance rules)");
}

if (!exists("examples/sandbox/src/components/LazyCollapsible.tsx")) {
  errors.push(
    "missing examples/sandbox/src/components/LazyCollapsible.tsx (inspector unmount helper)",
  );
}

const inspectorFiles = [
  "examples/sandbox/src/pages/PropertyInspector.tsx",
  "examples/sandbox/src/pages/GlobalsInspector.tsx",
  "examples/sandbox/src/pages/LayoutChromeInspector.tsx",
];

for (const rel of inspectorFiles) {
  if (!exists(rel)) {
    errors.push(`missing ${rel}`);
    continue;
  }
  const src = read(rel);
  if (/<LazyCollapsible\b[^>]*\bdefaultOpen\b/.test(src)) {
    errors.push(
      `${rel}: LazyCollapsible must not use defaultOpen (hard-refresh tip/slider forest — llm/PERF.md)`,
    );
  }
  if (!src.includes("LazyCollapsible")) {
    errors.push(
      `${rel}: expected LazyCollapsible for dense inspector sections`,
    );
  }
}

const shellRel = "src/primitives/ClippedNavShell.tsx";
if (!exists(shellRel)) {
  errors.push(`missing ${shellRel}`);
} else {
  const shell = read(shellRel);
  /* Old thrash pattern: probe appended to the observed shell host. */
  if (/host\.appendChild\s*\(/.test(shell)) {
    errors.push(
      `${shellRel}: must not append measure probes to the shell host (observer feedback loop — llm/PERF.md)`,
    );
  }
  if (!/function resolveLengthPx/.test(shell)) {
    errors.push(
      `${shellRel}: expected resolveLengthPx (DOM-free length resolution)`,
    );
  }
}

const globalsRel = "examples/sandbox/src/pages/GlobalsPage.tsx";
if (exists(globalsRel)) {
  const globals = read(globalsRel);
  if (!/children:\s*\(\)\s*=>\s*ReactNode/.test(globals)) {
    errors.push(
      `${globalsRel}: GlobalsCategory should take children: () => ReactNode (lazy mount)`,
    );
  }
  if (!/\{\s*open\s*\?\s*\([\s\S]*?children\(\)/.test(globals)) {
    errors.push(
      `${globalsRel}: closed categories must call children() only when open`,
    );
  }
}

if (errors.length > 0) {
  console.error("check:perf-sandbox failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nSee llm/PERF.md");
  process.exit(1);
}

console.log("check:perf-sandbox: ok");
