#!/usr/bin/env node
/** Deterministic startup recovery; strict read-only gates remain independently callable. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkConsumerDependencies, repairConsumerDependencies, resolveNpmCli } from "./check-consumer-deps.mjs";
import { checkUiExports, scanConsumerImports } from "./check-ui-exports.mjs";
import { fixWorkspaceFiles } from "./check-workspace-ui.mjs";
import { ensureNoStoreDevHeader } from "./vite-dev-cache.mjs";

const mutation = /\b(?:npm(?:-cli\.js)?|npm\.js)["']?\s+(?:(?:--[\w-]+(?:=[^\s]+)?)\s+)*(?:install|add|i|in|ins|inst|insta|instal|isnt|isnta|isntal|isntall|ci|rebuild|update|uninstall|prune|dedupe|link)\b|\bnpm-cli\.js["']?\s+(?:run|run-script)\s+(?:preinstall|install|postinstall|prepare)\b/i;
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { return error.code === "EPERM"; } };

/** Nested `npm run gate` replaces npm_lifecycle_event/npm_command. Inspect the
 * ancestry before starting npm, so an external install cannot recursively install. */
export function installationContext() {
  if (process.env.FYNNS_UI_REPAIRING_DEPS === "1" ||
      ["preinstall", "install", "postinstall", "prepare"].includes(process.env.npm_lifecycle_event) ||
      ["install", "ci", "rebuild", "update", "uninstall", "prune", "dedupe", "link"].includes(process.env.npm_command)) return "install";
  if (process.platform === "win32") {
    const script = `$ErrorActionPreference='Stop'; try { $taskPid=${process.ppid}; for($i=0;$i -lt 32 -and $taskPid -gt 0;$i++){ $p=Get-CimInstance Win32_Process -Filter ('ProcessId='+$taskPid); if(!$p){break}; if($p.CommandLine -match '${mutation.source.replace(/'/g, "''")}'){Write-Output 'install';exit}; $taskPid=[int]$p.ParentProcessId }; Write-Output 'startup' } catch { Write-Output 'unknown' }`;
    const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      encoding: "utf8", windowsHide: true, timeout: 10000,
    });
    const value = result.stdout?.trim();
    return ["install", "startup"].includes(value) ? value : "unknown";
  }
  let pid = process.ppid;
  try {
    for (let i = 0; i < 32 && pid > 1; i++) {
      if (process.platform === "linux") {
        const command = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ");
        if (mutation.test(command)) return "install";
        pid = Number(/^PPid:\s*(\d+)/m.exec(fs.readFileSync(`/proc/${pid}/status`, "utf8"))?.[1] ?? 0);
      } else {
        const result = spawnSync("ps", ["-p", String(pid), "-o", "ppid=", "-o", "command="], { encoding: "utf8" });
        if (result.status !== 0) return "unknown";
        if (mutation.test(result.stdout)) return "install";
        pid = Number(/^\s*(\d+)/.exec(result.stdout)?.[1] ?? 0);
      }
    }
    return "startup";
  } catch (error) { return error.code === "ENOENT" ? "startup" : "unknown"; }
}

function npmTree(pkgRoot) {
  const cli = resolveNpmCli();
  const viaNode = cli && fs.existsSync(cli);
  const result = spawnSync(viaNode ? process.execPath : "npm", [
    ...(viaNode ? [cli] : []), "ls", "--all", "--json",
  ], { cwd: pkgRoot, encoding: "utf8", windowsHide: true, shell: !viaNode && process.platform === "win32", maxBuffer: 32 * 1024 * 1024 });
  let tree;
  try { tree = JSON.parse(result.stdout); } catch {
    throw new Error(`Cannot verify npm dependency tree: ${result.error?.message || result.stderr || "invalid npm ls output"}`);
  }
  const accepted = validLinkedCorePeers(pkgRoot, tree, cli);
  const problems = [...new Set(tree.problems ?? [])].filter(problem => !problem.startsWith("extraneous:") &&
    !accepted.has(problem) && !validLocalAlias(pkgRoot, problem));
  if (result.error || (result.status !== 0 && !problems.length && !tree.problems?.length)) {
    throw new Error(`npm dependency tree check failed: ${result.error?.message || tree.error?.summary || result.stderr}`);
  }
  return problems;
}

function installedDirectory(pkgRoot, name) {
  const require = createRequire(path.join(pkgRoot, "package.json"));
  return (require.resolve.paths(name) ?? []).map(base => path.join(base, name)).find(dir => {
    try { fs.lstatSync(dir); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; }
  });
}

