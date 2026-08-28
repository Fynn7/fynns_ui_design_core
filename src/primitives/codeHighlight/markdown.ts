import type { CodeSegment, CodeTokenKind } from "./types";

function push(out: CodeSegment[], kind: CodeTokenKind, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
    return;
  }
  out.push({ kind, text });
}

function lineStart(code: string, i: number): boolean {
  if (i === 0) return true;
  let j = i - 1;
  while (j >= 0 && (code[j] === " " || code[j] === "\t")) j -= 1;
  return j < 0 || code[j] === "\n" || code[j] === "\r";
}

/**
 * Zero-dep Markdown highlighter (L2 subset — mirrors ChatMarkdown scope):
 * ATX headings, fenced / inline code, emphasis, blockquote, list markers, links.
 */
export function tokenizeMarkdown(code: string): CodeSegment[] {
  const out: CodeSegment[] = [];
  let i = 0;
  let inFence = false;
  let fenceMarker = "";

  while (i < code.length) {
    const ch = code[i]!;

    /* Fenced code block */
    if (!inFence && ch === "`" && code.startsWith("```", i)) {
      let j = i + 3;
      while (j < code.length && code[j] !== "\n" && code[j] !== "`") j += 1;
      push(out, "operator", code.slice(i, j));
      if (code[j] === "\n") {
        push(out, "operator", "\n");
        j += 1;
      }
      inFence = true;
      fenceMarker = "```";
      i = j;
      continue;
    }

    if (inFence) {
      if (code.startsWith(fenceMarker, i)) {
        push(out, "operator", fenceMarker);
        i += fenceMarker.length;
        inFence = false;
        fenceMarker = "";
        continue;
      }
      let j = i + 1;
      while (j < code.length && !code.startsWith(fenceMarker, j)) j += 1;
      push(out, "string", code.slice(i, j));
      i = j;
      continue;
    }

    /* ATX heading */
    if (ch === "#" && lineStart(code, i)) {
      let j = i;
      while (j < code.length && code[j] === "#") j += 1;
      if (j < code.length && code[j] === " ") {
        push(out, "keyword", code.slice(i, j));
        i = j;
        continue;
      }
    }

    /* Blockquote */
    if (ch === ">" && lineStart(code, i)) {
      push(out, "comment", ">");
      i += 1;
      continue;
    }

    /* Unordered list marker */
    if (
      lineStart(code, i) &&
      (ch === "-" || ch === "*" || ch === "+") &&
      i + 1 < code.length &&
      code[i + 1] === " "
    ) {
      push(out, "operator", ch);
      i += 1;
      continue;
    }

    /* Ordered list marker */
    if (lineStart(code, i) && ch >= "0" && ch <= "9") {
      let j = i;
      while (j < code.length && code[j] >= "0" && code[j] <= "9") j += 1;
      if (j < code.length && code[j] === "." && j + 1 < code.length && code[j + 1] === " ") {
        push(out, "operator", code.slice(i, j + 1));
        i = j + 1;
        continue;
      }
    }

    /* Horizontal rule */
    if (lineStart(code, i) && (ch === "-" || ch === "*") && i + 2 < code.length) {
      const mark = ch;
      let j = i;
      while (j < code.length && code[j] === mark) j += 1;
      if (j - i >= 3 && (j >= code.length || code[j] === "\n" || code[j] === "\r")) {
        push(out, "operator", code.slice(i, j));
        i = j;
        continue;
      }
    }

    /* Inline code */
    if (ch === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== "`" && code[j] !== "\n") j += 1;
      if (j < code.length && code[j] === "`") j += 1;
      push(out, "string", code.slice(i, j));
      i = j;
      continue;
    }

    /* Bold **…** or __…__ */
    if (
      (ch === "*" && code.startsWith("**", i)) ||
      (ch === "_" && code.startsWith("__", i))
    ) {
      const mark = ch === "*" ? "**" : "__";
      const close = mark;
      let j = i + 2;
      while (j < code.length && !code.startsWith(close, j)) j += 1;
      if (j < code.length) j += 2;
      push(out, "keyword", code.slice(i, j));
      i = j;
      continue;
    }

    /* Italic *…* or _…_ (single marker, not word-internal underscore) */
    if (
      (ch === "*" && code[i + 1] !== "*") ||
      (ch === "_" && code[i + 1] !== "_" && (i === 0 || /\W/.test(code[i - 1]!)))
    ) {
      const mark = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== mark) j += 1;
      if (j < code.length) j += 1;
      push(out, "type", code.slice(i, j));
      i = j;
      continue;
    }

    /* Link [label](url) */
    if (ch === "[") {
      let j = i + 1;
      while (j < code.length && code[j] !== "]") j += 1;
      if (j < code.length && code[j + 1] === "(") {
        let k = j + 2;
        while (k < code.length && code[k] !== ")") k += 1;
        if (k < code.length) k += 1;
        push(out, "function", code.slice(i, j + 1));
        push(out, "string", code.slice(j + 1, k));
        i = k;
        continue;
      }
    }

    push(out, "plain", ch);
    i += 1;
  }

  return out;
}
