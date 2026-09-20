import {
  Chat,
  ChatComposer,
  ChatMessage,
  ChatReveal,
  ChatThread,
  EmptyState,
  Surface,
} from "@fynns/ui";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n";
import { ChatEmptySurfaceStarters, type ChatStarterItem } from "./ChatEmptySurfaceStarters";
import { ChatNewChatLandingEmpty } from "./ChatNewChatLandingEmpty";

type DemoTurn = { id: number; kind: "user" | "assistant" | "component"; text: string };

/** Shared live send/reply/block sequence for the main and EndAside hosts. */
export function ChatConversationDemo({
  label,
  ariaLabel,
  placeholder,
  sendLabel,
  starterItems,
  landing,
  onFirstSend,
}: {
  label: string;
  ariaLabel: string;
  placeholder: string;
  sendLabel: string;
  starterItems: ReadonlyArray<ChatStarterItem>;
  landing: boolean;
  onFirstSend?: () => void;
}) {
  const { t } = useLocale();
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<DemoTurn[]>([]);
  const nextId = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => pending.current.forEach(clearTimeout), []);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    if (turns.length === 0) onFirstSend?.();
    setDraft("");
    setTurns((items) => [...items, { id: ++nextId.current, kind: "user", text }]);

    // A demo transport beat lets the two entrance states be inspected.
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--fynns-duration-activity")
      .trim();
    const delay = Number.parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
    const timer = setTimeout(() => {
      setTurns((items) => [
        ...items,
        { id: ++nextId.current, kind: "component", text: t("globals.chatRevealCard") },
        { id: ++nextId.current, kind: "assistant", text: t("globals.chatStreamFull") },
      ]);
      pending.current = pending.current.filter((item) => item !== timer);
    }, Number.isFinite(delay) ? delay : 0);
    pending.current.push(timer);
  };

  const composer = (
    <ChatComposer
      value={draft}
      onChange={setDraft}
      ariaLabel={ariaLabel}
      placeholder={placeholder}
      sendLabel={sendLabel}
      onSubmit={send}
    />
  );
  const showLanding = landing && turns.length === 0;

  return (
    <Chat label={label} className={showLanding ? "sandbox-chat--landing" : undefined}>
      <ChatThread
        empty={
          showLanding ? (
            <ChatNewChatLandingEmpty
              items={starterItems}
              composer={composer}
              onSelect={send}
            />
          ) : (
            <div className="fynns-unit-stack sandbox-chat-empty">
              <EmptyState title={t("globals.chatEmpty")} />
              <ChatEmptySurfaceStarters
                ariaLabel={t("globals.chatStarterAria")}
                items={starterItems}
                onSelect={send}
              />
            </div>
          )
        }
      >
        {turns.map((turn) =>
          turn.kind === "component" ? (
            <ChatReveal key={turn.id}>
              <Surface variant="soft" padded>
                {turn.text}
              </Surface>
            </ChatReveal>
          ) : (
            <ChatMessage key={turn.id} role={turn.kind} markdown={turn.text} />
          ),
        )}
      </ChatThread>
      {showLanding ? null : composer}
    </Chat>
  );
}
