import { useState } from "react";
import { Button, ChatSessionsDrawer, Switch, snackbar } from "@fynns/ui";
import { useLocale } from "../i18n";
import { NavDrawerFooterAccount } from "./NavDrawerFooterAccount";
import { SandboxHelp } from "./SandboxHelp";

/** Generic session data only; mutations demonstrate consumer-owned callbacks. */
export function ChatSessionsDrawerDemo() {
  const { t } = useLocale();
  const [ids, setIds] = useState(["a", "b", "c", "d", "e", "f", "g"]);
  const [active, setActive] = useState<string | null>("a");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const labels = {
    newChat: t("globals.navDrawerSessionNew"),
    more: t("globals.navDrawerSessionMore"),
    rename: t("globals.navDrawerModeEntryRename"),
    delete: t("globals.navDrawerModeEntryDelete"),
    deleteAll: t("globals.navDrawerSessionDeleteAll"),
    deleteSelected: t("layouts.selectionDelete"),
    sessionMenu: t("globals.navDrawerSessionMore"),
    listMenu: t("globals.navDrawerSessionToolsAria"),
    emptyTitle: t("layouts.chatProductSessionsEmptyTitle"),
    emptyDescription: t("layouts.chatProductSessionsEmptyBody"),
    loading: t("globals.busyRegionLabel"),
    revealMore: t("globals.listRevealMore"),
  };
  const props = {
    sessions: ids.map((id) => ({ id, label: `${t("globals.navDrawerSessionEntry")} ${id.toUpperCase()}` })),
    activeSessionId: active,
    labels, busy,
    error: failed ? t("globals.navDrawerModeCatalogFailAlert") : null,
    reveal: { resetKey: epoch },
    selection: { resetKey: epoch },
    ariaLabel: t("globals.navDrawerSessionAria"),
    footer: <NavDrawerFooterAccount accountLabel={t("layouts.chatProductAccountLabel")}
      settingsLabel={t("globals.appBarSettings")} />,
    onNewChat: () => { setActive(null); setModalOpen(false); },
    onSelect: (id: string) => { setActive(id); setModalOpen(false); },
    onRename: (id: string) => snackbar(`${labels.rename}: ${id.toUpperCase()}`),
    onDelete: (id: string) => {
      setIds((prev) => prev.filter((value) => value !== id));
      if (active === id) setActive(null);
    },
    onDeleteAll: () => { setIds([]); setActive(null); },
    onDeleteSelected: (selectedIds: readonly string[]) => {
      setIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
      if (active != null && selectedIds.includes(active)) setActive(null);
    },
  };
  return <div id="sandbox-chat-sessions-drawer">
    <div className="sandbox-globals-row">
      <Switch label={t("layouts.sessionsDrawerBusy")} labelSide="end" checked={busy} onCheckedChange={setBusy} />
      <Switch label={t("layouts.sessionsDrawerError")} labelSide="end" checked={failed} onCheckedChange={setFailed} />
      <Button variant="ghost" onClick={() => {
        setIds(["a", "b", "c", "d", "e", "f", "g"]);
        setActive("a"); setBusy(false); setFailed(false); setEpoch((prev) => prev + 1);
      }}>{t("globals.navDrawerModeRefreshTip")}</Button>
      <Button variant="ghost" onClick={() => setModalOpen(true)}>{t("layouts.sessionsDrawerModal")}</Button>
    </div>
    <div className="sandbox-chat-product-stage">
      <ChatSessionsDrawer {...props} />
    </div>
    <ChatSessionsDrawer {...props} variant="modal" open={modalOpen} onClose={() => setModalOpen(false)} />
    <SandboxHelp text={t("layouts.sessionsDrawerHelp")} />
  </div>;
}
