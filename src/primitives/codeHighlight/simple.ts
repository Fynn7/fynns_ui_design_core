import type { CodeSegment, CodeTokenKind } from "./types";

/**
 * Line-command dialect for app-owned languages (Raycaster `.gsc` shape).
 * Maps to `--fynns-code-*` via {@link highlightWithProfile}.
 */
export type SimpleHighlightProfile = {
  /** Control words (`if` / `else` / …) → `keyword`. */
  keywords: readonly string[];
  /** Line-head commands (`setvolume` / …) → `function`. */
  commands: readonly string[];
  /** Defaults to `true` / `false`. */
  constants?: readonly string[];
  /** `#` to end of line is a comment. @default true */
  hashComment?: boolean;
  /** `$name` / `${…}` → `variable`. @default true */
  dollarVariables?: boolean;
};

type ResolvedSimple = {
  keywords: ReadonlySet<string>;
  commands: ReadonlySet<string>;
  constants: ReadonlySet<string>;
  hashComment: boolean;
  dollarVariables: boolean;
};

function push(out: CodeSegment[], kind: CodeTokenKind, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
    return;
  }
  out.push({ kind, text });
}

function resolveProfile(profile: SimpleHighlightProfile): ResolvedSimple {
  return {
    keywords: new Set(profile.keywords),
    commands: new Set(profile.commands),
    constants: new Set(profile.constants ?? ["true", "false"]),
    hashComment: profile.hashComment !== false,
    dollarVariables: profile.dollarVariables !== false,
  };
}

function matchIdent(line: string, pos: number): number | null {
  if (pos >= line.length || !/[A-Za-z_]/.test(line[pos]!)) return null;
  let end = pos + 1;
  while (end < line.length && /[A-Za-z0-9_]/.test(line[end]!)) end += 1;
  return end;
}

function tokenizeOneSpan(
  line: string,
  start: number,
  profile: ResolvedSimple,
  out: CodeSegment[],
): number {
  const i = start;
  const len = line.length;

  if (profile.dollarVariables) {
    if (line.startsWith("${", i)) {
      let j = i + 2;
      while (j < len && line[j] !== "}" && line[j] !== "\n") j += 1;
      if (j < len && line[j] === "}") j += 1;
      push(out, "variable", line.slice(i, j));
      return j;
    }
    if (line[i] === "$" && i + 1 < len && /[A-Za-z_]/.test(line[i + 1]!)) {
      let j = i + 2;
      while (j < len && /[A-Za-z0-9_]/.test(line[j]!)) j += 1;
      push(out, "variable", line.slice(i, j));
      return j;
    }
  }

  const numberMatch = line.slice(i).match(/^-?\d+(?:\.\d+)?/);
  if (numberMatch) {
    push(out, "number", numberMatch[0]);
    return i + numberMatch[0].length;
  }

  const operatorMatch = line.slice(i).match(/^[<>=!]+/);
  if (operatorMatch) {
    push(out, "operator", operatorMatch[0]);
    return i + operatorMatch[0].length;
  }

  const identEnd = matchIdent(line, i);
  if (identEnd != null) {
    const word = line.slice(i, identEnd);
    if (profile.constants.has(word)) {
      push(out, "constant", word);
    } else {
      push(out, "parameter", word);
    }
    return identEnd;
  }

  let j = i;
  while (j < len && !/\s/.test(line[j]!) && line[j] !== "#") j += 1;
  if (j > i) {
    push(out, "parameter", line.slice(i, j));
    return j;
  }

  push(out, "plain", line[i]!);
  return i + 1;
}

function tokenizeArgs(
  line: string,
  start: number,
  profile: ResolvedSimple,
  out: CodeSegment[],
): void {
  let i = start;
  const len = line.length;
  while (i < len) {
    if (line[i] === " " || line[i] === "\t") {
      let j = i + 1;
      while (j < len && (line[j] === " " || line[j] === "\t")) j += 1;
      push(out, "plain", line.slice(i, j));
      i = j;
      continue;
    }
    if (profile.hashComment && line[i] === "#") {
      push(out, "comment", line.slice(i));
      return;
    }
    i = tokenizeOneSpan(line, i, profile, out);
  }
}

function tokenizeSimpleLine(
  line: string,
  profile: ResolvedSimple,
  out: CodeSegment[],
): void {
  let i = 0;
  const len = line.length;

  if (i < len && (line[i] === " " || line[i] === "\t")) {
    let j = i + 1;
    while (j < len && (line[j] === " " || line[j] === "\t")) j += 1;
    push(out, "plain", line.slice(i, j));
    i = j;
  }

  if (i >= len) return;

  if (profile.hashComment && line[i] === "#") {
    push(out, "comment", line.slice(i));
    return;
  }

  const headEnd = matchIdent(line, i);
  if (headEnd != null) {
    const word = line.slice(i, headEnd);
    if (profile.commands.has(word)) {
      push(out, "function", word);
    } else if (profile.keywords.has(word)) {
      push(out, "keyword", word);
    } else if (profile.constants.has(word)) {
      push(out, "constant", word);
    } else {
      push(out, "invalid", word);
    }
    tokenizeArgs(line, headEnd, profile, out);
    return;
  }

  tokenizeArgs(line, i, profile, out);
}

/**
 * Tokenize with a {@link SimpleHighlightProfile} (line-command / `.gsc` shape).
 */
export function highlightWithProfile(
  code: string,
  profile: SimpleHighlightProfile,
): CodeSegment[] {
  const resolved = resolveProfile(profile);
  const out: CodeSegment[] = [];
  let start = 0;
  while (start <= code.length) {
    const nl = code.indexOf("\n", start);
    const end = nl === -1 ? code.length : nl;
    tokenizeSimpleLine(code.slice(start, end), resolved, out);
    if (nl === -1) break;
    push(out, "plain", "\n");
    start = nl + 1;
  }
  return out;
}

const registry = new Map<string, SimpleHighlightProfile>();

function normalizeId(id: string): string {
  return id.trim().toLowerCase();
}

/** Register a consumer language id for `CodeBlock` / `highlightCode`. */
export function registerHighlightLanguage(
  id: string,
  profile: SimpleHighlightProfile,
): void {
  const key = normalizeId(id);
  if (!key) return;
  registry.set(key, profile);
}

/** Remove a previously registered language id. */
export function unregisterHighlightLanguage(id: string): void {
  registry.delete(normalizeId(id));
}

/** Lookup a registered profile (or `undefined`). */
export function getRegisteredHighlightLanguage(
  id: string,
): SimpleHighlightProfile | undefined {
  return registry.get(normalizeId(id));
}

/** @internal — tests / reset. */
export function clearRegisteredHighlightLanguages(): void {
  registry.clear();
}
