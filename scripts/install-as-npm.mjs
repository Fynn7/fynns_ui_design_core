#!/usr/bin/env node
/**
 * Install @fynn7/ui-design-core from GitHub Packages into a consumer and wire
 * Vite/tsconfig `@fynns/ui` → package source entry.
 *
 * Canonical consume model: npm dependency + source alias (GitHub Packages).
 * Do NOT use git submodule for day-to-day consumption.
 *
 * Usage:
 *   node scripts/install-as-npm.mjs --target <consumer-root> [options]
 *   npm run consume:install -- --target ../my-app
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, "..");
const PKG_NAME = "@fynn7/ui-design-core";
const REGISTRY = "https://npm.pkg.github.com";
/** Import alias kept for apps; resolves into the published package src. */
const ALIAS = "@fynns/ui";
const ENTRY_FROM_PKG = "node_modules/@fynn7/ui-design-core/src/index.ts";
const UPDATE_SCRIPT = "fynns-ui:check-update";
const UPDATE_SCRIPT_CMD =
  "node node_modules/@fynn7/ui-design-core/scripts/check-ui-update.mjs || exit 0";
const UPDATE_CACHE_FILE = ".fynns-ui-update-check.json";

function usage() {
  return `Usage: node scripts/install-as-npm.mjs --target <dir> [options]

Install ${PKG_NAME} from GitHub Packages and wire ${ALIAS} → ${ENTRY_FROM_PKG}.

Options:
  --target <dir>     Consumer repo (or path inside it). Default: cwd
  --version <ver>    Semver range to install (default: read from this core package.json)
  --vite <file>      Vite config to wire
  --tsconfig <file>  tsconfig to wire
  --vite-from <dir>  Directory that contains vite.config.*
  --skip-install     Only wire configs / .npmrc (dependency already present)
  --wire-only        Same as --skip-install
  --check            Validate dep + alias + .npmrc; exit 1 if incomplete
  --dry-run          Print actions without writing
  --json             JSON summary on stdout
  -h, --help         Show help

Auth: set NODE_AUTH_TOKEN or GITHUB_TOKEN (read:packages) for install/publish.
Consumer .npmrc:
  @fynn7:registry=${REGISTRY}
  //npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}
`;
}

function parseArgs(argv) {
  const out = {
    target: process.cwd(),
    version: null,
    vite: null,
    tsconfig: null,
    viteFrom: null,
    skipInstall: false,
    wireOnly: false,
    check: false,
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
    else if (a === "--version") out.version = next();
    else if (a === "--vite") out.vite = next();
    else if (a === "--tsconfig") out.tsconfig = next();
    else if (a === "--vite-from") out.viteFrom = next();
    else if (a === "--skip-install" || a === "--wire-only") {
      out.skipInstall = true;
      out.wireOnly = true;
    } else if (a === "--check") out.check = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json") out.json = true;
    else throw new Error(`Unknown argument: ${a}\n${usage()}`);
  }
  return out;
}

function run(cmd, args, cwd, { allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: false });
  if (!allowFail && r.status !== 0) {
    throw new Error((r.stderr || r.stdout || "").trim() || `${cmd} ${args.join(" ")} failed`);
  }
  return { status: r.status ?? 1, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}

function findGitRoot(start) {
  const r = run("git", ["rev-parse", "--show-toplevel"], start, { allowFail: true });
  if (r.status !== 0 || !r.stdout) throw new Error(`Not a git repository: ${start}`);
  return path.resolve(r.stdout);
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

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function writeText(p, text, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, "utf8");
}

function coreVersion() {
  const pkg = JSON.parse(readText(path.join(CORE_ROOT, "package.json")));
  return pkg.version || "0.3.0";
}

function walkFiles(root, pred, out = []) {
  if (!fs.existsSync(root)) return out;
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "dist") continue;
    const abs = path.join(root, ent.name);
    if (ent.isDirectory()) walkFiles(abs, pred, out);
    else if (pred(abs)) out.push(abs);
  }
  return out;
}

