#!/usr/bin/env node
/**
 * On-demand API surface for `@fynns/ui` — print only what an agent needs
 * instead of reading whole source files (src/index.ts 16 KB, GlobalsPage 300 KB,
 * tokens.ts 88 KB). Built for small local models with ~32k context.
 *
 * Usage (from the core checkout, or via node_modules/@fynn7/ui-design-core):
 *   node scripts/api.mjs --list                 public symbols grouped by source file
 *   node scripts/api.mjs Card ListItem Button   props / signatures (JSDoc stripped)
 *   node scripts/api.mjs --doc Card             keep JSDoc comments
 *   node scripts/api.mjs --search "Nav|Drawer"  find public symbols by regex
 *   node scripts/api.mjs --tokens color-        --fynns-* token names matching a regex
 *   node scripts/api.mjs --tokens radius --values   … with values
 *
 * Zero deps. Read-only. Output stays small on purpose (each symbol ≈ 100–400 tokens).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BARREL = path.join(ROOT, "src", "index.ts");
const THEME_CSS = path.join(ROOT, "src", "theme", "theme.css");
const MAX_REF_LINES = 40;

function usage() {
  return `Usage:
  node scripts/api.mjs --list
  node scripts/api.mjs [--doc] <Symbol> [<Symbol> ...]
  node scripts/api.mjs --search <regex>
  node scripts/api.mjs --tokens <regex> [--values]
Symbols are the public names exported from "@fynns/ui" (see --list).`;
}

// ---------------------------------------------------------------------------
// Barrel index: symbol -> { file, kind }
// ---------------------------------------------------------------------------

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function resolveModule(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const cand of [base + ".ts", base + ".tsx", path.join(base, "index.ts"), base]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand;
  }
  return null;
}

/** Names declared with `export` directly in a file (for `export *` re-exports). */
function declaredExports(file) {
  const text = readText(file);
  const out = new Map();
  const re =
    /^export\s+(?:declare\s+)?(const|let|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(text))) {
    out.set(m[2], m[1] === "type" || m[1] === "interface" ? "type" : "value");
  }
  return out;
}

function buildIndex() {
  const text = readText(BARREL);
  const index = new Map();
  const braceRe = /export\s+(type\s+)?\{([^}]*)\}\s+from\s+"([^"]+)"/g;
  let m;
  while ((m = braceRe.exec(text))) {
    const isType = Boolean(m[1]);
    const file = resolveModule(BARREL, m[3]);
    if (!file) continue;
    for (const raw of m[2].split(",")) {
      const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop();
      if (!name) continue;
      index.set(name, { file, kind: isType ? "type" : "value" });
    }
  }
  const starRe = /export\s+\*\s+from\s+"([^"]+)"/g;
  while ((m = starRe.exec(text))) {
    const file = resolveModule(BARREL, m[1]);
    if (!file) continue;
    for (const [name, kind] of declaredExports(file)) {
      if (!index.has(name)) index.set(name, { file, kind });
    }
  }
  return index;
}

// ---------------------------------------------------------------------------
// Declaration extraction
// ---------------------------------------------------------------------------

/** Scan from `start` to the end of a statement (`;` at depth 0) or a balanced `{}` body. */
function scanStatement(text, start, { stopAtBody = false } = {}) {
  let i = start;
  let depth = 0;
  let sawBrace = false;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === "/" && next === "/") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(text, i);
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") {
      depth++;
      if (ch === "{") sawBrace = true;
    } else if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      if (depth === 0 && stopAtBody && sawBrace && ch === "}") return i + 1;
    } else if (ch === ";" && depth === 0) {
      return i + 1;
    } else if (ch === "\n" && depth === 0 && !stopAtBody) {
      // statement without trailing semicolon: end at a blank line or next export
      const rest = text.slice(i + 1);
      if (/^\s*\n/.test(rest) || /^export\s/.test(rest)) return i;
    }
    i++;
  }
  return text.length;
}

