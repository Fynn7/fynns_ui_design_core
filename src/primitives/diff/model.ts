/** Internal, bounded diff engine. No DOM, HTML parsing, or runtime dependencies. */
export type DiffSource =
  | { kind: "text"; before: string; after: string }
  | { kind: "patch"; patch: string };

export type DiffFile = {
  id: string;
  path: string;
  previousPath?: string;
  language?: string;
  source: DiffSource;
};

export type DiffRow = {
  type: "same" | "add" | "del" | "gap" | "meta";
  text: string;
  oldNumber?: number;
  newNumber?: number;
  noNewline?: boolean;
  emphasis?: Array<[number, number]>;
};
export type DiffProblem = "size" | "budget" | "invalid" | "multiple";
export type DiffModel = {
  rows: DiffRow[];
  additions: number;
  deletions: number;
  changes: number[];
  patch: string;
  problem?: DiffProblem;
  status?: "binary" | "renamed" | "empty";
};
export const DIFF_LIMITS = { chars: 1_048_576, lines: 20_000, steps: 1_000_000, page: 500 } as const;
type Edit = { type: "same" | "add" | "del"; text: string };
type Budget = { remaining: number };
class ComparisonLimit extends Error {}
function step(budget: Budget) {
  if (--budget.remaining < 0) throw new ComparisonLimit();
}
function sourceLines(text: string): string[] {
  if (!text) return [];
  return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}
function normalize(text: string) { return text.replace(/\r\n/g, "\n"); }

/** Myers shortest edit path, bounded in both frontier work and snake comparisons. */
function myers(a: string[], b: string[], budget: Budget): Edit[] {
  let start = 0;
  while (start < a.length && start < b.length) {
    step(budget);
    if (a[start] !== b[start]) break;
    start++;
  }
  let end = 0;
  while (end < a.length - start && end < b.length - start) {
    step(budget);
    if (a[a.length - end - 1] !== b[b.length - end - 1]) break;
    end++;
  }
  const prefix: Edit[] = a.slice(0, start).map(text => ({ type: "same", text }));
  const suffix: Edit[] = end ? a.slice(a.length - end).map(text => ({ type: "same", text })) : [];
  const left = a.slice(start, a.length - end), right = b.slice(start, b.length - end);
  if (!left.length) return [...prefix, ...right.map(text => ({ type: "add" as const, text })), ...suffix];
  if (!right.length) return [...prefix, ...left.map(text => ({ type: "del" as const, text })), ...suffix];
  let frontier = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  for (let d = 0; d <= left.length + right.length; d++) {
    trace.push(frontier);
    const next = new Map<number, number>();
    for (let k = -d; k <= d; k += 2) {
      step(budget);
      const down = frontier.get(k + 1) ?? -Infinity;
      const across = frontier.get(k - 1) ?? -Infinity;
      let x = k === -d || (k !== d && across < down) ? down : across + 1;
      let y = x - k;
      while (x < left.length && y < right.length) {
        step(budget);
        if (left[x] !== right[y]) break;
        x++; y++;
      }
      next.set(k, x);
      if (x >= left.length && y >= right.length) {
        const edits: Edit[] = [];
        for (let depth = d; depth >= 0; depth--) {
          const previous = trace[depth];
          const diagonal = x - y;
          const prevK = diagonal === -depth || (diagonal !== depth && (previous.get(diagonal - 1) ?? -Infinity) < (previous.get(diagonal + 1) ?? -Infinity)) ? diagonal + 1 : diagonal - 1;
          const prevX = previous.get(prevK) ?? 0;
          const prevY = prevX - prevK;
          while (x > prevX && y > prevY) { edits.push({ type: "same", text: left[--x] }); y--; }
          if (depth > 0) {
            if (x === prevX) edits.push({ type: "add", text: right[--y] });
            else edits.push({ type: "del", text: left[--x] });
          }
        }
        return [...prefix, ...edits.reverse(), ...suffix];
      }
    }
    frontier = next;
  }
  return [];
}

function ordered(edits: Edit[]): Edit[] {
  const out: Edit[] = [];
  for (let i = 0; i < edits.length;) {
    if (edits[i].type === "same") { out.push(edits[i++]); continue; }
    const block: Edit[] = [];
    while (i < edits.length && edits[i].type !== "same") block.push(edits[i++]);
    out.push(...block.filter(e => e.type === "del"), ...block.filter(e => e.type === "add"));
  }
  return out;
}

