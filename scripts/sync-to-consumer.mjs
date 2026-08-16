#!/usr/bin/env node
/**
 * Instant local sync: upsert this core checkout's consumable source tree into
 * consumer fynns_ui_design_core submodule working tree(s) (including uncommitted
 * edits). Does not commit the submodule pin or push.
 *
 * Usage (from a checkout of fynns_ui_design_core):
 *   npm run consume:sync -- --target <CONSUMER_ROOT>
 *   npm run consume:sync -- --all
 *   npm run consume:watch
 *   node scripts/sync-to-consumer.mjs --target ../fynns_bachelor_thesis --dry-run
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, "..");
const DEFAULT_SUBPATH = "packages/fynns_ui_design_core";
const LOCAL_CONSUMERS_PATH = path.join(CORE_ROOT, "llm", "local-consumers.json");
/** Relative paths under core / submodule to mirror (dirs recurse; files copy). */
const MIRROR_ENTRIES = ["src", "package.json"];
const WATCH_DEBOUNCE_MS = 150;

function usage() {
  return `Usage: node scripts/sync-to-consumer.mjs [--target <dir> | --all] [options]

Upsert this core's src/ (+ package.json) into consumer submodule worktree(s).
Overwrites conflicting dirty files; by default does NOT delete consumer-only
files (hub-pin extras like DiffView). Pass --prune for a strict mirror delete.
Does not git-commit the pin or push.

Options:
  --target <dir>           Consumer repo (or any path inside it). Default: cwd
                           when neither --target nor --all.
  --all                    Sync every consumer in llm/local-consumers.json
                           (skip missing roots with a warning).
  --submodule-path <path>  Submodule path in consumer. Default: ${DEFAULT_SUBPATH}
                           (ignored for --all; registry supplies paths).
  --from <dir>             Source core checkout. Default: this script's repo root
  --prune                  Delete dest files under src/ / package.json that are
                           absent from core (strict mirror; can remove hub-only files).
  --watch                  Watch src/ + package.json; debounce ${WATCH_DEBOUNCE_MS}ms
                           then re-sync (--all or --target). Initial sync on start.
  --dry-run                Report diffs without writing
  --json                   Machine-readable JSON summary on stdout
  -h, --help               Show help
`;
}

function parseArgs(argv) {
  const out = {
    target: null,
    all: false,
    submodulePath: DEFAULT_SUBPATH,
    from: CORE_ROOT,
    dryRun: false,
    json: false,
    prune: false,
    watch: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v == null) throw new Error(`Missing value after ${a}`);
      return v;
    };
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--target") out.target = next();
    else if (a === "--all") out.all = true;
    else if (a === "--submodule-path") out.submodulePath = next();
    else if (a === "--from") out.from = next();
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json") out.json = true;
    else if (a === "--prune") out.prune = true;
    else if (a === "--watch") out.watch = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return out;
}

function runGit(args, cwd, { allowFail = false } = {}) {
  const r = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    shell: false,
  });
  if (!allowFail && r.status !== 0) {
    const err = (r.stderr || r.stdout || "").trim() || `git ${args.join(" ")} failed`;
    throw new Error(err);
  }
  return {
    status: r.status ?? 1,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
  };
}

function findGitRoot(start) {
  const r = runGit(["rev-parse", "--show-toplevel"], start, { allowFail: true });
  if (r.status !== 0 || !r.stdout) {
    throw new Error(`Not a git repository: ${start}`);
  }
  return path.resolve(r.stdout);
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function fileHash(abs) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(abs));
  return h.digest("hex");
}

/**
 * Walk a directory; return Map of posix-relative path → { abs, hash }.
 * Skips node_modules, .git, dist.
 */
