/**
 * Guard: labeled DropdownMenu trigger chevron stays in a trailing flex slot
 * with block SVG (no inline baseline “歪”; no missing chevron).
 * Slug: labeled DropdownMenu missing chevron / Menu chevron optically high.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(root, "src/primitives/css/overlays.css");
const tsxPath = path.join(root, "src/primitives/DropdownMenu.tsx");
const iconsPath = path.join(root, "src/primitives/icons.tsx");
const actionsCss = path.join(root, "src/primitives/css/actions.css");

const css = fs.readFileSync(cssPath, "utf8");
const tsx = fs.readFileSync(tsxPath, "utf8");
const icons = fs.readFileSync(iconsPath, "utf8");
const actions = fs.readFileSync(actionsCss, "utf8");

function fail(msg) {
  console.error(`check:menu-trigger-chevron: ${msg}`);
  process.exit(1);
}

if (!/\.fynns-icon\s*\{[^}]*display:\s*block/is.test(actions)) {
  fail("missing .fynns-icon { display: block } in actions.css (icons.tsx root).");
}
if (!/className:\s*\[["']fynns-icon["']/.test(icons)) {
  fail("icons.tsx svgProps must default className to include fynns-icon.");
}
if (!/fynns-menu-trigger-trailing/.test(tsx)) {
  fail("DropdownMenu labeled trigger must wrap chevron in .fynns-menu-trigger-trailing.");
}
if (!/ChevronDownIcon/.test(tsx)) {
  fail("DropdownMenu must inject ChevronDownIcon on labeled triggers.");
}

const trailing = css.match(
  /\.fynns-menu-trigger-trailing\s*\{[^}]+\}/s,
);
if (!trailing) {
  fail("missing .fynns-menu-trigger-trailing rule in overlays.css.");
}
if (!/display:\s*inline-flex/i.test(trailing[0])) {
  fail(".fynns-menu-trigger-trailing must be inline-flex (Select-slot recipe).");
}
if (!/align-items:\s*center/i.test(trailing[0])) {
  fail(".fynns-menu-trigger-trailing must align-items: center.");
}

if (!/line-height:\s*var\(--fynns-line-height-snug\)/.test(css)) {
  fail(
    ".fynns-menu-trigger-label must use --fynns-line-height-snug (line-height:1 clips descenders).",
  );
}
if (/\.fynns-menu-trigger-label\s*\{[^}]*line-height:\s*1(?:\s|;|})/s.test(css)) {
  fail(".fynns-menu-trigger-label must not set line-height: 1.");
}

const labelRule = css.match(/\.fynns-menu-trigger-label\s*\{[^}]+\}/s);
if (!labelRule) {
  fail("missing .fynns-menu-trigger-label rule in overlays.css.");
}
if (!/display:\s*inline-flex/i.test(labelRule[0])) {
  fail(
    ".fynns-menu-trigger-label must be inline-flex (leading glyph + label center ≥ 0.5.258).",
  );
}
if (!/align-items:\s*center/i.test(labelRule[0])) {
  fail(".fynns-menu-trigger-label must align-items: center.");
}
if (!/fynns-menu-trigger-leading/.test(tsx)) {
  fail("DropdownMenu must render .fynns-menu-trigger-leading for leadingIcon.");
}
if (!/leadingIcon/.test(tsx)) {
  fail("DropdownMenu must accept leadingIcon prop (≥ 0.5.258).");
}

const leading = css.match(/\.fynns-menu-trigger-leading\s*\{[^}]+\}/s);
if (!leading) {
  fail("missing .fynns-menu-trigger-leading rule in overlays.css.");
}
if (!/display:\s*inline-flex/i.test(leading[0])) {
  fail(".fynns-menu-trigger-leading must be inline-flex.");
}
if (!/align-items:\s*center/i.test(leading[0])) {
  fail(".fynns-menu-trigger-leading must align-items: center.");
}
if (!/width:\s*var\(--fynns-size-icon\)/i.test(leading[0])) {
  fail(".fynns-menu-trigger-leading must size to --fynns-size-icon (16dp).");
}

/* iconOnly path must not render the labeled leading/trailing chrome. */
const iconOnlyBranch = tsx.match(
  /iconOnly\s*\?\s*\([\s\S]*?\)\s*:\s*\([\s\S]*?fynns-menu-trigger-label[\s\S]*?\)/,
);
if (!iconOnlyBranch) {
  fail(
    "DropdownMenu must keep labeled trigger (with leading/label) on the non-iconOnly branch only.",
  );
}
if (/fynns-menu-trigger-leading/.test(iconOnlyBranch[0].split(") : (")[0] ?? "")) {
  fail("iconOnly branch must not render .fynns-menu-trigger-leading.");
}

const chromePath = path.join(root, "src/primitives/css/chrome.css");
const chrome = fs.readFileSync(chromePath, "utf8");
if (
  /\.fynns-menu-trigger-label\s*>\s*\.fynns-overflow-tip[^{]*\{[^}]*(?<![-\w])width:\s*0/s.test(
    chrome,
  )
) {
  fail(
    ".fynns-menu-trigger-label > OverflowTip must not use width:0 (collapses content-sized toolbar labels).",
  );
}

console.log(
  "check:menu-trigger-chevron: ok (fynns-icon + trailing/leading slots + flex label + ChevronDown + snug LH)",
);
