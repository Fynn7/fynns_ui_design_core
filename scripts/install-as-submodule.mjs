#!/usr/bin/env node
/**
 * Install fynns_ui_design_core into a consumer repo as a git submodule and
 * optionally wire Vite + tsconfig `@fynns/ui` aliases.
 *
 * Canonical consume model: submodule + source alias. NEVER add this package
 * to package.json dependencies / devDependencies.
 *
 * Usage:
 *   node scripts/install-as-submodule.mjs --target <consumer-root> [options]
 *   npm run consume:install -- --target ../my-app
 *
 * Bootstrap when this repo is not yet a submodule of the target:
 *   git clone --depth 1 https://github.com/Fynn7/fynns_ui_design_core.git %TEMP%\fynns_ui_design_core
 *   node %TEMP%\fynns_ui_design_core\scripts\install-as-submodule.mjs --target .
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, "..");
const DEFAULT_URL = "https://github.com/Fynn7/fynns_ui_design_core.git";
const DEFAULT_SUBPATH = "packages/fynns_ui_design_core";

function usage() {
  return `Usage: node scripts/install-as-submodule.mjs --target <dir> [options]

Options:
  --target <dir>           Consumer repo (or any path inside it). Default: cwd
  --submodule-path <path>  Submodule path in consumer. Default: ${DEFAULT_SUBPATH}
  --url <git-url>          Submodule remote URL. Default: ${DEFAULT_URL}
  --branch <name>          Optional branch for submodule add -b
  --vite <file>            Vite config to wire (default: auto-detect)
  --tsconfig <file>        tsconfig to wire (default: auto-detect)
  --vite-from <dir>        Directory that contains vite.config.* (alias relative to it)
  --skip-wire              Only add/init submodule; do not edit vite/tsconfig
  --wire-only              Skip git submodule; only wire configs
  --check                  Validate existing install; exit 1 if incomplete
  --dry-run                Print actions without changing anything
  --json                   Machine-readable JSON summary on stdout
  -h, --help               Show help
`;
}

function parseArgs(argv) {
  const out = {
    target: process.cwd(),
    submodulePath: DEFAULT_SUBPATH,
    url: DEFAULT_URL,
    branch: null,
    vite: null,
    tsconfig: null,
    viteFrom: null,
    skipWire: false,
    wireOnly: false,
    check: false,
    dryRun: false,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--target") out.target = next();
    else if (a === "--submodule-path") out.submodulePath = next();
    else if (a === "--url") out.url = next();
    else if (a === "--branch") out.branch = next();
    else if (a === "--vite") out.vite = next();
    else if (a === "--tsconfig") out.tsconfig = next();
    else if (a === "--vite-from") out.viteFrom = next();
    else if (a === "--skip-wire") out.skipWire = true;
    else if (a === "--wire-only") out.wireOnly = true;
    else if (a === "--check") out.check = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json") out.json = true;
    else if (a.startsWith("-")) throw new Error(`Unknown flag: ${a}\n${usage()}`);
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

function readText(p) {
  // Strip UTF-8 BOM (common on Windows PowerShell Set-Content -Encoding utf8).
  return fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
}

function writeText(p, text, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, "utf8");
}

function walkFind(root, pred, { maxDepth = 4 } = {}) {
  const hits = [];
  function walk(dir, depth) {
    if (depth > maxDepth || hits.length >= 20) return;
    let ents;
    try {
      ents = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "dist") continue;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p, depth + 1);
      else if (pred(ent.name, p)) hits.push(p);
    }
  }
  walk(root, 0);
  return hits;
}

function autoViteConfigs(root) {
  return walkFind(root, (name) => /^vite\.config\.(ts|mts|js|mjs|cjs)$/i.test(name));
}

function autoTsconfigs(root) {
  return walkFind(root, (name) => /^tsconfig(\..+)?\.json$/i.test(name)).filter(
    (p) => !/[\\/]packages[\\/]fynns_ui_design_core[\\/]/.test(p),
  );
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function relImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return toPosix(rel);
}

function submodulePresent(gitRoot, subPath) {
  const abs = path.join(gitRoot, subPath);
  const gitmodules = path.join(gitRoot, ".gitmodules");
  if (!fs.existsSync(gitmodules)) return { present: false, abs, initialized: false };
  const gm = readText(gitmodules);
  const mentioned = gm.includes(subPath.replace(/\\/g, "/")) || gm.includes(toPosix(subPath));
  const hasIndex = fs.existsSync(path.join(abs, "src", "index.ts"));
  return { present: mentioned || hasIndex, abs, initialized: hasIndex };
}

function packageJsonHasForbiddenDep(gitRoot) {
  const hits = [];
  for (const pkg of walkFind(gitRoot, (n) => n === "package.json", { maxDepth: 5 })) {
    if (/[\\/]packages[\\/]fynns_ui_design_core[\\/]/.test(pkg)) continue;
    try {
      const j = JSON.parse(readText(pkg));
      for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        const block = j[field] || {};
        for (const name of Object.keys(block)) {
          if (name === "@fynns/ui" || name === "@fynns/ui-design-core") {
            hits.push({ file: path.relative(gitRoot, pkg), field, name, value: block[name] });
          }
        }
      }
    } catch {
      /* ignore */
    }
  }
  return hits;
}

