import {
  Chat,
  ChatComposer,
  ChatMessage,
  ChatReveal,
  ChatSessionMenu,
  ChatThread,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  EmptyState,
  ArchiveIcon,
  FileIcon,
  Surface,
  snackbar,
  useChatSequencer,
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
  activeSessionId,
}: {
  label: string;
  ariaLabel: string;
  placeholder: string;
  sendLabel: string;
  starterItems: ReadonlyArray<ChatStarterItem>;
  landing: boolean;
  onFirstSend?: () => void;
  activeSessionId?: string | null;
}) {
  const { t, locale } = useLocale();
  const menuCopy = locale === "zh"
    ? { more: "会话选项", export: "导出会话为…", archive: "归档会话", requested: "示例归档请求" }
    : { more: "Chat session options", export: "Export chat as…", archive: "Archive chat", requested: "Sample archive request" };
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

    // A demo transport beat lets the appended component and answer be inspected.
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
  const { visibleItems: visibleTurns } = useChatSequencer({
    items: turns,
    getKey: (turn) => String(turn.id),
    seed: "first",
  });
  const showLanding = landing && turns.length === 0;
  const sessionId = activeSessionId === undefined
    ? (turns.length > 0 ? "sample-session" : null)
    : activeSessionId;
  const exportChat = (id: string, format: "md" | "json") => {
    const body = format === "json"
      ? JSON.stringify({ sessionId: id, turns }, null, 2)
      : turns.map((turn) => `## ${turn.kind}\n\n${turn.text}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([body], {
      type: format === "json" ? "application/json" : "text/markdown;charset=utf-8",
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-${id}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Chat label={label} className={showLanding ? "sandbox-chat--landing" : undefined}>
      <ChatSessionMenu activeSessionId={sessionId} label={menuCopy.more} renderMenu={(id) => <>
        <DropdownMenuSub trigger={menuCopy.export} icon={<FileIcon />}>
          <DropdownMenuItem onClick={() => exportChat(id, "md")}>Markdown (.md)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportChat(id, "json")}>JSON (.json)</DropdownMenuItem>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<ArchiveIcon />} onClick={() => snackbar(`${menuCopy.requested} · ${id}`)}>
          {menuCopy.archive}
        </DropdownMenuItem>
      </>} />
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
        {visibleTurns.map((turn) =>
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
