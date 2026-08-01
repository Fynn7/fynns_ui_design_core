import { useLayoutEffect, useState, type RefObject } from "react";
import {
  measureContentOverflow,
  measureOverflow,
  type BoundsOverflow,
  type MeasureOverflowOptions,
  type OverflowContainer,
} from "./overflowBounds";

const EMPTY: BoundsOverflow = {
  overflows: false,
  edges: { top: false, right: false, bottom: false, left: false },
  delta: { top: 0, right: 0, bottom: 0, left: 0 },
};

export type UseOverflowBoundsOptions = MeasureOverflowOptions & {
  /**
   * `"bounds"` (default): target border box vs container.
   * `"content"`: scroll/content size vs the target's own client box
   * (`container` is ignored).
   */
  mode?: "bounds" | "content";
};

/**
 * Live overflow detection for a mounted element. Re-measures on resize of the
 * target, optional container, and the window.
 */
export function useOverflowBounds(
  targetRef: RefObject<Element | null>,
  container: RefObject<Element | null> | OverflowContainer = "viewport",
  options: UseOverflowBoundsOptions = {},
): BoundsOverflow {
  const { mode = "bounds", epsilon } = options;
  const [result, setResult] = useState<BoundsOverflow>(EMPTY);

  useLayoutEffect(() => {
    const target = targetRef.current;
    if (!target) {
      setResult(EMPTY);
      return;
    }

    const measure = () => {
      if (mode === "content") {
        setResult(measureContentOverflow(target, { epsilon }));
        return;
      }
      const resolved: OverflowContainer =
        typeof container === "object" &&
        container !== null &&
        "current" in container
          ? (container.current ?? "viewport")
          : container;
      setResult(measureOverflow(target, resolved, { epsilon }));
    };

    measure();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(target);
    if (
      mode === "bounds" &&
      typeof container === "object" &&
      container !== null &&
      "current" in container &&
      container.current
    ) {
      ro?.observe(container.current);
    }

    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [targetRef, container, mode, epsilon]);

  return result;
}
