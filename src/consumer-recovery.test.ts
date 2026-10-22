import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const ensure = path.resolve("scripts/ensure-sibling-ui-core.mjs");
const gate = path.resolve("scripts/check-ui-exports.mjs");
const recovery = path.resolve("scripts/consumer-recovery.mjs");
const require = createRequire(import.meta.url);
const npmCli = process.env.npm_execpath ?? require.resolve("npm/bin/npm-cli.js");
const roots: string[] = [];

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-auto-recovery-"));
  roots.push(root);
  const repo = path.join(root, "consumer");
  const app = path.join(repo, "gui");
  const core = path.join(root, "fynns_ui_design_core");
  const tool = path.join(root, "tool");
  const support = path.join(root, "support");
  fs.mkdirSync(path.join(repo, ".git"), { recursive: true });
  for (const dir of [app, tool, support, path.join(core, "src"), path.join(app, "scripts")]) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(core, "package.json"), '{"name":"@fynn7/ui-design-core","version":"1.0.0","type":"module"}');
  fs.writeFileSync(path.join(core, "src/index.ts"), 'export const Button=1; export const InlineAlert=1;');
  fs.writeFileSync(path.join(support, "package.json"), '{"name":"support","version":"1.0.0","main":"index.js"}');
  fs.writeFileSync(path.join(support, "index.js"), 'module.exports="ready";');
  fs.writeFileSync(path.join(tool, "package.json"), JSON.stringify({ name: "runner", version: "1.0.0", main: "index.js", bin: "cli.js", dependencies: { support: `file:${support}` } }));
  fs.writeFileSync(path.join(tool, "index.js"), 'module.exports=require("support");');
  fs.writeFileSync(path.join(tool, "cli.js"), '#!/usr/bin/env node\nconsole.log(require("./index.js"));');
  const ensureCommand = `node "${ensure}" --target . --update --json`;
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({
    name: "recovery-fixture", version: "1.0.0", private: true,
    dependencies: { "@fynn7/ui-design-core": "file:../../fynns_ui_design_core" }, devDependencies: { runner: `file:${tool}` },
    scripts: { predev: ensureCommand, dev: 'node node_modules/runner/cli.js',
      postinstall: `node scripts/count.cjs && ${ensureCommand} && node "${gate}" --target .` },
  }));
  fs.writeFileSync(path.join(app, "scripts/count.cjs"), 'const fs=require("node:fs");let n=0;try{n=Number(fs.readFileSync("installs","utf8"))}catch{}fs.writeFileSync("installs",String(n+1));');
  fs.writeFileSync(path.join(app, "vite.config.ts"), 'export default { server: { headers: { "Cache-Control": "no-store" } } };');
  const env = { ...process.env, FYNNS_UI_SKIP_SIBLING_SYNC: "1", npm_config_offline: "true", npm_config_install_links: "true",
    npm_config_cache: path.join(root, "cache"), npm_execpath: npmCli };
  delete env.FYNNS_UI_REPAIRING_DEPS;
  return { root, repo, app, core, tool, env };
}
function run(app: string, env: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync(process.execPath, [npmCli, ...args], { cwd: app, env, encoding: "utf8", timeout: 45000, maxBuffer: 8 * 1024 * 1024 });
}
function ensureAsync(app: string, env: NodeJS.ProcessEnv) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [ensure, "--target", app, "--update", "--json"], { env, windowsHide: true });
    let stdout = "", stderr = "";
    child.stdout.on("data", data => { stdout += data; });
    child.stderr.on("data", data => { stderr += data; });
    child.on("error", reject);
    child.on("exit", status => resolve({ status, stdout, stderr }));
  });
}
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

