import { EmptyState } from "@fynns/ui";
import type { ReactNode } from "react";
import { useLocale } from "../i18n";
import {
  ChatEmptySurfaceStarters,
  type ChatStarterItem,
} from "./ChatEmptySurfaceStarters";

/**
 * Shared new-chat landing stack: greeting EmptyState + soft starters centered
 * in the remaining column; ChatComposer pinned to the bottom with the same
 * `--fynns-chat-composer-inset-block` as a docked Chat composer (FillColumn /
 * active-thread). Used by session-host (`#layouts-demo-chat-product`) and
 * EndAside host (`#layouts-demo-chat-aside`).
 */
export function ChatNewChatLandingEmpty({
  items,
  composer,
  onSelect,
}: {
  items: ReadonlyArray<ChatStarterItem>;
  composer: ReactNode;
  onSelect: (prompt: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="sandbox-chat-empty sandbox-chat-empty--landing">
      <div className="sandbox-chat-empty-landing-body">
        <EmptyState title={t("globals.chatEmpty")} />
        <ChatEmptySurfaceStarters
          ariaLabel={t("globals.chatStarterAria")}
          items={items}
          onSelect={onSelect}
        />
      </div>
      <div className="sandbox-chat-empty-composer">{composer}</div>
    </div>
  );
}
