import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const coreRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installer = path.join(coreRoot, "scripts", "install-as-npm.mjs");
const tmpDirs: string[] = [];

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-ui-monorepo-"));
  tmpDirs.push(root);
  const init = spawnSync("git", ["init", "--quiet", root], { encoding: "utf8" });
  expect(init.status).toBe(0);
  return root;
}

function run(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [installer, "--target", root, ...args], {
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("install-as-npm monorepo target", () => {
  it("migrates only the Vite cache header when requested", () => {
    const root = fixture();
    const app = path.join(root, "gui");
    fs.mkdirSync(app);
    const rootPackage = '{"name":"root","scripts":{"dev":"npm --prefix gui run dev"}}';
    const appPackage = '{"name":"gui","dependencies":{"@fynn7/ui-design-core":"file:../../fynns_ui_design_core"}}';
    fs.writeFileSync(path.join(root, "package.json"), rootPackage);
    fs.writeFileSync(path.join(app, "package.json"), appPackage);
    fs.writeFileSync(path.join(app, "vite.config.ts"), "export default defineConfig({ server: { port: 5173 } });\n");

    const result = run(root, "--dev-cache-only", "--json");
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).consumerRoot).toBe(app);
    expect(fs.readFileSync(path.join(app, "vite.config.ts"), "utf8")).toContain('"Cache-Control": "no-store"');
    expect(fs.readFileSync(path.join(root, "package.json"), "utf8")).toBe(rootPackage);
    expect(fs.readFileSync(path.join(app, "package.json"), "utf8")).toBe(appPackage);
    expect(fs.existsSync(path.join(root, "AGENTS.md"))).toBe(false);
    expect(fs.existsSync(path.join(root, ".cursor"))).toBe(false);
  });

  it("moves installer hooks from a parent to the Vite package and preserves app wrappers", () => {
    const root = fixture();
    const app = path.join(root, "gui");
    fs.mkdirSync(app);
    const parent = {
      name: "root",
      scripts: {
        dev: "npm run ensure:ui && npm run gui",
        "fynns-ui:sync": "node node_modules/@fynn7/ui-design-core/scripts/ensure-sibling-ui-core.mjs --target . --update",
        "fynns-ui:check-exports": "node node_modules/@fynn7/ui-design-core/scripts/check-ui-exports.mjs --target .",
        "fynns-ui:gate": "npm run fynns-ui:sync && npm run fynns-ui:check-exports",
        "fynns-ui:check-update": "node node_modules/@fynn7/ui-design-core/scripts/check-ui-update.mjs || exit 0",
        predev: "npm run fynns-ui:gate && npm run fynns-ui:check-update",
        postinstall: "npm run fynns-ui:gate",
      },
    };
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(parent));
    const customGate = "node ../scripts/fynns-ui-gate.mjs";
    fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({
      name: "gui",
      dependencies: { "@fynn7/ui-design-core": "file:../../fynns_ui_design_core" },
      scripts: { "fynns-ui:gate": customGate, predev: "npm run fynns-ui:gate && npm run boot:splash" },
    }));
    fs.writeFileSync(path.join(app, "vite.config.ts"), `export default defineConfig({
  resolve: { alias: { "@fynns/ui": "node_modules/@fynn7/ui-design-core/src/index.ts" }, dedupe: ["react", "react-dom"] },
  server: { port: 5173 },
});\n`);
    const barrel = path.join(app, "node_modules", "@fynn7", "ui-design-core", "src");
    fs.mkdirSync(barrel, { recursive: true });
    fs.writeFileSync(path.join(barrel, "index.ts"), "export const Button = 1;\n");

    const checkedBefore = run(root, "--check", "--json");
    expect(checkedBefore.status).toBe(1);
    expect(JSON.parse(checkedBefore.stdout).issues.join(" ")).toContain("parent package");

    const installed = run(root, "--wire-only", "--json");
    expect(installed.status, installed.stderr).toBe(0);
    expect(JSON.parse(installed.stdout).consumerRoot).toBe(app);
    const parentAfter = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const appAfter = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"));
    expect(parentAfter.scripts).toEqual({ dev: parent.scripts.dev });
    expect(appAfter.scripts["fynns-ui:gate"]).toBe(customGate);
    expect(appAfter.scripts.predev).toContain("boot:splash");
    expect(fs.readFileSync(path.join(app, "vite.config.ts"), "utf8")).toContain('"Cache-Control": "no-store"');
    expect(run(root, "--check", "--json").status).toBe(0);

    // A colleague may follow the error hint and target gui directly. That
    // must also repair the old root predev hook that still blocks npm run dev.
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(parent));
    expect(run(app, "--check", "--json").status).toBe(1);
    expect(run(app, "--wire-only", "--json").status).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts)
      .toEqual({ dev: parent.scripts.dev });

    const customParent = { ...parentAfter, scripts: {
      ...parentAfter.scripts,
      "fynns-ui:gate": "npm run gui:gate",
      predev: "npm run fynns-ui:gate && echo root",
    } };
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(customParent));
    expect(run(root, "--wire-only", "--json").status).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))).toEqual(customParent);
  });

  it("refuses an ambiguous parent with multiple Vite app packages", () => {
    const root = fixture();
    fs.writeFileSync(path.join(root, "package.json"), '{"name":"root"}');
    for (const name of ["one", "two"]) {
      const app = path.join(root, name);
      fs.mkdirSync(app);
      fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ name }));
      fs.writeFileSync(path.join(app, "vite.config.ts"), "export default defineConfig({});\n");
    }
    const result = run(root, "--wire-only");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Multiple Vite app packages");
    expect(fs.readFileSync(path.join(root, "package.json"), "utf8")).toBe('{"name":"root"}');
  });
});
