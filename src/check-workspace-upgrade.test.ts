import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource, fixWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

const imports = 'import { InlineAlert, Button, Collapsible } from "@fynns/ui";';

describe("workspace upgrade regressions", () => {
  it("checks every explicit consumer, fails the batch and never writes or syncs", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-preflight-"));
    try {
      const targets = ["invalid", "valid"].map(name => path.join(root, name));
      for (const target of targets) {
        const barrel = path.join(target, "node_modules/@fynn7/ui-design-core/src");
        fs.mkdirSync(barrel, { recursive: true });
        fs.mkdirSync(path.join(target, "src"));
        fs.writeFileSync(path.join(target, "package.json"), '{"name":"fixture"}');
        fs.writeFileSync(path.join(barrel, "index.ts"), 'export const InlineAlert = 1;');
        fs.writeFileSync(path.join(target, "src/App.tsx"), 'import { InlineAlert } from "@fynns/ui"; const sample = <InlineAlert>Unavailable</InlineAlert>;');
      }
      const invalid = path.join(targets[0], "src/App.tsx");
      const source = 'import { InlineAlert } from "@fynns/ui"; const sample = <InlineAlert><div>Unavailable</div></InlineAlert>;';
      fs.writeFileSync(invalid, source);
      const run = (...args: string[]) => spawnSync(process.execPath, [path.resolve("scripts/check-consumers.mjs"), ...args], { encoding: "utf8" });
      expect(run().status).toBe(1);
      const result = run("--target", targets[0], "--target", targets[1]);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`consumer FAIL: ${targets[0]}`);
      expect(result.stdout).toContain(`consumer PASS: ${targets[1]}`);
      expect(result.stderr).toContain("[inline-dismiss]");
      expect(fs.readFileSync(invalid, "utf8")).toBe(source);
      fs.writeFileSync(invalid, fixWorkspaceSource(source).source);
      expect(run("--target", targets[0], "--target", targets[1]).status).toBe(0);
    } finally {
      if (path.dirname(root) === os.tmpdir() && path.basename(root).startsWith("fynns-preflight-")) fs.rmSync(root, { recursive: true, force: true });
    }
  });
  it("preserves conventional metric and hardware labels without allowing uppercase decoration", () => {
    const source = '<><StatCard label="TTFT"/><StatCard label="GPU / VRAM"/><StatCard label="CPU / RAM"/><h2>SETTINGS</h2><Panel title="GPU SETTINGS"/><Panel label="CSS/JS"/></>';
    const errors = checkWorkspaceSource(`const sample = ${source};`);
    expect(errors.map((error: { rule: string }) => error.rule)).toEqual(["natural-case", "natural-case", "natural-case"]);
  });

  it("finishes a text-only wrapper migration after recovery has already moved outside", () => {
    const source = imports + 'const sample = <div className="fynns-unit-stack"><InlineAlert severity="error"><div className="fynns-unit-stack"><div>{userFacingError(error, t)}</div></div></InlineAlert><div className="fynns-control-cluster"><Button disabled={locked} onClick={retry}>Retry</Button></div></div>;';
    const result = fixWorkspaceSource(source);
    expect(result.rules).toEqual(["inline-dismiss"]);
    expect(result.source).toContain('<InlineAlert severity="error">{userFacingError(error, t)}</InlineAlert>');
    expect(result.source).toContain('<Button disabled={locked} onClick={retry}>Retry</Button>');
    expect(checkWorkspaceSource(result.source)).toEqual([]);
    expect(fixWorkspaceSource(result.source)).toEqual({ source: result.source, rules: [] });
  });

  it("does not claim a successful migration when details, styled wrappers or indirect controls remain", () => {
    for (const content of [
      '<Collapsible title="Details">Details</Collapsible>',
      '<div role="status">Unavailable</div>',
      '<div className="custom">Unavailable</div>',
      '<div><div>First paragraph</div><div>Second paragraph</div></div>',
      '{details()}',
    ]) {
      const source = imports + `function details() { return <Collapsible title="Details">Details</Collapsible>; } const sample = <InlineAlert>${content}<Button onClick={retry}>Retry</Button></InlineAlert>;`;
      expect(fixWorkspaceSource(source)).toEqual({ source, rules: [] });
      expect(checkWorkspaceSource(source).map((error: { rule: string }) => error.rule)).toContain("inline-dismiss");
    }
  });
});
