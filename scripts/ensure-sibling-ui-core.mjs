#!/usr/bin/env node
/**
 * Zero-token day-to-day consume helper.
 *
 * Ensures a sibling checkout of this public repo at
 * `<consumer-git-root>/../fynns_ui_design_core`, then can `npm install`
 * `@fynn7/ui-design-core@file:…` into a consumer package.
 *
 * GitHub Packages auth (NODE_AUTH_TOKEN) is NOT required. Anyone who clones a
 * consumer should clone/link this sibling over HTTPS and install — no PAT.
 *
 * Usage (from a core checkout, or after sibling already exists):
 *   node scripts/ensure-sibling-ui-core.mjs --target <consumer-pkg-or-root>
 *   node scripts/ensure-sibling-ui-core.mjs --target ../my-app/apps/web --install
 *
 * Consumer apps typically wrap this (or copy the clone+file: steps) into their
 * own setup / predev so first `npm run dev` is seamless. Reference:
 * fynns_cv_generator/scripts/ensure-node.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, "..");
const PKG_NAME = "@fynn7/ui-design-core";
const SIBLING_DIRNAME = "fynns_ui_design_core";
const CANONICAL_GIT_URL = "https://github.com/Fynn7/fynns_ui_design_core.git";
const DEFAULT_REF = process.env.FYNNS_UI_CORE_REF || "dev";

/** Keep @fynn7 off GitHub Packages so empty user/project tokens cannot E401. */
const SAFE_NPMRC =
  "# Zero-token sibling consume: do not point @fynn7 at npm.pkg.github.com.\n" +
  "# (User-level .npmrc with empty NODE_AUTH_TOKEN would otherwise break install.)\n" +
  "@fynn7:registry=https://registry.npmjs.org\n" +
  "# Optional Packages publish/bump only — needs NODE_AUTH_TOKEN / GITHUB_TOKEN:\n" +
  "# @fynn7:registry=https://npm.pkg.github.com\n" +
  "# //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n";

function usage() {
  return `Usage: node scripts/ensure-sibling-ui-core.mjs --target <dir> [options]

Ensure sibling ../${SIBLING_DIRNAME} next to the consumer git root (public HTTPS
clone — no NODE_AUTH_TOKEN). Optionally file:-link ${PKG_NAME} into the package.

Options:
  --target <dir>   Consumer package dir or path inside the consumer repo
  --ref <branch>   Clone/update ref (default: ${DEFAULT_REF} or FYNNS_UI_CORE_REF)
  --install        npm install ${PKG_NAME}@file:<sibling> into --target package
  --npmrc          Write zero-token .npmrc beside the package (safe @fynn7 scope)
  --json           JSON summary on stdout
  -h, --help
`;
}

function parseArgs(argv) {
  const out = {
    target: process.cwd(),
    ref: DEFAULT_REF,
    install: false,
    npmrc: false,
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
    else if (a === "--ref") out.ref = next();
    else if (a === "--install") out.install = true;
    else if (a === "--npmrc") out.npmrc = true;
    else if (a === "--json") out.json = true;
    else throw new Error(`Unknown argument: ${a}\n${usage()}`);
  }
  return out;
}

function run(cmd, args, cwd, { allowFail = false, quiet = false } = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32" && cmd === "npm",
    windowsHide: true,
  });
  if (!allowFail && (r.status ?? 1) !== 0) {
    const msg = (r.stderr || r.stdout || "").trim() || `${cmd} ${args.join(" ")} failed`;
    throw new Error(msg);
  }
  if (!quiet && r.stdout) process.stdout.write(r.stdout.endsWith("\n") ? r.stdout : `${r.stdout}\n`);
  if (!quiet && r.stderr) process.stderr.write(r.stderr.endsWith("\n") ? r.stderr : `${r.stderr}\n`);
  return r;
}

function findGitRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function findPkgRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function siblingDir(gitRoot) {
  return path.resolve(gitRoot, "..", SIBLING_DIRNAME);
}

function siblingReady(dir) {
  return fs.existsSync(path.join(dir, "package.json"));
}

function resolveCloneUrl(gitRoot) {
  try {
    const r = run("git", ["remote", "get-url", "origin"], gitRoot, {
      allowFail: true,
      quiet: true,
    });
    const origin = String(r.stdout ?? "").trim();
    if (origin && /github\.com/.test(origin)) {
      return origin.replace(/[^/:]+(\.git)?$/, `${SIBLING_DIRNAME}$1`);
    }
  } catch {
    /* fall through */
  }
  return CANONICAL_GIT_URL;
}

function ensureSiblingCheckout(gitRoot, ref, log) {
  const dir = siblingDir(gitRoot);
  if (siblingReady(dir)) {
    log.push({ step: "sibling", status: "ok", path: dir });
    return dir;
  }
  if (fs.existsSync(dir) && !siblingReady(dir)) {
    throw new Error(
      `${dir} exists but has no package.json — move it aside and retry.`,
    );
  }
  const url = resolveCloneUrl(gitRoot);
  log.push({ step: "clone", status: "start", url, ref, path: dir });
  run("git", ["clone", "--branch", ref, "--depth", "1", url, dir], gitRoot);
  if (!siblingReady(dir)) {
    throw new Error(`Clone finished but ${dir}/package.json missing`);
  }
  log.push({ step: "clone", status: "ok", path: dir });
  return dir;
}

function writeSafeNpmrc(pkgRoot, dryWrite, log) {
  const npmrcPath = path.join(pkgRoot, ".npmrc");
  const current = fs.existsSync(npmrcPath) ? fs.readFileSync(npmrcPath, "utf8") : "";
  const pointsAtPackages = /npm\.pkg\.github\.com/.test(current);
  const hasEmptyAuth = /_authToken=\$\{NODE_AUTH_TOKEN\}/.test(current);
  const alreadySafe = current.includes("@fynn7:registry=https://registry.npmjs.org");
  if (alreadySafe && !pointsAtPackages && !hasEmptyAuth) {
    log.push({ step: "npmrc", status: "ok", file: npmrcPath });
    return;
  }
  if (!dryWrite) fs.writeFileSync(npmrcPath, SAFE_NPMRC, "utf8");
  log.push({ step: "npmrc", status: "written", file: npmrcPath });
}

function installFromSibling(pkgRoot, sibling, log) {
  const fileUrl = pathToFileURL(path.resolve(sibling)).href;
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  log.push({ step: "install", status: "start", spec: fileUrl });
  run(npm, ["install", `${PKG_NAME}@${fileUrl}`, "--save"], pkgRoot);
  log.push({ step: "install", status: "ok", detail: `${PKG_NAME}@file:${sibling}` });
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }
  const log = [];
  const pkgRoot = findPkgRoot(opts.target);
  const gitRoot = findGitRoot(pkgRoot);
  try {
    const sibling = ensureSiblingCheckout(gitRoot, opts.ref, log);
    if (opts.npmrc || opts.install) writeSafeNpmrc(pkgRoot, false, log);
    if (opts.install) installFromSibling(pkgRoot, sibling, log);
    const summary = {
      ok: true,
      mode: "sibling-file",
      pkgRoot,
      gitRoot,
      sibling: path.resolve(gitRoot, "..", SIBLING_DIRNAME),
      tokenRequired: false,
      log,
    };
    if (opts.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    else {
      console.log(
        `[fynns-ui] sibling ready (zero-token): ${summary.sibling}` +
          (opts.install ? ` → linked into ${pkgRoot}` : ""),
      );
    }
  } catch (err) {
    const summary = { ok: false, error: String(err?.message || err), log };
    if (opts.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    else console.error(`[fynns-ui] ${summary.error}`);
    process.exit(1);
  }
}

main();
