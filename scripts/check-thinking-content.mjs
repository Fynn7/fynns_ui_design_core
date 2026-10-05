/** Enforce quiet thinking composition in core examples and consumer source. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const forbidden = new Set(["Collapsible", "LazyCollapsible", "Card", "Surface", "Button", "IconButton", "Tabs", "Tab", "ChatActivity", "ChatActivityStep", "Timeline", "TimelineItem", "ControlStack", "ControlRow", "button", "input", "select"]);

/** Follows same-file JSX helpers/variables, including imported component aliases.
 * It does not claim to resolve helpers imported from other files or dynamic CSS.
 * Structured ChatThinking.details enforces the safe shape across those boundaries. */
export function checkThinkingSource(text, filename = "sample.tsx") {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const aliases = new Map();
  const definitions = new Map();
  const violations = new Set();
  function collect(node) {
    if (ts.isImportSpecifier(node)) aliases.set(node.name.text, node.propertyName?.text ?? node.name.text);
    if (ts.isFunctionDeclaration(node) && node.name) definitions.set(node.name.text, node);
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) definitions.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  }
  collect(source);
  const name = tag => { const raw = tag.getText(source).split(".").at(-1); return aliases.get(raw) ?? raw; };
  function inspect(node, seen) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = name(node.tagName);
      if (forbidden.has(tag)) violations.add(tag);
    }
    if (ts.isIdentifier(node)) {
      const target = definitions.get(node.text);
      if (target && !seen.has(target)) { seen.add(target); inspect(target, seen); }
    }
    ts.forEachChild(node, child => inspect(child, seen));
  }
  function visit(node) {
    if (ts.isJsxElement(node) && name(node.openingElement.tagName) === "ChatThinking") {
      for (const child of node.children) inspect(child, new Set());
      const children = node.openingElement.attributes.properties.filter(prop => ts.isJsxAttribute(prop) && ["children", "details", "icon"].includes(prop.name.getText(source)));
      for (const child of children) inspect(child, new Set());
    }
    if (ts.isJsxSelfClosingElement(node) && name(node.tagName) === "ChatThinking") {
      const children = node.attributes.properties.filter(prop => ts.isJsxAttribute(prop) && ["children", "details", "icon"].includes(prop.name.getText(source)));
      for (const child of children) inspect(child, new Set());
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return [...violations];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const core = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const targets = process.argv.slice(2);
  if (!targets.length) targets.push(path.join(core, "examples/sandbox/src"));
  const files = [];
  function walk(target) {
    if (fs.statSync(target).isDirectory()) {
      if (["node_modules", ".git", "dist", ".tmp"].includes(path.basename(target))) return;
      for (const entry of fs.readdirSync(target)) walk(path.join(target, entry));
    } else if (/\.tsx$/.test(target) && !/\.test\.tsx$/.test(target)) files.push(target);
  }
  for (const target of targets) walk(path.resolve(target));
  let failed = false;
  for (const file of files) {
    const violations = checkThinkingSource(fs.readFileSync(file, "utf8"), file);
    if (violations.length) { failed = true; console.error(file + ": forbidden inside ChatThinking: " + violations.join(", ")); }
  }
  if (failed) process.exitCode = 1;
  else console.log("check-thinking-content: ok (" + files.length + " files)");
}
