/**
 * Pure helpers for ChatThinking labels and open/close policy.
 * UI-only — no LLM / transport.
 */

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

/**
 * Clear pins when a new streaming cycle starts (idle → streaming).
 * Pure — ChatThinking applies the result into React state.
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
  if (input.streaming && !input.wasStreaming) {
    return {
      userPinnedClosed: false,
      userPinnedOpen: false,
      didAutoCollapse: false,
    };
  }
  return {
    userPinnedClosed: input.userPinnedClosed,
    userPinnedOpen: input.userPinnedOpen,
    didAutoCollapse: input.didAutoCollapse,
  };
}

/**
 * Steady-state open for render (no streaming→done edge).
 * Effect owns auto-collapse via {@link resolveThinkingOpen}; render must not
 * reimplement that edge. Pass `wasStreaming` so idle→streaming pin clear is
 * applied **before paint** (avoids one closed-while-streaming frame).
 */
export function displayThinkingOpen(input: {
  streaming: boolean;
  open?: boolean;
  internalOpen: boolean;
  userPinnedClosed: boolean;
  /** Previous `streaming`; omit / true = no cycle-start pin clear. */
  wasStreaming?: boolean;
}): boolean {
  const pins = resetThinkingPinsOnStreamStart({
    streaming: input.streaming,
    wasStreaming: input.wasStreaming ?? true,
    userPinnedClosed: input.userPinnedClosed,
    userPinnedOpen: false,
    didAutoCollapse: true,
  });
  return resolveThinkingOpen({
    streaming: input.streaming,
    open: input.open,
    internalOpen: input.internalOpen,
    userPinnedClosed: pins.userPinnedClosed,
    userPinnedOpen: false,
    didAutoCollapse: true,
    wasStreaming: false,
  }).open;
}

/**
 * Open policy:
 * - controlled `open` always wins
 * - streaming → force open unless `userPinnedClosed` (trigger stays
 *   enabled; pin is cleared when a new streaming cycle starts)
 * - streaming→done → auto-collapse once unless `userPinnedOpen`
 * - otherwise keep `internalOpen`
 */
export function resolveThinkingOpen(
  input: ResolveThinkingOpenInput,
): ResolveThinkingOpenResult {
  if (input.open !== undefined) {
    return { open: input.open, didAutoCollapse: input.didAutoCollapse };
  }

  if (input.streaming) {
    if (input.userPinnedClosed) {
      return { open: false, didAutoCollapse: false };
    }
    return { open: true, didAutoCollapse: false };
  }

  // Edge: just finished streaming → auto-collapse once.
  if (input.wasStreaming && !input.didAutoCollapse && !input.userPinnedOpen) {
    return { open: false, didAutoCollapse: true };
  }

  return {
    open: input.internalOpen,
    didAutoCollapse: input.didAutoCollapse,
  };
}
