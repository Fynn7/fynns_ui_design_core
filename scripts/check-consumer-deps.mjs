#!/usr/bin/env node
/** Consumer install health. Read-only by default; repair runs npm in the app package. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const CORE = "@fynn7/ui-design-core";
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));

export function resolveNpmCli() {
  const candidates = [process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
    path.resolve(path.dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js")];
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    candidates.push(path.join(dir, "node_modules/npm/bin/npm-cli.js"));
    if (process.platform !== "win32") {
      try { const cli = fs.realpathSync(path.join(dir, "npm")); if (cli.endsWith(".js")) candidates.push(cli); } catch {}
    }
  }
  return candidates.find(file => file && fs.existsSync(file)) ?? null;
}

// Use the consumer's resolution chain, never the tooling/core node_modules.
// Walking package directories also supports packages that hide package.json in exports.
function installedPackage(pkgRoot, name) {
  const require = createRequire(path.join(pkgRoot, "package.json"));
  for (const base of require.resolve.paths(name) ?? []) {
    const dir = path.join(base, name);
    try { fs.lstatSync(dir); } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    // A broken nearer install shadows any healthy ancestor install.
    try { return { dir, manifest: readJson(path.join(dir, "package.json")) }; }
    catch (error) { error.dependencyPath = dir; throw error; }
  }
  return null;
}

export function checkConsumerDependencies(pkgRoot) {
  const pkg = readJson(path.join(pkgRoot, "package.json"));
  const declared = { ...pkg.devDependencies, ...pkg.dependencies };
  const failures = [];
  let checked = 0;
  for (const name of Object.keys(declared).sort()) {
    if (Object.hasOwn(pkg.optionalDependencies ?? {}, name)) continue;
    if (!/^(?:@[\w.-]+\/)?[\w.-]+$/.test(name)) throw new Error(`Invalid dependency name: ${name}`);
    checked++;
    try {
      if (name === CORE) {
        const require = createRequire(path.join(pkgRoot, "package.json"));
        const dir = (require.resolve.paths(name) ?? []).map(base => path.join(base, name)).find(dir => {
          try { fs.lstatSync(dir); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; }
        });
        if (!dir || !fs.existsSync(path.join(dir, "src/index.ts"))) failures.push({ name, reason: "UI barrel missing" });
        continue;
      }
      const installed = installedPackage(pkgRoot, name);
      if (!installed) {
        failures.push({ name, reason: "package missing" });
        continue;
      }
      const { dir, manifest } = installed;
      const bins = typeof manifest.bin === "string" ? [manifest.bin] : Object.values(manifest.bin ?? {});
      for (const bin of bins) {
        if (typeof bin !== "string" || !fs.existsSync(path.resolve(dir, bin))) {
          failures.push({ name, reason: `CLI entry missing: ${bin}`, path: dir });
        }
      }
      if (typeof manifest.main === "string" && manifest.main.trim() && !manifest.exports) {
        try { createRequire(path.join(pkgRoot, "package.json")).resolve(path.resolve(dir, manifest.main)); }
        catch { failures.push({ name, reason: `main entry missing: ${manifest.main}`, path: dir }); }
      }
    } catch (error) {
      failures.push({ name, reason: `unreadable installed package: ${error.message}`, ...(error.dependencyPath ? { path: error.dependencyPath } : {}) });
    }
  }
  const repair = `node "${fileURLToPath(import.meta.url)}" --target "${pkgRoot}" --repair`;
  const message = failures.length
    ? `Consumer dependencies are incomplete in ${pkgRoot}:\n` +
      failures.map(({ name, reason }) => `  ${name}: ${reason}`).join("\n") +
      `\nA core link/export pass does not install app dependencies. A non-workspace root npm install does not install nested apps.\n` +
      `Repair this package (includes devDependencies and runs normal install hooks):\n  ${repair}\n` +
      `Or run npm install --include=dev in "${pkgRoot}". Then rerun the UI gate and the consumer typecheck/build.`
    : null;
  return { ok: failures.length === 0, checked, failures, issues: message ? [{ code: "consumer-dependencies", message }] : [], error: message };
}

export function repairConsumerDependencies(pkgRoot, { json = false, force = false } = {}) {
  const before = checkConsumerDependencies(pkgRoot);
  if (before.ok && !force) return { ...before, repaired: false };
  if (process.env.FYNNS_UI_REPAIRING_DEPS === "1" || process.env.npm_lifecycle_event === "postinstall" ||
      ["install", "ci"].includes(process.env.npm_command)) {
    throw new Error("Dependency repair cannot run inside install hooks. Run the repair command directly after npm exits.");
  }
  // Fixed arguments, cwd selects the package. Do not disable lifecycle scripts:
  // packages such as Electron/esbuild need them to be runnable.
  const npmCli = resolveNpmCli();
  const viaNode = npmCli && fs.existsSync(npmCli);
  const result = spawnSync(viaNode ? process.execPath : "npm", [
    ...(viaNode ? [npmCli] : []), "install", "--include=dev", "--no-audit", "--no-fund",
  ], {
    cwd: pkgRoot, windowsHide: true, shell: !viaNode && process.platform === "win32",
    env: { ...process.env, FYNNS_UI_REPAIRING_DEPS: "1" },
    stdio: json ? "pipe" : "inherit", encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
  if (json) {
    if (result.stdout) process.stderr.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  const after = checkConsumerDependencies(pkgRoot);
  if (result.error || result.status !== 0) {
    const message = `Consumer npm install failed (${result.error?.message ?? result.status}); preserve the npm/hook diagnostics above. A complete dependency tree alone does not make a failed install successful.`;
    return { ...after, ok: false, repaired: false, error: [message, after.error].filter(Boolean).join("\n"),
      issues: [{ code: "consumer-install", message }, ...after.issues] };
  }
  return { ...after, repaired: after.ok };
}

function main() {
  let target = process.cwd(), repair = false, json = false;
  try {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--target" && args[i + 1] && !args[i + 1].startsWith("--")) target = path.resolve(args[++i]);
      else if (args[i] === "--repair") repair = true;
      else if (args[i] === "--json") json = true;
      else throw new Error("Usage: node scripts/check-consumer-deps.mjs --target <app-package> [--repair] [--json]");
    }
    const result = repair ? repairConsumerDependencies(target, { json }) : checkConsumerDependencies(target);
    if (json) console.log(JSON.stringify({ pkgRoot: target, ...result }, null, 2));
    else if (result.ok) console.log(`[fynns-ui] consumer dependencies ready: ${target} (${result.checked} packages)`);
    else console.error(`[fynns-ui] ${result.error}`);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    const result = { ok: false, error: error.message, issues: [{ code: "consumer-dependency-tooling", message: error.message }] };
    if (json) console.log(JSON.stringify(result));
    else console.error(`[fynns-ui] ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) main();
