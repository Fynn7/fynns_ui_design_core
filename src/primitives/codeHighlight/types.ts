/** Semantic roles for CodeBlock spans (fynns-code token classes). */
export type CodeTokenKind =
  | "plain"
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "type"
  | "function"
  | "variable"
  | "property"
  | "parameter"
  | "operator"
  | "module"
  | "constant"
  | "constant-named"
  | "escape"
  | "invalid";

export type CodeSegment = {
  kind: CodeTokenKind;
  text: string;
};

export type CodeLanguageId =
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "py"
  | "python"
  | "cpp"
  | "css"
  | "json"
  | "bash"
  | "sh"
  | "shell";

export type LangProfile = {
  keywords: ReadonlySet<string>;
  types: ReadonlySet<string>;
  constants: ReadonlySet<string>;
  /** Namespace / module names (`std`, …) → `module`. */
  modules?: ReadonlySet<string>;
  lineComment: string | null;
  blockComment: readonly [string, string] | null;
  /** When true, hash starts a line comment (Python / bash). */
  hashComment?: boolean;
  /** When true, `#directive` is colored as a keyword (C / C++). */
  preprocessor?: boolean;
  /**
   * When true, `from` / `import` paths are `module` and imported names
   * default to `function` (Python).
   */
  importAware?: boolean;
};