function skipString(text, i) {
  const quote = text[i];
  i++;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    if (quote === "`" && ch === "$" && text[i + 1] === "{") {
      // template expression — balance braces
      let d = 0;
      while (i < text.length) {
        if (text[i] === "{") d++;
        else if (text[i] === "}") {
          d--;
          if (d === 0) break;
        }
        i++;
      }
    }
    i++;
  }
  return i;
}

/** Find `[export] type|interface Name` in a file and return its full text. */
function findTypeDecl(text, name) {
  const re = new RegExp(`^(?:export\\s+)?(type|interface)\\s+${escapeRe(name)}\\b`, "m");
  const m = re.exec(text);
  if (!m) return null;
  const start = m.index;
  const end =
    m[1] === "interface"
      ? scanStatement(text, start, { stopAtBody: true })
      : scanStatement(text, start);
  return text.slice(start, end).trimEnd();
}

/** Find a value declaration (function / const) and return a short signature. */
function findValueDecl(text, name) {
  const fnRe = new RegExp(
    `^export\\s+(?:async\\s+)?function\\s+${escapeRe(name)}\\s*[<(]`,
    "m",
  );
  const fm = fnRe.exec(text);
  if (fm) {
    // signature up to the opening `{` of the body
    let i = fm.index;
    let depth = 0;
    while (i < text.length) {
      const ch = text[i];
      if (ch === "(" || ch === "<" || ch === "[") depth++;
      else if (ch === ")" || ch === ">" || ch === "]") depth--;
      else if (ch === "{" && depth <= 0) break;
      i++;
    }
    return text.slice(fm.index, i).trim().replace(/\s+/g, " ");
  }
  const constRe = new RegExp(`^export\\s+const\\s+${escapeRe(name)}\\b[^\\n]*`, "m");
  const cm = constRe.exec(text);
  if (cm) return cm[0].trim();
  const classRe = new RegExp(`^export\\s+class\\s+${escapeRe(name)}\\b[^\\n]*`, "m");
  const km = classRe.exec(text);
  if (km) return km[0].trim();
  return null;
}

/** JSDoc block immediately preceding a declaration (for --doc). */
function leadingDoc(text, name) {
  // a single JSDoc block (no inner `*/`) directly followed by the declaration
  const re = new RegExp(
    `(/\\*\\*(?:(?!\\*/)[\\s\\S])*\\*/)\\s*\\nexport\\s+(?:const|function|type|interface)\\s+${escapeRe(name)}\\b`,
  );
  const m = re.exec(text);
  return m ? m[1] : null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    if (ch === "/" && next === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const end = skipString(src, i);
      out += src.slice(i, end);
      i = end;
      continue;
    }
    out += ch;
    i++;
  }
  return out
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() !== "")
    .join("\n");
}

/** Local imported type names → file (one level, relative imports only). */
function importedTypes(file, text) {
  const map = new Map();
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"(\.[^"]+)"/g;
  let m;
  while ((m = re.exec(text))) {
    const target = resolveModule(file, m[2]);
    if (!target) continue;
    for (const raw of m[1].split(",")) {
      const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      if (name) map.set(name, target);
    }
  }
  return map;
}

