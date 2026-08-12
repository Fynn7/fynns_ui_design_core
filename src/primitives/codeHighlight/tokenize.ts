import { normalizeLanguage, profileFor } from "./languages";
import { tokenizeMarkup } from "./markup";
import {
  getRegisteredHighlightLanguage,
  highlightWithProfile,
} from "./simple";
import type { CodeSegment, CodeTokenKind, LangProfile } from "./types";

function push(out: CodeSegment[], kind: CodeTokenKind, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
    return;
  }
  out.push({ kind, text });
}

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentCont(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

type ImportPhase = "module" | "names" | null;

function classifyIdent(
  word: string,
  profile: LangProfile,
  afterDot: boolean,
  nextNonWs: string | undefined,
  nextTwo: string,
  importPhase: ImportPhase,
): CodeTokenKind {
  if (profile.constants.has(word)) return "constant";
  if (profile.keywords.has(word)) return "keyword";
  if (importPhase === "module") return "module";
  if (profile.types.has(word)) return "type";
  if (profile.modules?.has(word) || nextTwo === "::") return "module";
  if (/^[A-Z][A-Z0-9_]+$/.test(word)) return "constant-named";
  if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) return "type";
  if (importPhase === "names") return "function";
  if (afterDot) return "property";
  if (nextNonWs === "(") return "function";
  return "variable";
}

function peekNonWs(code: string, from: number): string | undefined {
  for (let i = from; i < code.length; i += 1) {
    const ch = code[i];
    if (ch !== " " && ch !== "\t" && ch !== "\n" && ch !== "\r") return ch;
  }
  return undefined;
}

