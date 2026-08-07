import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadSandboxUiSession,
  patchSandboxUiSession,
  type PlaygroundTarget,
} from "./sandboxUiSession";

export type { PlaygroundTarget };

type PlaygroundTargetContextValue = {
  target: PlaygroundTarget;
  setTarget: (target: PlaygroundTarget) => void;
};

const PlaygroundTargetContext = createContext<PlaygroundTargetContextValue | null>(null);

export function PlaygroundTargetProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<PlaygroundTarget>(
    () => loadSandboxUiSession()?.playgroundTarget ?? "card",
  );

  useEffect(() => {
    patchSandboxUiSession({ playgroundTarget: target });
  }, [target]);

  const value = useMemo(() => ({ target, setTarget }), [target]);
  return (
    <PlaygroundTargetContext.Provider value={value}>{children}</PlaygroundTargetContext.Provider>
  );
}

export function usePlaygroundTarget(): PlaygroundTargetContextValue {
  const ctx = useContext(PlaygroundTargetContext);
  if (!ctx) {
    throw new Error("usePlaygroundTarget must be used within PlaygroundTargetProvider");
  }
  return ctx;
}