function walkFiles(rootAbs, relPrefix = "") {
  const map = new Map();
  function walk(dirAbs, relDir) {
    let ents;
    try {
      ents = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "dist") continue;
      const abs = path.join(dirAbs, ent.name);
      const rel = relDir ? `${relDir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(abs, rel);
      else if (ent.isFile() || ent.isSymbolicLink()) {
        try {
          map.set(toPosix(rel), { abs, hash: fileHash(abs) });
        } catch (err) {
          // Never skip: a silent miss drops the path from fromMap and can mark
          // the dest twin as "removed" (false delete on Windows locks, etc.).
          const why = err instanceof Error ? err.message : String(err);
          throw new Error(`Unreadable during sync walk: ${abs} (${why})`);
        }
      }
    }
  }
  if (!fs.existsSync(rootAbs)) return map;
  const st = fs.statSync(rootAbs);
  if (st.isFile()) {
    const name = relPrefix || path.basename(rootAbs);
    map.set(toPosix(name), { abs: rootAbs, hash: fileHash(rootAbs) });
    return map;
  }
  walk(rootAbs, relPrefix);
  return map;
}

function collectMirrorMaps(coreRoot) {
  const map = new Map();
  for (const entry of MIRROR_ENTRIES) {
    const abs = path.join(coreRoot, entry);
    if (!fs.existsSync(abs)) {
      if (entry === "src") throw new Error(`Missing ${entry}/ under ${coreRoot}`);
      continue;
    }
    const st = fs.statSync(abs);
    if (st.isFile()) {
      map.set(toPosix(entry), { abs, hash: fileHash(abs) });
    } else {
      const nested = walkFiles(abs, entry);
      for (const [k, v] of nested) map.set(k, v);
    }
  }
  return map;
}

function collectDestMaps(destRoot) {
  const destMap = new Map();
  for (const entry of MIRROR_ENTRIES) {
    const abs = path.join(destRoot, entry);
    if (!fs.existsSync(abs)) continue;
    const st = fs.statSync(abs);
    if (st.isFile()) destMap.set(toPosix(entry), { abs, hash: fileHash(abs) });
    else {
      for (const [k, v] of walkFiles(abs, entry)) destMap.set(k, v);
    }
  }
  return destMap;
}

function diffMaps(fromMap, toMap) {
  const added = [];
  const changed = [];
  const removed = [];
  for (const [rel, src] of fromMap) {
    const dest = toMap.get(rel);
    if (!dest) added.push(rel);
    else if (dest.hash !== src.hash) changed.push(rel);
  }
  for (const rel of toMap.keys()) {
    if (!fromMap.has(rel)) removed.push(rel);
  }
  added.sort();
  changed.sort();
  removed.sort();
  return { added, changed, removed };
}

function ensureDir(p, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dest, dryRun) {
  if (dryRun) return;
  ensureDir(path.dirname(dest), false);
  fs.copyFileSync(src, dest);
}

function removePath(abs, dryRun) {
  if (dryRun) return;
  if (!fs.existsSync(abs)) return;
  const st = fs.lstatSync(abs);
  if (st.isDirectory()) fs.rmSync(abs, { recursive: true, force: true });
  else fs.unlinkSync(abs);
}

/** After deleting files under src/, prune empty directories (not the src root). */
function pruneEmptyDirs(rootAbs, dryRun) {
  if (dryRun || !fs.existsSync(rootAbs)) return;
  function walk(dir) {
    let ents;
    try {
      ents = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      if (ent.name === ".git") continue;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
    }
    if (path.resolve(dir) === path.resolve(rootAbs)) return;
    try {
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {
      /* ignore */
    }
  }
  walk(rootAbs);
}

function shortList(paths, limit = 20) {
  if (paths.length <= limit) return paths;
  return [...paths.slice(0, limit), `… +${paths.length - limit} more`];
}

function shortSha(sha) {
  if (!sha) return "(unknown)";
  return sha.slice(0, 7);
}

function normalizeSubPath(subPathRaw) {
  const subPath = String(subPathRaw || DEFAULT_SUBPATH).replace(/\\/g, "/");
  if (!subPath || subPath.split("/").some((seg) => seg === ".." || seg === "")) {
    throw new Error(`Invalid submodule path (no empty or '..' segments): ${subPathRaw}`);
  }
  return subPath;
}

function resolveDestRoot(consumerRoot, subPath) {
  const destRoot = path.resolve(path.join(consumerRoot, ...subPath.split("/")));
  const consumerResolved = path.resolve(consumerRoot);
  const relToConsumer = path.relative(consumerResolved, destRoot);
  if (
    !relToConsumer ||
    relToConsumer.startsWith("..") ||
    path.isAbsolute(relToConsumer)
  ) {
    throw new Error(
      `Refusing sync: submodule path escapes consumer root (${destRoot} vs ${consumerResolved})`,
    );
  }
  return destRoot;
}

/**
 * Upsert (and optionally prune) one consumer submodule worktree.
 * @returns {{ ok: boolean, code: number, result: object }}
 */
function syncOne(fromRoot, destRoot, consumerRoot, subPath, { dryRun = false, prune = false } = {}) {
  const result = {
    ok: false,
    action: "sync",
    from: fromRoot,
    consumerRoot,
    submodulePath: subPath,
    dest: destRoot,
    dryRun,
    prune,
    inSync: false,
    copied: [],
    removed: [],
    skippedExtra: [],
    counts: { added: 0, changed: 0, removed: 0, skippedExtra: 0 },
    fromHead: null,
    destHead: null,
    message: "",
  };

  if (!fs.existsSync(path.join(fromRoot, "src", "index.ts"))) {
    result.message = `Source core missing src/index.ts: ${fromRoot}`;
    return { ok: false, code: 1, result };
  }
  if (!fs.existsSync(path.join(destRoot, "src", "index.ts"))) {
    result.message =
      `Consumer submodule not initialized at ${destRoot} (expected src/index.ts). ` +
      `Run consume:install -- --target <CONSUMER_ROOT> first.`;
    return { ok: false, code: 1, result };
  }

  result.fromHead = runGit(["rev-parse", "HEAD"], fromRoot, { allowFail: true }).stdout || null;
  result.destHead = runGit(["rev-parse", "HEAD"], destRoot, { allowFail: true }).stdout || null;

  let fromMap;
  let destMap;
  try {
    fromMap = collectMirrorMaps(fromRoot);
    destMap = collectDestMaps(destRoot);
  } catch (e) {
    result.message = String(e.message || e);
    return { ok: false, code: 1, result };
  }

  const { added, changed, removed } = diffMaps(fromMap, destMap);
  result.counts.added = added.length;
  result.counts.changed = changed.length;
  result.counts.removed = removed.length;

  const toCopy = [...added, ...changed];
  const willRemove = prune
    ? removed.filter((rel) => rel === "package.json" || rel.startsWith("src/"))
    : [];
  if (!prune && removed.length > 0) {
    result.skippedExtra = removed.filter(
      (rel) => rel === "package.json" || rel.startsWith("src/"),
    );
    result.counts.skippedExtra = result.skippedExtra.length;
  }

  if (toCopy.length === 0 && willRemove.length === 0) {
    result.ok = true;
    result.inSync = true;
    result.message =
      result.skippedExtra.length > 0
        ? `already in sync (kept ${result.skippedExtra.length} consumer-only file(s); pass --prune to delete)`
        : "already in sync";
    return { ok: true, code: 0, result };
  }

  for (const rel of toCopy) {
    const src = fromMap.get(rel);
    const dest = path.join(destRoot, ...rel.split("/"));
    copyFile(src.abs, dest, dryRun);
    result.copied.push(rel);
  }
  for (const rel of willRemove) {
    const dest = path.join(destRoot, ...rel.split("/"));
    removePath(dest, dryRun);
    result.removed.push(rel);
  }
  if (willRemove.some((r) => r.startsWith("src/"))) {
    pruneEmptyDirs(path.join(destRoot, "src"), dryRun);
  }

  result.ok = true;
  result.inSync = false;
  const mode = prune ? "mirror" : "upsert";
  result.message = dryRun
    ? `dry-run (${mode}): would sync ${toCopy.length} file(s), remove ${result.removed.length}`
    : `synced (${mode}) ${toCopy.length} file(s), removed ${result.removed.length}`;
  return { ok: true, code: 0, result };
}

function loadLocalConsumers(fromRoot) {
  const registryPath = path.join(fromRoot, "llm", "local-consumers.json");
  const abs = fs.existsSync(registryPath) ? registryPath : LOCAL_CONSUMERS_PATH;
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing local consumers registry: ${abs}`);
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(`Invalid JSON in ${abs}: ${e.message || e}`);
  }
  const list = Array.isArray(data?.consumers) ? data.consumers : [];
  if (list.length === 0) {
    throw new Error(`No consumers listed in ${abs}`);
  }
  return { registryPath: abs, consumers: list };
}

