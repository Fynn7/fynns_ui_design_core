/**
 * Deep Status-tree disclosure open module (ChatActivity + ChatThinking).
 *
 * One interface: streaming transitions + user toggles → `{ open, pins, … }`.
 * UI binds `data-state` only — no render+effect dual write of open.
 *
 * Modes:
 * - `activity` — force open while streaming unless pinned closed; no
 *   post-stream auto-collapse (completed trees keep last open).
 * - `thinking` — same force-open + one auto-collapse on streaming→done
 *   unless the user pinned open after done.
 */

export type StatusTreeOpenMode = "activity" | "thinking";

export type StatusTreeOpenState = {
  /** Uncontrolled disclosure open. */
  internalOpen: boolean;
  /** User collapsed while streaming — do not force-open again this cycle. */
  userPinnedClosed: boolean;
  /**
   * User expanded after done (`thinking` only) — skip auto-collapse once.
   * Unused for `activity` (always false).
   */
  userPinnedOpen: boolean;
  /**
   * Whether auto-collapse already ran this idle stretch (`thinking` only).
   * Unused for `activity` (always false).
   */
  didAutoCollapse: boolean;
  /** Previous `streaming` — edge detection lives here, not in a ref+effect. */
  wasStreaming: boolean;
};

export type StatusTreeOpenSnapshot = StatusTreeOpenState & {
  /** Effective open for paint (controlled `open` wins when set). */
  open: boolean;
};

export function createStatusTreeOpenState(
  defaultOpen: boolean,
  streaming = false,
): StatusTreeOpenState {
  return {
    internalOpen: defaultOpen,
    userPinnedClosed: false,
    userPinnedOpen: false,
    didAutoCollapse: false,
    wasStreaming: streaming,
  };
}

/**
 * Effective open from a committed state (no edge mutations).
 * Controlled `open` always wins.
 */
export function statusTreeOpenFromState(
  state: StatusTreeOpenState,
  input: {
    mode: StatusTreeOpenMode;
    streaming: boolean;
    open?: boolean;
  },
): boolean {
  if (input.open !== undefined) return Boolean(input.open);
  // While streaming, pin alone decides (force-open unless pinned closed).
  if (input.streaming) return !state.userPinnedClosed;
  void input.mode;
  return state.internalOpen;
}

/**
 * Apply a streaming prop edge into state (idle↔streaming).
 * Call once per edge from the hook (render-time adjust) — locality for
 * pin clear + auto-collapse + activity cycle-start force-open.
 */
export function reduceStatusTreeStreaming(
  state: StatusTreeOpenState,
  input: {
    mode: StatusTreeOpenMode;
    streaming: boolean;
    /** When true, only advance `wasStreaming` (cycle still detected by caller). */
    controlled?: boolean;
  },
): StatusTreeOpenState {
  const { mode, streaming, controlled = false } = input;
  if (streaming === state.wasStreaming) return state;

  if (controlled) {
    return { ...state, wasStreaming: streaming };
  }

  let next: StatusTreeOpenState = { ...state, wasStreaming: streaming };

  // idle → streaming: clear pins and force-open (both modes).
  if (streaming && !state.wasStreaming) {
    return {
      ...next,
      userPinnedClosed: false,
      userPinnedOpen: false,
      didAutoCollapse: false,
      internalOpen: true,
    };
  }

  // streaming → done (thinking auto-collapses once; activity keeps last open)
  if (
    !streaming &&
    state.wasStreaming &&
    mode === "thinking" &&
    !next.didAutoCollapse &&
    !next.userPinnedOpen
  ) {
    return {
      ...next,
      internalOpen: false,
      didAutoCollapse: true,
    };
  }

  return next;
}

/**
 * User disclosure toggle while uncontrolled.
 */
export function reduceStatusTreeUserOpen(
  state: StatusTreeOpenState,
  input: {
    mode: StatusTreeOpenMode;
    streaming: boolean;
    open: boolean;
  },
): StatusTreeOpenState {
  const { mode, streaming, open } = input;
  if (streaming) {
    return {
      ...state,
      internalOpen: open,
      userPinnedClosed: !open,
      userPinnedOpen: open ? false : state.userPinnedOpen,
    };
  }
  if (mode === "thinking") {
    return {
      ...state,
      internalOpen: open,
      userPinnedOpen: open,
      userPinnedClosed: false,
      // Expanding after done marks collapse as already handled so a later
      // idle frame does not re-collapse.
      didAutoCollapse: open ? true : state.didAutoCollapse,
    };
  }
  return {
    ...state,
    internalOpen: open,
    // Activity: leave pin as-is until the next streaming cycle clears it.
  };
}

/** Snapshot helper for tests / callers that need open + state together. */
export function snapshotStatusTreeOpen(
  state: StatusTreeOpenState,
  input: {
    mode: StatusTreeOpenMode;
    streaming: boolean;
    open?: boolean;
  },
): StatusTreeOpenSnapshot {
  return {
    ...state,
    open: statusTreeOpenFromState(state, input),
  };
}
