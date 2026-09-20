/**
 * Vite serves the linked UI barrel as native ESM in development. A webview can
 * retain an old response for the same URL after the sibling checkout updates,
 * even though the barrel on disk already exports the new symbol.
 *
 * Keep this dependency-free: the installer runs before a consumer (or the
 * sibling core checkout) necessarily has devDependencies installed.
 */

const NO_STORE_HEADER = 'headers: { "Cache-Control": "no-store" },';

function objectAt(source, open) {
  if (source[open] !== "{") return null;
  let quote = null;
  let comment = null;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];
    if (comment === "line") {
      if (c === "\n") comment = null;
      continue;
    }
    if (comment === "block") {
      if (c === "*" && next === "/") { comment = null; i++; }
      continue;
    }
    if (quote) {
      if (c === "\\") { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === "/" && next === "/") { comment = "line"; i++; continue; }
    if (c === "/" && next === "*") { comment = "block"; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth++;
    if (c === "}" && --depth === 0) return { open, close: i };
  }
  return null;
}

function propertyObject(source, name, within = { open: -1, close: source.length }) {
  const body = source.slice(within.open + 1, within.close);
  const re = new RegExp(`(?:^|[,{\\n])\\s*(?:["']${name}["']|${name})\\s*:\\s*\\{`, "g");
  let match;
  while ((match = re.exec(body))) {
    const open = within.open + 1 + match.index + match[0].lastIndexOf("{");
    const object = objectAt(source, open);
    if (object && object.close < within.close) return object;
  }
  return null;
}

function cacheControl(source, headers) {
  const body = source.slice(headers.open + 1, headers.close);
  return /(?:^|[,\n])\s*(?:["']Cache-Control["']|Cache-Control)\s*:\s*(["'])([^"']*)\1/i.exec(body);
}

export function hasNoStoreDevHeader(source) {
  const server = propertyObject(source, "server");
  const headers = server && propertyObject(source, "headers", server);
  const value = headers && cacheControl(source, headers)?.[2];
  return typeof value === "string" && /(?:^|,)\s*no-store\s*(?:,|$)/i.test(value);
}

/** Return null for a config shape we cannot safely rewrite. */
export function ensureNoStoreDevHeader(source) {
  if (hasNoStoreDevHeader(source)) return source;
  const server = propertyObject(source, "server");
  if (server) {
    const headers = propertyObject(source, "headers", server);
    if (!headers) {
      // Do not add a duplicate property when headers is computed elsewhere.
      if (/(?:^|[,\n])\s*headers\s*:/.test(source.slice(server.open + 1, server.close))) return null;
      return source.slice(0, server.open + 1) + `\n    ${NO_STORE_HEADER}` + source.slice(server.open + 1);
    }
    const existing = cacheControl(source, headers);
    if (existing) {
      const bodyStart = headers.open + 1;
      const valueStart = bodyStart + existing.index + existing[0].lastIndexOf(existing[1] + existing[2] + existing[1]);
      return source.slice(0, valueStart) + '"no-store"' + source.slice(valueStart + existing[2].length + 2);
    }
    if (/["']?Cache-Control["']?\s*:/i.test(source.slice(headers.open + 1, headers.close))) return null;
    return source.slice(0, headers.open + 1) + '\n      "Cache-Control": "no-store",' + source.slice(headers.open + 1);
  }

  // Standard object-form config. Function configs require a manual addition.
  const root = /\bdefineConfig\s*\(\s*\{|\bexport\s+default\s*\{/.exec(source);
  if (!root) return null;
  const open = root.index + root[0].lastIndexOf("{");
  return source.slice(0, open + 1) + `\n  server: { ${NO_STORE_HEADER} },` + source.slice(open + 1);
}
