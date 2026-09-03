import { isValidElement, type ReactNode } from "react";

/**
 * Shared catalog-row geometry for ListItem and TimelineItem.
 *
 * Decides whether `trailing` stays **outside** the interactive row control
 * (`--with-end` / end sibling) so IconButton / clusters never nest inside a
 * `<button>`. Also partitions meta vs chrome vs end action for skins.
 * Skins stay separate (List pill vs Timeline rail) — this module owns only
 * the nesting / action-vs-decorative / meta-band decision.
 *
 * Internal seam — not a public Consumer API.
 */

function elementName(type: unknown): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || "";
  }
  if (type && typeof type === "object" && "render" in type) {
    const render = (type as { render?: { displayName?: string; name?: string } }).render;
    return render?.displayName || render?.name || "";
  }
  return "";
}

/**
 * True when `trailing` must stay outside the row control (IconButton / cluster).
 * Prefer **outside** for unknown / minified composites so production builds
 * never nest `<button>` inside the interactive row (Vite name-mangling lesson).
 * Only leave clearly decorative leaves (text, svg, `*Icon`) inside.
 */
export function trailingIsRowAction(node: ReactNode, depth = 0): boolean {
  if (node == null || typeof node === "boolean" || depth > 5) return false;
  if (typeof node === "string" || typeof node === "number") return false;
  if (Array.isArray(node)) {
    return node.some((child) => trailingIsRowAction(child, depth));
  }
  if (!isValidElement(node)) return false;

  if (node.type === "button" || node.type === "a") return true;
  if (typeof node.type === "string") {
    if (node.type === "svg" || node.type === "path" || node.type === "span") {
      return trailingIsRowAction(
        (node.props as { children?: ReactNode }).children,
        depth + 1,
      );
    }
    return true;
  }

  const name = elementName(node.type);
  const className = (node.props as { className?: unknown }).className;
  if (
    typeof className === "string" &&
    /fynns-btn|fynns-control-cluster/.test(className)
  ) {
    return true;
  }
  if (/IconButton|Button|SplitButton|DropdownMenu|Tooltip/.test(name)) {
    return true;
  }
  // Named decorative glyphs (ChevronRightIcon, …) stay inside the row.
  if (/Icon$/.test(name)) return false;
  // Fragment / anonymous wrappers: inspect children; empty → treat as action.
  const children = (node.props as { children?: ReactNode }).children;
  if (children != null && (name === "" || /Fragment/.test(name))) {
    return trailingIsRowAction(children, depth + 1);
  }
  // Unknown or minified component names → outside (safe nesting).
  return true;
}

/**
 * True when `--with-end` must pin in-flow (Select / labeled Button) instead of
 * IconButton overlay reveal. Mirrors content.css `:has(.fynns-select)` /
 * `.fynns-btn:not(.fynns-btn--icon)`. Used so gap meta
 * (`trailingSupportingText`) can co-locate in the end strip without hiding
 * under IconButton opacity:0 reveal.
 */
export function trailingIsPinnedInspectorEnd(node: ReactNode, depth = 0): boolean {
  if (node == null || typeof node === "boolean" || depth > 5) return false;
  if (typeof node === "string" || typeof node === "number") return false;
  if (Array.isArray(node)) {
    return node.some((child) => trailingIsPinnedInspectorEnd(child, depth));
  }
  if (!isValidElement(node)) return false;

  const className = (node.props as { className?: unknown }).className;
  if (typeof className === "string") {
    if (/\bfynns-select\b/.test(className)) return true;
    if (/\bfynns-btn\b/.test(className) && !/\bfynns-btn--icon\b/.test(className)) {
      return true;
    }
  }

  const name = elementName(node.type);
  if (/^Select$|Select\b/.test(name) && !/IconButton/.test(name)) return true;
  if (/^Button$|SplitButton/.test(name)) return true;

  const children = (node.props as { children?: ReactNode }).children;
  if (children != null) {
    return trailingIsPinnedInspectorEnd(children, depth + 1);
  }
  return false;
}

/** Shared min-width trailing meta column (`"start"`) for date / timestamp catalogs. */
export type CatalogTrailingMetaAlign = "start";

export type CatalogTrailingPartition = {
  /** Park trailing outside the row control (`--with-end`). */
  withEnd: boolean;
  /** List inspector Select/CTA: park supporting meta in the end strip. */
  placeMetaInEnd: boolean;
  /** Supporting meta stays inside the row (default / Timeline). */
  placeMetaInRow: boolean;
  /** Decorative trailing that stays inside the row control. */
  chromeTrailing: ReactNode | null;
  /** Action trailing rendered in the end sibling. */
  endAction: ReactNode | null;
};

/**
 * Partition catalog trailing into row chrome vs end action / meta bands.
 * List passes `pinInspectorMeta: true`; Timeline omits it.
 */
export function partitionCatalogTrailing(opts: {
  trailing?: ReactNode;
  hasTrailingSupportingText: boolean;
  /** When true, co-locate supporting meta with pinned inspector end. */
  pinInspectorMeta?: boolean;
}): CatalogTrailingPartition {
  const trailing = opts.trailing;
  const actionTrailing = trailing != null && trailingIsRowAction(trailing);
  const pinnedInspectorEnd =
    Boolean(opts.pinInspectorMeta) &&
    actionTrailing &&
    trailing != null &&
    trailingIsPinnedInspectorEnd(trailing);
  const hasMeta = opts.hasTrailingSupportingText;

  return {
    withEnd: actionTrailing,
    placeMetaInEnd: Boolean(pinnedInspectorEnd && hasMeta),
    placeMetaInRow: Boolean(hasMeta && !pinnedInspectorEnd),
    chromeTrailing: trailing != null && !actionTrailing ? trailing : null,
    endAction: actionTrailing && trailing != null ? trailing : null,
  };
}
