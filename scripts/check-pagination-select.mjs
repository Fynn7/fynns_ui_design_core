/**
 * Guard: Pagination rows-per-page Select must stay stock Keep-set Select.
 * Fail if absolute upward overlay CSS is reintroduced under .fynns-pagination-bar.
 * Slug: Pagination Select invents absolute overlay (≥ 0.5.194).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(root, "src/primitives/css/content.css");
const css = fs.readFileSync(cssPath, "utf8");

const start = css.indexOf(".fynns-pagination-bar");
if (start < 0) {
  console.error("check:pagination-select: missing .fynns-pagination-bar in content.css");
  process.exit(1);
}
// Slice until next major section after pagination (SkipLink / or next ----------)
const slice = css.slice(start, start + 8000);
const banned = [
  /pagination-bar__start\s*>\s*\.fynns-select\s*>\s*\.fynns-search-bar-panel\s*\{[^}]*position:\s*absolute/is,
  /pagination-bar__start\s*>\s*\.fynns-select\s*>\s*\.fynns-search-bar-panel\s*\{[^}]*bottom:\s*100%/is,
];
for (const re of banned) {
  if (re.test(slice)) {
    console.error(
      "check:pagination-select: FORBIDDEN absolute upward overlay CSS under .fynns-pagination-bar (use stock #select joined capsule).",
    );
    process.exit(1);
  }
}
console.log("check:pagination-select: ok (no absolute overlay)");