/** Collect referenced type names that are declared locally / imported (depth 1). */
function referencedTypes(decl, file, text, self) {
  const names = new Set();
  const identRe = /\b([A-Z][A-Za-z0-9_]*)\b/g;
  const imports = importedTypes(file, text);
  let m;
  while ((m = identRe.exec(decl))) {
    const n = m[1];
    if (n === self || names.has(n)) continue;
    if (/^(React|ReactNode|ReactElement|HTML[A-Za-z]*Element|CSSProperties|Ref|RefObject|MutableRefObject|Element|Event|KeyboardEvent|MouseEvent|PointerEvent|FocusEvent|ChangeEvent|FormEvent|Promise|Record|Partial|Pick|Omit|Readonly|Array|Map|Set|Date|Error|AbortSignal|ComponentProps|ComponentPropsWithoutRef|ComponentPropsWithRef|PropsWithChildren|Dispatch|SetStateAction|MutableRef|ElementType|JSX|ForwardedRef|SyntheticEvent|InputHTMLAttributes|ButtonHTMLAttributes|TextareaHTMLAttributes|HTMLAttributes|AriaAttributes|DOMAttributes|Node|Window|Document|String|Number|Boolean|Symbol|Function|Object|Exclude|Extract|NonNullable|ReturnType|Parameters|Required|Iterable|Generator|Intl|TouchEvent|WheelEvent|DragEvent|UIEvent|AnimationEvent|TransitionEvent|ClipboardEvent|CompositionEvent|ResizeObserver|IntersectionObserver|MutationObserver|Text|Comment|DocumentFragment|Range|Selection|URL|Blob|File|FileList|DataTransfer)$/.test(n))
      continue;
    if (findTypeDecl(text, n) || imports.has(n)) names.add(n);
  }
  return [...names].map((n) => ({ name: n, file: findTypeDecl(text, n) ? file : imports.get(n) }));
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdList(index) {
  const byFile = new Map();
  for (const [name, { file, kind }] of index) {
    if (!byFile.has(file)) byFile.set(file, { values: [], types: [] });
    byFile.get(file)[kind === "type" ? "types" : "values"].push(name);
  }
  const files = [...byFile.keys()].sort((a, b) => rel(a).localeCompare(rel(b)));
  const lines = [];
  for (const file of files) {
    const { values, types } = byFile.get(file);
    const v = values.length ? values.join(", ") : "";
    const t = types.length ? ` | types: ${types.join(", ")}` : "";
    lines.push(`${rel(file)}: ${v}${t}`);
  }
  lines.push("");
  lines.push(`${index.size} public symbols. Props: node scripts/api.mjs <Name> …`);
  return lines.join("\n");
}

function cmdSearch(index, pattern) {
  const re = new RegExp(pattern, "i");
  const hits = [...index.entries()].filter(([name]) => re.test(name));
  if (!hits.length) return `No public symbol matches /${pattern}/i.`;
  return hits
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, { file, kind }]) => `${name}${kind === "type" ? " (type)" : ""}  ← ${rel(file)}`)
    .join("\n");
}

