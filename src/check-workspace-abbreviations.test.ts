import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

const violations = (source: string) => checkWorkspaceSource(source)
  .filter((error: { rule: string }) => error.rule === "natural-case");

describe("workspace short abbreviations", () => {
  it("leaves short initialisms in JSX and literal props for copy review", () => {
    expect(violations('const label = "API"; const sample = <><Collapsible title="CSS"/><Panel label={label}/><h2>\n SVG \n</h2></>;')).toEqual([]);
  });

  it("still rejects longer and compound uppercase chrome", () => {
    expect(violations('const sample = <><h2>SETTINGS</h2><Panel title="API SETTINGS"/><Panel label="CSS/JS"/><span>SVG TOOLS</span></>;')).toHaveLength(4);
    expect(violations('const sample = <Panel title="API settings"/>;')).toEqual([]);
  });
});