function declaredSource(pkgRoot, spec) {
  return typeof spec === "string" && spec.startsWith("file:")
    ? spec.startsWith("file://") ? fileURLToPath(spec) : path.resolve(pkgRoot, spec.slice(5)) : null;
}

function validLocalAlias(pkgRoot, problem) {
  if (!problem.startsWith("invalid:")) return false;
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8").replace(/^\uFEFF/, ""));
  for (const [name, spec] of Object.entries({ ...pkg.devDependencies, ...pkg.dependencies })) {
    const source = declaredSource(pkgRoot, spec);
    if (!source) continue;
    const dir = installedDirectory(pkgRoot, name);
    if (!dir || !fs.lstatSync(dir).isSymbolicLink() || !problem.endsWith(` ${dir}`) || !problem.startsWith(`invalid: ${name}@`)) continue;
    if (fs.realpathSync(dir) === fs.realpathSync(source)) return true;
    // npm can flag an app-local junction to its own healthy hoisted copy as
    // invalid for file: specs. Accept only aliases recorded by this recovery.
    try {
      const journal = JSON.parse(fs.readFileSync(path.join(repositoryRoot(pkgRoot), ".fynns-ui-recovery/cli-links.json"), "utf8"));
      const record = journal[dir];
      if (record && record.source === fs.realpathSync(source) && record.target === fs.realpathSync(dir) &&
          JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8")).version ===
          JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).version) return true;
    } catch {}
  }
  return false;
}

function validLinkedCorePeers(pkgRoot, tree, cli) {
  const accepted = new Set();
  const core = installedDirectory(pkgRoot, "@fynn7/ui-design-core");
  if (!core || !fs.lstatSync(core).isSymbolicLink() || !cli) return accepted;
  const config = ["ts", "mts", "js", "mjs", "cjs"].map(ext => path.join(pkgRoot, `vite.config.${ext}`)).find(fs.existsSync);
  if (!config) return accepted;
  const source = fs.readFileSync(config, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const dedupe = /\bdedupe\s*:\s*\[([^\]]*)\]/.exec(source)?.[1] ?? "";
  if (!["react", "react-dom"].every(name => new RegExp(`["']${name}["']`).test(dedupe))) return accepted;
  const manifest = JSON.parse(fs.readFileSync(path.join(core, "package.json"), "utf8"));
  const semver = createRequire(cli)("semver");
  const visit = node => {
    for (const [name, child] of Object.entries(node.dependencies ?? {})) {
      if (name === "@fynn7/ui-design-core") for (const peer of ["react", "react-dom"]) {
        const missing = child.dependencies?.[peer];
        const consumerPeer = installedDirectory(pkgRoot, peer);
        if (!missing?.missing || !consumerPeer) continue;
        const version = JSON.parse(fs.readFileSync(path.join(consumerPeer, "package.json"), "utf8")).version;
        if (manifest.peerDependencies?.[peer] && semver.satisfies(version, manifest.peerDependencies[peer])) {
          for (const problem of missing.problems ?? []) accepted.add(problem);
        }
      }
      visit(child);
    }
  };
  visit(tree);
  return accepted;
}

function cliPackages(pkgRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8").replace(/^\uFEFF/, ""));
  const require = createRequire(path.join(pkgRoot, "package.json"));
  const records = [];
  for (const name of Object.keys({ ...pkg.devDependencies, ...pkg.dependencies })) {
    if (Object.hasOwn(pkg.optionalDependencies ?? {}, name)) continue;
    for (const base of require.resolve.paths(name) ?? []) {
      const dir = path.join(base, name);
      if (!fs.existsSync(path.join(dir, "package.json"))) continue;
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
      if (manifest.bin) records.push({ name, base, dir, commands: typeof manifest.bin === "string" ? [name.split("/").at(-1)] : Object.keys(manifest.bin) });
      break;
    }
  }
  return records;
}

