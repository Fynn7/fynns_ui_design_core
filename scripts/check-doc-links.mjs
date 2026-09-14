#!/usr/bin/env node
/**
 * Lightweight doc-link / catalog gate for agent-facing docs.
 * - documentation[].path in llm/agent-interfaces.json must exist
 * - catalog must list docs/DESIGN_SYSTEM.md as design-system SoT
 * - AGENTS.md must not be role=design-system in the JSON twin
 * - relative markdown links in key entry docs must resolve
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const errors = [];

function absFromRepo(rel) {
  return join(root, rel.replace(/\\/g, "/"));
}

const ifacePath = join(root, "llm", "agent-interfaces.json");
const iface = JSON.parse(readFileSync(ifacePath, "utf8"));
const docs = iface.documentation || [];

let hasDesignSystem = false;
for (const entry of docs) {
  const p = entry?.path;
  if (!p) {
    errors.push("agent-interfaces.json: documentation entry missing path");
    continue;
  }
  if (!existsSync(absFromRepo(p))) {
    errors.push(`agent-interfaces.json: missing file ${p}`);
  }
  if (p === "docs/DESIGN_SYSTEM.md" && entry.role === "design-system") {
    hasDesignSystem = true;
  }
  if (p === "AGENTS.md" && entry.role === "design-system") {
    errors.push("agent-interfaces.json: AGENTS.md must not be role=design-system (use agent-always-on-slim)");
  }
}
if (!hasDesignSystem) {
  errors.push('agent-interfaces.json: must include docs/DESIGN_SYSTEM.md with role "design-system"');
}

const SCAN = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "llm/AGENT_INTERFACES.md",
  "llm/CONSUMER_TREATY.md",
  "llm/BREAKING_PURGE.md",
  "docs/DESIGN_SYSTEM.md",
];

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

for (const rel of SCAN) {
  const abs = absFromRepo(rel);
  if (!existsSync(abs)) {
    errors.push(`missing scan target: ${rel}`);
    continue;
  }
  const text = readFileSync(abs, "utf8");
  const baseDir = dirname(abs);
  let m;
  while ((m = LINK_RE.exec(text))) {
    let href = m[2].trim();
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
      continue;
    }
    if (href.startsWith("#")) continue;
    const hash = href.indexOf("#");
    if (hash >= 0) href = href.slice(0, hash);
    if (!href) continue;
    // skip bare anchors / templates
    if (href.includes("{{") || href.startsWith("skill://")) continue;
    const target = normalize(join(baseDir, href));
    if (!target.startsWith(normalize(root))) continue;
    if (!existsSync(target)) {
      errors.push(`${rel}: broken link → ${m[2]}`);
    }
  }
}

if (errors.length) {
  console.error("check-doc-links failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-doc-links: ok (${docs.length} catalog paths, ${SCAN.length} scanned files)`);
