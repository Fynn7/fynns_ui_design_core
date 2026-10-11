import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource, fixWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

const imports = 'import { Button, InlineAlert, Dialog, CloseIcon, RefreshIcon } from "@fynns/ui";\n';

describe("consumer workspace migrations", () => {
  it("keeps recovery callbacks, disabled state, copy and icons while separating alert content", () => {
    const source = imports + `const sample = <InlineAlert severity="error">
      <div className="fynns-unit-stack">
        <div>{userFacingError(loadError, t)}</div>
        <Button variant="tonal" size="sm" disabled={locked} onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
          <RefreshIcon aria-hidden />{t("load.retry")}
        </Button>
      </div>
    </InlineAlert>;`;
    const result = fixWorkspaceSource(source);
    expect(result.rules).toEqual(["inline-dismiss"]);
    expect(checkWorkspaceSource(result.source)).toEqual([]);
    for (const content of ['{userFacingError(loadError, t)}', 'disabled={locked}', 'onClick={() => setLoadAttempt((attempt) => attempt + 1)}', '<RefreshIcon aria-hidden />', '{t("load.retry")}', 'variant="tonal" size="sm"']) {
      expect(result.source).toContain(content);
    }
    expect(result.source.indexOf("</InlineAlert>")).toBeLessThan(result.source.indexOf('<Button variant="tonal"'));
    expect(result.source).toContain('className="fynns-control-cluster"');
    expect(fixWorkspaceSource(result.source)).toEqual({ source: result.source, rules: [] });
  });

  it("supports direct retries and aliases, and changes only the Cancel on a shared line", () => {
    const direct = imports + 'const sample = <InlineAlert severity="warning">{connectionError}<Button onClick={() => void task.retry().catch(report)}>{t("load.retry")}</Button></InlineAlert>;';
    expect(checkWorkspaceSource(fixWorkspaceSource(direct).source)).toEqual([]);
    const alias = 'import { Button as Action, InlineAlert as Notice } from "@fynns/ui"; const sample = <Notice>Unavailable<Action onClick={retry}>Retry</Action></Notice>;';
    expect(checkWorkspaceSource(fixWorkspaceSource(alias).source)).toEqual([]);
    const footer = imports + 'const sample = <Dialog feet={<div className="fynns-control-cluster"><Button variant="tonal" onClick={close}><CloseIcon/>{t("form.cancel")}</Button><Button variant="primary" onClick={save}>Save</Button></div>}/>;';
    const result = fixWorkspaceSource(footer);
    expect(result.source).toContain('variant="ghost" onClick={close}');
    expect(result.source).toContain('variant="primary" onClick={save}');
    expect(checkWorkspaceSource(result.source)).toEqual([]);
    expect(fixWorkspaceSource(result.source).rules).toEqual([]);
    const expressionVariant = imports + 'const sample = <Button variant={"tonal"}>Cancel</Button>;';
    expect(checkWorkspaceSource(fixWorkspaceSource(expressionVariant).source)).toEqual([]);
  });

  it("leaves dynamic variants, conditional recovery, message slots, spreads and local components for manual review", () => {
    for (const sample of [
      '<Button variant={cancelVariant}>Cancel</Button>',
      '<InlineAlert>Unavailable{canRetry && <Button onClick={retry}>Retry</Button>}</InlineAlert>',
      '<InlineAlert message={<Button onClick={retry}>Retry</Button>}/>',
      '<InlineAlert {...props}>Unavailable<Button onClick={retry}>Retry</Button></InlineAlert>',
      '<InlineAlert>Unavailable<Button onClick={dismiss}>Dismiss</Button></InlineAlert>',
    ]) {
      const source = imports + `const sample = ${sample};`;
      expect(fixWorkspaceSource(source)).toEqual({ source, rules: [] });
    }
    const local = 'const sample = <InlineAlert>Unavailable<Button>Retry</Button></InlineAlert>;';
    expect(fixWorkspaceSource(local)).toEqual({ source: local, rules: [] });
  });

  it("inspects rendered alert content without treating callback-only JSX as controls", () => {
    const source = imports + 'const sample = <InlineAlert message={<span onClick={() => { const detached = <Button>Save</Button>; }}>Unavailable</span>}/>;';
    expect(checkWorkspaceSource(source)).toEqual([]);
    expect(checkWorkspaceSource(imports + 'const content = <Button>Dismiss</Button>; const sample = <InlineAlert message={content}/>;').map((error: { rule: string }) => error.rule)).toContain("inline-dismiss");
    for (const sample of [
      'function content(){ const detached = <Button>Save</Button>; return "Unavailable"; } const sample = <InlineAlert message={content()}/>;',
      'const sample = <InlineAlert>{items.map(item => <span onClick={() => <Button>Save</Button>}>{item}</span>)}</InlineAlert>;',
    ]) expect(checkWorkspaceSource(imports + sample)).toEqual([]);
    for (const sample of [
      'function content(){ return <Button>Retry</Button>; } const sample = <InlineAlert message={content()}/>;',
      'const sample = <InlineAlert>{items.map(item => <Button>{item}</Button>)}</InlineAlert>;',
    ]) expect(checkWorkspaceSource(imports + sample).map((error: { rule: string }) => error.rule)).toContain("inline-dismiss");
  });

  it("keeps checks read-only, classifies mixed failures, fixes explicitly and still blocks missing exports", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-workspace-migration-"));
    try {
      const barrel = path.join(root, "node_modules", "@fynn7", "ui-design-core", "src");
      fs.mkdirSync(barrel, { recursive: true });
      fs.mkdirSync(path.join(root, "src"));
      fs.writeFileSync(path.join(root, "package.json"), '{"name":"fixture"}');
      fs.writeFileSync(path.join(barrel, "index.ts"), 'export const Button = 1;');
      const file = path.join(root, "src", "App.tsx");
      const source = 'import { Button, Missing } from "@fynns/ui"; const sample = <Button variant="tonal">Cancel</Button>;';
      fs.writeFileSync(file, source);
      const run = (...args: string[]) => spawnSync(process.execPath, [path.resolve("scripts/check-ui-exports.mjs"), "--target", root, "--json", ...args], { encoding: "utf8" });
      const before = run();
      expect(before.status).toBe(1);
      expect(fs.readFileSync(file, "utf8")).toBe(source);
      expect(JSON.parse(before.stdout).issues.map((issue: { code: string }) => issue.code)).toEqual(["workspace-contract", "missing-exports"]);
      const fixed = run("--fix");
      expect(fixed.status).toBe(1);
      expect(JSON.parse(fixed.stdout).issues.map((issue: { code: string }) => issue.code)).toEqual(["missing-exports"]);
      expect(JSON.parse(fixed.stdout).fixes).toHaveLength(1);
      fs.writeFileSync(path.join(barrel, "index.ts"), 'export const Button = 1; export const Missing = 1;');
      const repeated = run("--fix");
      expect(repeated.status).toBe(0);
      expect(JSON.parse(repeated.stdout).fixes).toEqual([]);
    } finally {
      if (path.dirname(root) === os.tmpdir() && path.basename(root).startsWith("fynns-workspace-migration-")) fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
