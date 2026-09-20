import { Button, ChatComposer, type ChatComposerTodoItem } from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

/** The same composer switches between ordinary and progress-attached modes. */
export function ChatTodoComposerDemo() {
  const { t } = useLocale();
  const [enabled, setEnabled] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [draft, setDraft] = useState("");
  const tasks: ChatComposerTodoItem[] = [
    t("globals.chatTodoTask1"),
    t("globals.chatTodoTask2"),
    t("globals.chatTodoTask3"),
    t("globals.chatTodoTask4"),
    t("globals.chatTodoTask5"),
  ].map((label, index) => ({
    id: String(index + 1),
    label,
    status: index < completed ? "completed" : index === completed ? "active" : "pending",
  }));

  return (
    <div id="sandbox-chat-composer-todos" className="sandbox-chat-composer-leading-menus-host">
      <p className="sandbox-chat-aside-label">{t("globals.chatTodoLabel")}</p>
      <div className="sandbox-globals-row">
        <Button size="sm" variant="tonal" onClick={() => setEnabled((value) => !value)}>
          {enabled ? t("globals.chatTodoDisable") : t("globals.chatTodoEnable")}
        </Button>
        <Button size="sm" variant="ghost" disabled={!enabled || completed === tasks.length} onClick={() => setCompleted((value) => value + 1)}>
          {t("globals.chatTodoCompleteNext")}
        </Button>
      </div>
      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={() => setDraft("")}
        ariaLabel={t("globals.chatComposerAria")}
        placeholder={t("globals.chatTodoPlaceholder")}
        sendLabel={t("globals.chatSend")}
        todoList={enabled ? {
          items: tasks,
          progressLabel: (done, total) => t("globals.chatTodoProgress", { done, total }),
          expandLabel: t("globals.chatTodoExpand"),
          collapseLabel: t("globals.chatTodoCollapse"),
          completedLabel: t("globals.chatTodoCompleted"),
          activeLabel: t("globals.chatTodoActive"),
          pendingLabel: t("globals.chatTodoPending"),
        } : undefined}
      />
      <SandboxHelp text={t("globals.chatTodoHelp")} />
    </div>
  );
}
