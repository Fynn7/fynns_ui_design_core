import { describe, expect, it } from "vitest";
// @ts-expect-error Node CLI module has no declaration file.
import { checkWorkspaceSource } from "../scripts/check-workspace-ui.mjs";

describe("inline feedback composition boundary", () => {
  it("rejects disclosure and lists passed as message or children, including aliases", () => {
    const imports = 'import { InlineAlert as Notice, Collapsible as Disclosure, List } from "@fynns/ui";';
    for (const sample of [
      '<Notice message={<Disclosure>Details</Disclosure>} />',
      '<Notice><List /></Notice>',
      '<Notice children={<Disclosure>Details</Disclosure>} />',
      'const body = <Disclosure>Details</Disclosure>; const sample = <Notice message={body} />',
      '<Notice message={<a href="/details">Details</a>} />',
    ]) {
      expect(checkWorkspaceSource(imports + sample).some((error: { rule: string }) => error.rule === "inline-dismiss")).toBe(true);
    }
  });
  it("allows phrasing emphasis and dedicated section notice actions", () => {
    expect(checkWorkspaceSource('import { InlineAlert, SectionNotice } from "@fynns/ui"; const a = <InlineAlert message={<span>Use <strong>cached</strong> content.</span>} />; const b = <SectionNotice severity="warning" message="Cached content" actions={[{label:"Refresh",onClick:refresh}]} />;')).toEqual([]);
  });
});
