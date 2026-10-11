#!/usr/bin/env node
/** Static, same-file workspace contract. Geometry and dynamic/localized copy
 * still require the sandbox browser recipe. Does not execute consumer code. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

function compiler(target = process.cwd()) {
  for (const base of [import.meta.url, path.join(path.resolve(target), "package.json")]) {
    try { return createRequire(base)("typescript"); } catch { /* try consumer tooling */ }
  }
  throw new Error("Workspace UI gate needs TypeScript tooling in core or the consumer. Install typescript as a devDependency and retry.");
}

export function checkWorkspaceSource(text, filename = "sample.tsx", ts = compiler()) {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true,
    /\.jsx$/.test(filename) ? ts.ScriptKind.JSX : ts.ScriptKind.TSX);
  const aliases = new Map();
  const definitions = new Map();
  const errors = [];
  const visitAll = (node, fn) => { fn(node); ts.forEachChild(node, child => visitAll(child, fn)); };
  visitAll(source, node => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === "@fynns/ui") {
      for (const spec of node.importClause?.namedBindings?.elements ?? []) {
        aliases.set(spec.name.text, spec.propertyName?.text ?? spec.name.text);
      }
      if (node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
        aliases.set(node.importClause.namedBindings.name.text, "@fynns/ui");
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) definitions.set(node.name.text, node.initializer);
    if (ts.isFunctionDeclaration(node) && node.name) definitions.set(node.name.text, node);
  });
  const opening = node => ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  const tag = node => {
    const raw = opening(node)?.tagName.getText(source) ?? "";
    const parts = raw.split(".");
    return aliases.get(raw) ?? (aliases.get(parts[0]) === "@fynns/ui" ? parts.at(-1) : raw);
  };
  const props = node => opening(node)?.attributes.properties ?? [];
  const attribute = (node, key) => props(node).find(prop => ts.isJsxAttribute(prop) && prop.name.getText(source) === key);
  const value = (node, key) => {
    const init = attribute(node, key)?.initializer;
    if (init && ts.isStringLiteral(init)) return init.text;
    const expr = init && ts.isJsxExpression(init) ? init.expression : null;
    const literal = expr && ts.isIdentifier(expr) ? definitions.get(expr.text) : expr;
    return literal && ts.isStringLiteralLike(literal) ? literal.text : undefined;
  };
  const children = node => ts.isJsxElement(node) ? node.children : [];
  const visibleText = node => children(node).some(child => {
    if (ts.isJsxText(child)) return !!child.text.trim();
    if (!ts.isJsxExpression(child) || !child.expression) return false;
    let containsJsx = false;
    expanded(child.expression, item => { if (opening(item)) containsJsx = true; });
    return !containsJsx;
  });
  const expanded = (node, fn, seen = new Set()) => {
    if (!node || seen.has(node)) return;
    seen.add(node);
    fn(node);
    if (ts.isIdentifier(node) && definitions.has(node.text)) expanded(definitions.get(node.text), fn, seen);
    if (opening(node) && definitions.has(tag(node))) expanded(definitions.get(tag(node)), fn, seen);
    ts.forEachChild(node, child => expanded(child, fn, seen));
  };
  const icons = node => {
    const names = new Set();
    for (const child of children(node)) expanded(child, item => { if (tag(item).endsWith("Icon")) names.add(tag(item)); });
    return names;
  };
  const report = (node, rule, message) => errors.push({
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, rule, message,
  });
  const isRow = node => tag(node) === "Toolbar" || /\bfynns-control-cluster\b/.test(value(node, "className") ?? "");
  const upper = text => {
    const label = text.trim();
    // A standalone short initialism is ambiguous without domain knowledge.
    // Leave it for copy review rather than blocking a consumer's dev server.
    if (/^[A-Z]{1,3}$/.test(label)) return false;
    return /^[A-Z][A-Z\s/_-]{2,}$/.test(label) && /[A-Z]{3}/.test(label);
  };
  const inherited = (node, name) => {
    for (let parent = node.parent; parent; parent = parent.parent) if (tag(parent) === name) return true;
    return false;
  };
  const hasClass = (node, name) => (value(node, "className") ?? "").split(/\s+/).includes(name);
  // Inspect rendered children, never handlers or menu/dialog slots. Alternatives
  // are mutually exclusive, so count their maximum rather than their sum.
  const toolbarCount = (node, root, seen = new Set()) => {
    if (!node || seen.has(node)) return 0;
    const branch = new Set(seen).add(node);
    if (ts.isIdentifier(node) && definitions.has(node.text)) return toolbarCount(definitions.get(node.text), root, branch);
    if (ts.isConditionalExpression(node)) return Math.max(
      toolbarCount(node.whenTrue, root, branch), toolbarCount(node.whenFalse, root, branch));
    if (ts.isBinaryExpression(node)) {
      if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return toolbarCount(node.right, root, branch);
      if ([ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) return Math.max(
        toolbarCount(node.left, root, branch), toolbarCount(node.right, root, branch));
    }
    const name = tag(node);
    if (["EndAside", "EndAsidePane", "NavigationDrawer", "TopAppBar", "DropdownMenu", "ContextMenu", "Dialog"].includes(name)) return 0;
    if (node !== root && hasClass(node, "fynns-workspace-canvas")) return 0;
    if (name === "Toolbar") return 1;
    if (opening(node) && definitions.has(name)) return toolbarCount(definitions.get(name), root, branch);
    if (opening(node)) return children(node).reduce((total, child) => total + toolbarCount(child, root, branch), 0);
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      const returns = [];
      if (node.body && !ts.isBlock(node.body)) return toolbarCount(node.body, root, branch);
      function collect(item) {
        if (ts.isReturnStatement(item)) returns.push(item.expression);
        else if (!ts.isFunctionLike(item)) ts.forEachChild(item, collect);
      }
      if (node.body) ts.forEachChild(node.body, collect);
      return Math.max(0, ...returns.map(item => toolbarCount(item, root, branch)));
    }
    let count = 0;
    ts.forEachChild(node, child => { count += toolbarCount(child, root, branch); });
    return count;
  };
  visitAll(source, node => {
    if (!opening(node)) return;
    const kind = tag(node);
    if (hasClass(node, "fynns-workspace-canvas") && toolbarCount(node, node) > 1) {
      report(node, "canvas-single-toolbar", "A canvas has only one floating editing Toolbar. Move document mode/layout/export commands into one top-bar ghost icon DropdownMenu, not a second toolbar.");
    }
    let canvasShell = false;
    if (kind === "ClippedNavShell") for (const child of children(node)) expanded(child, item => { if (hasClass(item, "fynns-workspace-canvas")) canvasShell = true; });
    if ((hasClass(node, "fynns-workspace-panes") || canvasShell) && toolbarCount(node, node)) {
      report(node, "workspace-command-menu", "Workspace panes contain the canvas and EndAside in one full-height row. Move standalone document toolbars into a top-bar menu so the inspector begins directly below TopAppBar.");
    }
    if (kind === "Toolbar") {
      let canvasTools = /^(canvas (tools|toolbar)|画布工具(栏)?)$/i.test(value(node, "aria-label") ?? "");
      for (let parent = node.parent; parent && !canvasTools; parent = parent.parent) {
        canvasTools = /\bfynns-workspace-(tools|canvas)\b/.test(value(parent, "className") ?? "");
      }
      if (canvasTools && value(node, "variant") === "docked") {
        report(node, "canvas-tools-floating", "Canvas tools must use floating Toolbar in fynns-workspace-tools with 16dp clearance, never a flush rounded docked row.");
      }
    }
    if (isRow(node)) {
      let primary = 0;
      // Descend through wrappers and same-file helpers, but not event handlers,
      // nested action rows or unrelated slots such as a menu's item content.
      function count(item, seen = new Set()) {
        if (!item || seen.has(item)) return;
        seen.add(item);
        if (item !== node && isRow(item)) return;
        if (ts.isIdentifier(item) && definitions.has(item.text)) return count(definitions.get(item.text), seen);
        const name = tag(item);
        if (name === "Button" || name === "IconButton" || name === "DropdownMenu") {
          const variant = value(item, "variant") ?? (attribute(item, "variant") ? undefined : name === "Button" ? "primary" : "ghost");
          if (variant === "primary") primary++;
          return;
        }
        if (opening(item) && definitions.has(name)) return count(definitions.get(name), seen);
        if (opening(item)) { for (const child of children(item)) count(child, seen); }
        else ts.forEachChild(item, child => count(child, seen));
      }
      count(node);
      if (primary > 1) report(node, "action-emphasis", "One action row may have at most one primary; routine inspector actions use horizontal ghost icons or tonal/ghost labeled actions.");
    }
    if (["Button", "IconButton"].includes(kind)) {
      const glyphs = icons(node);
      const chrome = ["PanelLeftIcon", "PanelRightIcon", "HomeIcon"].some(icon => glyphs.has(icon)) ||
        (glyphs.has("ArrowLeftIcon") && inherited(node, "TopAppBar"));
      if (chrome && (kind !== "IconButton" || (value(node, "variant") ?? "ghost") !== "ghost" || visibleText(node))) {
        report(node, "chrome-icon", "Sidebar/Home/Back chrome must be a ghost IconButton with only its glyph, Tooltip and aria-label. Toggle one shared state.");
      }
      const label = children(node).map(child => child.getText(source)).join(" ");
      if (kind === "Button" && /\bcancel\b|取消/i.test(label) && value(node, "variant") !== "ghost") {
        report(node, "cancel-ghost", "Cancel must explicitly use variant=ghost; the confirm action is the only primary at the right of Dialog.feet.");
      }
    }
    if (kind === "InlineAlert") {
      const embedded = new Set();
      for (const child of children(node)) expanded(child, item => {
        if (["Button", "IconButton"].includes(tag(item))) embedded.add(tag(item));
      });
      const message = attribute(node, "message");
      if (message) expanded(message, item => { if (["Button", "IconButton"].includes(tag(item))) embedded.add(tag(item)); });
      if (embedded.size) report(node, "inline-dismiss", "InlineAlert message contains controls. Use onDismiss + dismissAriaLabel for the built-in ghost X; errors default to snackbar.");
      const style = attribute(node, "style")?.getText(source) ?? "";
      if (/width\s*:\s*["']100%["']|alignItems\s*:\s*["']flex-start["']/.test(style)) report(node, "inline-geometry", "Preserve InlineAlert content width and cross-axis center; do not override core geometry.");
    }
    if (!["CodeBlock", "ChatMarkdown", "pre", "code"].some(name => kind === name || inherited(node, name))) {
      for (const child of children(node)) {
        if (ts.isJsxText(child) && upper(child.text)) report(child, "natural-case", "Visible chrome must use natural sentence case, never all-cap headings or labels.");
      }
      for (const key of ["title", "label", "headline", "trigger", "message"]) {
        const text = value(node, key);
        if (text && upper(text)) report(node, "natural-case", "Visible chrome must use natural sentence case, never all-cap headings or labels.");
      }
    }
  });
  return errors;
}

export function checkWorkspaceFiles(files, target) {
  const jsx = files.filter(file => /\.[jt]sx$/.test(file) && !/\.(test|spec)\.[jt]sx$/.test(file));
  if (!jsx.length) return [];
  const ts = compiler(target);
  return jsx.flatMap(file => checkWorkspaceSource(fs.readFileSync(file, "utf8"), file, ts).map(error => ({ file, ...error })));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targets = process.argv.slice(2);
  if (!targets.length) targets.push("examples/sandbox/src/components/WorkspaceChromeDemo.tsx", "examples/sandbox/src/components/CanvasWorkspaceDemo.tsx");
  const files = [];
  function walk(target) {
    if (fs.statSync(target).isDirectory()) {
      if (["node_modules", ".git", "dist", "build", "coverage", "test-results", "playwright-report"].includes(path.basename(target))) return;
      for (const child of fs.readdirSync(target)) walk(path.join(target, child));
    } else if (/\.[jt]sx$/.test(target)) files.push(target);
  }
  try {
    targets.forEach(target => walk(path.resolve(target)));
    const errors = checkWorkspaceFiles(files, process.cwd());
    for (const error of errors) console.error(`${error.file}:${error.line} [${error.rule}] ${error.message}`);
    if (errors.length) process.exitCode = 1;
    else console.log(`check-workspace-ui: ok (${files.length} files; dynamic copy and geometry still need browser verification)`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
