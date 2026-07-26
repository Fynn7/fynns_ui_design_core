import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { BASE_TOKENS_HASH, BASELINE } from "./baseline";
import {
  buildOverrideStyleBlock,
  cssVarForOp,
  DRAFT_STORAGE_KEY,
  emptyDraft,
  type TokenDraft,
  type TokenGroup,
  type TokenOperation,
  type TokenScope,
  type TokenSource,
} from "./tokenDraft";

type ApplyArgs = {
  group: TokenGroup;
  key: string;
  value: string;
  scope?: TokenScope;
  source?: TokenSource;
  reasoning?: string;
};

type DraftAction =
  | { type: "apply"; op: TokenOperation; cssVar: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" }
  | { type: "load"; draft: TokenDraft }
  | { type: "replaceOverrides"; overrides: Record<string, string>; source: TokenSource }
  | {
      type: "mergeOverrides";
      patch: Record<string, string>;
      source: TokenSource;
      /** When true, replace the tip history entry if it shares the same source + `*`. */
      coalesce?: boolean;
      group?: TokenGroup;
    };

function applyOpToOverrides(
  overrides: Record<string, string>,
  cssVar: string,
  to: string,
  fromBaseline: string,
): Record<string, string> {
  const next = { ...overrides };
  if (to === fromBaseline) {
    delete next[cssVar];
  } else {
    next[cssVar] = to;
  }
  return next;
}

function reducer(state: TokenDraft, action: DraftAction): TokenDraft {
  switch (action.type) {
    case "load":
      return action.draft;
    case "reset":
      return emptyDraft(BASE_TOKENS_HASH);
    case "replaceOverrides": {
      const op: TokenOperation = {
        ts: Date.now(),
        group: "color",
        key: "*",
        from: JSON.stringify(state.overrides),
        to: JSON.stringify(action.overrides),
        scope: "global",
        source: action.source,
      };
      const history = [...state.history.slice(0, state.historyIndex + 1), op];
      return {
        ...state,
        overrides: action.overrides,
        history,
        historyIndex: history.length - 1,
      };
    }
    case "mergeOverrides": {
      const nextOverrides = { ...state.overrides };
      for (const [cssVar, value] of Object.entries(action.patch)) {
        const baseline = BASELINE[cssVar] ?? "";
        if (value === baseline) delete nextOverrides[cssVar];
        else nextOverrides[cssVar] = value;
      }
      if (JSON.stringify(nextOverrides) === JSON.stringify(state.overrides)) return state;

      const tip = state.history[state.historyIndex];
      const COALESCE_MS = 500;
      const canCoalesce =
        Boolean(action.coalesce) &&
        tip != null &&
        tip.key === "*" &&
        tip.source === action.source &&
        state.historyIndex === state.history.length - 1 &&
        Date.now() - tip.ts < COALESCE_MS;

      if (canCoalesce) {
        const coalesced: TokenOperation = {
          ...tip,
          to: JSON.stringify(nextOverrides),
          ts: Date.now(),
        };
        const history = [...state.history.slice(0, state.historyIndex), coalesced];
        return {
          ...state,
          overrides: nextOverrides,
          history,
          historyIndex: state.historyIndex,
        };
      }

      const op: TokenOperation = {
        ts: Date.now(),
        group: action.group ?? "color",
        key: "*",
        from: JSON.stringify(state.overrides),
        to: JSON.stringify(nextOverrides),
        scope: "global",
        source: action.source,
      };
      const history = [...state.history.slice(0, state.historyIndex + 1), op];
      return {
        ...state,
        overrides: nextOverrides,
        history,
        historyIndex: history.length - 1,
      };
    }
    case "apply": {
      const baseline = BASELINE[action.cssVar] ?? "";
      const current = state.overrides[action.cssVar] ?? baseline;
      if (current === action.op.to) return state;
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      const history = [...trimmed, action.op];
      return {
        ...state,
        overrides: applyOpToOverrides(state.overrides, action.cssVar, action.op.to, baseline),
        history,
        historyIndex: history.length - 1,
      };
    }
    case "undo": {
      if (state.historyIndex < 0) return state;
      const op = state.history[state.historyIndex];
      if (op.key === "*") {
        try {
          const prev = JSON.parse(op.from) as Record<string, string>;
          return { ...state, overrides: prev, historyIndex: state.historyIndex - 1 };
        } catch {
          return { ...state, historyIndex: state.historyIndex - 1 };
        }
      }
      const cssVar = cssVarForOp(op.group, op.key);
      const baseline = BASELINE[cssVar] ?? "";
      return {
        ...state,
        overrides: applyOpToOverrides(state.overrides, cssVar, op.from, baseline),
        historyIndex: state.historyIndex - 1,
      };
    }
    case "redo": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const op = state.history[nextIndex];
      if (op.key === "*") {
        try {
          const next = JSON.parse(op.to) as Record<string, string>;
          return { ...state, overrides: next, historyIndex: nextIndex };
        } catch {
          return { ...state, historyIndex: nextIndex };
        }
      }
      const cssVar = cssVarForOp(op.group, op.key);
      const baseline = BASELINE[cssVar] ?? "";
      return {
        ...state,
        overrides: applyOpToOverrides(state.overrides, cssVar, op.to, baseline),
        historyIndex: nextIndex,
      };
    }
    default:
      return state;
  }
}

