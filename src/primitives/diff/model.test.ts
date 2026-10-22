import { describe, expect, it } from "vitest";
import { buildDiff, buildTextDiff, contextRanges, DIFF_LIMITS, parseFilePatch, serializePatch, splitPatch } from "./model";

describe("bounded unified diff engine", () => {
  it("preserves repeated lines, orders deletions first and assigns dual line numbers", () => {
    const model = buildTextDiff("a\nb\na\nc\n", "a\na\nx\nc\n", "test.txt");
    expect(model.problem).toBeUndefined();
    expect(model.rows.map(r => [r.type, r.text, r.oldNumber, r.newNumber])).toEqual([
      ["same", "a", 1, 1], ["del", "b", 2, undefined], ["same", "a", 3, 2], ["add", "x", undefined, 3], ["same", "c", 4, 4],
    ]);
    expect(model.additions).toBe(1); expect(model.deletions).toBe(1);
    expect(parseFilePatch(model.patch).rows.filter(r => r.type !== "gap")).toEqual(model.rows);
  });

  it("round-trips deterministic random edit scripts without losing or inventing content", () => {
    let seed = 137;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
    for (let sample = 0; sample < 160; sample++) {
      const make = () => Array.from({ length: Math.floor(random() * 35) }, () => `${Math.floor(random() * 8)}\n`).join("");
      const before = make(), after = make(), model = buildTextDiff(before, after);
      const source = (side: "add" | "del") => model.rows.filter(r => r.type === "same" || r.type === side).map(r => r.text + (r.noNewline ? "" : "\n")).join("");
      expect(source("del")).toBe(before); expect(source("add")).toBe(after);
      if (model.patch) {
        const parsed = parseFilePatch(model.patch);
        expect(parsed.problem, model.patch).toBeUndefined();
        expect(parsed.additions).toBe(model.additions); expect(parsed.deletions).toBe(model.deletions);
      }
    }
  });

  it("supports empty sides, CRLF, blank lines, and no-final-newline changes", () => {
    expect(buildTextDiff("", "").changes).toEqual([]);
    expect(buildTextDiff("a\r\n\r\n", "a\n\n").changes).toEqual([]);
    const added = buildTextDiff("", "\nvalue");
    expect(added.rows.map(r => r.text)).toEqual(["", "value"]);
    expect(added.patch).toContain("@@ -0,0 +1,2 @@");
    expect(added.patch).toContain("\\ No newline at end of file");
    expect(parseFilePatch(added.patch).problem).toBeUndefined();
    expect(buildTextDiff("old\n", "").patch).toContain("@@ -1,1 +0,0 @@");
    expect(buildTextDiff("same", "same\n").rows.map(r => r.type)).toEqual(["del", "add"]);
  });

  it("emphasizes actual Unicode edits without splitting surrogate pairs", () => {
    const model = buildTextDiff("const 标题 = 'hello 🌍';\n", "const 标题 = 'hello 🌟';\n");
    expect(model.rows[0].emphasis?.map(([a, b]) => model.rows[0].text.slice(a, b))).toEqual(["🌍"]);
    expect(model.rows[1].emphasis?.map(([a, b]) => model.rows[1].text.slice(a, b))).toEqual(["🌟"]);
    const unrelated = buildTextDiff("aaaa\n", "bbbb\n");
    expect(unrelated.rows[0].emphasis).toBeUndefined();
  });

  it("keeps long inline candidates at whole-line highlighting", () => {
    const model = buildTextDiff(`${"x".repeat(2000)}a\n`, `${"x".repeat(2000)}b\n`);
    expect(model.rows[0].emphasis).toBeUndefined();
  });

  it("merges three-line contexts and generates valid separated hunks", () => {
    const before = Array.from({ length: 60 }, (_, i) => `line ${i}\n`).join("");
    const after = before.replace("line 10\n", "new 10\n").replace("line 15\n", "new 15\n").replace("line 50\n", "new 50\n");
    const model = buildTextDiff(before, after);
    expect(contextRanges(model.rows)).toHaveLength(2);
    expect(model.patch.match(/^@@ /gm)).toHaveLength(2);
    const parsed = parseFilePatch(model.patch);
    expect(parsed.problem).toBeUndefined(); expect(parsed.additions).toBe(3);
    expect(parsed.rows.filter(r => r.type === "gap")).toHaveLength(3);
  });

  it("rejects size and computational overflows explicitly", () => {
    expect(buildTextDiff("x".repeat(DIFF_LIMITS.chars), "y").problem).toBe("size");
    expect(buildTextDiff("a\n".repeat(DIFF_LIMITS.lines), "b\n").problem).toBe("size");
    const model = buildTextDiff(Array.from({ length: 1800 }, (_, i) => `a${i}\n`).join(""), Array.from({ length: 1800 }, (_, i) => `b${i}\n`).join(""));
    expect(model.problem).toBe("budget"); expect(model.rows).toEqual([]); expect(model.patch).toBe("");
    expect(parseFilePatch("x".repeat(DIFF_LIMITS.chars + 1)).problem).toBe("size");
    expect(parseFilePatch(`--- a/a\n+++ b/a\n@@ -1,10001 +1,10001 @@\n${" same\n".repeat(10001)}`).problem).toBe("size");
  });
});