describe("automatic startup recovery through the real npm lifecycle", () => {
  it("npm run dev recovers an entirely absent nested node_modules, reenters postinstall once and is idempotent", () => {
    const { app, env } = fixture();
    const first = run(app, env, "run", "dev");
    expect(first.status, first.stdout + first.stderr).toBe(0);
    expect(first.stdout).toContain("ready");
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
    const second = run(app, env, "run", "dev");
    expect(second.status, second.stdout + second.stderr).toBe(0);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
  }, 45000);

  it("restores a deleted CLI artifact automatically, retaining the damaged install and the source package", () => {
    const { app, repo, tool, env } = fixture();
    expect(run(app, env, "run", "dev").status).toBe(0);
    const dir = path.join(app, "node_modules/runner");
    expect(fs.lstatSync(dir).isSymbolicLink()).toBe(false);
    fs.writeFileSync(path.join(dir, "retain.txt"), "damaged package retained");
    fs.unlinkSync(path.join(dir, "cli.js"));
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.existsSync(path.join(dir, "cli.js"))).toBe(true);
    expect(fs.existsSync(path.join(tool, "cli.js"))).toBe(true);
    const backups = fs.readdirSync(path.join(repo, ".fynns-ui-recovery")).filter(name => name !== ".gitignore");
    expect(backups).toHaveLength(1);
    expect(fs.readFileSync(path.join(repo, ".fynns-ui-recovery", backups[0], "retain.txt"), "utf8")).toBe("damaged package retained");
  }, 45000);

  it("detects and reinstalls missing transitive dependencies even when direct metadata and entry files exist", () => {
    const { app, env } = fixture();
    expect(run(app, env, "run", "dev").status).toBe(0);
    fs.rmSync(path.join(app, "node_modules/support"), { recursive: true });
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.existsSync(path.join(app, "node_modules/support/index.js"))).toBe(true);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("2");
  }, 45000);

  it("repairs corrupt UI package metadata without aborting before the installer can restore it", () => {
    const { app, env } = fixture();
    expect(run(app, env, "run", "dev").status).toBe(0);
    const installed = path.join(app, "node_modules/@fynn7/ui-design-core");
    expect(fs.lstatSync(installed).isSymbolicLink()).toBe(false);
    fs.writeFileSync(path.join(installed, "package.json"), "{");
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(installed, "package.json"), "utf8")).name).toBe("@fynn7/ui-design-core");
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("2");
  }, 45000);

  it("restores missing command shims instead of letting npm scripts fail after a healthy metadata check", () => {
    const { app, env } = fixture();
    expect(run(app, env, "run", "dev").status).toBe(0);
    const shim = path.join(app, "node_modules/.bin", process.platform === "win32" ? "runner.cmd" : "runner");
    fs.unlinkSync(shim);
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.existsSync(shim)).toBe(true);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("2");
  }, 45000);

  it("supports npm workspaces while making hoisted CLI packages available to app-local launchers", () => {
    const { app, repo, env } = fixture();
    // npm already invokes workspace lifecycle scripts. Count the root install
    // independently instead of dispatching the app's postinstall a second time.
    fs.writeFileSync(path.join(repo, "count.cjs"), 'const fs=require("node:fs");let n=0;try{n=Number(fs.readFileSync("installs","utf8"))}catch{}fs.writeFileSync("installs",String(n+1));');
    fs.writeFileSync(path.join(repo, "package.json"), '{"name":"workspace-fixture","version":"1.0.0","private":true,"workspaces":["gui"],"scripts":{"postinstall":"node count.cjs"}}');
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.lstatSync(path.join(app, "node_modules/runner")).isSymbolicLink()).toBe(true);
    expect(fs.existsSync(path.join(app, "node_modules/runner/cli.js"))).toBe(true);
    expect(fs.readFileSync(path.join(repo, "installs"), "utf8")).toBe("1");
    expect(run(app, env, "run", "dev").status).toBe(0);
    expect(fs.readFileSync(path.join(repo, "installs"), "utf8")).toBe("1");
  }, 45000);

  it("serializes simultaneous startup repair and rechecks after waiting, so only one npm install runs", async () => {
    const { app, env } = fixture();
    const results = await Promise.all([ensureAsync(app, env), ensureAsync(app, env)]);
    for (const result of results) expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
  }, 45000);

  it("recovers an abandoned process lock rather than permanently blocking every later startup", () => {
    const { app, repo, env } = fixture();
    const root = fs.realpathSync(repo);
    const hash = createHash("sha256").update(process.platform === "win32" ? root.toLowerCase() : root).digest("hex").slice(0, 24);
    const lock = path.join(os.tmpdir(), `fynns-ui-recovery-${hash}`);
    fs.mkdirSync(lock);
    fs.writeFileSync(path.join(lock, "owner.json"), JSON.stringify({ pid: 2147483647, root }));
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.existsSync(lock)).toBe(false);
  }, 45000);

  it("repairs standard dev-cache and supported legacy JSX before the nested install gate, preserving the handler", () => {
    const { app, env } = fixture();
    fs.writeFileSync(path.join(app, "vite.config.ts"), 'export default { server: { port: 5199 } };');
    fs.mkdirSync(path.join(app, "src"));
    fs.writeFileSync(path.join(app, "src/App.tsx"), 'import { Button, InlineAlert } from "@fynns/ui"; const sample=<InlineAlert><div>Unavailable<Button onClick={retry} disabled={busy}>Retry</Button></div></InlineAlert>;');
    const result = run(app, env, "run", "dev");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(fs.readFileSync(path.join(app, "vite.config.ts"), "utf8")).toContain('"Cache-Control": "no-store"');
    const source = fs.readFileSync(path.join(app, "src/App.tsx"), "utf8");
    expect(source).toContain('onClick={retry} disabled={busy}');
    expect(source).toContain('fynns-control-cluster');
  }, 45000);

  it.each(["install", "i"])("recognizes external npm %s through nested npm run hooks and never recursively starts another install", installCommand => {
    const { app, env } = fixture();
    const manifest = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"));
    manifest.scripts.postinstall = "node scripts/count.cjs && npm run post:nested";
    manifest.scripts["post:nested"] = "node scripts/corrupt-once.cjs && npm run ui:gate";
    manifest.scripts["ui:gate"] = `node "${ensure}" --target . --update --json && node "${gate}" --target .`;
    fs.writeFileSync(path.join(app, "package.json"), JSON.stringify(manifest));
    fs.writeFileSync(path.join(app, "scripts/corrupt-once.cjs"), 'const fs=require("node:fs");if(!fs.existsSync("corrupted-once")){fs.rmSync("node_modules/runner",{recursive:true,force:true});fs.writeFileSync("corrupted-once","1");}');
    const install = run(app, env, installCommand, "--include=dev", "--no-audit", "--no-fund");
    expect(install.status).not.toBe(0);
    expect(install.stdout + install.stderr).toContain("npm-install-in-progress");
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
    const recovered = run(app, env, "run", "dev");
    expect(recovered.status, recovered.stdout + recovered.stderr).toBe(0);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("2");
  }, 45000);

  it("keeps genuine unsupported source errors strict and stops after one failed repair", () => {
    const { app, env } = fixture();
    fs.mkdirSync(path.join(app, "src"));
    const source = 'import { InlineAlert } from "@fynns/ui";const sample=<InlineAlert><UnknownDetails/></InlineAlert>;';
    fs.writeFileSync(path.join(app, "src/App.tsx"), source);
    const result = run(app, env, "run", "dev");
    expect(result.status).not.toBe(0);
    expect(result.stdout + result.stderr).toContain("inline-dismiss");
    expect(fs.readFileSync(path.join(app, "src/App.tsx"), "utf8")).toBe(source);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
    const strict = spawnSync(process.execPath, [gate, "--target", app, "--json"], { env, encoding: "utf8" });
    expect(strict.status).toBe(1);
    expect(JSON.parse(strict.stdout).issues.map((issue: {code: string}) => issue.code)).toContain("workspace-contract");
  }, 45000);

  it("prepares before a custom sync gate without rejecting symbols that its upcoming core update will supply", () => {
    const { app, core, env } = fixture();
    expect(run(app, env, "run", "dev").status).toBe(0);
    fs.mkdirSync(path.join(app, "src"));
    fs.writeFileSync(path.join(app, "src/App.tsx"), 'import { FutureComponent } from "@fynns/ui";');
    const ready = spawnSync(process.execPath, [recovery, "--target", app, "--before-gate", "--json"], { env, encoding: "utf8" });
    expect(ready.status, ready.stdout + ready.stderr).toBe(0);
    expect(JSON.parse(ready.stdout).prepared).toBe(true);
    expect(spawnSync(process.execPath, [gate, "--target", app, "--json"], { env }).status).toBe(1);
    // The existing consumer gate performs its update, then runs core ensure.
    // npm install-links left a physical UI copy; it must follow the new source.
    fs.writeFileSync(path.join(core, "src/index.ts"), 'export const FutureComponent=1;');
    const updated = spawnSync(process.execPath, [ensure, "--target", app, "--update", "--json"], { env, encoding: "utf8" });
    expect(updated.status, updated.stdout + updated.stderr).toBe(0);
    expect(fs.realpathSync(path.join(app, "node_modules/@fynn7/ui-design-core"))).toBe(fs.realpathSync(core));
    expect(spawnSync(process.execPath, [gate, "--target", app, "--json"], { env }).status).toBe(0);
    expect(fs.readFileSync(path.join(app, "installs"), "utf8")).toBe("1");
  }, 45000);
});
