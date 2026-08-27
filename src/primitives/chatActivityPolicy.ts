/**
 * Pure helpers for ChatActivity Status-tree open policy and streaming
 * settle timing (min-busy hold / complete / queue). UI-only — no LLM.
 */

export type ChatActivityStepStatus = "pending" | "active" | "done";

export type ResolveActivityOpenInput = {
  streaming: boolean;
  /** Controlled open — wins over policy when set. */
  open?: boolean;
  /** Current uncontrolled open. */
  internalOpen: boolean;
  /**
   * User manually closed while streaming — do not force-open again this cycle.
   */
  userPinnedClosed: boolean;
};

/**
 * Open policy (unlike ChatThinking, completed trees keep last open —
 * no post-stream auto-collapse):
 * - controlled `open` always wins
 * - streaming → force open unless `userPinnedClosed`
 * - otherwise keep `internalOpen`
 */
export function resolveActivityOpen(input: ResolveActivityOpenInput): boolean {
  if (input.open !== undefined) return Boolean(input.open);
  if (input.streaming && !input.userPinnedClosed) return true;
  return input.internalOpen;
}

export type PredictStepSettleInput = {
  /** Stable key per logical step (caller owns identity). */
  keys: readonly string[];
  /** Parallel status per key index. */
  statuses: readonly ChatActivityStepStatus[];
  /** Keys present on the previous paint. */
  prevKeys: ReadonlySet<string>;
  /** Status by key on the previous paint. */
  prevStatusByKey: ReadonlyMap<string, ChatActivityStepStatus>;
};

export type PredictStepSettleResult = {
  /** Newly mounted instant-done rows that will hold then complete. */
  holdIndices: ReadonlySet<number>;
  /** Rows flipping active → done (complete one-shot, no hold). */
  completeIndices: ReadonlySet<number>;
};

/**
 * While `streaming`, predict which step indices will settle this paint so
 * later siblings can stay queued until prior hold **and** complete finish.
 */
export function predictStepSettle(
  input: PredictStepSettleInput,
): PredictStepSettleResult {
  const holdIndices = new Set<number>();
  const completeIndices = new Set<number>();
  input.keys.forEach((key, index) => {
    const st = input.statuses[index] ?? "done";
    const prev = input.prevStatusByKey.get(key);
    if (!input.prevKeys.has(key) && st === "done") {
      holdIndices.add(index);
    }
    if (prev === "active" && st === "done") {
      completeIndices.add(index);
    }
  });
  return { holdIndices, completeIndices };
}

/** True when any index in `indices` is strictly before `index`. */
export function anyPriorIndex(
  indices: ReadonlySet<number>,
  index: number,
): boolean {
  for (const i of indices) {
    if (i < index) return true;
  }
  return false;
}

export type InitialStepMotionInput = {
  streaming: boolean;
  status: ChatActivityStepStatus;
  priorWillHold: boolean;
  priorWillComplete: boolean;
  prefersReducedMotion: boolean;
};

export type InitialStepMotionResult = {
  holding: boolean;
  queued: boolean;
  entering: boolean;
  expandOpen: boolean;
};

/**
 * First-paint motion flags for a Status-tree step under a streaming parent.
 * Hold / enter skip when `prefersReducedMotion`.
 */
export function initialStepMotion(
  input: InitialStepMotionInput,
): InitialStepMotionResult {
  if (!input.streaming) {
    return {
      holding: false,
      queued: false,
      entering: false,
      expandOpen: true,
    };
  }
  const priorBusy = input.priorWillHold || input.priorWillComplete;
  const queued = priorBusy;
  const holding = input.status === "done" && !priorBusy;
  const entering = !queued && !input.prefersReducedMotion;
  return {
    holding,
    queued,
    entering,
    expandOpen: !queued,
  };
}
