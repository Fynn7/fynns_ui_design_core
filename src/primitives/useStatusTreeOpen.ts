import { useCallback, useState } from "react";
import {
  createStatusTreeOpenState,
  reduceStatusTreeStreaming,
  reduceStatusTreeUserOpen,
  statusTreeOpenFromState,
  type StatusTreeOpenMode,
  type StatusTreeOpenState,
} from "./statusTreeOpen";

export type UseStatusTreeOpenOptions = {
  mode: StatusTreeOpenMode;
  streaming: boolean;
  /** Controlled open — when set, policy state is not mutated for open. */
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type UseStatusTreeOpenResult = {
  open: boolean;
  setOpen: (next: boolean) => void;
  /**
   * Increments each idle→streaming edge (Activity step hold replay).
   * Always advances, including controlled mode.
   */
  streamCycle: number;
  /** Uncontrolled pin / open fields — tests / debug. */
  state: StatusTreeOpenState;
};

/**
 * Status-tree disclosure open — single locality for streaming edges and
 * user toggles. Adjusts state during render when `streaming` flips (React
 * restarts the render with the new state before paint).
 */
export function useStatusTreeOpen(
  opts: UseStatusTreeOpenOptions,
): UseStatusTreeOpenResult {
  const { mode, streaming, open, defaultOpen, onOpenChange } = opts;
  const isControlled = open !== undefined;

  const [state, setState] = useState(() =>
    createStatusTreeOpenState(defaultOpen, streaming),
  );
  const [streamCycle, setStreamCycle] = useState(0);

  // Adjust during render (React restarts before paint) so pin clear /
  // auto-collapse land in the same frame — not a post-paint effect.
  if (streaming !== state.wasStreaming) {
    const edgeIntoStreaming = streaming && !state.wasStreaming;
    setState((prev) =>
      reduceStatusTreeStreaming(prev, {
        mode,
        streaming,
        controlled: isControlled,
      }),
    );
    if (edgeIntoStreaming) {
      setStreamCycle((n) => n + 1);
    }
  }

  const resolvedOpen = statusTreeOpenFromState(state, {
    mode,
    streaming,
    open,
  });

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setState((prev) =>
          reduceStatusTreeUserOpen(prev, { mode, streaming, open: next }),
        );
      }
      onOpenChange?.(next);
    },
    [isControlled, mode, streaming, onOpenChange],
  );

  return {
    open: resolvedOpen,
    setOpen,
    streamCycle,
    state,
  };
}
