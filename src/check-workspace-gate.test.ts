import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkUiExports } from "../scripts/check-ui-exports.mjs";

it("existing consumer export gate fails on invalid workspace JSX, including namespace-only imports", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-workspace-gate-"));
  try {
    const src = path.join(fixture, "src");
    const barrel = path.join(fixture, "node_modules", "@fynn7", "ui-design-core", "src");
    fs.mkdirSync(src);
    fs.mkdirSync(barrel, { recursive: true });
    fs.writeFileSync(path.join(barrel, "index.ts"), "export const Button = 1; export const IconButton = 1; export const HomeIcon = 1;");
    fs.writeFileSync(path.join(src, "App.tsx"), 'import { Button } from "@fynns/ui"; export const App = <Button>Cancel</Button>;');
    const badCancel = checkUiExports(fixture);
    expect(badCancel.ok).toBe(false);
    expect(badCancel.missing).toEqual([]);
    expect(badCancel.workspaceViolations[0].rule).toBe("cancel-ghost");
    fs.writeFileSync(path.join(src, "App.tsx"), 'import * as UI from "@fynns/ui"; export const App = <UI.IconButton variant="primary"><UI.HomeIcon/></UI.IconButton>;');
    expect(checkUiExports(fixture).workspaceViolations[0].rule).toBe("chrome-icon");
    fs.writeFileSync(path.join(src, "App.tsx"), 'import { IconButton, HomeIcon } from "@fynns/ui"; export const App = <IconButton variant="ghost" aria-label="Home"><HomeIcon/></IconButton>;');
    expect(checkUiExports(fixture).ok).toBe(true);
  } finally {
    const resolved = path.resolve(fixture);
    if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith("fynns-workspace-gate-")) {
      fs.rmSync(resolved, { recursive: true, force: true });
    }
  }
});