function health(pkgRoot) {
  const direct = checkConsumerDependencies(pkgRoot);
  // The source-only export checker accepts a bare UI barrel for compatibility.
  // Runtime recovery additionally requires the installed package metadata/bins;
  // classify corruption before cliPackages/npx can throw an unrepairable parse error.
  const coreName = "@fynn7/ui-design-core";
  const core = installedDirectory(pkgRoot, coreName);
  if (core) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(core, "package.json"), "utf8"));
      if (manifest.name !== coreName || typeof manifest.version !== "string") throw new Error("invalid UI package identity/version");
      const bins = typeof manifest.bin === "string" ? [manifest.bin] : Object.values(manifest.bin ?? {});
      for (const bin of bins) if (typeof bin !== "string" || !fs.existsSync(path.resolve(core, bin))) {
        direct.failures.push({ name: coreName, reason: `CLI entry missing: ${bin}`, path: core });
      }
    } catch (error) { direct.failures.push({ name: coreName, reason: `unreadable installed package: ${error.message}`, path: core }); }
  }
  direct.ok = !direct.failures.length;
  if (direct.ok) for (const { name, base, dir, commands } of cliPackages(pkgRoot)) {
    const realDir = fs.realpathSync(dir);
    let realBase = realDir;
    for (const part of name.split("/")) realBase = path.dirname(realBase);
    const commandBases = new Set([base]);
    if (path.basename(realBase) === "node_modules") commandBases.add(realBase);
    for (const command of commands) {
      if (!/^[\w.-]+$/.test(command)) throw new Error(`Unsupported CLI command name: ${command}`);
      const available = [...commandBases].some(binBase => fs.existsSync(path.join(binBase, ".bin", `${command}${process.platform === "win32" ? ".cmd" : ""}`)));
      if (!available) direct.failures.push({ name, reason: `command shim missing: ${command}`, path: dir });
    }
  }
  direct.ok = !direct.failures.length;
  const problems = direct.ok ? npmTree(pkgRoot) : [];
  return { ...direct, ok: direct.ok && !problems.length, problems };
}