function ensureSubmodule({ gitRoot, subPath, url, branch, dryRun, log }) {
  const state = submodulePresent(gitRoot, subPath);
  if (state.initialized) {
    log.push({ step: "submodule", status: "ok", detail: "already initialized" });
    return state;
  }
  if (state.present && !state.initialized) {
    log.push({ step: "submodule_update", status: dryRun ? "dry-run" : "run", detail: "git submodule update --init" });
    if (!dryRun) {
      runGit(["submodule", "update", "--init", "--recursive", "--", subPath], gitRoot);
    }
    return submodulePresent(gitRoot, subPath);
  }
  const args = ["submodule", "add"];
  if (branch) args.push("-b", branch);
  args.push(url, subPath);
  log.push({ step: "submodule_add", status: dryRun ? "dry-run" : "run", detail: `git ${args.join(" ")}` });
  if (!dryRun) {
    runGit(args, gitRoot);
  }
  return submodulePresent(gitRoot, subPath);
}

function hasFynnsAlias(text) {
  return /["']@fynns\/ui["']/.test(text);
}

function hasDedupe(text) {
  return /dedupe\s*:\s*\[[^\]]*react/.test(text);
}

function wireVite(viteFile, entryRel, dryRun, log) {
  const before = readText(viteFile);
  if (hasFynnsAlias(before)) {
    let next = before;
    let changed = false;
    if (!hasDedupe(before) && /resolve\s*:\s*\{/.test(before)) {
      next = next.replace(/resolve\s*:\s*\{/, (m) => `${m}\n    dedupe: ["react", "react-dom"],`);
      changed = next !== before;
    }
    if (changed) {
      writeText(viteFile, next, dryRun);
      log.push({
        step: "vite_dedupe",
        status: dryRun ? "dry-run" : "patched",
        file: viteFile,
      });
    } else {
      log.push({ step: "vite_alias", status: "ok", detail: "alias already present", file: viteFile });
    }
    return { patched: changed, snippet: null };
  }

  const aliasLine = `"@fynns/ui": path.resolve(__dirname, "${entryRel}")`;
  const snippet = `resolve: {\n  alias: {\n    ${aliasLine},\n  },\n  dedupe: ["react", "react-dom"],\n}`;

  // Prefer injecting into existing resolve.alias
  if (/alias\s*:\s*\{/.test(before)) {
    const next = before.replace(/alias\s*:\s*\{(\s*)/, (_m, ws) => {
      const indent = ws.includes("\n") ? "\n      " : "\n      ";
      return `alias: {${indent}${aliasLine},${indent}`;
    });
    let final = next;
    if (!hasDedupe(final) && /resolve\s*:\s*\{/.test(final)) {
      final = final.replace(/resolve\s*:\s*\{/, (m) => `${m}\n    dedupe: ["react", "react-dom"],`);
    }
    if (!/from ["']node:path["']|from ["']path["']|require\(["']path["']\)/.test(final)) {
      // Prepend path import for ESM vite configs
      if (/^import\s/m.test(final)) {
        final = `import path from "node:path";\n${final}`;
      }
    }
    if (!/__dirname/.test(final) && /fileURLToPath/.test(final) === false) {
      // Many ESM configs define __dirname already; if alias uses __dirname ensure helper exists
      if (!/\b__dirname\b/.test(final)) {
        if (!/fileURLToPath/.test(final)) {
          final = `import { fileURLToPath } from "node:url";\n${final}`;
        }
        final = final.replace(
          /^(import .+\n)+/,
          (imports) =>
            `${imports}const __dirname = path.dirname(fileURLToPath(import.meta.url));\n`,
        );
      }
    }
    writeText(viteFile, final, dryRun);
    log.push({ step: "vite_alias", status: dryRun ? "dry-run" : "patched", file: viteFile });
    return { patched: true, snippet: null };
  }

  log.push({
    step: "vite_alias",
    status: "manual",
    file: viteFile,
    detail: "Could not auto-inject; add this resolve block",
    snippet,
  });
  return { patched: false, snippet };
}

function wireTsconfig(tsconfigFile, entryRelFromTsconfig, dryRun, log) {
  const before = readText(tsconfigFile);
  let data;
  try {
    data = JSON.parse(before);
  } catch {
    log.push({ step: "tsconfig", status: "manual", file: tsconfigFile, detail: "invalid JSON" });
    return { patched: false };
  }
  data.compilerOptions = data.compilerOptions || {};
  data.compilerOptions.paths = data.compilerOptions.paths || {};
  const existing = data.compilerOptions.paths["@fynns/ui"];
  if (existing) {
    log.push({ step: "tsconfig", status: "ok", detail: "paths already set", file: tsconfigFile });
    return { patched: false };
  }
  data.compilerOptions.paths["@fynns/ui"] = [entryRelFromTsconfig];
  if (data.compilerOptions.baseUrl == null) {
    data.compilerOptions.baseUrl = ".";
  }
  const next = `${JSON.stringify(data, null, 2)}\n`;
  writeText(tsconfigFile, next, dryRun);
  log.push({ step: "tsconfig", status: dryRun ? "dry-run" : "patched", file: tsconfigFile });
  return { patched: true };
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
  // Prefer shallowest / non-example
  hits.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length);
  const preferred = hits.find((p) => !/[\\/]examples?[\\/]/.test(p)) || hits[0];
  return preferred || null;
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

function checkMode(gitRoot, subPath, viteFile, tsconfigFile) {
  const issues = [];
  const state = submodulePresent(gitRoot, subPath);
  if (!state.initialized) issues.push("submodule not initialized (missing src/index.ts)");
  if (viteFile) {
    const t = readText(viteFile);
    if (!hasFynnsAlias(t)) issues.push(`vite missing @fynns/ui alias: ${viteFile}`);
    if (!hasDedupe(t)) issues.push(`vite missing react dedupe: ${viteFile}`);
  } else {
    issues.push("no vite.config.* found to validate");
  }
  if (tsconfigFile) {
    const t = readText(tsconfigFile);
    if (!hasFynnsAlias(t)) issues.push(`tsconfig missing @fynns/ui paths: ${tsconfigFile}`);
  }
  const forbidden = packageJsonHasForbiddenDep(gitRoot);
  if (forbidden.length) {
    issues.push(
      `forbidden npm dependency on design system: ${forbidden
        .map((h) => `${h.file}:${h.name}`)
        .join(", ")}`,
    );
  }
  return { ok: issues.length === 0, issues, state };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(usage());
    process.exit(0);
  }

  const targetAbs = path.resolve(opts.target);
  if (!fs.existsSync(targetAbs)) throw new Error(`Target does not exist: ${targetAbs}`);

  const gitRoot = findGitRoot(targetAbs);
  const subPath = opts.submodulePath.replace(/\\/g, "/");
  const log = [];
  const result = {
    ok: false,
    mode: opts.check ? "check" : opts.wireOnly ? "wire-only" : "install",
    gitRoot,
    submodulePath: subPath,
    url: opts.url,
    dryRun: opts.dryRun,
    coreScriptRoot: CORE_ROOT,
    steps: log,
    viteFile: null,
    tsconfigFile: null,
    forbiddenDeps: [],
    manualSnippets: [],
    nextSteps: [],
  };

  const viteFile = opts.skipWire && !opts.check ? null : pickVite(opts, gitRoot);
  const tsconfigFile =
    opts.skipWire && !opts.check ? null : pickTsconfig(opts, gitRoot, viteFile);
  result.viteFile = viteFile;
  result.tsconfigFile = tsconfigFile;

  if (opts.check) {
    const c = checkMode(gitRoot, subPath, viteFile, tsconfigFile);
    result.ok = c.ok;
    result.issues = c.issues;
    result.forbiddenDeps = packageJsonHasForbiddenDep(gitRoot);
    emit(result, opts.json);
    process.exit(c.ok ? 0 : 1);
  }

  if (!opts.wireOnly) {
    ensureSubmodule({
      gitRoot,
      subPath,
      url: opts.url,
      branch: opts.branch,
      dryRun: opts.dryRun,
      log,
    });
  }

  const entryAbs = path.join(gitRoot, subPath, "src", "index.ts");
  if (!opts.dryRun && !opts.wireOnly && !fs.existsSync(entryAbs)) {
    throw new Error(`Submodule entry missing after install: ${entryAbs}`);
  }

  if (!opts.skipWire) {
    if (viteFile) {
      const entryRel = relImport(viteFile, entryAbs);
      const w = wireVite(viteFile, entryRel, opts.dryRun, log);
      if (w.snippet) result.manualSnippets.push({ file: viteFile, snippet: w.snippet });
    } else {
      log.push({ step: "vite_alias", status: "skip", detail: "no vite.config.* found" });
      result.nextSteps.push(
        `Create vite.config and alias @fynns/ui → ${toPosix(path.join(subPath, "src/index.ts"))}`,
      );
    }
    if (tsconfigFile) {
      const entryRel = toPosix(path.relative(path.dirname(tsconfigFile), entryAbs));
      const normalized = entryRel.startsWith(".") ? entryRel : `./${entryRel}`;
      wireTsconfig(tsconfigFile, normalized, opts.dryRun, log);
    } else {
      log.push({ step: "tsconfig", status: "skip", detail: "no tsconfig found" });
    }
  }

  result.forbiddenDeps = packageJsonHasForbiddenDep(gitRoot);
  if (result.forbiddenDeps.length) {
    result.nextSteps.push(
      "Remove @fynns/ui / @fynns/ui-design-core from package.json — consume via submodule alias only.",
    );
  }

  result.nextSteps.push(
    `Import: import { Button, Collapsible } from "@fynns/ui";`,
    `Do not npm-install the design system. See llm/CONSUME.md in the core repo.`,
  );
  result.ok = true;
  emit(result, opts.json);
  process.exit(0);
}

function emit(result, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  const lines = [];
  lines.push(`fynns_ui_design_core consume — ${result.mode}${result.dryRun ? " (dry-run)" : ""}`);
  lines.push(`gitRoot: ${result.gitRoot}`);
  lines.push(`submodule: ${result.submodulePath}`);
  if (result.viteFile) lines.push(`vite: ${result.viteFile}`);
  if (result.tsconfigFile) lines.push(`tsconfig: ${result.tsconfigFile}`);
  for (const s of result.steps) {
    lines.push(`- [${s.status}] ${s.step}${s.detail ? `: ${s.detail}` : ""}${s.file ? ` (${s.file})` : ""}`);
    if (s.snippet) lines.push(s.snippet);
  }
  if (result.issues?.length) {
    lines.push("issues:");
    for (const i of result.issues) lines.push(`  - ${i}`);
  }
  if (result.forbiddenDeps?.length) {
    lines.push("forbidden npm deps:");
    for (const h of result.forbiddenDeps) {
      lines.push(`  - ${h.file} ${h.field}.${h.name}=${h.value}`);
    }
  }
  for (const m of result.manualSnippets || []) {
    lines.push(`manual patch for ${m.file}:`);
    lines.push(m.snippet);
  }
  if (result.nextSteps?.length) {
    lines.push("next:");
    for (const n of result.nextSteps) lines.push(`  - ${n}`);
  }
  lines.push(result.ok ? "OK" : "FAILED");
  process.stdout.write(`${lines.join("\n")}\n`);
}

try {
  main();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}