function resolveRegistryTargets(fromRoot) {
  const { registryPath, consumers } = loadLocalConsumers(fromRoot);
  const targets = [];
  const skipped = [];
  for (const entry of consumers) {
    const rootRel = entry?.root;
    if (!rootRel || typeof rootRel !== "string") {
      skipped.push({ root: rootRel, reason: "invalid root" });
      continue;
    }
    const rootAbs = path.resolve(fromRoot, rootRel);
    if (!fs.existsSync(rootAbs)) {
      skipped.push({ root: rootRel, reason: "missing", abs: rootAbs });
      continue;
    }
    let consumerRoot;
    try {
      consumerRoot = findGitRoot(rootAbs);
    } catch {
      skipped.push({ root: rootRel, reason: "not a git repo", abs: rootAbs });
      continue;
    }
    let subPath;
    try {
      subPath = normalizeSubPath(entry.submodulePath || DEFAULT_SUBPATH);
    } catch (e) {
      skipped.push({ root: rootRel, reason: String(e.message || e) });
      continue;
    }
    let destRoot;
    try {
      destRoot = resolveDestRoot(consumerRoot, subPath);
    } catch (e) {
      skipped.push({ root: rootRel, reason: String(e.message || e) });
      continue;
    }
    if (!fs.existsSync(path.join(destRoot, "src", "index.ts"))) {
      skipped.push({
        root: rootRel,
        reason: "submodule not initialized",
        dest: destRoot,
      });
      continue;
    }
    targets.push({ rootRel, consumerRoot, subPath, destRoot });
  }
  return { registryPath, targets, skipped };
}

