#!/usr/bin/env node
/**
 * Assert every tracked repomix config includes the shared ignore patterns.
 * Repomix has no config extends — this gate prevents drift.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const sharedPath = join(root, "scripts", "repomix-shared-ignore.json");
const shared = JSON.parse(readFileSync(sharedPath, "utf8"));
const required = shared.requiredCustomPatterns || [];
const configs = shared.configs || [];

const errors = [];

for (const rel of configs) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    errors.push(`missing config: ${rel}`);
    continue;
  }
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    errors.push(`${rel}: invalid JSON (${e.message})`);
    continue;
  }
  const patterns = cfg?.ignore?.customPatterns;
  if (!Array.isArray(patterns)) {
    errors.push(`${rel}: missing ignore.customPatterns array`);
    continue;
  }
  for (const need of required) {
    const ok = patterns.some(
      (p) => p === need || (need === ".tmp*" && (p === ".tmp*" || p === ".tmp*/**" || p.startsWith(".tmp"))),
    );
    if (!ok) errors.push(`${rel}: missing shared ignore pattern "${need}"`);
  }
}

// lite must not pack machine JSON twins or design-system chapter dumps
const litePath = join(root, "repomix.agent-slim-advice-lite.config.json");
if (existsSync(litePath)) {
  const lite = JSON.parse(readFileSync(litePath, "utf8"));
  const ignore = lite?.ignore?.customPatterns || [];
  const include = lite?.include || [];
  for (const banned of ["llm/agent-interfaces.json", "llm/consume.json", "llm/wysiwyg-companion.json"]) {
    if (include.includes(banned)) {
      errors.push(`lite config must not include ${banned}`);
    }
  }
  for (const need of ["docs/design-system/**", "llm/archive/**", "llm/consumer-cursor-rule.mdc"]) {
    if (!ignore.includes(need)) {
      errors.push(`lite config must ignore ${need}`);
    }
  }
}

const fullPath = join(root, "repomix.agent-slim-advice.config.json");
if (existsSync(fullPath)) {
  const full = JSON.parse(readFileSync(fullPath, "utf8"));
  const include = full?.include || [];
  for (const banned of ["llm/agent-interfaces.json", "llm/consume.json", "llm/wysiwyg-companion.json"]) {
    if (include.includes(banned)) {
      errors.push(`full slim-advice config must not include ${banned}`);
    }
  }
}

if (errors.length) {
  console.error("check-repomix-base failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`check-repomix-base: ok (${configs.length} configs)`);