export function emphasize(rows: DiffRow[]) {
  const fileBudget: Budget = { remaining: DIFF_LIMITS.steps };
  for (let i = 0; i < rows.length;) {
    if (rows[i].type !== "del") { i++; continue; }
    const deleted: DiffRow[] = [], added: DiffRow[] = [];
    while (rows[i]?.type === "del") deleted.push(rows[i++]);
    while (rows[i]?.type === "add") added.push(rows[i++]);
    for (let j = 0; j < Math.min(deleted.length, added.length); j++) {
      const old = deleted[j], next = added[j];
      if (Math.max(old.text.length, next.text.length) > 2000 || fileBudget.remaining <= 0) continue;
      const local: Budget = { remaining: Math.min(10_000, fileBudget.remaining) };
      const initial = local.remaining;
      try {
        const edits = myers(Array.from(old.text), Array.from(next.text), local);
        const same = edits.filter(e => e.type === "same").length;
        if (same < Math.max(Array.from(old.text).length, Array.from(next.text).length) * 0.35) continue;
        let a = 0, b = 0;
        old.emphasis = []; next.emphasis = [];
        for (const edit of edits) {
          const length = edit.text.length;
          if (edit.type === "del") { old.emphasis.push([a, a + length]); a += length; }
          else if (edit.type === "add") { next.emphasis.push([b, b + length]); b += length; }
          else { a += length; b += length; }
        }
      } catch (error) { if (!(error instanceof ComparisonLimit)) throw error; }
      finally { fileBudget.remaining -= initial - local.remaining; }
    }
  }
}

export function summarize(rows: DiffRow[]) {
  let additions = 0, deletions = 0;
  const changes: number[] = [];
  rows.forEach((row, i) => {
    if (row.type === "add") additions++;
    if (row.type === "del") deletions++;
    if ((row.type === "add" || row.type === "del") && (i === 0 || (rows[i - 1].type !== "add" && rows[i - 1].type !== "del"))) changes.push(i);
  });
  return { additions, deletions, changes };
}

/** Ranges of visible context. Gaps in a patch are never treated as source lines. */
export function contextRanges(rows: DiffRow[], context = 3): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].type === "same") continue;
    let start = i, end = i + 1;
    for (let n = 0; n < context && start > 0 && rows[start - 1].type === "same"; n++) start--;
    for (let n = 0; n < context && end < rows.length && rows[end].type === "same"; n++) end++;
    const previous = ranges[ranges.length - 1];
    if (previous && start <= previous[1]) previous[1] = Math.max(end, previous[1]);
    else ranges.push([start, end]);
  }
  return ranges;
}

