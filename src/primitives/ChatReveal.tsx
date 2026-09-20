import { type HTMLAttributes } from "react";
import { useChatEntrance } from "./chatEntrance";

export type ChatRevealProps = HTMLAttributes<HTMLDivElement>;

/**
 * Reveal a newly mounted non-message block in a conversation. Place keyed
 * instances around cards, tool results, or other caller-owned content.
 * Initial history in ChatThread paints immediately; later inserts slide in.
 */
export function ChatReveal({ className, children, ...rest }: ChatRevealProps) {
  const enter = useChatEntrance();
  return (
    <div
      {...rest}
      className={["fynns-chat-reveal", enter && "fynns-chat-reveal--enter", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