function materializeLocalCliLinks(pkgRoot, actions) {
  for (const { name, dir } of cliPackages(pkgRoot)) {
    const local = path.join(pkgRoot, "node_modules", name);
    if (path.resolve(dir) === path.resolve(local)) continue;
    // npm normally hoists CLI packages. Consumer launchers may use app-local
    // node_modules paths; a junction points to the same installed package.
    try { fs.lstatSync(local); continue; } catch (error) { if (error.code !== "ENOENT") throw error; }
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.symlinkSync(dir, local, process.platform === "win32" ? "junction" : "dir");
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
    const declared = declaredSource(pkgRoot, pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
    if (declared) {
      const backupRoot = path.join(repositoryRoot(pkgRoot), ".fynns-ui-recovery");
      fs.mkdirSync(backupRoot, { recursive: true });
      if (!fs.existsSync(path.join(backupRoot, ".gitignore"))) fs.writeFileSync(path.join(backupRoot, ".gitignore"), "*\n");
      const journalFile = path.join(backupRoot, "cli-links.json");
      let journal = {};
      try { journal = JSON.parse(fs.readFileSync(journalFile, "utf8")); } catch {}
      journal[local] = { source: fs.realpathSync(declared), target: fs.realpathSync(dir) };
      fs.writeFileSync(journalFile, JSON.stringify(journal));
    }
    actions.push({ kind: "local-cli-link", name, path: local, target: dir });
  }
}

function repositoryRoot(pkgRoot) {
  let dir = pkgRoot;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  return pkgRoot;
}

/** One installer per consumer repository, including sibling workspace apps. */
async function recoveryLock(pkgRoot, timeoutMs) {
  const root = fs.realpathSync(repositoryRoot(pkgRoot));
  const hash = createHash("sha256").update(process.platform === "win32" ? root.toLowerCase() : root).digest("hex").slice(0, 24);
  const lock = path.join(os.tmpdir(), `fynns-ui-recovery-${hash}`);
  const ownerFile = path.join(lock, "owner.json");
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      fs.mkdirSync(lock);
      fs.writeFileSync(ownerFile, JSON.stringify({ pid: process.pid, root }));
      return () => {
        try {
          const owner = JSON.parse(fs.readFileSync(ownerFile, "utf8"));
          if (owner.pid === process.pid) { fs.unlinkSync(ownerFile); fs.rmdirSync(lock); }
        } catch (error) { if (error.code !== "ENOENT") throw error; }
      };
    } catch (error) { if (error.code !== "EEXIST") throw error; }
    try {
      let owner;
      try { owner = JSON.parse(fs.readFileSync(ownerFile, "utf8")); } catch {}
      if ((owner && !alive(owner.pid)) || (!owner && Date.now() - fs.statSync(lock).mtimeMs > 5000)) {
        // Only one waiter may reap a dead owner; no waiter can rename a new lock.
        const claim = path.join(lock, "reaping");
        let fd;
        try { fd = fs.openSync(claim, "wx"); } catch (error) { if (!["EEXIST", "ENOENT"].includes(error.code)) throw error; }
        if (fd !== undefined) {
          fs.closeSync(fd);
          let current;
          try { current = JSON.parse(fs.readFileSync(ownerFile, "utf8")); } catch {}
          if (!current || !alive(current.pid)) {
            if (fs.existsSync(ownerFile)) fs.unlinkSync(ownerFile);
            fs.unlinkSync(claim);
            fs.rmdirSync(lock);
          } else fs.unlinkSync(claim);
        }
      }
    } catch (error) { if (!["ENOENT", "EEXIST", "ENOTEMPTY"].includes(error.code)) throw error; }
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for another startup to repair ${root}; no second npm install was started.`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function quarantineBrokenPackages(pkgRoot, failures, actions) {
  const root = fs.realpathSync(repositoryRoot(pkgRoot));
  const require = createRequire(path.join(pkgRoot, "package.json"));
  const moved = new Set();
  for (const failure of failures) {
    let dir = failure.path;
    if (!dir && failure.name === "@fynn7/ui-design-core") dir = (require.resolve.paths(failure.name) ?? [])
      .map(base => path.join(base, failure.name)).find(candidate => { try { fs.lstatSync(candidate); return true; } catch { return false; } });
    if (!dir) continue; // npm installs absent packages without quarantining.
    dir = path.resolve(dir);
    if (moved.has(dir)) continue;
    const relative = path.relative(root, dir);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !relative.split(path.sep).includes("node_modules")) {
      throw new Error(`Broken package outside consumer node_modules: ${dir}. Refusing to move source/global dependencies.`);
    }
    // Rename the installed directory/link, never delete a source checkout.
    // npm otherwise considers a package with a deleted CLI file up to date.
    // Keep backups outside node_modules: npm may prune ordinary extraneous
    // directories there. The inner ignore file keeps generated backups out of Git.
    const backupRoot = path.join(root, ".fynns-ui-recovery");
    fs.mkdirSync(backupRoot, { recursive: true });
    if (!fs.existsSync(path.join(backupRoot, ".gitignore"))) fs.writeFileSync(path.join(backupRoot, ".gitignore"), "*\n");
    const backup = path.join(backupRoot, `${process.pid}-${Date.now()}-${failure.name.replace(/[^\w.-]/g, "_")}`);
    fs.renameSync(dir, backup);
    moved.add(dir);
    actions.push({ kind: "quarantine", name: failure.name, path: dir, backup });
  }
}

function sourceDigest(dir) {
  const hash = createHash("sha256");
  const visit = (current, relative = "") => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(current, entry.name), key = `${relative}/${entry.name}`;
      hash.update(key + "\0");
      if (entry.isSymbolicLink()) hash.update(fs.readlinkSync(file));
      else if (entry.isDirectory()) visit(file, key);
      else if (entry.isFile()) hash.update(fs.readFileSync(file));
      hash.update("\0");
    }
  };
  visit(dir);
  return hash.digest("hex");
}

function synchronizeLocalUiSource(pkgRoot, actions) {
  const name = "@fynn7/ui-design-core";
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
  const source = declaredSource(pkgRoot, pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  const installed = installedDirectory(pkgRoot, name);
  if (!source || !installed || fs.lstatSync(installed).isSymbolicLink() ||
      !fs.existsSync(path.join(source, "src/index.ts")) || !fs.existsSync(path.join(installed, "src/index.ts"))) return;
  const expected = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
  let actual;
  try { actual = JSON.parse(fs.readFileSync(path.join(installed, "package.json"), "utf8")); }
  catch { return; } // Dependency health will quarantine/reinstall unreadable metadata.
  if (expected.name !== name) throw new Error(`Declared UI source is not ${name}: ${source}`);
  if (expected.version === actual.version && sourceDigest(path.join(source, "src")) === sourceDigest(path.join(installed, "src"))) return;
  // npm install-links can leave a physical copy frozen after the sibling updates,
  // including source-only changes at the same version. Preserve it, then follow
  // the declared file: source (also works for deliberately pinned vendor sources).
  quarantineBrokenPackages(pkgRoot, [{ name, path: installed }], actions);
  fs.symlinkSync(source, installed, process.platform === "win32" ? "junction" : "dir");
  actions.push({ kind: "ui-source-link", path: installed, target: source });
}

function migrateMechanicalIssues(pkgRoot, actions) {
  const config = ["ts", "mts", "js", "mjs", "cjs"].map(ext => path.join(pkgRoot, `vite.config.${ext}`)).find(fs.existsSync);
  if (config && !fs.lstatSync(config).isSymbolicLink()) {
    const before = fs.readFileSync(config, "utf8");
    const after = ensureNoStoreDevHeader(before);
    if (after !== null && after !== before) {
      if (fs.readFileSync(config, "utf8") !== before) throw new Error(`Config changed during recovery: ${config}`);
      fs.writeFileSync(config, after);
      actions.push({ kind: "dev-cache", file: config });
    }
  }
  const files = [...scanConsumerImports(pkgRoot).files.keys()];
  for (const fix of fixWorkspaceFiles(files, pkgRoot)) actions.push({ kind: "workspace-migration", ...fix });
}

export async function prepareConsumer(pkgRoot, { json = false, lockTimeoutMs = 60000, beforeGate = false } = {}) {
  pkgRoot = fs.realpathSync(path.resolve(pkgRoot));
  const actions = [];
  // Our npm child reenters through postinstall. The outer startup owns the lock;
  // do not recurse or wait for it. Installed source/config migrations are safe
  // here and must finish before the child's read-only export gate runs.
  const nested = process.env.FYNNS_UI_REPAIRING_DEPS === "1";
  if (nested) {
    if (checkConsumerDependencies(pkgRoot).ok) {
      synchronizeLocalUiSource(pkgRoot, actions);
      materializeLocalCliLinks(pkgRoot, actions);
      migrateMechanicalIssues(pkgRoot, actions);
    }
    return { ok: true, deferred: true, reason: "outer-recovery-owns-install", actions };
  }
  const initial = health(pkgRoot);
  const context = !initial.ok ? installationContext() : "startup";
  if (!initial.ok && context === "install") {
    return { ok: true, deferred: true, reason: "npm-install-in-progress", actions };
  }
  if (!initial.ok && context === "unknown") throw new Error("Cannot determine npm install ancestry; refusing a potentially recursive install.");
  const unlock = await recoveryLock(pkgRoot, lockTimeoutMs);
  try {
    synchronizeLocalUiSource(pkgRoot, actions);
    const before = health(pkgRoot); // Another startup may have finished the repair.
    if (!before.ok) {
      quarantineBrokenPackages(pkgRoot, before.failures, actions);
      if (!json) console.log(`[fynns-ui] Automatically repairing consumer install: ${pkgRoot}`);
      const repaired = repairConsumerDependencies(pkgRoot, { json, force: true });
      actions.push({ kind: "npm-install", ok: repaired.ok });
      if (!repaired.ok) throw new Error(repaired.error);
      synchronizeLocalUiSource(pkgRoot, actions);
      const after = health(pkgRoot);
      if (!after.ok) throw new Error(`Automatic npm repair did not restore the dependency tree:\n${after.failures.map(failure => `${failure.name}: ${failure.reason}`).join("\n")}\n${after.problems.join("\n")}`);
    }
    materializeLocalCliLinks(pkgRoot, actions);
    migrateMechanicalIssues(pkgRoot, actions);
    // An independent prepare hook precedes the consumer's custom sync gate.
    // Checking exports now would block the very update that restores new symbols.
    if (beforeGate) return { ok: true, prepared: true, actions, dependencies: { checked: before.checked } };
    const gate = checkUiExports(pkgRoot);
    if (!gate.ok) return { ok: false, error: gate.error, issues: gate.issues, actions };
    return { ok: true, actions, dependencies: { checked: gate.dependencies.checked }, imports: gate.imports.length };
  } finally { unlock(); }
}

async function main() {
  let target = process.cwd(), json = false, beforeGate = false;
  try {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--target" && args[i + 1] && !args[i + 1].startsWith("--")) target = path.resolve(args[++i]);
      else if (args[i] === "--json") json = true;
      else if (args[i] === "--before-gate") beforeGate = true;
      else throw new Error("Usage: node scripts/consumer-recovery.mjs --target <app-package> [--before-gate] [--json]");
    }
    const report = await prepareConsumer(target, { json, beforeGate });
    if (json) console.log(JSON.stringify(report));
    else if (report.ok) console.log(`[fynns-ui] consumer ${report.deferred ? "recovery deferred during install" : report.prepared ? "prepared for sync/export gate" : "ready"}: ${target} (${report.actions.length} recovery actions)`);
    else console.error(`[fynns-ui] ${report.error}`);
    process.exitCode = report.ok ? 0 : 1;
  } catch (error) {
    if (json) console.log(JSON.stringify({ ok: false, error: error.message }));
    else console.error(`[fynns-ui] ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) await main();