function patchPath(path: string) {
  return /[\s"\\]/.test(path) ? JSON.stringify(path) : path;
}
export function serializePatch(rows: DiffRow[], path: string, previousPath = path): string {
  const stats = summarize(rows);
  const out: string[] = previousPath !== path ? [`diff --git ${patchPath(`a/${previousPath}`)} ${patchPath(`b/${path}`)}`, ...(stats.changes.length ? [] : ["similarity index 100%"]), `rename from ${patchPath(previousPath)}`, `rename to ${patchPath(path)}`] : [];
  if (!stats.changes.length) return out.length ? `${out.join("\n")}\n` : "";
  out.push(`--- ${patchPath(`a/${previousPath}`)}`, `+++ ${patchPath(`b/${path}`)}`);
  for (const [start, end] of contextRanges(rows)) {
    const block = rows.slice(start, end);
    const old = block.filter(r => r.oldNumber != null), next = block.filter(r => r.newNumber != null);
    const oldStart = old[0]?.oldNumber ?? (rows.slice(0, start).filter(r => r.oldNumber != null).at(-1)?.oldNumber ?? 0);
    const newStart = next[0]?.newNumber ?? (rows.slice(0, start).filter(r => r.newNumber != null).at(-1)?.newNumber ?? 0);
    out.push(`@@ -${oldStart},${old.length} +${newStart},${next.length} @@`);
    for (const row of block) {
      out.push(`${row.type === "add" ? "+" : row.type === "del" ? "-" : " "}${row.text}`);
      if (row.noNewline) out.push("\\ No newline at end of file");
    }
  }
  return `${out.join("\n")}\n`;
}

function failure(problem: DiffProblem, patch = ""): DiffModel {
  return { rows: [], additions: 0, deletions: 0, changes: [], patch, problem };
}

export function buildTextDiff(before: string, after: string, path = "file", previousPath?: string, inline = true): DiffModel {
  if (before.length + after.length > DIFF_LIMITS.chars) return failure("size");
  const a = sourceLines(normalize(before)), b = sourceLines(normalize(after));
  if (a.length + b.length > DIFF_LIMITS.lines) return failure("size");
  try {
    const edits = ordered(myers(a, b, { remaining: DIFF_LIMITS.steps }));
    let oldNumber = 1, newNumber = 1;
    const rows: DiffRow[] = edits.map(edit => ({
      type: edit.type, text: edit.text.replace(/\n$/, ""), noNewline: !edit.text.endsWith("\n"),
      oldNumber: edit.type !== "add" ? oldNumber++ : undefined,
      newNumber: edit.type !== "del" ? newNumber++ : undefined,
    }));
    if (inline) emphasize(rows);
    const stats = summarize(rows);
    return { rows, ...stats, patch: serializePatch(rows, path, previousPath), status: !stats.changes.length && previousPath != null && previousPath !== path ? "renamed" : undefined };
  } catch (error) {
    if (error instanceof ComparisonLimit) return failure("budget");
    throw error;
  }
}

function decodePath(value: string, stripPrefix = true): string {
  let path = value.split("\t")[0];
  if (path.startsWith('"')) {
    // Git's quoted paths use octal UTF-8 bytes, unlike JSON string escapes.
    const octal = path.replace(/\\([0-7]{3})/g, (_, digits: string) => String.fromCharCode(parseInt(digits, 8)));
    try { path = JSON.parse(octal); } catch { path = octal.slice(1, -1); }
    if (/\\[0-7]{3}/.test(value)) {
      try { path = new TextDecoder().decode(Uint8Array.from(path, (c: string) => c.charCodeAt(0))); } catch { /* keep readable path */ }
    }
  }
  return stripPrefix ? path.replace(/^[ab]\//, "") : path;
}

/** Split only at file boundaries outside hunk bodies (a deleted `---` is data). */
export function splitPatch(patch: string): DiffFile[] {
  const lines = normalize(patch).split("\n");
  const blocks: string[][] = [];
  let block: string[] = [], oldLeft = 0, newLeft = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const inHunk = oldLeft > 0 || newLeft > 0;
    if (line.startsWith("diff --git ") || (!inHunk && line.startsWith("--- ") && lines[i + 1]?.startsWith("+++ ") && block.some(l => l.startsWith("--- ")))) {
      if (block.some(l => l.trim())) blocks.push(block);
      block = []; oldLeft = 0; newLeft = 0;
    }
    block.push(line);
    const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk) { oldLeft = Number(hunk[2] ?? 1); newLeft = Number(hunk[4] ?? 1); }
    else if (inHunk) {
      if (line[0] === " " || line[0] === "-") oldLeft--;
      if (line[0] === " " || line[0] === "+") newLeft--;
    }
  }
  if (block.some(l => l.trim())) blocks.push(block);
  return blocks.map((part, index) => {
    const oldHeader = part.find(l => l.startsWith("--- "));
    const newHeader = part.find(l => l.startsWith("+++ "));
    const renameFrom = part.find(l => l.startsWith("rename from "));
    const renameTo = part.find(l => l.startsWith("rename to "));
    let gitPaths: string[] | null = /^diff --git ("(?:\\.|[^"\\])*"|\S+) ("(?:\\.|[^"\\])*"|\S+)$/.exec(part[0]);
    if (!gitPaths && part[0]?.startsWith("diff --git a/")) {
      const value = part[0].slice(11);
      for (let boundary = value.indexOf(" b/"); boundary >= 0; boundary = value.indexOf(" b/", boundary + 1)) {
        const old = value.slice(0, boundary), next = value.slice(boundary + 1);
        if (old.slice(2) === next.slice(2)) { gitPaths = [part[0], old, next]; break; }
      }
    }
    const old = renameFrom ? decodePath(renameFrom.slice(12), false) : oldHeader ? decodePath(oldHeader.slice(4)) : gitPaths ? decodePath(gitPaths[1]) : undefined;
    const next = renameTo ? decodePath(renameTo.slice(10), false) : newHeader ? decodePath(newHeader.slice(4)) : gitPaths ? decodePath(gitPaths[2]) : undefined;
    const path = next && next !== "/dev/null" ? next : old ?? "file";
    return { id: `patch-${index}`, path, previousPath: old && old !== "/dev/null" && old !== path ? old : undefined, source: { kind: "patch", patch: part.join("\n").replace(/\n*$/, "\n") } };
  });
}

