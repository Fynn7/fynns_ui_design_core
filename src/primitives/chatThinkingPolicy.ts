/**
 * Pure helpers for ChatThinking labels + thin open adapters.
 * Disclosure open locality lives in {@link ./statusTreeOpen} /
 * {@link ./useStatusTreeOpen} — do not reassemble render+effect open here.
 */

import {
  reduceStatusTreeStreaming,
  statusTreeOpenFromState,
  type StatusTreeOpenState,
} from "./statusTreeOpen";

export type ThinkingLabelLabels = {
  /** While `streaming`. Default `"Thinking"`. */
  streamingLabel?: string;
  /** Done, no duration. Default `"Thinking"`. */
  label?: string;
  /** Done with duration. Receives whole seconds. */
  durationLabel?: (seconds: number) => string;
};

const DEFAULT_STREAMING = "Thinking";
const DEFAULT_DONE = "Thinking";

/** Wall-clock ms → whole seconds (min 1 when ms > 0). */
export function formatThoughtSeconds(durationMs: number): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  return Math.max(1, Math.round(durationMs / 1000));
}

/** Default English `"Thought for {n}s"`. */
export function formatThoughtDuration(durationMs: number): string {
  const n = formatThoughtSeconds(durationMs);
  if (n <= 0) return DEFAULT_DONE;
  return `Thought for ${n}s`;
}

export function resolveThinkingLabel(
  opts: {
    streaming?: boolean;
    durationMs?: number;
  } & ThinkingLabelLabels,
): string {
  if (opts.streaming) {
    return opts.streamingLabel ?? DEFAULT_STREAMING;
  }
  if (opts.durationMs != null && opts.durationMs > 0) {
    if (opts.durationLabel) {
      return opts.durationLabel(formatThoughtSeconds(opts.durationMs));
    }
    return formatThoughtDuration(opts.durationMs);
  }
  return opts.label ?? DEFAULT_DONE;
}

export type ResolveThinkingOpenInput = {
  streaming: boolean;
  /** Controlled open — wins over policy when set. */
  open?: boolean;
  /** Current uncontrolled open (after user / policy). */
  internalOpen: boolean;
  /**
   * User manually closed while streaming — do not force-open again this cycle.
   */
  userPinnedClosed: boolean;
  /**
   * User manually opened after done — do not auto-collapse again this cycle.
   */
  userPinnedOpen: boolean;
  /** Whether we already ran the post-stream auto-collapse once. */
  didAutoCollapse: boolean;
  /** Previous `streaming` for edge detection. */
  wasStreaming: boolean;
};

export type ResolveThinkingOpenResult = {
  open: boolean;
  /** Set true after applying one auto-collapse on streaming→done. */
  didAutoCollapse: boolean;
};

function stateFromResolveInput(
  input: ResolveThinkingOpenInput,
): StatusTreeOpenState {
  return {
    internalOpen: input.internalOpen,
    userPinnedClosed: input.userPinnedClosed,
    userPinnedOpen: input.userPinnedOpen,
    didAutoCollapse: input.didAutoCollapse,
    wasStreaming: input.wasStreaming,
  };
}

/**
 * Clear pins when a new streaming cycle starts (idle → streaming).
 * Prefer {@link reduceStatusTreeStreaming} for new call sites.
 */
export function resetThinkingPinsOnStreamStart(input: {
  streaming: boolean;
  wasStreaming: boolean;
  userPinnedClosed: boolean;
  userPinnedOpen: boolean;
  didAutoCollapse: boolean;
}): {
  userPinnedClosed: boolean;
  userPinnedOpen: boolean;
  didAutoCollapse: boolean;
} {
  if (!(input.streaming && !input.wasStreaming)) {
    return {
      userPinnedClosed: input.userPinnedClosed,
      userPinnedOpen: input.userPinnedOpen,
      didAutoCollapse: input.didAutoCollapse,
    };
  }
  const next = reduceStatusTreeStreaming(
    {
      internalOpen: false,
      userPinnedClosed: input.userPinnedClosed,
      userPinnedOpen: input.userPinnedOpen,
      didAutoCollapse: input.didAutoCollapse,
      wasStreaming: input.wasStreaming,
    },
    { mode: "thinking", streaming: input.streaming },
  );
  return {
    userPinnedClosed: next.userPinnedClosed,
    userPinnedOpen: next.userPinnedOpen,
    didAutoCollapse: next.didAutoCollapse,
  };
}

/**
 * Steady-state open for paint without committing auto-collapse.
 * Prefer {@link useStatusTreeOpen} — kept for unit tests of the display path.
 */
export function displayThinkingOpen(input: {
  streaming: boolean;
  open?: boolean;
  internalOpen: boolean;
  userPinnedClosed: boolean;
  /** Previous `streaming`; omit / true = no cycle-start pin clear. */
  wasStreaming?: boolean;
}): boolean {
  let state: StatusTreeOpenState = {
    internalOpen: input.internalOpen,
    userPinnedClosed: input.userPinnedClosed,
    userPinnedOpen: false,
    // Display path never commits streaming→done auto-collapse.
    didAutoCollapse: true,
    wasStreaming: input.wasStreaming ?? true,
  };
  // Only idle→streaming pin clear for paint; reducer owns auto-collapse.
  if (input.streaming && !state.wasStreaming) {
    state = reduceStatusTreeStreaming(state, {
      mode: "thinking",
      streaming: true,
    });
  }
  return statusTreeOpenFromState(state, {
    mode: "thinking",
    streaming: input.streaming,
    open: input.open,
  });
}

/**
 * Open policy snapshot (legacy pure entry). Prefer {@link useStatusTreeOpen}.
 */
export function resolveThinkingOpen(
  input: ResolveThinkingOpenInput,
): ResolveThinkingOpenResult {
  if (input.open !== undefined) {
    return { open: input.open, didAutoCollapse: input.didAutoCollapse };
  }

  const state = stateFromResolveInput(input);
  if (input.streaming === input.wasStreaming) {
    return {
      open: statusTreeOpenFromState(state, {
        mode: "thinking",
        streaming: input.streaming,
      }),
      didAutoCollapse: state.didAutoCollapse,
    };
  }

  const next = reduceStatusTreeStreaming(state, {
    mode: "thinking",
    streaming: input.streaming,
  });
  return {
    open: statusTreeOpenFromState(next, {
      mode: "thinking",
      streaming: input.streaming,
    }),
    didAutoCollapse: next.didAutoCollapse,
  };
}
