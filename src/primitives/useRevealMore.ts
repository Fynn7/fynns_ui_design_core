import { useCallback, useEffect, useRef, useState } from "react";

/** Table / dense-row catalog defaults (≥ 0.5.144). */
export const REVEAL_MORE_DEFAULT_INITIAL = 10;
export const REVEAL_MORE_DEFAULT_STEP = 10;

/**
 * List / tall-row catalog defaults (≥ 0.5.145). ListItems are taller than
 * table rows — start and step at **5**. Pass these when calling
 * `useRevealMore` for Card / PageScroll Lists (live `#list`).
 */
export const REVEAL_MORE_LIST_DEFAULT_INITIAL = 5;
export const REVEAL_MORE_LIST_DEFAULT_STEP = 5;

export type UseRevealMoreOptions = {
  /** Total row / item count in the full dataset. */
  total: number;
  /** Rows shown before the first reveal. @default 10 (Table); List → 5 */
  initial?: number;
  /** Rows added each reveal. @default 10 (Table); List → 5 */
  step?: number;
  /**
   * When this identity changes (filter, source, date range, …), `visible`
   * resets to `initial`. Polling that only bumps `total` must **not** change
   * this key.
   */
  resetKey?: string | number;
};

export type UseRevealMoreResult = {
  /** How many items to render (`items.slice(0, visible)`). */
  visible: number;
  remaining: number;
  canRevealMore: boolean;
  revealMore: () => void;
  /** Force `visible` back to `initial` (same as a `resetKey` change). */
  reset: () => void;
};

function floorNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function floorPos(n: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

/**
 * Progressive “show more” window for long catalogs. Pair with `<RevealMore />`
 * as a sibling after the host (`List` or outside `.fynns-table-wrap`). Does
 * **not** own List/Table DOM — the app slices items.
 *
 * - **Table** (default): `initial`/`step` 10 — live `#table`
 * - **List**: pass `REVEAL_MORE_LIST_DEFAULT_*` (5 / 5) — live `#list`
 */
export function useRevealMore({
  total,
  initial = REVEAL_MORE_DEFAULT_INITIAL,
  step = REVEAL_MORE_DEFAULT_STEP,
  resetKey,
}: UseRevealMoreOptions): UseRevealMoreResult {
  const totalCount = floorNonNeg(total);
  const initialCount = floorNonNeg(initial);
  const stepCount = floorPos(step, REVEAL_MORE_DEFAULT_STEP);
  const totalRef = useRef(totalCount);
  totalRef.current = totalCount;

  const [visible, setVisible] = useState(() =>
    Math.min(initialCount, totalCount),
  );

  // Filter / source identity (or initial) change → back to the first window.
  // Read `total` via ref so polling growth does not re-fire this reset.
  useEffect(() => {
    setVisible(Math.min(initialCount, totalRef.current));
  }, [resetKey, initialCount]);

  useEffect(() => {
    setVisible((v) => Math.min(v, totalCount));
  }, [totalCount]);

  const revealMore = useCallback(() => {
    setVisible((v) => Math.min(totalCount, v + stepCount));
  }, [stepCount, totalCount]);

  const reset = useCallback(() => {
    setVisible(Math.min(initialCount, totalCount));
  }, [initialCount, totalCount]);

  const clampedVisible = Math.min(visible, totalCount);
  const remaining = Math.max(0, totalCount - clampedVisible);

  return {
    visible: clampedVisible,
    remaining,
    canRevealMore: remaining > 0,
    revealMore,
    reset,
  };
}