function tokenizeWithProfile(code: string, profile: LangProfile): CodeSegment[] {
  const out: CodeSegment[] = [];
  let i = 0;
  let afterDot = false;
  let importPhase: ImportPhase = null;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    // Hash line comment
    if (profile.hashComment && ch === "#") {
      let j = i + 1;
      while (j < code.length && code[j] !== "\n") j += 1;
      push(out, "comment", code.slice(i, j));
      i = j;
      afterDot = false;
      continue;
    }

    // C / C++ preprocessor (`#include`, `#if`, …)
    if (profile.preprocessor && ch === "#") {
      let j = i + 1;
      while (j < code.length && (code[j] === " " || code[j] === "\t")) j += 1;
      const dirStart = j;
      if (j < code.length && isIdentStart(code[j]!)) {
        while (j < code.length && isIdentCont(code[j]!)) j += 1;
      }
      const dirWord = code.slice(dirStart, j);
      push(out, "keyword", code.slice(i, j));
      i = j;

      // `#include <cmath>` / `#include "foo.h"` — header names are modules
      // (cpptools: grassy green, same as Python module).
      if (dirWord === "include") {
        while (i < code.length && (code[i] === " " || code[i] === "\t")) {
          push(out, "plain", code[i]!);
          i += 1;
        }
        if (i < code.length && code[i] === "<") {
          push(out, "operator", "<");
          i += 1;
          const start = i;
          while (i < code.length && code[i] !== ">" && code[i] !== "\n") i += 1;
          if (i > start) push(out, "module", code.slice(start, i));
          if (i < code.length && code[i] === ">") {
            push(out, "operator", ">");
            i += 1;
          }
        } else if (i < code.length && code[i] === '"') {
          push(out, "operator", '"');
          i += 1;
          const start = i;
          while (i < code.length && code[i] !== '"' && code[i] !== "\n") i += 1;
          if (i > start) push(out, "module", code.slice(start, i));
          if (i < code.length && code[i] === '"') {
            push(out, "operator", '"');
            i += 1;
          }
        }
      }
      afterDot = false;
      continue;
    }

    // Line comment
    if (
      profile.lineComment &&
      code.startsWith(profile.lineComment, i)
    ) {
      let j = i + profile.lineComment.length;
      while (j < code.length && code[j] !== "\n") j += 1;
      push(out, "comment", code.slice(i, j));
      i = j;
      afterDot = false;
      continue;
    }

    // Block comment
    if (profile.blockComment && code.startsWith(profile.blockComment[0], i)) {
      const [open, close] = profile.blockComment;
      let j = i + open.length;
      while (j < code.length && !code.startsWith(close, j)) j += 1;
      if (j < code.length) j += close.length;
      push(out, "comment", code.slice(i, j));
      i = j;
      afterDot = false;
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      push(out, "string", quote);
      while (j < code.length) {
        const c = code[j];
        if (c === "\\" && j + 1 < code.length) {
          push(out, "escape", code.slice(j, j + 2));
          j += 2;
          continue;
        }
        if (c === quote) {
          push(out, "string", quote);
          j += 1;
          break;
        }
        // template ${ … } — keep simple: color as string until }
        if (quote === "`" && c === "$" && code[j + 1] === "{") {
          push(out, "operator", "${");
          j += 2;
          let depth = 1;
          const start = j;
          while (j < code.length && depth > 0) {
            if (code[j] === "{") depth += 1;
            else if (code[j] === "}") depth -= 1;
            if (depth > 0) j += 1;
          }
          const inner = code.slice(start, j);
          // Recurse lightly: treat inner as plain/operator mix via nested tokenize
          const nested = tokenizeWithProfile(inner, profile);
          for (const seg of nested) out.push(seg);
          if (j < code.length && code[j] === "}") {
            push(out, "operator", "}");
            j += 1;
          }
          continue;
        }
        let k = j + 1;
        while (
          k < code.length &&
          code[k] !== quote &&
          code[k] !== "\\" &&
          !(quote === "`" && code[k] === "$" && code[k + 1] === "{")
        ) {
          k += 1;
        }
        push(out, "string", code.slice(j, k));
        j = k;
      }
      i = j;
      afterDot = false;
      continue;
    }

    // Numbers
    if (isDigit(ch) || (ch === "." && next !== undefined && isDigit(next))) {
      let j = i;
      if (ch === "0" && (next === "x" || next === "X" || next === "b" || next === "B" || next === "o" || next === "O")) {
        j += 2;
        while (j < code.length && /[0-9A-Fa-f_]/.test(code[j]!)) j += 1;
      } else {
        while (j < code.length && /[0-9_]/.test(code[j]!)) j += 1;
        if (code[j] === ".") {
          j += 1;
          while (j < code.length && /[0-9_]/.test(code[j]!)) j += 1;
        }
        if (code[j] === "e" || code[j] === "E") {
          j += 1;
          if (code[j] === "+" || code[j] === "-") j += 1;
          while (j < code.length && /[0-9_]/.test(code[j]!)) j += 1;
        }
        if (code[j] === "n") j += 1;
      }
      push(out, "number", code.slice(i, j));
      i = j;
      afterDot = false;
      continue;
    }

    // Decorator `@name` / `@name(` → function (Python / TS)
    if (ch === "@" && next !== undefined && isIdentStart(next)) {
      push(out, "operator", "@");
      let j = i + 2;
      while (j < code.length && isIdentCont(code[j]!)) j += 1;
      push(out, "function", code.slice(i + 1, j));
      i = j;
      afterDot = false;
      continue;
    }

    // Identifiers
    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < code.length && isIdentCont(code[j]!)) j += 1;
      const word = code.slice(i, j);
      const nextTwo = code.slice(j, j + 2);
      const kind = classifyIdent(
        word,
        profile,
        afterDot,
        peekNonWs(code, j),
        nextTwo,
        importPhase,
      );
      push(out, kind, word);
      if (profile.importAware) {
        if (word === "from" && kind === "keyword") {
          importPhase = "module";
        } else if (word === "import" && kind === "keyword") {
          importPhase = importPhase === "module" ? "names" : "module";
        } else if (word === "as" && kind === "keyword") {
          /* alias stays in current phase */
        }
      }
      i = j;
      afterDot = false;
      continue;
    }

    // Dot (property access marker; module path while importing)
    if (ch === ".") {
      push(out, "operator", ".");
      i += 1;
      afterDot = true;
      continue;
    }

    // Whitespace (newline ends an import statement)
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      let j = i + 1;
      while (
        j < code.length &&
        (code[j] === " " || code[j] === "\t" || code[j] === "\n" || code[j] === "\r")
      ) {
        j += 1;
      }
      if (code.slice(i, j).includes("\n")) importPhase = null;
      push(out, "plain", code.slice(i, j));
      i = j;
      continue;
    }

    // Operators / punctuation
    if (/[{}()[\];,:<>?=+\-*/%&|^!~]/.test(ch)) {
      // Multi-char operators
      const two = code.slice(i, i + 2);
      const three = code.slice(i, i + 3);
      if (
        ["===", "!==", ">>>", "<<=", ">>=", "&&=", "||="].includes(three) ||
        ["=>", "==", "!=", "<=", ">=", "&&", "||", "??", "++", "--", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "**", "::"].includes(two)
      ) {
        const len = ["===", "!==", ">>>", "<<=", ">>=", "&&=", "||="].includes(three) ? 3 : 2;
        push(out, "operator", code.slice(i, i + len));
        i += len;
      } else {
        push(out, "operator", ch);
        i += 1;
      }
      afterDot = false;
      continue;
    }

    push(out, "plain", ch);
    i += 1;
    afterDot = false;
  }

  return out;
}

/**
 * Tokenize `code` for a supported `language`. Built-ins first, then
 * {@link registerHighlightLanguage} profiles. Unknown / missing language
 * returns a single plain segment (caller may skip highlighting).
 */
export function highlightCode(code: string, language?: string): CodeSegment[] {
  const id = normalizeLanguage(language);
  if (id === "xml" || id === "html") return tokenizeMarkup(code);
  if (id) return tokenizeWithProfile(code, profileFor(id));
  if (language) {
    const custom = getRegisteredHighlightLanguage(language);
    if (custom) return highlightWithProfile(code, custom);
  }
  return [{ kind: "plain", text: code }];
}

export function isHighlightableLanguage(language?: string): boolean {
  if (normalizeLanguage(language) != null) return true;
  if (!language) return false;
  return getRegisteredHighlightLanguage(language) != null;
}
