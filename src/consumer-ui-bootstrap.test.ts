import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";
import { ensureConsumerLink } from "../scripts/ensure-sibling-ui-core.mjs";

const roots: string[] = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ui-link-recovery-"));
  roots.push(root);
  const core = path.join(root, "fynns_ui_design_core");
  const app = path.join(root, "consumer", "gui");
  fs.mkdirSync(path.join(core, "src"), { recursive: true });
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(path.join(core, "src", "index.ts"), "export const Button = 1;");
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({
    dependencies: { "@fynn7/ui-design-core": "file:../../fynns_ui_design_core" },
  }));
  return { root, core, app, link: path.join(app, "node_modules", "@fynn7", "ui-design-core") };
}
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

it("recovers a deleted nested app link repeatedly without changing manifests or the core", () => {
  const { app, core, link } = fixture();
  const manifest = fs.readFileSync(path.join(app, "package.json"), "utf8");
  ensureConsumerLink(app, core);
  expect(fs.realpathSync(link)).toBe(fs.realpathSync(core));
  ensureConsumerLink(app, core);
  fs.unlinkSync(link);
  ensureConsumerLink(app, core);
  expect(fs.readFileSync(path.join(app, "package.json"), "utf8")).toBe(manifest);
  expect(fs.existsSync(path.join(link, "src", "index.ts"))).toBe(true);
});

it("repairs a dangling junction without deleting its target", () => {
  const { root, app, core, link } = fixture();
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(path.join(root, "missing"), link, process.platform === "win32" ? "junction" : "dir");
  ensureConsumerLink(app, core);
  expect(fs.realpathSync(link)).toBe(fs.realpathSync(core));
});

it("preserves incomplete physical installs and mismatched dependency declarations", () => {
  const { app, core, link } = fixture();
  fs.mkdirSync(link, { recursive: true });
  fs.writeFileSync(path.join(link, "owned.txt"), "keep");
  expect(() => ensureConsumerLink(app, core)).toThrow("Incomplete installed");
  expect(fs.readFileSync(path.join(link, "owned.txt"), "utf8")).toBe("keep");
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ dependencies: {
    "@fynn7/ui-design-core": "file:.",
  } }));
  expect(() => ensureConsumerLink(app, core)).toThrow("refusing to rewrite");
});

it("bootstraps from the declared sibling when node_modules is entirely absent", () => {
  const { app, core } = fixture();
  fs.mkdirSync(path.join(core, "scripts"));
  fs.writeFileSync(path.join(core, "scripts", "ensure-sibling-ui-core.mjs"),
    'import fs from "node:fs"; fs.writeFileSync("called.json", JSON.stringify(process.argv.slice(2)));');
  const result = spawnSync(process.execPath, [path.resolve("scripts/consumer-ui-bootstrap.mjs")], { cwd: app, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(fs.readFileSync(path.join(app, "called.json"), "utf8"))).toEqual(["--target", app, "--update"]);
});