function loadStoredDraft(): TokenDraft {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return emptyDraft(BASE_TOKENS_HASH);
    const parsed = JSON.parse(raw) as TokenDraft;
    if (parsed.baseTokensHash !== BASE_TOKENS_HASH) {
      return emptyDraft(BASE_TOKENS_HASH);
    }
    return {
      ...emptyDraft(BASE_TOKENS_HASH),
      ...parsed,
      historyIndex: parsed.historyIndex ?? parsed.history.length - 1,
    };
  } catch {
    return emptyDraft(BASE_TOKENS_HASH);
  }
}

type DraftContextValue = {
  draft: TokenDraft;
  apply: (args: ApplyArgs) => void;
  /**
   * Merge a CSS-var patch into overrides as a single undo step (`key: "*"`).
   * Pass `coalesce: true` for continuous gestures (hue drag) so one Undo
   * reverts the whole gesture.
   */
  mergeOverrides: (
    patch: Record<string, string>,
    opts?: { source?: TokenSource; coalesce?: boolean; group?: TokenGroup },
  ) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  loadPreset: (overrides: Record<string, string>) => void;
  resolved: (cssVar: string) => string;
  canUndo: boolean;
  canRedo: boolean;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function TokenDraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(reducer, undefined, loadStoredDraft);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const id = "fynns-sandbox-overrides";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = buildOverrideStyleBlock(draft.overrides);
  }, [draft.overrides]);

  const apply = useCallback(
    (args: ApplyArgs) => {
      const cssVar = cssVarForOp(args.group, args.key);
      const from = draft.overrides[cssVar] ?? BASELINE[cssVar] ?? "";
      dispatch({
        type: "apply",
        cssVar,
        op: {
          ts: Date.now(),
          group: args.group,
          key: args.key,
          from,
          to: args.value,
          scope: args.scope ?? "global",
          source: args.source ?? "slider",
          reasoning: args.reasoning,
        },
      });
    },
    [draft.overrides],
  );

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const loadPreset = useCallback((overrides: Record<string, string>) => {
    dispatch({ type: "replaceOverrides", overrides, source: "preset" });
  }, []);
  const mergeOverrides = useCallback(
    (
      patch: Record<string, string>,
      opts?: { source?: TokenSource; coalesce?: boolean; group?: TokenGroup },
    ) => {
      dispatch({
        type: "mergeOverrides",
        patch,
        source: opts?.source ?? "slider",
        coalesce: opts?.coalesce,
        group: opts?.group,
      });
    },
    [],
  );

  const resolved = useCallback(
    (cssVar: string) => draft.overrides[cssVar] ?? BASELINE[cssVar] ?? "",
    [draft.overrides],
  );

  const value = useMemo<DraftContextValue>(
    () => ({
      draft,
      apply,
      mergeOverrides,
      undo,
      redo,
      reset,
      loadPreset,
      resolved,
      canUndo: draft.historyIndex >= 0,
      canRedo: draft.historyIndex < draft.history.length - 1,
    }),
    [draft, apply, mergeOverrides, undo, redo, reset, loadPreset, resolved],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useTokenDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useTokenDraft must be used within TokenDraftProvider");
  return ctx;
}