export function parseFilePatch(patch: string, inline = true): DiffModel {
  if (patch.length > DIFF_LIMITS.chars) return failure("size");
  const lines = normalize(patch).split("\n");
  if (lines.length > DIFF_LIMITS.lines) return failure("size");
  const rows: DiffRow[] = [];
  let oldEnd = 0, newEnd = 0, foundHunk = false;
  let header = false, metadata = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("--- ")) { header = true; if (!lines[++i]?.startsWith("+++ ")) return failure("invalid"); continue; }
    const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?:.*)$/.exec(line);
    if (hunk) {
      foundHunk = true;
      let oldNumber = Number(hunk[1]), newNumber = Number(hunk[3]);
      const oldCount = Number(hunk[2] ?? 1), newCount = Number(hunk[4] ?? 1);
      if (![oldNumber, newNumber, oldCount, newCount, oldNumber + oldCount, newNumber + newCount].every(Number.isSafeInteger) || (oldCount > 0 && oldNumber < 1) || (newCount > 0 && newNumber < 1) || (!oldCount && !newCount)) return failure("invalid");
      if ((oldCount ? oldNumber <= oldEnd : oldNumber < oldEnd) || (newCount ? newNumber <= newEnd : newNumber < newEnd)) return failure("invalid");
      if (oldNumber > oldEnd + 1 || newNumber > newEnd + 1) rows.push({ type: "gap", text: "" });
      let oldLeft = oldCount, newLeft = newCount;
      while (oldLeft || newLeft) {
        const body = lines[++i];
        if (body == null || ![" ", "+", "-"].includes(body[0])) return failure("invalid");
        const type = body[0] === "+" ? "add" : body[0] === "-" ? "del" : "same";
        const row: DiffRow = { type, text: body.slice(1), noNewline: false };
        if (type !== "add") { if (--oldLeft < 0) return failure("invalid"); row.oldNumber = oldNumber++; }
        if (type !== "del") { if (--newLeft < 0) return failure("invalid"); row.newNumber = newNumber++; }
        rows.push(row);
        if (lines[i + 1] === "\\ No newline at end of file") { row.noNewline = true; i++; }
      }
      oldEnd = oldCount ? oldNumber - 1 : oldNumber;
      newEnd = newCount ? newNumber - 1 : newNumber;
      continue;
    }
    if (/^(diff --git |index |new file mode |deleted file mode |old mode |new mode |similarity index |dissimilarity index |rename from |rename to |copy from |copy to )/.test(line)) { metadata = true; continue; }
    if (/^(Binary files .* differ|GIT binary patch)$/.test(line)) return { rows: [], additions: 0, deletions: 0, changes: [], patch, status: "binary" };
    if (line && !line.startsWith("\\")) return failure("invalid");
    if (line.startsWith("\\")) return failure("invalid");
  }
  if (!foundHunk && !header && !metadata) return failure("invalid");
  if (rows.reduce((count, row) => count + (row.oldNumber != null ? 1 : 0) + (row.newNumber != null ? 1 : 0), 0) > DIFF_LIMITS.lines) return failure("size");
  // A trailing patch boundary has unknown remaining source, even after the last hunk.
  if (foundHunk) rows.push({ type: "gap", text: "" });
  if (inline) emphasize(rows);
  return { rows, ...summarize(rows), patch, status: !foundHunk ? /rename from /.test(patch) ? "renamed" : "empty" : undefined };
}

export function buildDiff(file: DiffFile, inline = true): DiffModel {
  if (file.source.kind === "text") return buildTextDiff(file.source.before, file.source.after, file.path, file.previousPath, inline);
  if (file.source.patch.length > DIFF_LIMITS.chars) return failure("size");
  const files = splitPatch(file.source.patch);
  if (files.length > 1) return failure("multiple");
  return parseFilePatch(file.source.patch, inline);
}

