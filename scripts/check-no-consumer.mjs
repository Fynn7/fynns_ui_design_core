#!/usr/bin/env node
/**
 * Hard gate: sandbox / demo paths must not contain consumer product strings.
 * Authority: .cursor/rules/no-consumer-content.mdc +
 * .cursor/rules/timeline-catalog.mdc + AGENTS.md Hard rules.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/** Case-insensitive substrings that must not appear in scanned files. */
const DENY = [
  // Named consumer products / repos (as demo subject — not incidental docs)
  "fynns_cv_generator",
  "cv generator",
  "cv-generator",
  "gsc-live-preview",
  "gsc live preview",
  "agents-hub",
  "fynns_music_studio",
  "fynns_corrector",
  "fynns_learnspace",
  "awesome_afs_visualizer",
  // Concrete consumer domain leaked into demos historically
  "universität duisburg",
  "universitat duisburg",
  "duisburg-essen",
  "international studies in engineering",
  "工作经历",
  "教育经历",
  "个人经历",
];

/** Regex denylist — lettered / ranked timeline comparison shells in demos.
 * Require uppercase A/B/C so English "a timeline" does not false-positive.
 * Do not ban form-demo "Option A" radio labels — only Variant/Shell ranking. */
const DENY_RE = [
  /\b(?:[Vv]ariant|[Ss]hell)\s+[ABC]\b/,
  /\b[ABC]\s*[·•]\s*(?:flat|list|timeline|detail)\b/i,
  /\b(?:flat|list|timeline)\s*[·•]\s*[ABC]\b/i,
  /\blist-detail\b/i,
  /\blistDetail\b/,
  /\bTimeline\s+[ABC]\b/,
  /\b[ABC]\s+Timeline\b/,
  /方案\s*[ABC]/,
  /壳\s*[ABC]/,
];

const SCAN_ROOTS = [
  "examples/sandbox/src",
];

const EXT = new Set([".ts", ".tsx", ".css", ".md", ".json"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else {
      const i = name.lastIndexOf(".");
      const ext = i >= 0 ? name.slice(i) : "";
      if (EXT.has(ext)) out.push(p);
    }
  }
  return out;
}

const hits = [];
for (const relRoot of SCAN_ROOTS) {
  const abs = join(root, relRoot);
  let files;
  try {
    files = walk(abs);
  } catch {
    continue;
  }
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const lower = text.toLowerCase();
    for (const term of DENY) {
      if (lower.includes(term.toLowerCase())) {
        hits.push({ file: relative(root, file).replace(/\\/g, "/"), term });
      }
    }
    for (const re of DENY_RE) {
      const m = text.match(re);
      if (m) {
        hits.push({
          file: relative(root, file).replace(/\\/g, "/"),
          term: `/${re.source}/ ← "${m[0]}"`,
        });
      }
    }
  }
}

if (hits.length) {
  console.error(
    "[check:no-consumer] Forbidden consumer-shaped strings in sandbox demos:\n",
  );
  for (const h of hits) {
    console.error(`  ${h.file}  ←  "${h.term}"`);
  }
  console.error(
    "\nRewrite to generic UI-shell placeholders. See .cursor/rules/no-consumer-content.mdc",
  );
  process.exit(1);
}

console.log("[check:no-consumer] ok — sandbox scan clean");
