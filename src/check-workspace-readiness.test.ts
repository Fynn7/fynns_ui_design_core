import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

const prefix = 'import { Toolbar, Button, FieldBlock, Input } from "@fynns/ui";';
const rules = (jsx: string) => checkWorkspaceSource(prefix + `const sample = ${jsx};`).map((v: { rule: string }) => v.rule);

describe("consumer gate false positives", () => {
  it("counts only simultaneously reachable primary actions", () => {
    expect(rules('<Toolbar>{ready ? <Button>Save</Button> : <Button>Create</Button>}</Toolbar>')).toEqual([]);
    expect(rules('<Toolbar>{item.action === "install" && <Button>Install</Button>}{item.action === "configure" && <Button>Configure</Button>}</Toolbar>')).toEqual([]);
    expect(rules('<Toolbar>{item.action === "install" && <Button>Install</Button>}{item.action === "install" && <Button>Again</Button>}</Toolbar>')).toContain("action-emphasis");
    expect(rules('<Toolbar><Button>Always</Button>{ready ? <Button>Save</Button> : <Button>Create</Button>}</Toolbar>')).toContain("action-emphasis");
    expect(rules('<Toolbar>{ready && <Button>Save</Button>}{other && <Button>Create</Button>}</Toolbar>')).toContain("action-emphasis");
    expect(rules('<Toolbar>{item.action === "install" && <Button>Install</Button>}{other.action === "configure" && <Button>Configure</Button>}</Toolbar>')).toContain("action-emphasis");
    const independent = prefix + 'function First(item){return item.action === "install" && <Button>Install</Button>;}function Second(item){return item.action === "configure" && <Button>Configure</Button>;}const sample=<Toolbar><First/><Second/></Toolbar>;';
    expect(checkWorkspaceSource(independent).map((v: {rule: string}) => v.rule)).toContain("action-emphasis");
  });
  it("preserves source multiplicity when a helper is rendered twice", () => {
    const text = prefix + 'const action=<Button>Save</Button>;const sample=<Toolbar>{action}{action}</Toolbar>;';
    expect(checkWorkspaceSource(text).map((v: {rule: string}) => v.rule)).toContain("action-emphasis");
  });
  it("preserves uppercase machine keys only on labels linked to the actual input", () => {
    expect(rules('<FieldBlock label="SERVICE_TOKEN" htmlFor="service-token"><Input id="service-token"/></FieldBlock>')).toEqual([]);
    expect(rules('<FieldBlock label="SERVICE_TOKEN" htmlFor="service-token"><Input id="other"/></FieldBlock>')).toContain("natural-case");
    expect(rules('<FieldBlock label="SETTINGS" htmlFor="settings"><Input id="settings"/></FieldBlock>')).toContain("natural-case");
    expect(rules('<h2>SERVICE_TOKEN</h2>')).toContain("natural-case");
  });
});
