import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(repoRoot, "scripts", "check-ui-exports.mjs");
const tmpDirs: string[] = [];

function makeTmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-ui-exports-"));
  tmpDirs.push(dir);
  return dir;
}

function runCheck(pkgRoot: string) {
  const r = spawnSync(process.execPath, [script, "--target", pkgRoot, "--json"], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  const stdout = String(r.stdout || "").trim();
  let json: { ok?: boolean; missing?: string[]; error?: string } = {};
  try {
    json = JSON.parse(stdout);
  } catch {
    json = { ok: false, error: stdout || String(r.stderr || "") };
  }
  return { status: r.status ?? 1, json };
}

afterEach(() => {
  while (tmpDirs.length) {
    const dir = tmpDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("check-ui-exports.mjs", () => {
  it("fails when consumer imports a missing barrel symbol", () => {
    const pkg = makeTmp();
    const barrelDir = path.join(pkg, "node_modules", "@fynn7", "ui-design-core", "src");
    fs.mkdirSync(barrelDir, { recursive: true });
    fs.writeFileSync(
      path.join(barrelDir, "index.ts"),
      'export { PersonIcon } from "./icons";\n',
    );
    fs.writeFileSync(path.join(barrelDir, "icons.ts"), "export function PersonIcon() {}\n");
    fs.mkdirSync(path.join(pkg, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(pkg, "src", "App.tsx"),
      'import { MessageSquareIcon, PersonIcon } from "@fynns/ui";\n',
    );
    fs.writeFileSync(path.join(pkg, "package.json"), '{ "name": "fixture" }\n');

    const { status, json } = runCheck(pkg);
    expect(status).toBe(1);
    expect(json.ok).toBe(false);
    expect(json.missing).toEqual(["MessageSquareIcon"]);
  });

  it("passes when all imports exist including export type", () => {
    const pkg = makeTmp();
    const barrelDir = path.join(pkg, "node_modules", "@fynn7", "ui-design-core", "src");
    fs.mkdirSync(barrelDir, { recursive: true });
    fs.writeFileSync(
      path.join(barrelDir, "index.ts"),
      [
        'export { MessageSquareIcon, PersonIcon } from "./icons";',
        'export type { ButtonSize, BusyIndicator } from "./types";',
        "",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(barrelDir, "icons.ts"),
      "export function MessageSquareIcon() {}\nexport function PersonIcon() {}\n",
    );
    fs.writeFileSync(
      path.join(barrelDir, "types.ts"),
      "export type ButtonSize = 'sm';\nexport type BusyIndicator = 'ring';\n",
    );
    fs.mkdirSync(path.join(pkg, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(pkg, "src", "App.tsx"),
      'import { MessageSquareIcon, type ButtonSize, type BusyIndicator } from "@fynns/ui";\n',
    );
    fs.writeFileSync(path.join(pkg, "package.json"), '{ "name": "fixture" }\n');

    const { status, json } = runCheck(pkg);
    expect(status).toBe(0);
    expect(json.ok).toBe(true);
    expect(json.missing).toEqual([]);
  });
});
