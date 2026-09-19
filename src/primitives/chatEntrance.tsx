import { createContext, useContext, useState } from "react";

/** Whether the containing thread has completed its first paint. */
export const ChatEntranceContext = createContext<boolean | null>(null);

/** Capture the mount state once: updates to the thread must not replay history. */
export function useChatEntrance(): boolean {
  const ready = useContext(ChatEntranceContext);
  const [enter] = useState(() => ready ?? true);
  return enter;
}
