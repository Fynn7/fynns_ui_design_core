import type { CodeLanguageId, LangProfile } from "./types";

const JS_KEYWORDS = [
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "type",
  "namespace",
  "declare",
  "readonly",
  "abstract",
  "satisfies",
  "infer",
  "keyof",
  "asserts",
  "is",
] as const;

const JS_TYPES = [
  "string",
  "number",
  "boolean",
  "any",
  "unknown",
  "never",
  "object",
  "symbol",
  "bigint",
  "undefined",
  "Array",
  "Record",
  "Promise",
  "Map",
  "Set",
  "Date",
  "Error",
  "ReactNode",
] as const;

const JS_CONSTANTS = ["true", "false", "null", "undefined", "NaN", "Infinity"] as const;

const PY_KEYWORDS = [
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
  "match",
  "case",
] as const;

const PY_TYPES = [
  "str",
  "int",
  "float",
  "bool",
  "list",
  "dict",
  "tuple",
  "set",
  "bytes",
  "None",
  "Any",
  "Optional",
  "List",
  "Dict",
  "Tuple",
] as const;

const PY_CONSTANTS = ["True", "False", "None"] as const;

const CSS_KEYWORDS = [
  "important",
  "and",
  "or",
  "not",
  "only",
  "from",
  "to",
  /* CSS functions (var/calc/rgb/…) stay out of keywords so `name(` → function. */
] as const;

const BASH_KEYWORDS = [
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "while",
  "do",
  "done",
  "case",
  "esac",
  "function",
  "in",
  "select",
  "until",
  "time",
  "coproc",
  "export",
  "local",
  "readonly",
  "declare",
  "typeset",
  "return",
  "exit",
  "break",
  "continue",
] as const;

const CPP_KEYWORDS = [
  "alignas",
  "alignof",
  "and",
  "and_eq",
  "asm",
  "auto",
  "bitand",
  "bitor",
  "bool",
  "break",
  "case",
  "catch",
  "char",
  "char8_t",
  "char16_t",
  "char32_t",
  "class",
  "compl",
  "concept",
  "const",
  "consteval",
  "constexpr",
  "constinit",
  "const_cast",
  "continue",
  "co_await",
  "co_return",
  "co_yield",
  "decltype",
  "default",
  "delete",
  "do",
  "double",
  "dynamic_cast",
  "else",
  "enum",
  "explicit",
  "export",
  "extern",
  "false",
  "float",
  "for",
  "friend",
  "goto",
  "if",
  "inline",
  "int",
  "long",
  "mutable",
  "namespace",
  "new",
  "noexcept",
  "not",
  "not_eq",
  "nullptr",
  "operator",
  "or",
  "or_eq",
  "private",
  "protected",
  "public",
  "register",
  "reinterpret_cast",
  "requires",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "static_assert",
  "static_cast",
  "struct",
  "switch",
  "template",
  "this",
  "thread_local",
  "throw",
  "true",
  "try",
  "typedef",
  "typeid",
  "typename",
  "union",
  "unsigned",
  "using",
  "virtual",
  "void",
  "volatile",
  "wchar_t",
  "while",
  "xor",
  "xor_eq",
] as const;

const CPP_TYPES = [
  "string",
  "wstring",
  "u8string",
  "vector",
  "array",
  "map",
  "unordered_map",
  "set",
  "unordered_set",
  "optional",
  "variant",
  "pair",
  "tuple",
  "unique_ptr",
  "shared_ptr",
  "weak_ptr",
  "size_t",
  "ptrdiff_t",
  "int8_t",
  "int16_t",
  "int32_t",
  "int64_t",
  "uint8_t",
  "uint16_t",
  "uint32_t",
  "uint64_t",
  "iostream",
  "ostream",
  "istream",
] as const;

const CPP_CONSTANTS = ["true", "false", "nullptr", "NULL"] as const;

const CPP_MODULES = ["std"] as const;

function setOf(words: readonly string[]): ReadonlySet<string> {
  return new Set(words);
}

const JS_PROFILE: LangProfile = {
  keywords: setOf(JS_KEYWORDS),
  types: setOf(JS_TYPES),
  constants: setOf(JS_CONSTANTS),
  lineComment: "//",
  blockComment: ["/*", "*/"],
};

const PY_PROFILE: LangProfile = {
  keywords: setOf(PY_KEYWORDS),
  types: setOf(PY_TYPES),
  constants: setOf(PY_CONSTANTS),
  lineComment: null,
  blockComment: null,
  hashComment: true,
  importAware: true,
};

const CSS_PROFILE: LangProfile = {
  keywords: setOf(CSS_KEYWORDS),
  types: setOf([]),
  constants: setOf(["true", "false", "null", "inherit", "initial", "unset", "none"]),
  lineComment: null,
  blockComment: ["/*", "*/"],
};

const JSON_PROFILE: LangProfile = {
  keywords: setOf([]),
  types: setOf([]),
  constants: setOf(["true", "false", "null"]),
  lineComment: null,
  blockComment: null,
};

const MARKUP_PROFILE: LangProfile = {
  keywords: setOf([]),
  types: setOf([]),
  constants: setOf([]),
  lineComment: null,
  blockComment: null,
};

const BASH_PROFILE: LangProfile = {
  keywords: setOf(BASH_KEYWORDS),
  types: setOf([]),
  constants: setOf([]),
  lineComment: null,
  blockComment: null,
  hashComment: true,
};

const CPP_PROFILE: LangProfile = {
  keywords: setOf(CPP_KEYWORDS),
  types: setOf(CPP_TYPES),
  constants: setOf(CPP_CONSTANTS),
  modules: setOf(CPP_MODULES),
  lineComment: "//",
  blockComment: ["/*", "*/"],
  preprocessor: true,
};

const ALIASES: Record<string, CodeLanguageId> = {
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  js: "js",
  javascript: "js",
  jsx: "jsx",
  py: "py",
  python: "py",
  cpp: "cpp",
  "c++": "cpp",
  cxx: "cpp",
  cc: "cpp",
  c: "cpp",
  css: "css",
  json: "json",
  xml: "xml",
  html: "html",
  htm: "html",
  bash: "bash",
  sh: "sh",
  shell: "shell",
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
};

export function normalizeLanguage(language?: string): CodeLanguageId | null {
  if (!language) return null;
  const key = language.trim().toLowerCase();
  return ALIASES[key] ?? null;
}

export function profileFor(language: CodeLanguageId): LangProfile {
  switch (language) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return JS_PROFILE;
    case "py":
    case "python":
      return PY_PROFILE;
    case "cpp":
      return CPP_PROFILE;
    case "css":
      return CSS_PROFILE;
    case "json":
      return JSON_PROFILE;
    case "xml":
    case "html":
      /* Markup uses tokenizeMarkup in highlightCode — profile unused. */
      return MARKUP_PROFILE;
    case "bash":
    case "sh":
    case "shell":
      return BASH_PROFILE;
    case "markdown":
    case "md":
      return MARKUP_PROFILE;
    default:
      return JS_PROFILE;
  }
}
