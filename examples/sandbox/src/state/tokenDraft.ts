/**
 * Structured token operations shared by the property inspector and the
 * (future) Agent bridge. Both are equal clients of the draft store.
 */

export type TokenGroup =
  | "radius"
  | "color"
  | "elevation"
  | "stateLayer"
  | "spacing"
  | "typography"
  | "shadow";

export type TokenScope = "global" | "card-elevated" | "card-filled" | "card-outlined";

export type TokenSource = "drag" | "colorwheel" | "preset" | "agent" | "slider" | "reset";

export type TokenOperation = {
  ts: number;
  group: TokenGroup;
  key: string;
  from: string;
  to: string;
  scope: TokenScope;
  source: TokenSource;
  /** Optional Agent reasoning shown in the confirmation UI. */
  reasoning?: string;
};

/** Flat override key: CSS custom property name, e.g. `--fynns-radius-md`. */
export type TokenDraft = {
  baseTokensHash: string;
  overrides: Record<string, string>;
  history: TokenOperation[];
  /** Index into history for undo/redo (points at last applied op). */
  historyIndex: number;
};

export const DRAFT_STORAGE_KEY = "fynns-sandbox-draft";

export function emptyDraft(baseTokensHash: string): TokenDraft {
  return {
    baseTokensHash,
    overrides: {},
    history: [],
    historyIndex: -1,
  };
}

/** Map a structured op onto the CSS variable name it mutates. */
export function cssVarForOp(group: TokenGroup, key: string): string {
  switch (group) {
    case "radius":
      return `--fynns-radius-${key}`;
    case "color":
      return `--fynns-color-${key}`;
    case "stateLayer":
      return `--fynns-state-${key}`;
    case "spacing":
      return `--fynns-space-${key}`;
    case "typography":
      return `--fynns-font-size-${key}`;
    case "shadow":
      return `--fynns-shadow-${key}`;
    case "elevation":
      // Elevation is a lookup; sandbox edits the underlying surface/shadow vars.
      return key.startsWith("--") ? key : `--fynns-color-${key}`;
    default:
      return `--fynns-${key}`;
  }
}

/** Build a `:root { ... }` override block for live injection. */
export function buildOverrideStyleBlock(overrides: Record<string, string>): string {
  const lines = Object.entries(overrides).map(([name, value]) => `  ${name}: ${value};`);
  if (lines.length === 0) return "";
  return `:root {\n${lines.join("\n")}\n}`;
}