function cmdSymbols(index, names, { doc }) {
  const blocks = [];
  const printed = new Set();
  for (const name of names) {
    const entry = index.get(name);
    if (!entry) {
      const near = cmdSearch(index, escapeRe(name.slice(0, 4)));
      blocks.push(`✗ "${name}" is not a public @fynns/ui export.\n  Similar:\n${indent(near)}`);
      continue;
    }
    const text = readText(entry.file);
    const parts = [`## ${name}  (${rel(entry.file)})`];
    const queue = [];
    if (entry.kind === "value") {
      const sig = findValueDecl(text, name);
      if (doc) {
        const d = leadingDoc(text, name);
        if (d) parts.push(d);
      }
      const propsName = `${name}Props`;
      if (sig) {
        parts.push(sig.length > 400 ? sig.slice(0, 400) + " …" : sig);
        // `export const x: SomeFn = …` — surface the annotated (non-props) type too
        for (const ref of referencedTypes(sig, entry.file, text, name)) {
          if (ref.name === propsName) continue; // handled below with its own references
          const rd = findTypeDecl(text, ref.name);
          if (rd && !printed.has(ref.name)) {
            printed.add(ref.name);
            parts.push(doc ? rd : stripComments(rd));
          }
        }
      }
      const propsDecl = findTypeDecl(text, propsName);
      if (propsDecl) {
        queue.push({ name: propsName, decl: propsDecl, file: entry.file, text });
      } else {
        // props may live in another file via barrel; fall back to barrel index
        const propsEntry = index.get(propsName);
        if (propsEntry) {
          const t2 = readText(propsEntry.file);
          const d2 = findTypeDecl(t2, propsName);
          if (d2) queue.push({ name: propsName, decl: d2, file: propsEntry.file, text: t2 });
        }
      }
    } else {
      const decl = findTypeDecl(text, name);
      if (decl) queue.push({ name, decl, file: entry.file, text });
      else parts.push(`(type declaration not found in ${rel(entry.file)})`);
    }
    // print queued declarations + one level of referenced local types
    for (const item of queue) {
      if (printed.has(item.name)) continue;
      printed.add(item.name);
      parts.push(doc ? item.decl : stripComments(item.decl));
      for (const ref of referencedTypes(item.decl, item.file, item.text, item.name)) {
        if (printed.has(ref.name) || !ref.file) continue;
        const rt = readText(ref.file);
        const rd = findTypeDecl(rt, ref.name);
        if (!rd) continue;
        printed.add(ref.name);
        const body = doc ? rd : stripComments(rd);
        const lines = body.split("\n");
        parts.push(
          lines.length > MAX_REF_LINES
            ? `${lines.slice(0, MAX_REF_LINES).join("\n")}\n  … (${lines.length - MAX_REF_LINES} more lines — Read ${rel(ref.file)})`
            : body,
        );
      }
    }
    blocks.push(parts.join("\n"));
  }
  blocks.push(
    "Usage notes / live demos: rg \"<" + names[0] + "\\b\" examples/sandbox/src --glob \"*.tsx\" -m 3   (never Read GlobalsPage.tsx whole)",
  );
  return blocks.join("\n\n");
}

function cmdTokens(pattern, withValues) {
  if (!fs.existsSync(THEME_CSS)) return `theme.css not found (${rel(THEME_CSS)}); run npm run gen:theme`;
  const css = readText(THEME_CSS);
  const rootEnd = css.indexOf("\n}", css.indexOf(":root"));
  const scope = rootEnd > 0 ? css.slice(0, rootEnd) : css;
  const re = /(--fynns-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(scope))) if (!seen.has(m[1])) seen.set(m[1], m[2].trim());
  const filter = new RegExp(pattern || ".", "i");
  const hits = [...seen.entries()].filter(([n]) => filter.test(n));
  if (!hits.length) return `No --fynns-* token matches /${pattern}/i.`;
  const lines = withValues
    ? hits.map(([n, v]) => `${n}: ${v}`)
    : hits.map(([n]) => n);
  lines.push("", `${hits.length}/${seen.size} tokens. Use as var(--fynns-…); never hardcode hex/px.`);
  return lines.join("\n");
}

function indent(s) {
  return s
    .split("\n")
    .map((l) => "  " + l)
    .join("\n");
}

// ---------------------------------------------------------------------------

function main(argv) {
  const opts = { list: false, search: null, tokens: null, values: false, doc: false, names: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return console.log(usage());
    else if (a === "--list") opts.list = true;
    else if (a === "--doc") opts.doc = true;
    else if (a === "--values") opts.values = true;
    else if (a === "--search") opts.search = argv[++i] ?? "";
    else if (a === "--tokens") opts.tokens = argv[++i] ?? "";
    else if (a.startsWith("-")) {
      console.error(`Unknown option ${a}\n${usage()}`);
      process.exit(2);
    } else opts.names.push(a);
  }
  if (opts.tokens !== null) return console.log(cmdTokens(opts.tokens, opts.values));
  const index = buildIndex();
  if (opts.list) return console.log(cmdList(index));
  if (opts.search !== null) return console.log(cmdSearch(index, opts.search));
  if (!opts.names.length) return console.log(usage());
  console.log(cmdSymbols(index, opts.names, { doc: opts.doc }));
}

main(process.argv.slice(2));
