import { useState } from "react";
import { Button, ArchivedChatsSettingsDialog, ChatSessionsDrawer, Switch, snackbar } from "@fynns/ui";
import { useLocale } from "../i18n";
import { NavDrawerFooterAccount } from "./NavDrawerFooterAccount";
import { SandboxHelp } from "./SandboxHelp";

/** Generic session data only; mutations demonstrate consumer-owned callbacks. */
export function ChatSessionsDrawerDemo() {
  const { t } = useLocale();
  const [ids, setIds] = useState(["a", "b", "c", "d", "e", "f", "g"]);
  /** Sample archived chats so the settings sub-page opens with rows. */
  const [archivedIds, setArchivedIds] = useState<string[]>(["f", "g"]);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [active, setActive] = useState<string | null>("a");
  // Standard and modal views share selection, including its rounded trailing host.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const labels = {
    newChat: t("globals.navDrawerSessionNew"),
    more: t("globals.navDrawerSessionMore"),
    rename: t("globals.navDrawerModeEntryRename"),
    archive: t("globals.navDrawerModeEntryArchive"),
    delete: t("globals.navDrawerModeEntryDelete"),
    deleteAll: t("globals.navDrawerSessionDeleteAll"),
    deleteSelected: t("layouts.selectionDelete"),
    sessionMenu: t("globals.navDrawerSessionMore"),
    listMenu: t("globals.navDrawerSessionToolsAria"),
    emptyTitle: t("layouts.chatProductSessionsEmptyTitle"),
    emptyDescription: t("layouts.chatProductSessionsEmptyBody"),
    loading: t("globals.busyRegionLabel"),
    runningLabel: t("layouts.sessionsDrawerRunningState"),
    revealMore: t("globals.listRevealMore"),
  };
  const sessionLabel = (id: string) => `${t("globals.navDrawerSessionEntry")} ${id.toUpperCase()}`;
  const visibleIds = ids.filter((id) => !archivedIds.includes(id));
  const archive = (id: string) => {
    if (archivedIds.includes(id)) return;
    setArchivedIds((prev) => [...prev, id]);
    if (active === id) {
      const remaining = visibleIds.filter((visible) => visible !== id);
      setActive(remaining[0] ?? null);
    }
    snackbar(t("layouts.sessionsDrawerArchiveToast"), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };
  const unarchive = (id: string) => {
    setArchivedIds((prev) => prev.filter((archived) => archived !== id));
    if (ids.includes(id)) setActive(id);
    snackbar(t("layouts.sessionsDrawerUnarchiveToast"), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };
  const props = {
    sessions: visibleIds.map((id) => ({
      id,
      label: sessionLabel(id),
      running: id === runningId,
    })),
    activeSessionId: active,
    labels, busy,
    error: failed ? t("globals.navDrawerModeCatalogFailAlert") : null,
    reveal: { resetKey: epoch },
    selection: { resetKey: epoch, selectedIds, onSelectionChange: setSelectedIds },
    ariaLabel: t("globals.navDrawerSessionAria"),
    footer: <NavDrawerFooterAccount accountLabel={t("layouts.chatProductAccountLabel")}
      settingsLabel={t("globals.appBarSettings")}
      settingsTip={t("globals.appBarSettings")}
      onSettingsClick={() => setArchivedOpen(true)} />,
    onNewChat: () => { setActive(null); setModalOpen(false); },
    onSelect: (id: string) => { setActive(id); setModalOpen(false); },
    onRename: (id: string) => snackbar(`${labels.rename}: ${id.toUpperCase()}`),
    onArchive: archive,
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
      <Switch label={t("layouts.sessionsDrawerRunning")} labelSide="end" checked={runningId !== null}
        onCheckedChange={(checked) => setRunningId(checked ? "b" : null)} />
      <Button variant="ghost" onClick={() => {
        setIds(["a", "b", "c", "d", "e", "f", "g"]);
        setArchivedIds(["f", "g"]);
        setActive("a"); setBusy(false); setFailed(false); setRunningId(null); setEpoch((prev) => prev + 1);
      }}>{t("globals.navDrawerModeRefreshTip")}</Button>
      <Button variant="ghost" onClick={() => setModalOpen(true)}>{t("layouts.sessionsDrawerModal")}</Button>
    </div>
    <div className="sandbox-chat-product-stage">
      <ChatSessionsDrawer {...props} />
    </div>
    <ChatSessionsDrawer {...props} variant="modal" open={modalOpen} onClose={() => setModalOpen(false)} />
    <ArchivedChatsSettingsDialog
      open={archivedOpen}
      onOpenChange={setArchivedOpen}
      sessions={archivedIds.map((id) => ({ id, label: sessionLabel(id) }))}
      labels={{
        title: t("globals.appBarSettings"),
        categories: t("layouts.sessionsDrawerSettingsCategories"),
        general: t("layouts.sessionsDrawerGeneral"),
        generalSample: t("layouts.sessionsDrawerGeneralSample"),
        archived: t("layouts.sessionsDrawerArchivedTitle"),
        unarchive: t("layouts.sessionsDrawerArchivedUnarchive"),
        close: t("layouts.sessionsDrawerArchivedClose"),
        archivedEmptyTitle: t("layouts.sessionsDrawerArchivedEmptyTitle"),
        archivedEmptyDescription: t("layouts.sessionsDrawerArchivedEmptyBody"),
      }}
      onUnarchive={unarchive}
    />
    <SandboxHelp text={t("layouts.sessionsDrawerHelp")} />
  </div>;
}