describe("unified / git patch parsing", () => {
  const patch = "--- a/demo.txt\n+++ b/demo.txt\n@@ -3,2 +3,2 @@ heading\n keep\n-before\n+after\n";
  it("preserves hunk coordinates and unavailable source boundaries", () => {
    const model = parseFilePatch(patch);
    expect(model.problem).toBeUndefined();
    expect(model.rows.filter(r => r.type !== "gap").map(r => [r.oldNumber, r.newNumber])).toEqual([[3, 3], [4, undefined], [undefined, 4]]);
    expect(model.rows.filter(r => r.type === "gap")).toHaveLength(2);
    expect(model.patch).toBe(patch);
  });

  it("isolates damaged files while keeping valid siblings", () => {
    const files = splitPatch(`diff --git a/bad b/bad\n--- a/bad\n+++ b/bad\n@@ -1 +1 @@\n-bad\ndiff --git a/demo.txt b/demo.txt\n${patch}`);
    expect(files.map(f => f.path)).toEqual(["bad", "demo.txt"]);
    expect(buildDiff(files[0]).problem).toBe("invalid");
    expect(buildDiff(files[1]).additions).toBe(1);
  });

  it("does not mistake deleted --- or added +++ text for file boundaries", () => {
    const files = splitPatch("--- a/a\n+++ b/a\n@@ -1 +1 @@\n--- content\n+++ content\n--- a/b\n+++ b/b\n@@ -0,0 +1 @@\n+new\n");
    expect(files).toHaveLength(2);
    expect(buildDiff(files[0]).rows.filter(r => r.type === "del")[0].text).toBe("-- content");
    expect(buildDiff(files[1]).additions).toBe(1);
  });

  it("handles additions, deletions, pure renames, metadata and binary summaries", () => {
    const add = splitPatch("diff --git a/new b/new\nnew file mode 100644\n--- /dev/null\n+++ b/new\n@@ -0,0 +1 @@\n+added\n")[0];
    expect(add.path).toBe("new"); expect(buildDiff(add).rows.find(r => r.type === "add")?.newNumber).toBe(1);
    const del = splitPatch("--- a/gone\n+++ /dev/null\n@@ -1 +0,0 @@\n-old\n")[0];
    expect(del.path).toBe("gone"); expect(buildDiff(del).deletions).toBe(1);
    const rename = splitPatch("diff --git a/old b/new\nsimilarity index 100%\nrename from old\nrename to new\n")[0];
    expect(rename.previousPath).toBe("old"); expect(rename.path).toBe("new"); expect(buildDiff(rename).status).toBe("renamed");
    expect(parseFilePatch("diff --git a/a b/a\nold mode 100644\nnew mode 100755\n").status).toBe("empty");
    expect(parseFilePatch("diff --git a/a b/a\nBinary files a/a and b/a differ\n").status).toBe("binary");
    expect(parseFilePatch("diff --git a/a b/a\nGIT binary patch\nliteral 20\nopaque\n").status).toBe("binary");
    const textRename = buildTextDiff("same\n", "same\n", "new name.txt", "old name.txt");
    expect(textRename.status).toBe("renamed");
    expect(buildDiff(splitPatch(textRename.patch)[0]).status).toBe("renamed");
  });

  it("decodes quoted paths and keeps patch text inert", () => {
    const files = splitPatch('--- "a/space name.txt"\n+++ "b/space name.txt"\n@@ -0,0 +1 @@\n+<script>alert(1)</script>\n');
    expect(files[0].path).toBe("space name.txt");
    expect(buildDiff(files[0]).rows.find(r => r.type === "add")?.text).toBe("<script>alert(1)</script>");
    const quoted = splitPatch('diff --git "a/\\344\\270\\255.txt" "b/\\344\\270\\255.txt"\nBinary files a/a and b/a differ\n');
    expect(quoted[0].path).toBe("中.txt");
    const unquoted = splitPatch("diff --git a/image with spaces.png b/image with spaces.png\nBinary files a/image with spaces.png and b/image with spaces.png differ\n");
    expect(unquoted[0].path).toBe("image with spaces.png");
  });

  it.each([
    "not a patch", "--- a/a\nmissing header", "@@ -1 +1 @@\n-old\n", "@@ -1 +1 @@\n+new\n", "@@ -0 +1 @@\n-old\n+new\n", "@@ -1,0 +1,0 @@\n", "@@@ -1 +1 @@@\n",
    "@@ -1 +1 @@\n-old\n+new\n+extra\n", "--- a/a\n+++ b/a\n@@ -1 +1 @@\n-old\n+new\n@@ -0 +0 @@\n-a\n+b\n",
    "@@ -1 +1 @@\n-a\n+b\n@@ -1 +1 @@\n-b\n+c\n",
  ])("rejects malformed input: %s", input => expect(parseFilePatch(input).problem).toBe("invalid"));

  it("requires DiffDialog for multiple files and round-trips escaped generated paths", () => {
    expect(buildDiff({ id: "x", path: "x", source: { kind: "patch", patch: `${patch}${patch}` } }).problem).toBe("multiple");
    const rows = buildTextDiff("a\n", "b\n").rows;
    expect(splitPatch(serializePatch(rows, 'a "name".txt'))[0].path).toBe('a "name".txt');
  });
});