function autoViteConfigs(root) {
  return walkFiles(root, (p) => /^vite\.config\.(ts|mts|js|mjs|cjs)$/.test(path.basename(p)));
}

function autoTsconfigs(root) {
  return walkFiles(root, (p) => /^tsconfig.*\.json$/.test(path.basename(p)));
}

function hasFynnsAlias(text) {
  return /["']@fynns\/ui["']/.test(text);
}

function hasDedupe(text) {
  return /dedupe\s*:\s*\[[^\]]*react/.test(text);
}

function ensureViteHelpers(src) {
  let final = src;
  if (!/from ["']node:path["']|from ["']path["']|require\(["']path["']\)/.test(final)) {
    if (/^import\s/m.test(final)) final = `import path from "node:path";\n${final}`;
  }
  if (!/\b__dirname\b/.test(final)) {
    if (!/fileURLToPath/.test(final)) {
      final = `import { fileURLToPath } from "node:url";\n${final}`;
    }
    final = final.replace(
      /^(import .+\n)+/,
      (imports) => `${imports}const __dirname = path.dirname(fileURLToPath(import.meta.url));\n`,
    );
  }
  return final;
}

function entryRelFromVite(viteFile, gitRoot) {
  const viteDir = path.dirname(viteFile);
  const entryAbs = path.join(gitRoot, ENTRY_FROM_PKG);
  let rel = path.relative(viteDir, entryAbs).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function aliasPointsAtPkg(text) {
  return (
    text.includes("@fynn7/ui-design-core/src/index.ts") ||
    text.includes("@fynn7/ui-design-core\\src\\index.ts")
  );
}

function rewriteViteAliasTarget(src, entryRel) {
  const aliasLine = `"${ALIAS}": path.resolve(__dirname, "${entryRel}")`;
  // Replace existing "@fynns/ui": <anything> (string or path.resolve(...))
  const re = /["']@fynns\/ui["']\s*:\s*(?:path\.resolve\([^)]*\)|"[^"]*"|'[^']*')/;
  if (re.test(src)) return src.replace(re, aliasLine);
  return src;
}

function wireVite(viteFile, entryRel, dryRun, log) {
  const before = readText(viteFile);
  const aliasLine = `"${ALIAS}": path.resolve(__dirname, "${entryRel}")`;
  if (hasFynnsAlias(before)) {
    let next = before;
    let changed = false;
    if (!aliasPointsAtPkg(before)) {
      next = rewriteViteAliasTarget(next, entryRel);
      changed = next !== before;
    }
    if (!hasDedupe(next) && /resolve\s*:\s*\{/.test(next)) {
      const withDedupe = next.replace(/resolve\s*:\s*\{/, (m) => `${m}\n    dedupe: ["react", "react-dom"],`);
      if (withDedupe !== next) {
        next = withDedupe;
        changed = true;
      }
    }
    if (changed) {
      next = ensureViteHelpers(next);
      writeText(viteFile, next, dryRun);
      log.push({
        step: "vite_alias",
        status: dryRun ? "dry-run" : "rewritten",
        detail: `→ ${entryRel}`,
        file: viteFile,
      });
    } else {
      log.push({ step: "vite_alias", status: "ok", detail: "alias already points at package", file: viteFile });
    }
    return;
  }
  if (/alias\s*:\s*\{/.test(before)) {
    let final = before.replace(/alias\s*:\s*\{(\s*)/, () => `alias: {\n      ${aliasLine},\n      `);
    if (!hasDedupe(final) && /resolve\s*:\s*\{/.test(final)) {
      final = final.replace(/resolve\s*:\s*\{/, (m) => `${m}\n    dedupe: ["react", "react-dom"],`);
    }
    final = ensureViteHelpers(final);
    writeText(viteFile, final, dryRun);
    log.push({ step: "vite_alias", status: dryRun ? "dry-run" : "patched", file: viteFile });
    return;
  }
  if (/resolve\s*:\s*\{/.test(before)) {
    let final = before.replace(/resolve\s*:\s*\{/, (m) => {
      const dedupe = hasDedupe(before) ? "" : `\n    dedupe: ["react", "react-dom"],`;
      return `${m}${dedupe}\n    alias: {\n      ${aliasLine},\n    },`;
    });
    final = ensureViteHelpers(final);
    writeText(viteFile, final, dryRun);
    log.push({ step: "vite_alias", status: dryRun ? "dry-run" : "patched", file: viteFile });
    return;
  }
  log.push({
    step: "vite_alias",
    status: "manual",
    file: viteFile,
    detail: `Add resolve.alias ${ALIAS} → ${entryRel} and dedupe react`,
  });
}

function wireTsconfig(tsconfigFile, entryRel, dryRun, log) {
  const before = readText(tsconfigFile);
  let data;
  try {
    data = JSON.parse(before);
  } catch {
    log.push({ step: "tsconfig", status: "manual", file: tsconfigFile, detail: "invalid JSON" });
    return;
  }
  data.compilerOptions = data.compilerOptions || {};
  data.compilerOptions.paths = data.compilerOptions.paths || {};
  const existing = data.compilerOptions.paths[ALIAS];
  const want = [entryRel];
  const same =
    Array.isArray(existing) &&
    existing.length === 1 &&
    String(existing[0]).replace(/\\/g, "/").includes("@fynn7/ui-design-core/src/index.ts");
  if (same) {
    log.push({ step: "tsconfig", status: "ok", detail: "paths already set", file: tsconfigFile });
    return;
  }
  data.compilerOptions.paths[ALIAS] = want;
  if (data.compilerOptions.baseUrl == null) data.compilerOptions.baseUrl = ".";
  writeText(tsconfigFile, `${JSON.stringify(data, null, 2)}\n`, dryRun);
  log.push({
    step: "tsconfig",
    status: dryRun ? "dry-run" : existing ? "rewritten" : "patched",
    file: tsconfigFile,
  });
}

function ensureNpmrc(gitRoot, dryRun, log) {
  const npmrcPath = path.join(gitRoot, ".npmrc");
  const wantScope = `@fynn7:registry=${REGISTRY}`;
  const wantAuth = "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}";
  let text = fs.existsSync(npmrcPath) ? readText(npmrcPath) : "";
  let changed = false;
  if (!text.includes("@fynn7:registry=")) {
    text = `${text.trimEnd()}${text.trim() ? "\n" : ""}${wantScope}\n`;
    changed = true;
  }
  if (!text.includes("//npm.pkg.github.com/:_authToken")) {
    text = `${text.trimEnd()}\n${wantAuth}\n`;
    changed = true;
  }
  if (changed) {
    writeText(npmrcPath, text.endsWith("\n") ? text : `${text}\n`, dryRun);
    log.push({ step: "npmrc", status: dryRun ? "dry-run" : "patched", file: npmrcPath });
  } else {
    log.push({ step: "npmrc", status: "ok", file: npmrcPath });
  }
}

function readConsumerPkg(gitRoot) {
  const p = path.join(gitRoot, "package.json");
  if (!fs.existsSync(p)) return null;
  return { path: p, data: JSON.parse(readText(p)) };
}

function isLocalDependencySpec(spec) {
  return typeof spec === "string" && /^(file:|link:|workspace:)/.test(spec.trim());
}

/** Strip range prefix so `^0.4.17` compares equal to `0.4.17`. */
function normalizeVersionTarget(version) {
  return String(version || "").replace(/^[\^~]/, "");
}

function dependencyNeedsInstall(current, version) {
  if (!current) return true;
  if (isLocalDependencySpec(current)) return true;
  if (!version) return false;
  const target = normalizeVersionTarget(version);
  const currentNorm = normalizeVersionTarget(current);
  if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(target) && currentNorm !== target) return true;
  return false;
}

function ensureDependency(gitRoot, version, dryRun, log) {
  const pkg = readConsumerPkg(gitRoot);
  if (!pkg) {
    log.push({ step: "dependency", status: "fail", detail: "no package.json" });
    return false;
  }
  const deps = { ...(pkg.data.dependencies || {}), ...(pkg.data.devDependencies || {}) };
  const current = deps[PKG_NAME];
  if (current && !dependencyNeedsInstall(current, version)) {
    log.push({ step: "dependency", status: "ok", detail: `${PKG_NAME}@${current}` });
    return true;
  }
  if (current && dryRun) {
    log.push({
      step: "dependency",
      status: "dry-run",
      detail: `would upgrade ${PKG_NAME} from ${current} to ${version}`,
    });
    return true;
  }
  if (current) {
    log.push({
      step: "dependency",
      status: "upgrade",
      detail: `${PKG_NAME} ${current} → ${version}`,
    });
  }
  if (dryRun) {
    log.push({
      step: "dependency",
      status: "dry-run",
      detail: `would add ${PKG_NAME}@${version}`,
    });
    return true;
  }
  const token = process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!token.trim()) {
    log.push({
      step: "dependency",
      status: "fail",
      detail:
        "missing NODE_AUTH_TOKEN / GITHUB_TOKEN (read:packages). " +
        "Consumer .npmrc uses ${NODE_AUTH_TOKEN}; an empty expansion overrides a " +
        "working user-level token and yields npm E401. Set the env var (Windows User " +
        "env is fine), then retry. Example: export NODE_AUTH_TOKEN=$(gh auth token) " +
        "when `gh` has packages scope.",
    });
    return false;
  }
  const env = { ...process.env, NODE_AUTH_TOKEN: token };
  const r = spawnSync(
    "npm",
    ["install", `${PKG_NAME}@${version}`, "--save"],
    { cwd: gitRoot, encoding: "utf8", shell: true, env },
  );
  if (r.status !== 0) {
    const raw = (r.stderr || r.stdout || "").trim() || "npm install failed";
    const hint = /E401|401 Unauthorized/i.test(raw)
      ? " — token rejected by GitHub Packages; create a PAT with read:packages " +
        "(or refresh `gh auth login` / re-export NODE_AUTH_TOKEN)."
      : "";
    log.push({
      step: "dependency",
      status: "fail",
      detail: `${raw}${hint}`,
    });
    return false;
  }
  log.push({ step: "dependency", status: "installed", detail: `${PKG_NAME}@${version}` });
  return true;
}

function prependLifecycleHook(existing, hookCmd) {
  if (!existing) return hookCmd;
  if (existing.includes(UPDATE_SCRIPT) || existing.includes("check-ui-update.mjs")) return existing;
  return `${hookCmd} && ${existing}`;
}

function wireUpdateHooks(pkgRoot, dryRun, log) {
  const pkgPath = path.join(pkgRoot, "package.json");
  const pkg = readConsumerPkg(pkgRoot);
  if (!pkg) {
    log.push({ step: "update_hooks", status: "fail", detail: "no package.json" });
    return;
  }

  const scripts = { ...(pkg.data.scripts || {}) };
  const hookCmd = `npm run ${UPDATE_SCRIPT}`;
  let changed = false;

  if (scripts[UPDATE_SCRIPT] !== UPDATE_SCRIPT_CMD) {
    scripts[UPDATE_SCRIPT] = UPDATE_SCRIPT_CMD;
    changed = true;
  }

  for (const hook of ["predev", "prebuild", "prepreview", "postinstall"]) {
    const next = prependLifecycleHook(scripts[hook], hookCmd);
    if (next !== scripts[hook]) {
      scripts[hook] = next;
      changed = true;
    }
  }

  if (!changed) {
    log.push({ step: "update_hooks", status: "ok", detail: "already wired" });
    return;
  }

  if (!dryRun) {
    pkg.data.scripts = scripts;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg.data, null, 2)}\n`);
  }
  log.push({
    step: "update_hooks",
    status: dryRun ? "dry-run" : "patched",
    detail: `${UPDATE_SCRIPT} + predev/prebuild/prepreview/postinstall`,
  });
}

function ensureUpdateCacheGitignored(gitRoot, dryRun, log) {
  const gitignorePath = path.join(gitRoot, ".gitignore");
  if (!fs.existsSync(gitignorePath)) return;
  const text = readText(gitignorePath);
  if (text.includes(UPDATE_CACHE_FILE)) {
    log.push({ step: "update_cache_gitignore", status: "ok" });
    return;
  }
  const next = `${text.replace(/\s*$/, "")}\n\n# ${PKG_NAME} update-check cache (install-as-npm)\n${UPDATE_CACHE_FILE}\n`;
  if (!dryRun) fs.writeFileSync(gitignorePath, next);
  log.push({ step: "update_cache_gitignore", status: dryRun ? "dry-run" : "patched" });
}

function ensureConsumerRule(gitRoot, dryRun, log) {
  const dest = path.join(gitRoot, ".cursor", "rules", "fynns-ui-consumer.mdc");
  if (fs.existsSync(dest)) {
    log.push({ step: "cursor_rule", status: "ok", detail: "exists" });
    return;
  }
  const src = path.join(CORE_ROOT, "llm", "consumer-cursor-rule.mdc");
  if (!fs.existsSync(src)) return;
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  log.push({ step: "cursor_rule", status: dryRun ? "dry-run" : "written", file: dest });
}

function pickVite(opts, gitRoot) {
  if (opts.vite) return path.resolve(opts.vite);
  if (opts.viteFrom) {
    const hits = autoViteConfigs(path.resolve(opts.viteFrom));
    if (hits[0]) return hits[0];
  }
  const hits = autoViteConfigs(gitRoot).filter(
    (p) => !/[\\/]packages[\\/]fynns_ui_design_core[\\/]/.test(p),
  );
  hits.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length);
  return hits.find((p) => !/[\\/]examples?[\\/]/.test(p)) || hits[0] || null;
}

function pickTsconfig(opts, gitRoot, viteFile) {
  if (opts.tsconfig) return path.resolve(opts.tsconfig);
  if (viteFile) {
    const dir = path.dirname(viteFile);
    for (const name of ["tsconfig.json", "tsconfig.app.json", "tsconfig.web.json"]) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
    }
  }
  const hits = autoTsconfigs(gitRoot);
  hits.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length);
  return hits.find((p) => path.basename(p) === "tsconfig.json") || hits[0] || null;
}

function checkMode(pkgRoot, viteFile, tsconfigFile) {
  const issues = [];
  const pkg = readConsumerPkg(pkgRoot);
  const deps = pkg
    ? { ...(pkg.data.dependencies || {}), ...(pkg.data.devDependencies || {}) }
    : {};
  if (!deps[PKG_NAME]) issues.push(`missing dependency ${PKG_NAME}`);
  if (!pkg?.data.scripts?.[UPDATE_SCRIPT]) {
    issues.push(
      `missing scripts.${UPDATE_SCRIPT} — re-run consume:install (or --wire-only) to wire dev/build update notices`,
    );
  }
  if (deps[PKG_NAME] && isLocalDependencySpec(deps[PKG_NAME])) {
    issues.push(
      `${PKG_NAME} uses local ${deps[PKG_NAME]} — run npm run consume:install -- --target <app> --version x.y.z for registry pin`,
    );
  }
  if (deps["@fynns/ui"] || deps["@fynns/ui-design-core"]) {
    issues.push("remove obsolete @fynns/ui / @fynns/ui-design-core package names; use @fynn7/ui-design-core");
  }
  const entry = path.join(pkgRoot, ENTRY_FROM_PKG);
  if (deps[PKG_NAME] && !fs.existsSync(entry)) {
    issues.push(`package not installed on disk (expected ${ENTRY_FROM_PKG}); run npm install`);
  }
  const npmrc = path.join(pkgRoot, ".npmrc");
  if (!fs.existsSync(npmrc) || !readText(npmrc).includes("@fynn7:registry=")) {
    issues.push(`.npmrc missing @fynn7 → ${REGISTRY}`);
  }
  if (viteFile) {
    const t = readText(viteFile);
    if (!hasFynnsAlias(t)) issues.push(`vite missing ${ALIAS} alias: ${viteFile}`);
    else if (!aliasPointsAtPkg(t)) {
      issues.push(
        `vite ${ALIAS} alias must point at ${ENTRY_FROM_PKG} (still looks like a submodule path): ${viteFile}`,
      );
    }
    if (!hasDedupe(t)) issues.push(`vite missing react dedupe: ${viteFile}`);
  } else {
    issues.push("no vite.config.* found to validate");
  }
  if (tsconfigFile) {
    const t = readText(tsconfigFile);
    if (!hasFynnsAlias(t)) issues.push(`tsconfig missing ${ALIAS} paths: ${tsconfigFile}`);
    else if (!aliasPointsAtPkg(t)) {
      issues.push(
        `tsconfig ${ALIAS} paths must include ${ENTRY_FROM_PKG}: ${tsconfigFile}`,
      );
    }
  }
  // Warn if submodule still present (migration leftover)
  const sub = path.join(pkgRoot, "packages", "fynns_ui_design_core", "src", "index.ts");
  if (fs.existsSync(sub)) {
    issues.push(
      "legacy git submodule packages/fynns_ui_design_core still present — remove after switching aliases to node_modules",
    );
  }
  return { ok: issues.length === 0, issues };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }
  if (opts.help) {
    console.log(usage());
    process.exit(0);
  }

  const log = [];
  const targetAbs = path.resolve(opts.target);
  let gitRoot;
  try {
    gitRoot = findGitRoot(targetAbs);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }
  const pkgRoot = findPackageRoot(targetAbs);
  if (!pkgRoot) {
    console.error(`No package.json found walking up from ${targetAbs}`);
    process.exit(1);
  }

  const version = opts.version || `^${coreVersion()}`;
  const viteFile = pickVite(opts, pkgRoot);
  const tsconfigFile = pickTsconfig(opts, pkgRoot, viteFile);

  if (opts.check) {
    const result = checkMode(pkgRoot, viteFile, tsconfigFile);
    const out = {
      ok: result.ok,
      action: "check",
      consumerRoot: pkgRoot,
      gitRoot,
      issues: result.issues,
      log,
    };
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(result.ok ? "check ok" : "check failed");
      for (const i of result.issues) console.log(`  - ${i}`);
    }
    process.exit(result.ok ? 0 : 1);
  }

  ensureNpmrc(pkgRoot, opts.dryRun, log);
  if (!opts.skipInstall && !opts.wireOnly) {
    const ok = ensureDependency(pkgRoot, version, opts.dryRun, log);
    if (!ok) {
      if (opts.json) console.log(JSON.stringify({ ok: false, log }, null, 2));
      process.exit(1);
    }
  }

  if (viteFile) {
    const entryRel = entryRelFromVite(viteFile, pkgRoot);
    wireVite(viteFile, entryRel, opts.dryRun, log);
  } else {
    log.push({ step: "vite_alias", status: "manual", detail: "no vite.config found" });
  }
  if (tsconfigFile) {
    const tsDir = path.dirname(tsconfigFile);
    let rel = path.relative(tsDir, path.join(pkgRoot, ENTRY_FROM_PKG)).split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    wireTsconfig(tsconfigFile, rel, opts.dryRun, log);
  }
  ensureConsumerRule(gitRoot, opts.dryRun, log);
  if (!opts.check) {
    wireUpdateHooks(pkgRoot, opts.dryRun, log);
    ensureUpdateCacheGitignored(gitRoot, opts.dryRun, log);
  }

  const summary = {
    ok: true,
    action: "install",
    package: PKG_NAME,
    version,
    consumerRoot: pkgRoot,
    gitRoot,
    alias: ALIAS,
    entry: ENTRY_FROM_PKG,
    dryRun: opts.dryRun,
    log,
  };
  if (opts.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(opts.dryRun ? "[dry-run] npm consume install planned" : "npm consume install done");
    console.log(`  consumer: ${pkgRoot}`);
    console.log(`  package: ${PKG_NAME}@${version}`);
    console.log(`  alias: ${ALIAS} → ${ENTRY_FROM_PKG}`);
    for (const step of log) {
      console.log(`  ${step.step}: ${step.status}${step.detail ? ` (${step.detail})` : ""}`);
    }
  }
}

main();
