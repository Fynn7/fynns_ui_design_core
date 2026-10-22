import { useMemo, useState } from "react";
import {
  Button, DiffView, DiffDialog, DropdownMenu, DropdownMenuItem, FieldBlock, snackbar,
  type DiffFile, type DiffSource,
} from "@fynns/ui";

const before = Array.from({ length: 90 }, (_, i) => i === 7 ? "/* Review settings" : i === 16 ? " */" : i > 7 && i < 16 ? ` * Setting ${i}: unchanged` : `export const setting${i} = "original";`).join("\n") + "\n";
const after = before.replace("Setting 12: unchanged", "Setting 12: clearer description").replace('setting65 = "original"', 'setting65 = "updated"');
const patch = 'diff --git a/docs/notes.md b/docs/notes.md\n--- a/docs/notes.md\n+++ b/docs/notes.md\n@@ -1,3 +1,4 @@\n # Notes\n \n-Old introduction.\n+Clearer introduction.\n+One more example.\n';
const files: DiffFile[] = [
  { id: "settings", path: "src/settings.ts", source: { kind: "text", before, after } },
  { id: "notes", path: "docs/notes.md", source: { kind: "patch", patch } },
  { id: "rename", path: "docs/guide.md", previousPath: "docs/manual.md", source: { kind: "patch", patch: "diff --git a/docs/manual.md b/docs/guide.md\nsimilarity index 100%\nrename from docs/manual.md\nrename to docs/guide.md\n" } },
];
const scenarios = ["Text", "Patch", "Long text", "Many lines", "No changes", "Invalid patch", "Limit", "Binary", "Renamed"] as const;
type Scenario = typeof scenarios[number];

export function DiffViewDemo() {
  const [scenario, setScenario] = useState<Scenario>("Text");
  const source = useMemo<DiffSource>(() => {
    if (scenario === "Patch") return { kind: "patch", patch };
    if (scenario === "Long text") return { kind: "text", before: `# Description\n\n${"A long paragraph with readable content and ordinary words. ".repeat(18)}Old ending.\n`, after: `# Description\n\n${"A long paragraph with readable content and ordinary words. ".repeat(18)}New ending.\n` };
    if (scenario === "Many lines") return { kind: "text", before: "", after: Array.from({ length: 1200 }, (_, i) => `Added line ${i + 1}`).join("\n") + "\n" };
    if (scenario === "No changes") return { kind: "text", before, after: before };
    if (scenario === "Invalid patch") return { kind: "patch", patch: "--- a/broken.txt\n+++ b/broken.txt\n@@ -1 +1 @@\n-old\n" };
    if (scenario === "Limit") return { kind: "text", before: "", after: "x".repeat(1_048_577) };
    if (scenario === "Binary") return { kind: "patch", patch: "diff --git a/image.png b/image.png\nBinary files a/image.png and b/image.png differ\n" };
    if (scenario === "Renamed") return files[2].source;
    return { kind: "text", before, after };
  }, [scenario]);
  return <div className="fynns-unit-stack" id="sandbox-modern-diff">
    <DropdownMenu trigger={`Scenario: ${scenario}`} ariaLabel="Diff scenario" size="sm" variant="ghost">
      {scenarios.map(name => <DropdownMenuItem key={name} onClick={() => setScenario(name)}>{name}</DropdownMenuItem>)}
    </DropdownMenu>
    <DiffView source={source} path={scenario === "Patch" || scenario === "Long text" ? "docs/notes.md" : scenario === "Binary" ? "image.png" : scenario === "Renamed" ? "docs/guide.md" : "src/settings.ts"} previousPath={scenario === "Renamed" ? "docs/manual.md" : undefined} maxHeight={320} />
  </div>;
}

export function DiffDialogDemo() {
  const [mode, setMode] = useState<"files" | "patch" | "single" | "save" | "empty" | "mixed" | "longpath" | null>(null);
  const mixed: DiffFile[] = [{ id: "broken", path: "broken.txt", source: { kind: "patch", patch: "not a patch" } }, ...files];
  const longpath: DiffFile[] = [{ ...files[0], id: "longpath", path: "src/" + "nested-directory/".repeat(15) + "settings.ts" }, files[1]];
  return <div className="fynns-unit-stack" id="sandbox-diff-dialog">
    <FieldBlock label="Review changes" description="A stable reading window with a shared scroll region and independent file disclosures.">
      <div className="fynns-control-cluster">
        <Button size="sm" variant="ghost" onClick={() => setMode("files")}>Review files</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("patch")}>Review patch</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("single")}>Review one file</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("save")}>Review before saving</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("empty")}>Empty review</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("mixed")}>Mixed validity</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("longpath")}>Long paths</Button>
      </div>
    </FieldBlock>
    <DiffDialog open={mode != null && mode !== "patch"} onOpenChange={open => { if (!open) setMode(null); }} title="Review changes" description="Inspect the changes before continuing."
      files={mode === "empty" ? [] : mode === "single" ? files.slice(0, 1) : mode === "mixed" ? mixed : mode === "longpath" ? longpath : files}
      feet={mode === "save" ? <div className="fynns-control-cluster fynns-control-cluster--end-align"><Button size="sm" variant="ghost" onClick={() => setMode(null)}>Cancel</Button><Button size="sm" variant="primary" onClick={() => { snackbar("Changes saved", { severity: "success" }); setMode(null); }}>Save</Button></div> : undefined} />
    <DiffDialog open={mode === "patch"} onOpenChange={open => { if (!open) setMode(null); }} title="Review patch" patch={patch + "diff --git a/image.png b/image.png\nBinary files a/image.png and b/image.png differ\n"} />
  </div>;
}
