#!/usr/bin/env node
/**
 * Non-blocking @fynn7/ui-design-core update notice for consumer apps.
 * Wired into predev / prebuild / prepreview / postinstall by install-as-npm.mjs.
 *
 * Env:
 *   FYNNS_UI_SKIP_UPDATE_CHECK=1 — silence checks
 *   NODE_AUTH_TOKEN / GITHUB_TOKEN — registry lookup (skips quietly when missing)
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PKG_NAME = "@fynn7/ui-design-core";
const REGISTRY = "https://npm.pkg.github.com";
const CACHE_BASENAME = ".fynns-ui-update-check.json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const HOOK_SCRIPT = "fynns-ui:check-update";

function usage() {
  return `Usage: node check-ui-update.mjs [--target <consumer-root>] [--force] [--json]

Prints a one-line notice when a newer ${PKG_NAME} is on GitHub Packages.
Never fails the parent npm script (always exit 0 unless --json with internal error).

Options:
  --target <dir>  Consumer package root (default: cwd)
  --force         Ignore cached registry result
  --json          Machine-readable result on stdout
  -h, --help      Show help
`;
}

function parseArgs(argv) {
  const out = { target: process.cwd(), force: false, json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v == null) throw new Error(`Missing value after ${a}`);
      return v;
    };
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--target") out.target = next();
    else if (a === "--force") out.force = true;
    else if (a === "--json") out.json = true;
    else throw new Error(`Unknown argument: ${a}\n${usage()}`);
  }
  return out;
}

function findPackageRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function parseSemver(v) {
  const m = String(v || "")
    .trim()
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function semverLt(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return false;
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return true;
    if (pa[i] > pb[i]) return false;
  }
  return false;
}

function isLocalDependencySpec(spec) {
  return typeof spec === "string" && /^(file:|link:|workspace:)/.test(spec.trim());
}

/** Nearest-to-app installs walking up (matches Node module resolution). */
function walkInstallChain(pkgRoot) {
  const chain = [];
  let dir = path.resolve(pkgRoot);
  for (;;) {
    const entry = path.join(dir, "node_modules", PKG_NAME, "package.json");
    if (fs.existsSync(entry)) {
      const installedPkg = readJson(entry);
      chain.push({
        hostRoot: dir,
        installedRoot: path.dirname(entry),
        version: installedPkg?.version ?? null,
      });
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return chain;
}

function resolveInstalledRoot(pkgRoot) {
  return walkInstallChain(pkgRoot)[0]?.installedRoot ?? null;
}

function semverRangeSatisfies(declared, version) {
  if (!declared || !version) return false;
  const spec = String(declared).trim();
  const target = parseSemver(version);
  if (!target) return false;
  if (/^[\^~]/.test(spec)) {
    const base = parseSemver(spec.slice(1));
    if (!base) return false;
    if (spec.startsWith("^")) {
      if (target[0] !== base[0]) return false;
      if (base[0] === 0 && target[1] !== base[1]) return false;
      return !semverLt(version, spec.slice(1));
    }
    // ~x.y.z → same minor line
    if (target[0] !== base[0] || target[1] !== base[1]) return false;
    return !semverLt(version, spec.slice(1));
  }
  const exact = parseSemver(spec);
  if (!exact) return false;
  return (
    exact[0] === target[0] && exact[1] === target[1] && exact[2] === target[2]
  );
}

function readInstalledVersion(pkgRoot) {
  const pkgJson = readJson(path.join(pkgRoot, "package.json"));
  const deps = {
    ...(pkgJson?.dependencies || {}),
    ...(pkgJson?.devDependencies || {}),
  };
  const declared = deps[PKG_NAME] ?? null;

  const chain = walkInstallChain(pkgRoot);
  const resolved = chain[0] ?? null;
  if (!resolved) {
    return {
      declared,
      installed: null,
      localLink: false,
      installedRoot: null,
      installChain: chain,
      parentNewer: null,
    };
  }

  const { installedRoot, version: installed, hostRoot: resolvedHost } = resolved;
  const parentNewer =
    chain.find(
      (hit, i) => i > 0 && hit.version && installed && semverLt(installed, hit.version),
    ) ?? null;

  let localLink = isLocalDependencySpec(declared);
  if (!localLink) {
    try {
      const stat = fs.lstatSync(path.join(resolvedHost, "node_modules", PKG_NAME));
      localLink = stat.isSymbolicLink();
    } catch {
      /* not a link */
    }
  }

  return {
    declared,
    installed,
    localLink,
    installedRoot,
    installChain: chain,
    parentNewer,
  };
}

function readCache(pkgRoot) {
  return readJson(path.join(pkgRoot, CACHE_BASENAME));
}

function writeCache(pkgRoot, data) {
  try {
    fs.writeFileSync(path.join(pkgRoot, CACHE_BASENAME), `${JSON.stringify(data, null, 2)}\n`);
  } catch {
    /* cache is best-effort — never block dev/install */
  }
}

function fetchLatestRegistryVersion() {
  const token = process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!token) return { latest: null, reason: "no_auth" };

  const env = { ...process.env, NODE_AUTH_TOKEN: token };
  const r = spawnSync(
    "npm",
    ["view", PKG_NAME, "version", "--registry", REGISTRY, "--json"],
    { encoding: "utf8", shell: true, env },
  );
  if (r.status !== 0) {
    return { latest: null, reason: "registry_error", detail: (r.stderr || r.stdout || "").trim() };
  }

  let parsed = (r.stdout || "").trim();
  try {
    const json = JSON.parse(parsed);
    if (typeof json === "string") parsed = json;
    else if (Array.isArray(json)) parsed = json[json.length - 1];
  } catch {
    /* plain semver string */
  }

  const latest = String(parsed || "").trim() || null;
  return latest ? { latest, reason: null } : { latest: null, reason: "empty_registry" };
}

function formatPkgRootLabel(pkgRoot) {
  const rel = path.relative(process.cwd(), pkgRoot);
  if (!rel || rel === ".") return "this package";
  if (!rel.startsWith("..")) return rel;
  return pkgRoot;
}

function printNotice({ pkgRoot, installed, latest, declared, localLink, parentNewer }) {
  const pkgLabel = formatPkgRootLabel(pkgRoot);
  const declaredSatisfiesLatest = semverRangeSatisfies(declared, latest);
  const installCmd = declaredSatisfiesLatest
    ? "npm install"
    : `npm install ${PKG_NAME}@${latest}`;

  const lines = [
    "",
    "┌─ @fynn7/ui-design-core update available ─────────────────────────────",
    `│  package: ${pkgLabel}`,
    `│  installed: ${installed}  →  latest: ${latest}`,
  ];
  if (declared && declaredSatisfiesLatest && declared !== installed) {
    lines.push(`│  package.json already declares ${declared} — refresh node_modules`);
  }
  if (parentNewer) {
    const parentLabel =
      path.relative(pkgRoot, parentNewer.hostRoot) === ".."
        ? path.basename(parentNewer.hostRoot)
        : formatPkgRootLabel(parentNewer.hostRoot);
    lines.push(
      `│  parent ${parentLabel} has ${parentNewer.version} — nested copy here still wins for Vite`,
    );
  }
  if (localLink) {
    lines.push("│  (local link / file: — registry tarball may differ from sibling checkout)");
  }
  lines.push(`│  run (in ${pkgLabel}): ${installCmd}`);
  lines.push("│  silence: FYNNS_UI_SKIP_UPDATE_CHECK=1");
  lines.push("└──────────────────────────────────────────────────────────────────────");
  lines.push("");
  console.warn(lines.join("\n"));
}

function main() {
  try {
    runMainBody();
  } catch (err) {
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify({ skipped: true, reason: "error", detail: String(err) }, null, 2));
    }
    process.exit(0);
  }
}

