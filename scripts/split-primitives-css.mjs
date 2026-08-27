/**
 * Split src/primitives/primitives.css into domain files under
 * src/primitives/css/, then rewrite the barrel as @import list.
 *
 * Idempotent: if primitives.css already starts with @import ./css/, exits.
 * Run: node scripts/split-primitives-css.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcCss = path.join(root, "src/primitives/primitives.css");
const outDir = path.join(root, "src/primitives/css");

/** Exact section title → domain file stem. */
const SECTION_DOMAIN = {
  "Motion keyframes": "motion",
  Button: "actions",
  "Split button (M3 Expressive: leading + trailing menu)": "actions",
  "FAB (M3 floating action)": "actions",
  "FAB menu (M3 Expressive)": "actions",
  Input: "fields",
  "NumberInput (spinbutton + trailing steppers)": "fields",
  "Select (SearchBar chrome + docked results; no SearchIcon)": "fields",
  "Autocomplete (Select chrome + filterable input)": "fields",
  "Switch (dense track / thumb; no handle icon; no md size)": "fields",
  Slider: "fields",
  "Checkbox / Radio (M3 selection)": "fields",
  "Chip (M3 assist / filter / input)": "fields",
  OtpInput: "fields",
  "FieldHeader / FieldBlock (label | trailing IconButtons)": "fields",
  "FieldStack (related FieldBlock / ControlBlock cluster)": "fields",
  "ControlBlock (control unit + supporting hint)": "form-rhythm",
  ControlStack: "form-rhythm",
  ControlRow: "form-rhythm",
  Grid: "form-rhythm",
  "Tabs (M3 primary underline; not ToggleGroup)": "form-rhythm",
  "ToggleGroup (M3 Segmented button)": "form-rhythm",
  "Unit stack (generic sibling units; not ControlBlock)": "form-rhythm",
  Dialog: "overlays",
  "CommandPalette (Cursor Actions / ⌘K)": "overlays",
  "Side drawer (content inspector, not NavigationDrawer)": "overlays",
  "Bottom sheet (M3)": "overlays",
  DropdownMenu: "overlays",
  "Tooltip / InfoHint": "overlays",
  Toast: "overlays",
  "Snackbar (M3)": "overlays",
  "BusyScrim / BusyRegion (M3 scrim + progress + message)": "overlays",
  DiffView: "content",
  "Collapsible / Card (shared shell)": "content",
  Breadcrumb: "content",
  Pagination: "content",
  "Progress (M3 linear / circular)": "content",
  Loading: "content",
  "Avatar (M3)": "content",
  "List / ListItem (M3 content list)": "content",
  "BadgedBox / AvatarGroup": "content",
  EmptyState: "content",
  SkipLink: "content",
  Stepper: "content",
  Dropzone: "content",
  Table: "content",
  CodeBlock: "content",
  "Surface (generic bordered / tonal well)": "content",
  "InlineAlert (in-panel severity; not chrome Banner)": "content",
  "Banner (M3 full-width strip)": "content",
  "Divider (M3)": "content",
  "TopAppBar (M3 top app bar)": "chrome",
  "NavigationRail (M3 anatomy)": "chrome",
  "NavigationBar (M3 bottom destinations)": "chrome",
  "NavigationDrawer (M3 destination side sheet)": "chrome",
  "BottomAppBar (M3 bottom app bar, densified)": "chrome",
  "StatusBar (IDE status strip — Cursor / VS Code)": "chrome",
  "Tree (hierarchical file / settings explorer)": "chrome",
  "Toolbar (M3 Expressive docked / floating)": "chrome",
  "SearchBar (M3 elevated search)": "chrome",
  "ClippedNavShell (full-bleed top bar + nav | main)": "chrome",
  "DestinationAppShell (declarative chrome body)": "chrome",
  "EndAside (width-morph supporting pane)": "chrome",
  "SplitPane (in-content resizable two panes)": "chrome",
  ChatMessage: "chat",
  "ChatThinking — single-block reasoning disclosure": "chat",
  "ChatActivity (Wave 2 status tree)": "chat",
  "Chat citations / source chips": "chat",
  "Chat shell": "chat",
};

const DOMAIN_ORDER = [
  "motion",
  "actions",
  "fields",
  "form-rhythm",
  "overlays",
  "content",
  "chrome",
  "chat",
];

function main() {
  const text = fs.readFileSync(srcCss, "utf8");
  if (text.trimStart().startsWith("@import") && text.includes("./css/")) {
    console.log("primitives.css already an @import barrel — skip");
    return;
  }

  const lines = text.split(/\r?\n/);
  /** @type {{ title: string | null, start: number, end: number }[]} */
  const chunks = [];
  let cur = { title: null, start: 0, end: 0 };

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\/\* -{5,} (.+?) -{5,} \*\/\s*$/);
    if (m) {
      cur.end = i;
      if (cur.end > cur.start || cur.title !== null) chunks.push({ ...cur });
      cur = { title: m[1].trim(), start: i, end: i };
    }
  }
  cur.end = lines.length;
  chunks.push(cur);

  /** @type {Map<string, string[]>} */
  const byDomain = new Map(DOMAIN_ORDER.map((d) => [d, []]));
  const unknown = [];

  for (const ch of chunks) {
    const body = lines.slice(ch.start, ch.end);
    if (ch.title == null) {
      byDomain.get("motion").push(...body);
      continue;
    }
    const domain = SECTION_DOMAIN[ch.title];
    if (!domain) {
      unknown.push(ch.title);
      byDomain.get("content").push(...body);
      continue;
    }
    byDomain.get(domain).push(...body);
  }

  if (unknown.length) {
    console.warn("Unmapped sections (parked in content):", unknown.join(", "));
    process.exitCode = 1;
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const d of DOMAIN_ORDER) {
    const parts = byDomain.get(d);
    const file = path.join(outDir, `${d}.css`);
    const header = `/* Domain: ${d} — extracted from primitives.css */\n`;
    const content = parts.join("\n").replace(/\n+$/, "") + "\n";
    fs.writeFileSync(file, header + content, "utf8");
    console.log(`wrote ${path.relative(root, file)} (${content.split("\n").length} lines)`);
  }

  const barrel =
    `/*\n` +
    ` * Keep-set primitive styles. Domain files live under ./css/ — edit there;\n` +
    ` * this barrel only @imports (order matters for cascade).\n` +
    ` * Regenerate domains: node scripts/split-primitives-css.mjs (from a monolith).\n` +
    ` */\n` +
    DOMAIN_ORDER.map((d) => `@import "./css/${d}.css";`).join("\n") +
    "\n";
  fs.writeFileSync(srcCss, barrel, "utf8");
  console.log("rewrote primitives.css as @import barrel");
}

main();
