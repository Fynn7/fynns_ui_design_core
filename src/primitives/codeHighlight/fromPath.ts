/**
 * Map a filename / path to a CodeBlock `language` id when the body should use
 * `CodeBlock` (not `Textarea`).
 *
 * - **`.txt` / `.text`** → `null` (plain-note Textarea is OK).
 * - **No extension** → `null`.
 * - **Known suffixes** (`.md`, `.xml`, `.py`, `.ts`, …) → matching built-in or
 *   plain-mono id (unknown ids still render mono — host stays CodeBlock).
 * - **Any other suffix** → the bare extension (still prefer CodeBlock).
 *
 * Does **not** replace passing `language` on CodeBlock — callers should use
 * the return value as `language` when non-null. See AGENTS.md Content density
 * + `llm/CONSUMER_TREATY.md` (Textarea for suffixed file bodies).
 */
const TEXTAREA_EXTENSIONS = new Set(["txt", "text"]);

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
  xml: "xml",
  html: "html",
  htm: "html",
  json: "json",
  jsonc: "json",
  ts: "ts",
  tsx: "tsx",
  mts: "ts",
  cts: "ts",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  py: "py",
  pyw: "py",
  css: "css",
  scss: "css",
  less: "css",
  bash: "bash",
  sh: "sh",
  zsh: "bash",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "cpp",
  h: "cpp",
  hpp: "cpp",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  ini: "ini",
  conf: "conf",
  gsc: "gsc",
};

function basename(pathOrName: string): string {
  const normalized = pathOrName.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  return slash >= 0 ? normalized.slice(slash + 1) : normalized;
}

export function codeLanguageFromPath(pathOrName: string): string | null {
  const name = basename(pathOrName.trim());
  if (!name) return null;
  const dot = name.lastIndexOf(".");
  // Leading-dot files (`.env`) and extensionless names → Textarea OK.
  if (dot <= 0 || dot === name.length - 1) return null;
  const ext = name.slice(dot + 1).toLowerCase();
  if (TEXTAREA_EXTENSIONS.has(ext)) return null;
  return EXTENSION_TO_LANGUAGE[ext] ?? ext;
}
