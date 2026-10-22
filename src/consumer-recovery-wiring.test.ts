import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

it("wires recovery ahead of a custom gate while retaining its pinned UI and configs, then bootstraps without node_modules", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ui-recovery-wiring-"));
  roots.push(root);
  const repo = path.join(root, "consumer");
  const app = path.join(repo, "apps/web");
  const core = path.join(root, "fynns_ui_design_core");
  const pinned = path.join(repo, "vendor/ui-core");
  for (const dir of [app, pinned, path.join(core, "scripts")]) fs.mkdirSync(dir, { recursive: true });
  expect(spawnSync("git", ["init", "--quiet", repo]).status).toBe(0);
  const manifest = { name: "pinned-app", dependencies: { "@fynn7/ui-design-core": "file:../../vendor/ui-core" },
    scripts: { "fynns-ui:gate": "node ../../scripts/pinned-gate.mjs", predev: "npm run fynns-ui:gate && npm run boot:splash" } };
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify(manifest));
  const config = 'export default { resolve: { alias: { "@fynns/ui": "../../vendor/ui-core/src/index.ts" } } };';
  fs.writeFileSync(path.join(app, "vite.config.ts"), config);
  fs.writeFileSync(path.join(pinned, "keep.txt"), "pinned source");
  fs.writeFileSync(path.join(core, "scripts/consumer-recovery.mjs"), 'import fs from "node:fs";fs.writeFileSync("called.json",JSON.stringify(process.argv.slice(2)));');
  const installer = path.resolve("scripts/install-as-npm.mjs");
  const migrate = () => spawnSync(process.execPath, [installer, "--target", app, "--recovery-only", "--json"], { encoding: "utf8" });
  const first = migrate();
  expect(first.status, first.stdout + first.stderr).toBe(0);
  const updated = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"));
  expect(updated.dependencies).toEqual(manifest.dependencies);
  expect(updated.scripts["fynns-ui:gate"]).toBe(manifest.scripts["fynns-ui:gate"]);
  expect(updated.scripts.predev).toMatch(/^npm run fynns-ui:prepare && /);
  expect(updated.scripts.predev).toContain("boot:splash");
  expect(updated.scripts.postinstall).toMatch(/^npm run fynns-ui:prepare && /);
  expect(fs.readFileSync(path.join(app, "vite.config.ts"), "utf8")).toBe(config);
  expect(fs.existsSync(path.join(repo, "AGENTS.md"))).toBe(false);
  expect(fs.existsSync(path.join(repo, ".cursor"))).toBe(false);
  expect(migrate().status).toBe(0);
  expect(JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"))).toEqual(updated);
  const boot = spawnSync(process.execPath, [path.join(app, "scripts/fynns-ui-bootstrap.mjs"), "--prepare"], { cwd: app, encoding: "utf8" });
  expect(boot.status, boot.stderr).toBe(0);
  expect(JSON.parse(fs.readFileSync(path.join(app, "called.json"), "utf8"))).toEqual(["--target", app, "--before-gate"]);
  expect(fs.readFileSync(path.join(pinned, "keep.txt"), "utf8")).toBe("pinned source");
});

it("fails clearly when a pinned snapshot and the workspace both lack recovery tooling", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ui-recovery-missing-"));
  roots.push(root);
  const app = path.join(root, "app");
  fs.mkdirSync(app);
  fs.mkdirSync(path.join(root, "snapshot"));
  fs.writeFileSync(path.join(app, "package.json"), '{"dependencies":{"@fynn7/ui-design-core":"file:../snapshot"}}');
  const result = spawnSync(process.execPath, [path.resolve("scripts/consumer-ui-bootstrap.mjs"), "--prepare"], { cwd: app, encoding: "utf8" });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("bootstrap helper missing");
  expect(fs.existsSync(path.join(app, "node_modules"))).toBe(false);
});
