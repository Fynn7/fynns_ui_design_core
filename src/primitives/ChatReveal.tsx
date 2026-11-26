import { type HTMLAttributes } from "react";

export type ChatRevealProps = HTMLAttributes<HTMLDivElement>;

/**
 * Wrap a newly appended non-message block in a conversation (cards, tool
 * results, caller-owned content). It is a semantic thread unit only: chat rows
 * paint at full opacity in their final position, so there is no per-block
 * entrance to replay. Keep a stable React `key` for the event identity.
 */
export function ChatReveal({ className, children, ...rest }: ChatRevealProps) {
  return (
    <div
      {...rest}
      className={["fynns-chat-reveal", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
