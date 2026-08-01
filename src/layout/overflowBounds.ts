/**
 * Low-level overflow / bounds helpers.
 *
 * Detect whether an element's border box extends past a container (parent,
 * arbitrary element, rect, or the viewport). Call from layout code or via
 * `useOverflowBounds` — do not reimplement ad-hoc getBoundingClientRect math
 * in each primitive.
 */

/** Sub-pixel slack when comparing layout math to rendered bounds. */
export const OVERFLOW_EPSILON = 1;

export type OverflowEdges = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export type OverflowDelta = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type BoundsOverflow = {
  /** True when any edge overflows beyond `epsilon`. */
  overflows: boolean;
  edges: OverflowEdges;
  /** Pixels past the container on each edge (0 if flush or inside). */
  delta: OverflowDelta;
};

export type OverflowContainer = Element | DOMRectReadOnly | "viewport";

export type MeasureOverflowOptions = {
  /** Sub-pixel slack (default {@link OVERFLOW_EPSILON}). */
  epsilon?: number;
};

function viewportRect(): DOMRectReadOnly {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    toJSON() {
      return this;
    },
  };
}

function resolveContainerRect(container: OverflowContainer): DOMRectReadOnly {
  if (container === "viewport") return viewportRect();
  if (container instanceof Element) return container.getBoundingClientRect();
  return container;
}

function buildOverflow(
  target: DOMRectReadOnly,
  box: DOMRectReadOnly,
  epsilon: number,
): BoundsOverflow {
  const delta: OverflowDelta = {
    top: Math.max(0, box.top - target.top),
    right: Math.max(0, target.right - box.right),
    bottom: Math.max(0, target.bottom - box.bottom),
    left: Math.max(0, target.left - box.left),
  };
  const edges: OverflowEdges = {
    top: delta.top > epsilon,
    right: delta.right > epsilon,
    bottom: delta.bottom > epsilon,
    left: delta.left > epsilon,
  };
  return {
    overflows: edges.top || edges.right || edges.bottom || edges.left,
    edges,
    delta: {
      top: edges.top ? delta.top : 0,
      right: edges.right ? delta.right : 0,
      bottom: edges.bottom ? delta.bottom : 0,
      left: edges.left ? delta.left : 0,
    },
  };
}

/**
 * Measure whether `target`'s border box extends outside `container`.
 *
 * @param target Element to test
 * @param container Parent/ancestor element, a rect, or `"viewport"` (default)
 */
export function measureOverflow(
  target: Element,
  container: OverflowContainer = "viewport",
  options: MeasureOverflowOptions = {},
): BoundsOverflow {
  const epsilon = options.epsilon ?? OVERFLOW_EPSILON;
  return buildOverflow(
    target.getBoundingClientRect(),
    resolveContainerRect(container),
    epsilon,
  );
}

/** Boolean shorthand for {@link measureOverflow}. */
export function overflowsBounds(
  target: Element,
  container: OverflowContainer = "viewport",
  options?: MeasureOverflowOptions,
): boolean {
  return measureOverflow(target, container, options).overflows;
}

/**
 * Content overflow inside one element (`scrollWidth` / `scrollHeight` vs
 * client size) — use when the element clips its own children.
 */
export function measureContentOverflow(
  el: Element,
  options: MeasureOverflowOptions = {},
): BoundsOverflow {
  const epsilon = options.epsilon ?? OVERFLOW_EPSILON;
  const scrollLeft = "scrollLeft" in el ? Number(el.scrollLeft) : 0;
  const scrollTop = "scrollTop" in el ? Number(el.scrollTop) : 0;
  const clientWidth = "clientWidth" in el ? Number(el.clientWidth) : 0;
  const clientHeight = "clientHeight" in el ? Number(el.clientHeight) : 0;
  const scrollWidth = "scrollWidth" in el ? Number(el.scrollWidth) : 0;
  const scrollHeight = "scrollHeight" in el ? Number(el.scrollHeight) : 0;

  const delta: OverflowDelta = {
    top: Math.max(0, scrollTop),
    left: Math.max(0, scrollLeft),
    right: Math.max(0, scrollWidth - clientWidth - scrollLeft),
    bottom: Math.max(0, scrollHeight - clientHeight - scrollTop),
  };
  const edges: OverflowEdges = {
    top: delta.top > epsilon,
    right: delta.right > epsilon,
    bottom: delta.bottom > epsilon,
    left: delta.left > epsilon,
  };
  return {
    overflows: edges.top || edges.right || edges.bottom || edges.left,
    edges,
    delta: {
      top: edges.top ? delta.top : 0,
      right: edges.right ? delta.right : 0,
      bottom: edges.bottom ? delta.bottom : 0,
      left: edges.left ? delta.left : 0,
    },
  };
}
