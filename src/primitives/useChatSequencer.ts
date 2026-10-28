import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** How a live conversation should reveal the rows it already has at mount. */
export type ChatSequencerSeed = "all" | "first";

export type ChatSequencerOptions<T> = {
  /** The complete ordered event list. Rows must be append-only while live. */
  items: readonly T[];
  /** Stable event identity. Never derive this from an array index alone. */
  getKey: (item: T, index: number) => string;
  /**
   * `all` paints the current list immediately (opening a recorded run).
   * `first` paints only the first row and queues the rest (a run started here).
   * @default "all"
   */
  seed?: ChatSequencerSeed;
  /**
   * Whether a row has finished settling on screen: entry motion done, media
   * decoded, streaming stopped. While any visible row is unsettled, no later
   * row is revealed. Omit when every row settles immediately.
   */
  isSettled?: (item: T) => boolean;
  /**
   * Delay between two reveals. Defaults to the core
   * `--fynns-chat-entry-duration` (zero under reduced motion).
   */
  intervalMs?: number;
  /** Reset identity. Changes clear the visible window and seed again. */
  resetKey?: string | number;
};

export type ChatSequencerResult<T> = {
  /** Rows that may be painted now, in source order. Never reordered or removed. */
  visibleItems: T[];
  /** Rows already in the source list but not painted yet. */
  waiting: number;
};

type SequencerState = {
  resetKey: string | number | undefined;
  visibleKeys: string[];
  pendingKeys: string[];
};

/** Read the core entrance duration once; reduced motion reveals without delay. */
function defaultIntervalMs(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return 0;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--fynns-chat-entry-duration")
      .trim();
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value) || value <= 0) return 360;
    return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
  } catch {
    return 360;
  }
}

function seedState(
  resetKey: string | number | undefined,
  keys: string[],
  seed: ChatSequencerSeed,
): SequencerState {
  if (seed === "all") {
    return { resetKey, visibleKeys: keys, pendingKeys: [] };
  }
  return {
    resetKey,
    visibleKeys: keys.slice(0, 1),
    pendingKeys: keys.slice(1),
  };
}

/**
 * Reveal live conversation rows one at a time, top to bottom.
 *
 * The hook keeps the order of the source list, never removes a row it has
 * painted, and waits for every visible row to settle before painting the next
 * one. Consumers own truth: pass the recorded event list, a stable key, and a
 * settle predicate for media or streaming rows. A live status row belongs
 * outside this list at the thread tail; it is a status, not a recorded event.
 */
export function useChatSequencer<T>({
  items,
  getKey,
  seed = "all",
  isSettled,
  intervalMs,
  resetKey,
}: ChatSequencerOptions<T>): ChatSequencerResult<T> {
  const keys = items.map((item, index) => getKey(item, index));
  const cache = useRef(new Map<string, T>());
  for (let index = 0; index < items.length; index += 1) {
    cache.current.set(keys[index], items[index]);
  }

  const [state, setState] = useState<SequencerState>(() =>
    seedState(resetKey, keys, seed),
  );

  // Derive a reset during render so the previous run never paints for a frame.
  const active =
    state.resetKey === resetKey ? state : seedState(resetKey, keys, seed);
  useLayoutEffect(() => {
    if (state.resetKey === resetKey) return;
    setState(seedState(resetKey, keys, seed));
  }, [resetKey, state.resetKey, keys, seed]);

  useEffect(() => {
    const known = new Set([...active.visibleKeys, ...active.pendingKeys]);
    const present = new Set(keys);
    const added = keys.filter((key) => !known.has(key));
    const pendingKeys = active.pendingKeys.filter((key) => present.has(key));
    if (added.length === 0 && pendingKeys.length === active.pendingKeys.length) {
      return;
    }
    setState((current) => {
      if (current.resetKey !== active.resetKey) return current;
      const currentKnown = new Set([...current.visibleKeys, ...current.pendingKeys]);
      const nextAdded = keys.filter((key) => !currentKnown.has(key));
      const nextPending = current.pendingKeys.filter((key) => present.has(key));
      if (nextAdded.length === 0 && nextPending.length === current.pendingKeys.length) {
        return current;
      }
      return {
        ...current,
        pendingKeys: [...nextPending, ...nextAdded],
      };
    });
  });

  const visibleItems = active.visibleKeys
    .map((key) => cache.current.get(key))
    .filter((item): item is T => item !== undefined);
  const allSettled =
    !isSettled || visibleItems.every((item) => isSettled(item));

  const pendingKey = active.pendingKeys[0];
  const revealDelay = intervalMs ?? defaultIntervalMs();

  useEffect(() => {
    if (pendingKey === undefined || !allSettled) return;
    if (active.resetKey !== resetKey) return;
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(
      () => {
        setState((current) => {
          if (current.pendingKeys[0] !== pendingKey) return current;
          const [next, ...rest] = current.pendingKeys;
          return {
            ...current,
            visibleKeys: [...current.visibleKeys, next],
            pendingKeys: rest,
          };
        });
      },
      active.visibleKeys.length === 0 ? 0 : revealDelay,
    );
    return () => window.clearTimeout(timer);
  }, [
    pendingKey,
    allSettled,
    revealDelay,
    resetKey,
    active.resetKey,
    state.resetKey,
    active.visibleKeys.length,
  ]);

  return {
    visibleItems,
    waiting: active.pendingKeys.length,
  };
}
