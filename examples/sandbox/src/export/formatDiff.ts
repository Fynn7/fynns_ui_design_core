import { BASELINE } from "../state/baseline";

/** Human-readable override diff for code review. */
export function formatOverrideDiff(overrides: Record<string, string>): string {
  const keys = Object.keys(overrides).sort();
  if (keys.length === 0) {
    return "# No overrides — draft matches tokens.ts baseline.\n";
  }
  const lines = [
    "# fynns sandbox · token override draft",
    "# Paste into tokens.ts after visual review, then run: npm run gen:theme",
    "#",
  ];
  for (const key of keys) {
    const next = overrides[key];
    const prev = BASELINE[key] ?? "(unset)";
    lines.push(`# ${key}`);
    lines.push(`#   was: ${prev}`);
    lines.push(`${key}: ${next};`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Unified-diff style patch for the `:root` CSS vars (not a git apply for .ts).
 * Useful for sharing / reviewing aesthetic decisions.
 */
export function formatCssPatch(overrides: Record<string, string>): string {
  const keys = Object.keys(overrides).sort();
  if (keys.length === 0) return "";
  const lines = ["--- a/src/theme/theme.css (:root overrides)", "+++ b/src/theme/theme.css (:root overrides)"];
  for (const key of keys) {
    const prev = BASELINE[key];
    const next = overrides[key];
    if (prev != null) lines.push(`-  ${key}: ${prev};`);
    lines.push(`+  ${key}: ${next};`);
  }
  return `${lines.join("\n")}\n`;
}

/** Suggest tokens.ts table edits from CSS var overrides (best-effort). */
export function formatTokensTsHints(overrides: Record<string, string>): string {
  const keys = Object.keys(overrides).sort();
  if (keys.length === 0) return "";
  const lines = [
    "// Suggested tokens.ts edits (manual paste — AST writeback is Phase 3+)",
    "",
  ];
  for (const key of keys) {
    const match = key.match(/^--fynns(?:-([a-z0-9-]+))?-([a-z0-9-]+)$/);
    if (!match) {
      lines.push(`// ${key}: ${overrides[key]}`);
      continue;
    }
    const group = match[1] ?? "misc";
    const tokenKey = match[2];
    const table =
      group === "radius"
        ? "RADIUS_TOKENS"
        : group === "color"
          ? "COLOR_TOKENS"
          : group === "state"
            ? "STATE_LAYER_TOKENS"
            : group === "space"
              ? "SPACE_TOKENS"
              : group === "shadow"
                ? "SHADOW_TOKENS"
                : group === "font-size"
                  ? "FONT_SIZE_TOKENS"
                  : `/* group ${group} */`;
    lines.push(`// ${table}["${tokenKey}"] = "${overrides[key]}";  // was ${BASELINE[key] ?? "?"}`);
  }
  return `${lines.join("\n")}\n`;
}
