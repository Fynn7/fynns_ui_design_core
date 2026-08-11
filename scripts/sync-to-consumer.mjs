#!/usr/bin/env node
/**
 * Instant local sync: mirror this core checkout's consumable source tree into a
 * consumer's fynns_ui_design_core submodule working tree (including uncommitted
 * edits). Does not commit the submodule pin or push.
 *
 * Usage (from a checkout of fynns_ui_design_core):
 *   npm run consume:sync -- --target <CONSUMER_ROOT>
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
/** Relative paths under core / submodule to mirror (dirs recurse; files copy). */
const MIRROR_ENTRIES = ["src", "package.json"];

function usage() {
  return `Usage: node scripts/sync-to-consumer.mjs --target <dir> [options]

Mirror this core's src/ (+ package.json) into the consumer submodule worktree.
Core is the source of truth; overwrites conflicting dirty files in the submodule.
Does not git-commit the pin or push.

Options:
  --target <dir>           Consumer repo (or any path inside it). Required unless cwd is the consumer.
  --submodule-path <path>  Submodule path in consumer. Default: ${DEFAULT_SUBPATH}
  --from <dir>             Source core checkout. Default: this script's repo root
  --dry-run                Report diffs without writing
  --json                   Machine-readable JSON summary on stdout
  -h, --help               Show help
`;
}

function parseArgs(argv) {
  const out = {
    target: null,
    submodulePath: DEFAULT_SUBPATH,
    from: CORE_ROOT,
    dryRun: false,
    json: false,
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
    else if (a === "--submodule-path") out.submodulePath = next();
    else if (a === "--from") out.from = next();
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json") out.json = true;
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
        } catch {
          /* skip unreadable */
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

  const fromRoot = path.resolve(args.from);
  const targetStart = path.resolve(args.target || process.cwd());
  let consumerRoot;
  try {
    consumerRoot = findGitRoot(targetStart);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }

  const subPath = args.submodulePath.replace(/\\/g, "/");
  if (!subPath || subPath.split("/").some((seg) => seg === ".." || seg === "")) {
    console.error(`Invalid --submodule-path (no empty or '..' segments): ${args.submodulePath}`);
    process.exit(1);
  }
  const destRoot = path.resolve(path.join(consumerRoot, ...subPath.split("/")));
  const consumerResolved = path.resolve(consumerRoot);
  const relToConsumer = path.relative(consumerResolved, destRoot);
  if (
    !relToConsumer ||
    relToConsumer.startsWith("..") ||
    path.isAbsolute(relToConsumer)
  ) {
    console.error(
      `Refusing sync: submodule path escapes consumer root (${destRoot} vs ${consumerResolved})`,
    );
    process.exit(1);
  }
  const result = {
    ok: false,
    action: "sync",
    from: fromRoot,
    consumerRoot,
    submodulePath: subPath,
    dest: destRoot,
    dryRun: args.dryRun,
    inSync: false,
    copied: [],
    removed: [],
    counts: { added: 0, changed: 0, removed: 0 },
    fromHead: null,
    destHead: null,
    message: "",
  };

  if (!fs.existsSync(path.join(fromRoot, "src", "index.ts"))) {
    result.message = `Source core missing src/index.ts: ${fromRoot}`;
    emit(result, args.json, 1);
    return;
  }
  if (!fs.existsSync(path.join(destRoot, "src", "index.ts"))) {
    result.message =
      `Consumer submodule not initialized at ${destRoot} (expected src/index.ts). ` +
      `Run consume:install -- --target <CONSUMER_ROOT> first.`;
    emit(result, args.json, 1);
    return;
  }

  result.fromHead = runGit(["rev-parse", "HEAD"], fromRoot, { allowFail: true }).stdout || null;
  result.destHead = runGit(["rev-parse", "HEAD"], destRoot, { allowFail: true }).stdout || null;

  const fromMap = collectMirrorMaps(fromRoot);
  // Dest map only under the same relative roots (avoid scanning unrelated files).
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

  const { added, changed, removed } = diffMaps(fromMap, destMap);
  result.counts = { added: added.length, changed: changed.length, removed: removed.length };

  if (added.length === 0 && changed.length === 0 && removed.length === 0) {
    result.ok = true;
    result.inSync = true;
    result.message = "already in sync";
    emit(result, args.json, 0);
    return;
  }

  const toCopy = [...added, ...changed];
  for (const rel of toCopy) {
    const src = fromMap.get(rel);
    const dest = path.join(destRoot, ...rel.split("/"));
    copyFile(src.abs, dest, args.dryRun);
    result.copied.push(rel);
  }
  for (const rel of removed) {
    // Only remove under mirrored roots (src/ or package.json).
    if (rel !== "package.json" && !rel.startsWith("src/")) continue;
    const dest = path.join(destRoot, ...rel.split("/"));
    removePath(dest, args.dryRun);
    result.removed.push(rel);
  }
  if (removed.some((r) => r.startsWith("src/"))) {
    pruneEmptyDirs(path.join(destRoot, "src"), args.dryRun);
  }

  result.ok = true;
  result.inSync = false;
  result.message = args.dryRun
    ? `dry-run: would sync ${toCopy.length} file(s), remove ${result.removed.length}`
    : `synced ${toCopy.length} file(s), removed ${result.removed.length}`;
  emit(result, args.json, 0);
}

function emit(result, asJson, code) {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const tag = result.dryRun ? "[dry-run] " : "";
    console.log(`${tag}${result.message}`);
    console.log(`  from: ${result.from}`);
    console.log(`  dest: ${result.dest}`);
    if (result.fromHead || result.destHead) {
      console.log(
        `  heads: from ${shortSha(result.fromHead)} → dest ${shortSha(result.destHead)} (worktree mirror; pin unchanged)`,
      );
    }
    if (!result.inSync) {
      console.log(
        `  counts: +${result.counts.added} ~${result.counts.changed} -${result.counts.removed}`,
      );
      const sample = shortList([...result.copied, ...result.removed.map((r) => `-${r}`)]);
      for (const line of sample) console.log(`    ${line}`);
    }
    if (!result.ok && result.message) {
      /* already printed */
    }
  }
  process.exit(code);
}

function shortSha(sha) {
  if (!sha) return "(unknown)";
  return sha.slice(0, 7);
}

main();
