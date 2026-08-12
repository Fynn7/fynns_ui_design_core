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

function isNameStart(ch: string): boolean {
  return /[A-Za-z_:]/.test(ch);
}

function isNameCont(ch: string): boolean {
  return /[A-Za-z0-9._:-]/.test(ch);
}

function isWs(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

/**
 * Zero-dep XML / HTML highlighter mapped onto `--fynns-code-*` roles:
 * tag punctuation → `operator`, element / PI names → `keyword`, attributes →
 * `property`, quoted values → `string`, comments / CDATA → `comment`,
 * `&…;` → `escape`, text → `plain`.
 */
export function tokenizeMarkup(code: string): CodeSegment[] {
  const out: CodeSegment[] = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i]!;

    /* <!-- comment --> */
    if (ch === "<" && code.startsWith("<!--", i)) {
      let j = i + 4;
      while (j < code.length && !code.startsWith("-->", j)) j += 1;
      if (j < code.length) j += 3;
      push(out, "comment", code.slice(i, j));
      i = j;
      continue;
    }

    /* <![CDATA[ … ]]> */
    if (ch === "<" && code.startsWith("<![CDATA[", i)) {
      let j = i + 9;
      while (j < code.length && !code.startsWith("]]>", j)) j += 1;
      if (j < code.length) j += 3;
      push(out, "comment", code.slice(i, j));
      i = j;
      continue;
    }

    /* <? … ?> processing instruction */
    if (ch === "<" && code.startsWith("<?", i)) {
      push(out, "operator", "<?");
      i += 2;
      if (i < code.length && isNameStart(code[i]!)) {
        const start = i;
        i += 1;
        while (i < code.length && isNameCont(code[i]!)) i += 1;
        push(out, "keyword", code.slice(start, i));
      }
      i = tokenizeTagBody(code, i, out, "?>");
      continue;
    }

    /* Opening / closing / empty element tag */
    if (
      ch === "<" &&
      i + 1 < code.length &&
      (code[i + 1] === "/" || isNameStart(code[i + 1]!))
    ) {
      push(out, "operator", "<");
      i += 1;
      if (code[i] === "/") {
        push(out, "operator", "/");
        i += 1;
      }
      if (i < code.length && isNameStart(code[i]!)) {
        const start = i;
        i += 1;
        while (i < code.length && isNameCont(code[i]!)) i += 1;
        push(out, "keyword", code.slice(start, i));
      }
      i = tokenizeTagBody(code, i, out, ">");
      continue;
    }

    /* &entity; / &#…; */
    if (ch === "&") {
      let j = i + 1;
      while (j < code.length && code[j] !== ";" && code[j] !== "<" && !isWs(code[j]!)) {
        j += 1;
      }
      if (j < code.length && code[j] === ";" && j > i + 1) {
        push(out, "escape", code.slice(i, j + 1));
        i = j + 1;
        continue;
      }
    }

    push(out, "plain", ch);
    i += 1;
  }

  return out;
}

/** Attributes + closing delimiter (`>` or `?>`) inside a tag / PI. */
function tokenizeTagBody(
  code: string,
  from: number,
  out: CodeSegment[],
  closer: ">" | "?>",
): number {
  let i = from;
  while (i < code.length) {
    if (closer === "?>" && code.startsWith("?>", i)) {
      push(out, "operator", "?>");
      return i + 2;
    }
    if (closer === ">" && code[i] === ">") {
      push(out, "operator", ">");
      return i + 1;
    }
    if (closer === ">" && code[i] === "/" && code[i + 1] === ">") {
      push(out, "operator", "/>");
      return i + 2;
    }

    const ch = code[i]!;
    if (isWs(ch)) {
      push(out, "plain", ch);
      i += 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== quote && code[j] !== "\n") j += 1;
      if (j < code.length && code[j] === quote) j += 1;
      push(out, "string", code.slice(i, j));
      i = j;
      continue;
    }

    if (ch === "=") {
      push(out, "operator", "=");
      i += 1;
      continue;
    }

    if (isNameStart(ch)) {
      const start = i;
      i += 1;
      while (i < code.length && isNameCont(code[i]!)) i += 1;
      push(out, "property", code.slice(start, i));
      continue;
    }

    push(out, "operator", ch);
    i += 1;
  }
  return i;
}
