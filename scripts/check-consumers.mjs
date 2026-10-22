#!/usr/bin/env node
/** Read-only compatibility preflight against every explicitly affected package.
 * No sync, install, migration or implicit scan of sibling repositories. */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const targets = [];
const args = process.argv.slice(2);
const usage = "Usage: npm run check:consumers -- --target <package> [--target <package> ...]";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target" && args[i + 1] && !args[i + 1].startsWith("--")) targets.push(path.resolve(args[++i]));
  else {
    console.error(usage);
    process.exit(1);
  }
}
if (!targets.length) {
  console.error(usage);
  process.exit(1);
}
const gate = fileURLToPath(new URL("./check-ui-exports.mjs", import.meta.url));
let failed = 0;
for (const target of new Set(targets)) {
  const result = spawnSync(process.execPath, [gate, "--target", target, "--json"], {
    encoding: "utf8", windowsHide: true,
  });
  let report;
  try { report = JSON.parse(result.stdout); } catch { /* report tooling failure below */ }
  const ok = result.status === 0 && report?.ok === true;
  console.log(`[fynns-ui] consumer ${ok ? "PASS" : "FAIL"}: ${target}`);
  if (!ok) {
    failed++;
    console.error(report?.error || result.error?.message || result.stderr || result.stdout || "Consumer gate failed without diagnostics.");
  }
}
console.log(`[fynns-ui] consumer preflight: ${new Set(targets).size - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
