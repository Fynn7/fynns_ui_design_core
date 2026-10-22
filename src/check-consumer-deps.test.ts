import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { checkConsumerDependencies, repairConsumerDependencies } from "../scripts/check-consumer-deps.mjs";

const roots: string[] = [];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-deps-"));
  roots.push(root);
  const app = path.join(root, "gui");
  fs.mkdirSync(app);
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({
    name: "fixture", dependencies: { "@fynn7/ui-design-core": "file:../core" },
    devDependencies: { concurrently: "1.0.0" },
  }));
  const barrel = path.join(app, "node_modules/@fynn7/ui-design-core/src");
  fs.mkdirSync(barrel, { recursive: true });
  fs.writeFileSync(path.join(barrel, "index.ts"), "export const Button = 1;");
  return { root, app };
}
function install(root: string, bin = true) {
  const dir = path.join(root, "node_modules", "concurrently");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({
    name: "concurrently", version: "1.0.0", bin: { concurrently: "dist/bin/cli.js" }, exports: "./index.js",
  }));
  if (bin) {
    fs.mkdirSync(path.join(dir, "dist/bin"), { recursive: true });
    fs.writeFileSync(path.join(dir, "dist/bin/cli.js"), "");
  }
}
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

describe("consumer dependency readiness", () => {
  it("rejects a core-only node_modules tree before export success can hide absent dev tooling", () => {
    const { app } = fixture();
    const barrel = path.join(app, "node_modules/@fynn7/ui-design-core/src");
    fs.mkdirSync(barrel, { recursive: true });
    fs.writeFileSync(path.join(barrel, "index.ts"), "export const Button = 1;");
    const before = fs.readFileSync(path.join(app, "package.json"), "utf8");
    const report = checkConsumerDependencies(app);
    expect(report.ok).toBe(false);
    expect(report.failures).toEqual([{ name: "concurrently", reason: "package missing" }]);
    expect(report.issues[0].code).toBe("consumer-dependencies");
    expect(report.error).toContain(app);
    const gate = spawnSync(process.execPath, [path.resolve("scripts/check-ui-exports.mjs"), "--target", app, "--json"], { encoding: "utf8" });
    expect(gate.status).toBe(1);
    expect(JSON.parse(gate.stdout).issues.map((i: { code: string }) => i.code)).toContain("consumer-dependencies");
    expect(fs.readFileSync(path.join(app, "package.json"), "utf8")).toBe(before);
    expect(fs.existsSync(path.join(app, "node_modules/concurrently"))).toBe(false);
  });

  it("accepts a hoisted install with package.json hidden by exports", () => {
    const { app, root } = fixture();
    install(root);
    expect(checkConsumerDependencies(app).ok).toBe(true);
  });

  it("detects a missing core link so dependency repair can also recover a declared pinned source", () => {
    const { app } = fixture();
    install(app);
    fs.unlinkSync(path.join(app, "node_modules/@fynn7/ui-design-core/src/index.ts"));
    expect(checkConsumerDependencies(app).failures).toEqual([{ name: "@fynn7/ui-design-core", reason: "UI barrel missing" }]);
  });

  it("rejects missing CLI artifacts and does not fall back from a broken local install to a healthy parent", () => {
    const { app, root } = fixture();
    install(root);
    install(app, false);
    expect(checkConsumerDependencies(app).failures[0].reason).toContain("CLI entry missing");
    fs.unlinkSync(path.join(app, "node_modules/concurrently/package.json"));
    expect(checkConsumerDependencies(app).ok).toBe(false);
  });

  it("allows absent optional dependencies, but checks a declared main artifact", () => {
    const { app } = fixture();
    fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ dependencies: { optional: "1", broken: "1" }, optionalDependencies: { optional: "1" } }));
    const dir = path.join(app, "node_modules/broken");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), '{"main":"dist/index.js"}');
    expect(checkConsumerDependencies(app).failures).toEqual([{ name: "broken", reason: "main entry missing: dist/index.js", path: dir }]);
  });

  it("accepts declaration-only packages with an explicitly empty main", () => {
    const { app } = fixture();
    fs.writeFileSync(path.join(app, "package.json"), '{"devDependencies":{"@types/sample":"1"}}');
    const dir = path.join(app, "node_modules/@types/sample");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), '{"main":"","types":"index.d.ts"}');
    fs.writeFileSync(path.join(dir, "index.d.ts"), "export {};");
    expect(checkConsumerDependencies(app).ok).toBe(true);
  });

  it("repairs the app with dev dependencies and normal hooks, then verifies rather than trusting npm exit", () => {
    const { root, app } = fixture();
    const fakeNpm = path.join(root, "npm.cjs");
    const oldCli = process.env.npm_execpath;
    const oldCommand = process.env.npm_command;
    fs.writeFileSync(fakeNpm, `const fs=require('node:fs');fs.writeFileSync('npm-args.json', JSON.stringify(process.argv.slice(2)));fs.mkdirSync('node_modules/concurrently/dist/bin',{recursive:true});fs.writeFileSync('node_modules/concurrently/package.json',JSON.stringify({bin:'dist/bin/cli.js'}));fs.writeFileSync('node_modules/concurrently/dist/bin/cli.js','');`);
    try {
      process.env.npm_execpath = fakeNpm;
      process.env.npm_command = "run-script";
      const result = repairConsumerDependencies(app);
      expect(result.ok).toBe(true);
      expect(result.repaired).toBe(true);
      expect(JSON.parse(fs.readFileSync(path.join(app, "npm-args.json"), "utf8"))).toEqual(["install", "--include=dev", "--no-audit", "--no-fund"]);
      expect(repairConsumerDependencies(app).repaired).toBe(false);
      fs.writeFileSync(path.join(app, "package.json"), '{"dependencies":{"absent":"1"}}');
      expect(repairConsumerDependencies(app).ok).toBe(false);
      fs.writeFileSync(fakeNpm, "process.exit(1)");
      expect(repairConsumerDependencies(app).issues[0].code).toBe("consumer-install");
      process.env.npm_command = "install";
      expect(() => repairConsumerDependencies(app)).toThrow("cannot run inside install hooks");
    } finally {
      if (oldCli === undefined) delete process.env.npm_execpath; else process.env.npm_execpath = oldCli;
      if (oldCommand === undefined) delete process.env.npm_command; else process.env.npm_command = oldCommand;
    }
  });
});
