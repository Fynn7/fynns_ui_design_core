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

function resolveInstalledRoot(pkgRoot) {
  const entry = path.join(pkgRoot, "node_modules", PKG_NAME, "package.json");
  if (fs.existsSync(entry)) return path.dirname(entry);
  return null;
}

function readInstalledVersion(pkgRoot) {
  const pkgJson = readJson(path.join(pkgRoot, "package.json"));
  const deps = {
    ...(pkgJson?.dependencies || {}),
    ...(pkgJson?.devDependencies || {}),
  };
  const declared = deps[PKG_NAME] ?? null;

  const installedRoot = resolveInstalledRoot(pkgRoot);
  if (!installedRoot) {
    return { declared, installed: null, localLink: false, installedRoot: null };
  }

  const installedPkg = readJson(path.join(installedRoot, "package.json"));
  const installed = installedPkg?.version ?? null;

  let localLink = isLocalDependencySpec(declared);
  if (!localLink) {
    try {
      const stat = fs.lstatSync(path.join(pkgRoot, "node_modules", PKG_NAME));
      localLink = stat.isSymbolicLink();
    } catch {
      /* not a link */
    }
  }

  return { declared, installed, localLink, installedRoot };
}

function readCache(pkgRoot) {
  return readJson(path.join(pkgRoot, CACHE_BASENAME));
}

function writeCache(pkgRoot, data) {
  fs.writeFileSync(path.join(pkgRoot, CACHE_BASENAME), `${JSON.stringify(data, null, 2)}\n`);
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

function printNotice({ installed, latest, declared, localLink }) {
  const pin = declared && !isLocalDependencySpec(declared) ? declared : latest;
  const installCmd = pin && pin === latest
    ? `npm install ${PKG_NAME}@${latest}`
    : `npm install ${PKG_NAME}@${latest}`;

  const lines = [
    "",
    "┌─ @fynn7/ui-design-core update available ─────────────────────────────",
    `│  installed: ${installed}  →  latest: ${latest}`,
  ];
  if (localLink) {
    lines.push("│  (local link / file: — registry tarball may differ from sibling checkout)");
  }
  lines.push(`│  run: ${installCmd}`);
  lines.push("│  silence: FYNNS_UI_SKIP_UPDATE_CHECK=1");
  lines.push("└──────────────────────────────────────────────────────────────────────");
  lines.push("");
  console.warn(lines.join("\n"));
}

function main() {
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

  const { declared, installed, localLink } = readInstalledVersion(pkgRoot);
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
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  if (updateAvailable) {
    printNotice({ installed, latest, declared, localLink });
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
};
