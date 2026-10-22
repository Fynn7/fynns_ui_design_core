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
  // Alert content must not include controls. Event handlers and other JSX slots
  // are not rendered content, even if they happen to construct JSX.
  const rendered = (node, fn, seen = new Set()) => {
    if (!node || seen.has(node)) return;
    seen.add(node);
    fn(node);
    if (ts.isIdentifier(node) && definitions.has(node.text)) return rendered(definitions.get(node.text), fn, seen);
    if (opening(node)) {
      if (definitions.has(tag(node))) rendered(definitions.get(tag(node)), fn, seen);
      for (const child of children(node)) rendered(child, fn, seen);
      return;
    }
    if (ts.isFunctionLike(node)) {
      if (node.body && !ts.isBlock(node.body)) rendered(node.body, fn, seen);
      else {
        const returns = item => {
          if (ts.isReturnStatement(item)) rendered(item.expression, fn, seen);
          else if (!ts.isFunctionLike(item)) ts.forEachChild(item, returns);
        };
        if (node.body) ts.forEachChild(node.body, returns);
      }
      return;
    }
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && definitions.has(node.expression.text)) rendered(definitions.get(node.expression.text), fn, seen);
      // Array render callbacks are part of the output; handler attributes were
      // already excluded by the JSX branch above.
      if (ts.isPropertyAccessExpression(node.expression) && ["map", "flatMap"].includes(node.expression.name.text)) {
        for (const arg of node.arguments) if (ts.isFunctionLike(arg) || ts.isIdentifier(arg)) rendered(arg, fn, seen);
      }
      return;
    }
    if (ts.isPropertyAccessExpression(node)) return;
    ts.forEachChild(node, child => rendered(child, fn, seen));
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
    // Conventional metric/hardware names are data labels, not decorative copy.
    // Keep this vocabulary explicit: accepting arbitrary uppercase words would
    // also accept SETTINGS, and a length threshold misses TTFT and VRAM.
    const technical = new Set(["TTFT", "GPU", "VRAM", "CPU", "RAM"]);
    if (label.split(/\s*\/\s*/).every(part => technical.has(part))) return false;
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
      const primary = [];
      const stable = item => ts.isIdentifier(item) ||
        (ts.isPropertyAccessExpression(item) && stable(item.expression));
      const unwrap = item => {
        while (ts.isParenthesizedExpression(item)) item = item.expression;
        return item;
      };
      const guardKey = item => {
        // Identically named parameters in separate helpers are not one state.
        let scope = item.parent;
        while (scope && !ts.isFunctionLike(scope)) scope = scope.parent;
        return `${scope?.getStart(source) ?? "module"}:${item.getText(source)}`;
      };
      const guard = (condition, truth, guards) => {
        condition = unwrap(condition);
        const next = new Map(guards);
        if (stable(condition)) next.set(guardKey(condition), JSON.stringify(truth));
        else if (truth && ts.isBinaryExpression(condition) &&
          condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) {
          let key = unwrap(condition.left), literal = unwrap(condition.right);
          if (!stable(key)) [key, literal] = [literal, key];
          if (stable(key) && (ts.isStringLiteral(literal) || ts.isNumericLiteral(literal) ||
              [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(literal.kind))) {
            const literalValue = ts.isStringLiteral(literal) ? JSON.stringify(literal.text)
              : ts.isNumericLiteral(literal) ? String(Number(literal.text)) : literal.getText(source);
            next.set(guardKey(key), literalValue);
          }
        }
        return next;
      };
      // Descend through wrappers and same-file helpers, but not event handlers,
      // nested action rows or unrelated slots such as a menu's item content.
      function count(item, seen = new Set(), guards = new Map()) {
        if (!item || seen.has(item)) return;
        seen = new Set(seen).add(item);
        if (item !== node && isRow(item)) return;
        if (ts.isIdentifier(item) && definitions.has(item.text)) return count(definitions.get(item.text), seen, guards);
        if (ts.isConditionalExpression(item)) {
          // Even a dynamic condition picks only one side of this ternary.
          const branchKey = `branch:${item.getStart(source)}`;
          count(item.whenTrue, seen, new Map(guard(item.condition, true, guards)).set(branchKey, true));
          count(item.whenFalse, seen, new Map(guard(item.condition, false, guards)).set(branchKey, false));
          return;
        }
        if (ts.isBinaryExpression(item) && item.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
          count(item.right, seen, guard(item.left, true, guards));
          return;
        }
        const name = tag(item);
        if (name === "Button" || name === "IconButton" || name === "DropdownMenu") {
          const variant = value(item, "variant") ?? (attribute(item, "variant") ? undefined : name === "Button" ? "primary" : "ghost");
          if (variant === "primary") primary.push(guards);
          return;
        }
        if (opening(item) && definitions.has(name)) return count(definitions.get(name), seen, guards);
        if (opening(item)) { for (const child of children(item)) count(child, seen, guards); }
        else ts.forEachChild(item, child => count(child, seen, guards));
      }
      count(node);
      const competing = primary.some((left, index) => primary.slice(index + 1).some(right =>
        ![...left].some(([key, constraint]) => right.has(key) && right.get(key) !== constraint)));
      if (competing) report(node, "action-emphasis", "One action row may have at most one primary; routine inspector actions use horizontal ghost icons or tonal/ghost labeled actions.");
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
      for (const child of children(node)) rendered(child, item => {
        if (opening(item) && !["span", "strong", "em", "b", "i", "small", "code", "s", "u", "mark", "sub", "sup"].includes(tag(item))) embedded.add(tag(item));
      });
      for (const key of ["message", "children"]) {
        const content = attribute(node, key);
        if (content) rendered(content.initializer, item => { if (opening(item) && !["span", "strong", "em", "b", "i", "small", "code", "s", "u", "mark", "sub", "sup"].includes(tag(item))) embedded.add(tag(item)); });
      }
      if (embedded.size) report(node, "inline-dismiss", "InlineAlert accepts phrasing text only; never embed components, disclosure, lists or controls. Use SectionNotice for in-flow details/actions; onDismiss + dismissAriaLabel for plain dismissal; sibling fynns-control-cluster for existing recovery (canvas: WorkspaceNoticeStack). Transient errors default to snackbar.");
      const style = attribute(node, "style")?.getText(source) ?? "";
      if (/width\s*:\s*["']100%["']|alignItems\s*:\s*["']flex-start["']/.test(style)) report(node, "inline-geometry", "Preserve InlineAlert content width and cross-axis center; do not override core geometry.");
    }
    if (!["CodeBlock", "ChatMarkdown", "pre", "code"].some(name => kind === name || inherited(node, name))) {
      for (const child of children(node)) {
        if (ts.isJsxText(child) && upper(child.text)) report(child, "natural-case", "Visible chrome must use natural sentence case, never all-cap headings or labels.");
      }
      for (const key of ["title", "label", "headline", "trigger", "message"]) {
        const text = value(node, key);
        // Preserve the exact casing of a machine field identifier. This exception
        // is limited to labels wired to their actual input, never headings.
        const fieldId = value(node, "htmlFor");
        let linkedInput = false;
        if (key === "label" && kind === "FieldBlock" && fieldId && /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(text ?? "")) {
          for (const child of children(node)) expanded(child, item => {
            if (["Input", "Textarea"].includes(tag(item)) && value(item, "id") === fieldId) linkedInput = true;
          });
        }
        if (linkedInput) continue;
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

/** Conservative source migration. Never runs during a read-only gate. Only
 * literal Cancel variants, text wrappers and unconditional retry rows are safe here;
 * arbitrary render functions/slots/dismiss handlers require a human edit. */
export function fixWorkspaceSource(text, filename = "sample.tsx", ts = compiler()) {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true,
    /\.jsx$/.test(filename) ? ts.ScriptKind.JSX : ts.ScriptKind.TSX);
  if (source.parseDiagnostics.length) return { source: text, rules: [] };
  const aliases = new Map();
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== "@fynns/ui") continue;
    for (const spec of node.importClause?.namedBindings?.elements ?? []) aliases.set(spec.name.text, spec.propertyName?.text ?? spec.name.text);
    if (node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) aliases.set(node.importClause.namedBindings.name.text, "@fynns/ui");
  }
  const opening = node => ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  const tag = node => {
    const raw = opening(node)?.tagName.getText(source) ?? "";
    const parts = raw.split(".");
    return aliases.get(raw) ?? (aliases.get(parts[0]) === "@fynns/ui" ? parts.at(-1) : undefined);
  };
  const attribute = (node, name) => opening(node)?.attributes.properties.find(prop => ts.isJsxAttribute(prop) && prop.name.getText(source) === name);
  const spread = node => opening(node)?.attributes.properties.some(ts.isJsxSpreadAttribute);
  const children = node => ts.isJsxElement(node) ? node.children : [];
  const meaningful = node => children(node).filter(child => !ts.isJsxText(child) || child.text.trim());
  const edits = [];
  const violations = checkWorkspaceSource(text, filename, ts);
  const violates = (node, rule) => violations.some(error => error.rule === rule && error.line === source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1);
  const add = (start, end, replacement, rule) => {
    const candidate = text.slice(0, start) + replacement + text.slice(end);
    if (rule === "inline-dismiss" && checkWorkspaceSource(candidate, filename, ts).filter(error => error.rule === rule).length >=
      violations.filter(error => error.rule === rule).length) return false;
    edits.push({ start, end, replacement, rule });
    return true;
  };
  const retry = node => tag(node) === "Button" && !spread(node) && children(node).some(child =>
    /\b(retry|refresh|recover|reload)\b|重试|重新加载|恢复|刷新/i.test(child.getText(source)));
  const containsControl = node => {
    if (["Button", "IconButton"].includes(tag(node))) return true;
    let found = false;
    ts.forEachChild(node, child => { if (containsControl(child)) found = true; });
    return found;
  };
  const textOnly = node => {
    if (ts.isJsxText(node)) return true;
    if (ts.isJsxExpression(node)) {
      let jsx = false;
      const scan = item => {
        if (opening(item) || ts.isJsxFragment(item)) jsx = true;
        ts.forEachChild(item, scan);
      };
      ts.forEachChild(node, scan);
      return !jsx;
    }
    if (!ts.isJsxElement(node)) return false;
    const name = node.openingElement.tagName.getText(source);
    const attrs = node.openingElement.attributes.properties;
    const cls = attribute(node, "className")?.initializer;
    const bareWrapper = name === "div" && (!attrs.length ||
      (attrs.length === 1 && cls && ts.isStringLiteral(cls) && cls.text === "fynns-unit-stack"));
    // Several block children encode paragraph boundaries; flattening them can
    // concatenate copy and silently lose layout semantics.
    if (bareWrapper && meaningful(node).length !== 1) return false;
    return (bareWrapper || ["span", "strong", "em", "b", "i", "small", "code", "s", "u", "mark", "sub", "sup"].includes(name)) &&
      children(node).every(textOnly);
  };
  const unwrapText = node => {
    if (!ts.isJsxElement(node)) return node.getText(source);
    const content = children(node).map(unwrapText).join("");
    if (node.openingElement.tagName.getText(source) === "div") return content;
    return node.openingElement.getText(source) + content + node.closingElement.getText(source);
  };
  function visit(node) {
    if (tag(node) === "InlineAlert" && ts.isJsxElement(node) && !spread(node) && !attribute(node, "message") && !attribute(node, "children") && violates(node, "inline-dismiss")) {
      let container = node;
      const only = meaningful(node);
      if (only.length === 1 && ts.isJsxElement(only[0]) && only[0].openingElement.tagName.getText(source) === "div") {
        const wrapper = only[0];
        const cls = attribute(wrapper, "className")?.initializer;
        if (!wrapper.openingElement.attributes.properties.length ||
            (wrapper.openingElement.attributes.properties.length === 1 && cls && ts.isStringLiteral(cls) && cls.text === "fynns-unit-stack")) container = wrapper;
      }
      const content = meaningful(container);
      const buttons = content.filter(retry);
      const rest = content.filter(child => !buttons.includes(child));
      if (!buttons.length && meaningful(node).length === 1 && children(node).every(textOnly)) {
        const replacement = node.openingElement.getText(source) + children(node).map(unwrapText).join("") + node.closingElement.getText(source);
        if (add(node.getStart(source), node.end, replacement, "inline-dismiss")) return;
      }
      if (buttons.length && rest.length === 1 && rest.every(textOnly) && !rest.some(containsControl)) {
        const start = node.getStart(source);
        const indent = text.slice(text.lastIndexOf("\n", start - 1) + 1, start).match(/^\s*/)[0];
        const eol = text.includes("\r\n") ? "\r\n" : "\n";
        const shift = (fragment, from, to) => fragment.split(/\r?\n/).map((line, index) =>
          index === 0 ? line : to + (line.startsWith(from) ? line.slice(from.length) : line)).join(eol);
        let alert = text.slice(start, node.end);
        const removals = [];
        const unwrap = item => {
          if (buttons.includes(item)) return;
          if (ts.isJsxElement(item) && item.openingElement.tagName.getText(source) === "div") {
            const attrs = item.openingElement.attributes.properties;
            const cls = attribute(item, "className")?.initializer;
            if (!attrs.length || (attrs.length === 1 && cls && ts.isStringLiteral(cls) && cls.text === "fynns-unit-stack")) {
              removals.push([item.openingElement.getStart(source), item.openingElement.end], [item.closingElement.getStart(source), item.closingElement.end]);
            }
          }
          ts.forEachChild(item, unwrap);
        };
        children(node).forEach(unwrap);
        for (const button of buttons) {
          let removeStart = button.getStart(source);
          let removeEnd = button.end;
          const lineStart = text.lastIndexOf("\n", removeStart - 1) + 1;
          const lineEnd = text.indexOf("\n", removeEnd);
          if (lineEnd !== -1 && /^\s*$/.test(text.slice(lineStart, removeStart)) && /^\s*$/.test(text.slice(removeEnd, lineEnd))) {
            removeStart = lineStart;
            removeEnd = lineEnd + 1;
          }
          removals.push([removeStart, removeEnd]);
        }
        for (const [removeStart, removeEnd] of removals.sort((a, b) => b[0] - a[0])) {
          alert = alert.slice(0, removeStart - start) + alert.slice(removeEnd - start);
        }
        // Retain exact handlers, disabled state, labels, icons and content.
        const row = buttons.map(button => {
          const buttonStart = button.getStart(source);
          const from = text.slice(text.lastIndexOf("\n", buttonStart - 1) + 1, buttonStart).match(/^\s*/)[0];
          return shift(text.slice(buttonStart, button.end), from, indent + "    ");
        }).join(eol + indent + "    ");
        alert = shift(alert, indent, indent + "  ");
        add(start, node.end, `<div className="fynns-unit-stack">${eol}${indent}  ${alert}${eol}${indent}  <div className="fynns-control-cluster">${eol}${indent}    ${row}${eol}${indent}  </div>${eol}${indent}</div>`, "inline-dismiss");
        return; // Do not create overlapping edits inside the migrated alert.
      }
    }
    if (tag(node) === "Button" && !spread(node) && /\bcancel\b|取消/i.test(children(node).map(child => child.getText(source)).join(" ")) && violates(node, "cancel-ghost")) {
      const variant = attribute(node, "variant");
      if (!variant) add(opening(node).tagName.end, opening(node).tagName.end, ' variant="ghost"', "cancel-ghost");
      else {
        const literal = variant.initializer && ts.isJsxExpression(variant.initializer) ? variant.initializer.expression : variant.initializer;
        if (literal && ts.isStringLiteralLike(literal)) add(variant.getStart(source), variant.end, 'variant="ghost"', "cancel-ghost");
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  let result = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
  return { source: result, rules: [...new Set(edits.map(edit => edit.rule))] };
}

export function fixWorkspaceFiles(files, target) {
  const jsx = files.filter(file => /\.[jt]sx$/.test(file) && !/\.(test|spec)\.[jt]sx$/.test(file));
  if (!jsx.length) return [];
  const ts = compiler(target);
  const pending = [];
  for (const file of jsx) {
    // Do not mutate sources reached through a link to a different checkout.
    if (fs.lstatSync(file).isSymbolicLink()) continue;
    const text = fs.readFileSync(file, "utf8");
    const result = fixWorkspaceSource(text, file, ts);
    if (result.source === text) continue;
    pending.push({ file, text, ...result });
  }
  // Compute all edits first; do not overwrite a concurrent editor change.
  for (const change of pending) {
    if (fs.readFileSync(change.file, "utf8") !== change.text) throw new Error(`Source changed during migration: ${change.file}. Retry from the current source.`);
  }
  for (const change of pending) fs.writeFileSync(change.file, change.source, "utf8");
  return pending.map(({ file, rules }) => ({ file, rules }));
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