function printOneResult(result, asJson) {
  if (asJson) return;
  const tag = result.dryRun ? "[dry-run] " : "";
  console.log(`${tag}${result.message}`);
  console.log(`  from: ${result.from}`);
  console.log(`  dest: ${result.dest}`);
  if (result.fromHead || result.destHead) {
    console.log(
      `  heads: from ${shortSha(result.fromHead)} → dest ${shortSha(result.destHead)} (worktree mirror; pin unchanged)`,
    );
  }
  if (!result.inSync || result.counts.skippedExtra > 0) {
    console.log(
      `  counts: +${result.counts.added} ~${result.counts.changed} -${result.counts.removed}` +
        (result.counts.skippedExtra
          ? ` (kept ${result.counts.skippedExtra} extra)`
          : ""),
    );
    const sample = shortList([
      ...result.copied,
      ...result.removed.map((r) => `-${r}`),
    ]);
    for (const line of sample) console.log(`    ${line}`);
  }
}

function runSyncPass(args) {
  const fromRoot = path.resolve(args.from);
  const summary = {
    ok: false,
    action: args.all ? "sync-all" : "sync",
    from: fromRoot,
    dryRun: args.dryRun,
    prune: args.prune,
    watch: false,
    results: [],
    skipped: [],
    okCount: 0,
    failCount: 0,
    message: "",
  };

  if (!fs.existsSync(path.join(fromRoot, "src", "index.ts"))) {
    summary.message = `Source core missing src/index.ts: ${fromRoot}`;
    if (args.json) console.log(JSON.stringify(summary, null, 2));
    else console.error(summary.message);
    return { code: 1, summary };
  }

  /** @type {{ consumerRoot: string, subPath: string, destRoot: string, rootRel?: string }[]} */
  let jobs = [];

  if (args.all) {
    let resolved;
    try {
      resolved = resolveRegistryTargets(fromRoot);
    } catch (e) {
      summary.message = String(e.message || e);
      if (args.json) console.log(JSON.stringify(summary, null, 2));
      else console.error(summary.message);
      return { code: 1, summary };
    }
    summary.registryPath = resolved.registryPath;
    summary.skipped = resolved.skipped;
    for (const s of resolved.skipped) {
      const detail = s.reason + (s.abs ? ` (${s.abs})` : s.dest ? ` (${s.dest})` : "");
      console.warn(`warn: skip ${s.root}: ${detail}`);
    }
    jobs = resolved.targets;
    if (jobs.length === 0) {
      summary.message = "no local consumers available to sync";
      if (args.json) console.log(JSON.stringify(summary, null, 2));
      else console.error(summary.message);
      return { code: 1, summary };
    }
  } else {
    const targetStart = path.resolve(args.target || process.cwd());
    let consumerRoot;
    try {
      consumerRoot = findGitRoot(targetStart);
    } catch (e) {
      summary.message = String(e.message || e);
      if (args.json) console.log(JSON.stringify(summary, null, 2));
      else console.error(summary.message);
      return { code: 1, summary };
    }
    let subPath;
    let destRoot;
    try {
      subPath = normalizeSubPath(args.submodulePath);
      destRoot = resolveDestRoot(consumerRoot, subPath);
    } catch (e) {
      summary.message = String(e.message || e);
      if (args.json) console.log(JSON.stringify(summary, null, 2));
      else console.error(summary.message);
      return { code: 1, summary };
    }
    jobs = [{ consumerRoot, subPath, destRoot }];
  }

  let worst = 0;
  for (const job of jobs) {
    const { ok, code, result } = syncOne(fromRoot, job.destRoot, job.consumerRoot, job.subPath, {
      dryRun: args.dryRun,
      prune: args.prune,
    });
    summary.results.push(result);
    if (ok) summary.okCount += 1;
    else summary.failCount += 1;
    if (code > worst) worst = code;
    if (!args.json) {
      if (job.rootRel) console.log(`--- ${job.rootRel} ---`);
      printOneResult(result, false);
    }
  }

  summary.ok = summary.failCount === 0;
  summary.message =
    jobs.length === 1
      ? summary.results[0]?.message || summary.message
      : `synced ${summary.okCount}/${jobs.length} consumer(s)` +
        (summary.skipped.length ? `, skipped ${summary.skipped.length}` : "");

  if (args.json) {
    if (jobs.length === 1 && !args.all) {
      console.log(JSON.stringify(summary.results[0], null, 2));
    } else {
      console.log(JSON.stringify(summary, null, 2));
    }
  } else if (jobs.length > 1) {
    console.log(summary.message);
  }

  return { code: worst, summary };
}

