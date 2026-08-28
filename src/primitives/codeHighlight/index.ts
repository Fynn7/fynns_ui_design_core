export type {
  CodeLanguageId,
  CodeSegment,
  CodeTokenKind,
  LangProfile,
} from "./types";
export type { SimpleHighlightProfile } from "./simple";
export { normalizeLanguage, profileFor } from "./languages";
export { tokenizeMarkdown } from "./markdown";
export { tokenizeMarkup } from "./markup";
export { highlightCode, isHighlightableLanguage } from "./tokenize";
export {
  highlightWithProfile,
  registerHighlightLanguage,
  unregisterHighlightLanguage,
  getRegisteredHighlightLanguage,
} from "./simple";
export { codeLanguageFromPath } from "./fromPath";
