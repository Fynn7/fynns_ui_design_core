import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PlaygroundTarget = "card" | "collapsible-card";

type PlaygroundTargetContextValue = {
  target: PlaygroundTarget;
  setTarget: (target: PlaygroundTarget) => void;
};

const PlaygroundTargetContext = createContext<PlaygroundTargetContextValue | null>(null);

export function PlaygroundTargetProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<PlaygroundTarget>("card");
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
