/**
 * Zero-dep Chat markdown (L2 subset): paragraphs, AT1–6, fenced code,
 * blockquotes, hr, ul/ol, GFM task lists, inline code / strong / em / del / links.
 * Not full CommonMark / GFM — intentional keep-set mapping for Chat bubbles.
 */

export type MdInline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "del"; children: MdInline[] }
  | { type: "link"; href: string; title?: string; children: MdInline[] }
  | { type: "br" };

export type MdListItem = {
  task: boolean;
  checked: boolean;
  children: MdInline[];
};

export type MdBlock =
  | { type: "paragraph"; children: MdInline[] }
  | { type: "heading"; depth: 1 | 2 | 3 | 4 | 5 | 6; children: MdInline[] }
  | { type: "code"; language: string; value: string }
  | { type: "blockquote"; children: MdBlock[] }
  | { type: "list"; ordered: boolean; start: number; items: MdListItem[] }
  | { type: "hr" };

const FENCE_OPEN = /^```([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const HR = /^([-*_])\1{2,}\s*$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const UL_ITEM = /^(\s*)([-*+])\s+(?:\[([ xX])\]\s+)?(.*)$/;
const OL_ITEM = /^(\s*)(\d+)\.\s+(?:\[([ xX])\]\s+)?(.*)$/;

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function looksLikeBlockStart(line: string): boolean {
  if (isBlank(line)) return true;
  if (FENCE_OPEN.test(line)) return true;
  if (HEADING.test(line)) return true;
  if (HR.test(line)) return true;
  if (BLOCKQUOTE.test(line)) return true;
  if (UL_ITEM.test(line) || OL_ITEM.test(line)) return true;
  return false;
}

/** Decode a small set of markdown escapes inside inline runs. */
function unescapeText(value: string): string {
  return value.replace(/\\([\\`*_[\]()#+.!|-])/g, "$1");
}

/**
 * Inline parse: code → links → bold/italic/strike → text.
 * Nested emphasis is shallow (one level of strong/em/del).
 */
export function parseInlines(input: string): MdInline[] {
  const out: MdInline[] = [];
  let i = 0;
  let textBuf = "";

  const flushText = () => {
    if (!textBuf) return;
    out.push({ type: "text", value: unescapeText(textBuf) });
    textBuf = "";
  };

  const push = (node: MdInline) => {
    flushText();
    out.push(node);
  };

  while (i < input.length) {
    const ch = input[i];

    if (ch === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "[") {
      const close = input.indexOf("]", i + 1);
      if (close !== -1 && input[close + 1] === "(") {
        const parenClose = input.indexOf(")", close + 2);
        if (parenClose !== -1) {
          const label = input.slice(i + 1, close);
          const hrefRaw = input.slice(close + 2, parenClose).trim();
          const space = hrefRaw.search(/\s+/);
          const href =
            space === -1 ? hrefRaw : hrefRaw.slice(0, space).replace(/^<|>$/g, "");
          const title =
            space === -1
              ? undefined
              : hrefRaw
                  .slice(space)
                  .trim()
                  .replace(/^"|"$/g, "")
                  .replace(/^'|'$/g, "");
          if (href) {
            push({
              type: "link",
              href,
              title,
              children: parseInlines(label),
            });
            i = parenClose + 1;
            continue;
          }
        }
      }
    }

    if (input.startsWith("~~", i)) {
      const end = input.indexOf("~~", i + 2);
      if (end !== -1) {
        push({
          type: "del",
          children: parseInlines(input.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    if (input.startsWith("**", i) || input.startsWith("__", i)) {
      const mark = input.slice(i, i + 2);
      const end = input.indexOf(mark, i + 2);
      if (end !== -1) {
        push({
          type: "strong",
          children: parseInlines(input.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && input[i + 1] !== ch) {
      const end = input.indexOf(ch, i + 1);
      if (end !== -1 && input[end + 1] !== ch) {
        push({
          type: "em",
          children: parseInlines(input.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }

    if (input.startsWith("  \n", i) || input.startsWith("\\\n", i)) {
      push({ type: "br" });
      i += input.startsWith("  \n", i) ? 3 : 2;
      continue;
    }

    textBuf += ch;
    i += 1;
  }

  flushText();
  return out.length > 0 ? out : [{ type: "text", value: "" }];
}

function parseParagraphLines(lines: string[]): MdBlock {
  const text = lines.join("\n").replace(/\n/g, " ").trim();
  return { type: "paragraph", children: parseInlines(text) };
}

function parseBlockquote(lines: string[], start: number): { block: MdBlock; next: number } {
  const inner: string[] = [];
  let i = start;
  while (i < lines.length) {
    const m = lines[i].match(BLOCKQUOTE);
    if (!m) break;
    inner.push(m[1] ?? "");
    i += 1;
  }
  return {
    block: { type: "blockquote", children: parseChatMarkdown(inner.join("\n")) },
    next: i,
  };
}

function parseList(
  lines: string[],
  start: number,
): { block: MdBlock; next: number } {
  const firstOl = lines[start].match(OL_ITEM);
  const ordered = Boolean(firstOl);
  const startNum = firstOl ? Number(firstOl[2]) : 1;
  const items: MdListItem[] = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    const m = ordered ? line.match(OL_ITEM) : line.match(UL_ITEM);
    if (!m) {
      if (isBlank(line)) {
        // Blank ends the list unless the next non-blank is still a list item.
        let j = i + 1;
        while (j < lines.length && isBlank(lines[j])) j += 1;
        const peek = j < lines.length ? lines[j] : "";
        const still =
          ordered ? OL_ITEM.test(peek) : UL_ITEM.test(peek);
        if (!still) break;
        i = j;
        continue;
      }
      break;
    }
    const marker = m[3];
    const task = marker != null;
    const checked = marker === "x" || marker === "X";
    items.push({
      task,
      checked,
      children: parseInlines(m[4] ?? ""),
    });
    i += 1;
  }

  return {
    block: { type: "list", ordered, start: startNum, items },
    next: i,
  };
}

function parseFence(
  lines: string[],
  start: number,
): { block: MdBlock; next: number } {
  const open = lines[start].match(FENCE_OPEN);
  const language = (open?.[1] ?? "").trim();
  const body: string[] = [];
  let i = start + 1;
  let closed = false;
  while (i < lines.length) {
    if (/^```\s*$/.test(lines[i])) {
      closed = true;
      i += 1;
      break;
    }
    body.push(lines[i]);
    i += 1;
  }
  // Streaming / incomplete fence: keep body through EOF (no closing ```).
  void closed;
  return {
    block: {
      type: "code",
      language,
      value: body.join("\n").replace(/\n$/, ""),
    },
    next: i,
  };
}

/** Parse a Chat-oriented Markdown / GFM subset into a block AST. */
export function parseChatMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    if (FENCE_OPEN.test(line)) {
      const { block, next } = parseFence(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const depth = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        type: "heading",
        depth,
        children: parseInlines(heading[2]),
      });
      i += 1;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const { block, next } = parseBlockquote(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }

    if (UL_ITEM.test(line) || OL_ITEM.test(line)) {
      const { block, next } = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (i < lines.length && !looksLikeBlockStart(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(parseParagraphLines(para));
  }

  return blocks;
}