function runMainBody() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }

  if (opts.help) {
    console.log(usage());
    process.exit(0);
  }

  if (process.env.FYNNS_UI_SKIP_UPDATE_CHECK === "1") {
    if (opts.json) console.log(JSON.stringify({ skipped: true, reason: "env" }, null, 2));
    process.exit(0);
  }

  const pkgRoot = findPackageRoot(opts.target);
  if (!pkgRoot) {
    if (opts.json) console.log(JSON.stringify({ skipped: true, reason: "no_package_json" }, null, 2));
    process.exit(0);
  }

  const { declared, installed, localLink, installChain, parentNewer } =
    readInstalledVersion(pkgRoot);
  if (!installed) {
    if (opts.json) {
      console.log(JSON.stringify({ skipped: true, reason: "not_installed", pkgRoot }, null, 2));
    }
    process.exit(0);
  }

  const cache = readCache(pkgRoot);
  const cacheFresh =
    !opts.force &&
    cache &&
    cache.installed === installed &&
    cache.latest &&
    Date.now() - (cache.checkedAt || 0) < CACHE_TTL_MS;

  let latest = cacheFresh ? cache.latest : null;
  let registryReason = cacheFresh ? null : null;

  if (!latest) {
    const reg = fetchLatestRegistryVersion();
    latest = reg.latest;
    registryReason = reg.reason;
    if (latest) {
      writeCache(pkgRoot, { installed, latest, checkedAt: Date.now() });
    }
  }

  const updateAvailable = latest ? semverLt(installed, latest) : false;

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          pkgRoot,
          installed,
          declared,
          localLink,
          latest,
          updateAvailable,
          registryReason,
          cacheFresh: !!cacheFresh,
          installChain: installChain.map((hit) => ({
            hostRoot: hit.hostRoot,
            version: hit.version,
          })),
          parentNewer: parentNewer
            ? { hostRoot: parentNewer.hostRoot, version: parentNewer.version }
            : null,
          declaredSatisfiesLatest: latest ? semverRangeSatisfies(declared, latest) : false,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  if (updateAvailable) {
    printNotice({ pkgRoot, installed, latest, declared, localLink, parentNewer });
  }

  process.exit(0);
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  try {
    return (
      fs.realpathSync(process.argv[1]).toLowerCase() ===
      fs.realpathSync(fileURLToPath(import.meta.url)).toLowerCase()
    );
  } catch {
    return false;
  }
}

if (isDirectRun()) main();

export {
  HOOK_SCRIPT,
  PKG_NAME,
  findPackageRoot,
  readInstalledVersion,
  semverLt,
  semverRangeSatisfies,
  walkInstallChain,
};
