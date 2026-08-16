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

function wireVite(viteFile, entryRel, dryRun, log) {
  const before = readText(viteFile);
  const aliasLine = `"${ALIAS}": path.resolve(__dirname, "${entryRel}")`;
  if (hasFynnsAlias(before)) {
    let next = before;
    let changed = false;
    if (!hasDedupe(before) && /resolve\s*:\s*\{/.test(before)) {
      next = next.replace(/resolve\s*:\s*\{/, (m) => `${m}\n    dedupe: ["react", "react-dom"],`);
      changed = next !== before;
    }
    if (changed) {
      writeText(viteFile, next, dryRun);
      log.push({ step: "vite_dedupe", status: dryRun ? "dry-run" : "patched", file: viteFile });
    } else {
      log.push({ step: "vite_alias", status: "ok", detail: "alias already present", file: viteFile });
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
  if (data.compilerOptions.paths[ALIAS]) {
    log.push({ step: "tsconfig", status: "ok", detail: "paths already set", file: tsconfigFile });
    return;
  }
  data.compilerOptions.paths[ALIAS] = [entryRel];
  if (data.compilerOptions.baseUrl == null) data.compilerOptions.baseUrl = ".";
  writeText(tsconfigFile, `${JSON.stringify(data, null, 2)}\n`, dryRun);
  log.push({ step: "tsconfig", status: dryRun ? "dry-run" : "patched", file: tsconfigFile });
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

function ensureDependency(gitRoot, version, dryRun, log) {
  const pkg = readConsumerPkg(gitRoot);
  if (!pkg) {
    log.push({ step: "dependency", status: "fail", detail: "no package.json" });
    return false;
  }
  const deps = { ...(pkg.data.dependencies || {}), ...(pkg.data.devDependencies || {}) };
  if (deps[PKG_NAME]) {
    log.push({ step: "dependency", status: "ok", detail: `${PKG_NAME}@${deps[PKG_NAME]}` });
    return true;
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
  const env = { ...process.env };
  if (token) env.NODE_AUTH_TOKEN = token;
  const r = spawnSync(
    "npm",
    ["install", `${PKG_NAME}@${version}`, "--save"],
    { cwd: gitRoot, encoding: "utf8", shell: true, env },
  );
  if (r.status !== 0) {
    log.push({
      step: "dependency",
      status: "fail",
      detail: (r.stderr || r.stdout || "").trim() || "npm install failed",
    });
    return false;
  }
  log.push({ step: "dependency", status: "installed", detail: `${PKG_NAME}@${version}` });
  return true;
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

function checkMode(gitRoot, viteFile, tsconfigFile) {
  const issues = [];
  const pkg = readConsumerPkg(gitRoot);
  const deps = pkg
    ? { ...(pkg.data.dependencies || {}), ...(pkg.data.devDependencies || {}) }
    : {};
  if (!deps[PKG_NAME]) issues.push(`missing dependency ${PKG_NAME}`);
  if (deps["@fynns/ui"] || deps["@fynns/ui-design-core"]) {
    issues.push("remove obsolete @fynns/ui / @fynns/ui-design-core package names; use @fynn7/ui-design-core");
  }
  const entry = path.join(gitRoot, ENTRY_FROM_PKG);
  if (deps[PKG_NAME] && !fs.existsSync(entry)) {
    issues.push(`package not installed on disk (expected ${ENTRY_FROM_PKG}); run npm install`);
  }
  const npmrc = path.join(gitRoot, ".npmrc");
  if (!fs.existsSync(npmrc) || !readText(npmrc).includes("@fynn7:registry=")) {
    issues.push(`.npmrc missing @fynn7 → ${REGISTRY}`);
  }
  if (viteFile) {
    const t = readText(viteFile);
    if (!hasFynnsAlias(t)) issues.push(`vite missing ${ALIAS} alias: ${viteFile}`);
    if (!hasDedupe(t)) issues.push(`vite missing react dedupe: ${viteFile}`);
  } else {
    issues.push("no vite.config.* found to validate");
  }
  if (tsconfigFile) {
    const t = readText(tsconfigFile);
    if (!hasFynnsAlias(t)) issues.push(`tsconfig missing ${ALIAS} paths: ${tsconfigFile}`);
  }
  // Warn if submodule still present (migration leftover)
  const sub = path.join(gitRoot, "packages", "fynns_ui_design_core", "src", "index.ts");
  const subHub = path.join(gitRoot, "gui", "packages", "fynns_ui_design_core", "src", "index.ts");
  if (fs.existsSync(sub) || fs.existsSync(subHub)) {
    issues.push(
      "legacy git submodule packages/fynns_ui_design_core (or gui/…) still present — remove after switching aliases to node_modules",
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
  let gitRoot;
  try {
    gitRoot = findGitRoot(path.resolve(opts.target));
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }

  const version = opts.version || `^${coreVersion()}`;
  const viteFile = pickVite(opts, gitRoot);
  const tsconfigFile = pickTsconfig(opts, gitRoot, viteFile);

  if (opts.check) {
    const result = checkMode(gitRoot, viteFile, tsconfigFile);
    const out = { ok: result.ok, action: "check", consumerRoot: gitRoot, issues: result.issues, log };
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(result.ok ? "check ok" : "check failed");
      for (const i of result.issues) console.log(`  - ${i}`);
    }
    process.exit(result.ok ? 0 : 1);
  }

  ensureNpmrc(gitRoot, opts.dryRun, log);
  if (!opts.skipInstall && !opts.wireOnly) {
    const ok = ensureDependency(gitRoot, version, opts.dryRun, log);
    if (!ok) {
      if (opts.json) console.log(JSON.stringify({ ok: false, log }, null, 2));
      process.exit(1);
    }
  }

  if (viteFile) {
    const entryRel = entryRelFromVite(viteFile, gitRoot);
    wireVite(viteFile, entryRel, opts.dryRun, log);
  } else {
    log.push({ step: "vite_alias", status: "manual", detail: "no vite.config found" });
  }
  if (tsconfigFile) {
    const tsDir = path.dirname(tsconfigFile);
    let rel = path.relative(tsDir, path.join(gitRoot, ENTRY_FROM_PKG)).split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    wireTsconfig(tsconfigFile, rel, opts.dryRun, log);
  }
  ensureConsumerRule(gitRoot, opts.dryRun, log);

  const summary = {
    ok: true,
    action: "install",
    package: PKG_NAME,
    version,
    consumerRoot: gitRoot,
    alias: ALIAS,
    entry: ENTRY_FROM_PKG,
    dryRun: opts.dryRun,
    log,
  };
  if (opts.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(opts.dryRun ? "[dry-run] npm consume install planned" : "npm consume install done");
    console.log(`  consumer: ${gitRoot}`);
    console.log(`  package: ${PKG_NAME}@${version}`);
    console.log(`  alias: ${ALIAS} → ${ENTRY_FROM_PKG}`);
    for (const step of log) {
      console.log(`  ${step.step}: ${step.status}${step.detail ? ` (${step.detail})` : ""}`);
    }
  }
}

main();