function startWatch(args) {
  const fromRoot = path.resolve(args.from);
  const srcDir = path.join(fromRoot, "src");
  const pkgFile = path.join(fromRoot, "package.json");
  if (!fs.existsSync(srcDir)) {
    console.error(`Missing src/ to watch: ${srcDir}`);
    process.exit(1);
  }

  console.log(
    `watching ${srcDir} (+ package.json) → ${args.all ? "all local consumers" : "target"}` +
      ` (debounce ${WATCH_DEBOUNCE_MS}ms; Ctrl+C to stop)`,
  );

  const watchArgs = { ...args, json: false };
  let timer = null;
  let running = false;
  let pending = false;

  const run = () => {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    pending = false;
    try {
      const stamp = new Date().toISOString();
      console.log(`\n[${stamp}] sync…`);
      runSyncPass(watchArgs);
    } catch (e) {
      console.error(String(e.message || e));
    } finally {
      running = false;
      if (pending) {
        pending = false;
        timer = setTimeout(run, WATCH_DEBOUNCE_MS);
      }
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, WATCH_DEBOUNCE_MS);
  };

  // Initial full pass before watchers.
  run();

  try {
    fs.watch(srcDir, { recursive: true }, schedule);
  } catch (e) {
    console.error(`fs.watch(src) failed: ${e.message || e}`);
    process.exit(1);
  }
  try {
    fs.watch(pkgFile, schedule);
  } catch {
    /* package.json may be unwatchable on some hosts; src watch is enough */
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(String(e.message || e));
    console.error(usage());
    process.exit(2);
  }
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }
  if (args.all && args.target) {
    console.error("Use either --all or --target, not both.");
    process.exit(2);
  }
  // --watch implies --all when no explicit --target (day-to-day default).
  if (args.watch && !args.target && !args.all) {
    args.all = true;
  }
  if (!args.watch && !args.all && args.target == null) {
    // Preserve prior behavior: default target = cwd.
  }

  if (args.watch) {
    startWatch(args);
    return;
  }

  const { code } = runSyncPass(args);
  process.exit(code);
}

main();
