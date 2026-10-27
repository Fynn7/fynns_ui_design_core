import {
  ArchiveIcon,
  Button,
  ArchivedChatsSettingsDialog,
  ClippedNavShell,
  ContextMenu,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  EmptyState,
  FillColumn,
  MoreHorizontalIcon,
  IconButton,
  PanelRightIcon,
  TopAppBar,
  Tooltip,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerNewChat,
  PencilIcon,
  RevealMore,
  Switch,
  TrashIcon,
  snackbar,
} from "@fynns/ui";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";
import { NavDrawerFooterAccount } from "./NavDrawerFooterAccount";
import { ChatConversationDemo } from "./ChatConversationDemo";

/**
 * Chat product / session host recipe — composite of recent session chrome +
 * empty-thread soft starters + docked ChatComposer.
 *
 * Tree: `ClippedNavShell` + session `NavigationDrawer`
 * (`NavigationDrawerNewChat` + EmptyState|Items + footer account) +
 * `FillColumn` → `Chat`. Flat destination roots stay on `DestinationAppShell`;
 * session-history chat / drill-in uses this keep-set tree.
 *
 * Live: `#layouts-demo-chat-product`.
 */
export function ChatProductLayoutsDemo({ withTopBar = false }: { withTopBar?: boolean }) {
  const { t } = useLocale();
  const [navOpen, setNavOpen] = useState(true);
  const [modalNavOpen, setModalNavOpen] = useState(false);
  const [sessionsEmpty, setSessionsEmpty] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [demoEpoch, setDemoEpoch] = useState(0);
  const [activeSession, setActiveSession] = useState<"alpha" | "beta" | null>(
    null,
  );
  /** ChatGPT-style archive: archived ids hide from history, restore via settings. */
  const [archivedIds, setArchivedIds] = useState<Array<"alpha" | "beta">>(["beta"]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    targetId: "alpha" | "beta" | null;
  }>({ open: false, x: 0, y: 0, targetId: null });

  const sessionLabel = (id: "alpha" | "beta") =>
    id === "alpha" ? t("layouts.chatProductSessionA") : t("layouts.chatProductSessionB");
  const visibleIds = (["alpha", "beta"] as const).filter(
    (id) => !sessionsEmpty && !archivedIds.includes(id),
  );

  const archiveSession = (id: "alpha" | "beta") => {
    if (archivedIds.includes(id)) return;
    const remaining = visibleIds.filter((visible) => visible !== id);
    setArchivedIds((prev) => [...prev, id]);
    if (activeSession === id) {
      if (remaining.length > 0) {
        setActiveSession(remaining[0]);
      } else {
        // Archiving the last visible session lands on new-chat, like ChatGPT.
        setActiveSession(null);
        setSessionsEmpty(true);
        setSessionsExpanded(false);
        setDemoEpoch((value) => value + 1);
      }
    }
    snackbar(t("layouts.chatProductArchiveToast"), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };

  const unarchiveSession = (id: string) => {
    if (id !== "alpha" && id !== "beta") return;
    setArchivedIds((prev) => prev.filter((archived) => archived !== id));
    setSessionsEmpty(false);
    setActiveSession(id);
    snackbar(t("layouts.chatProductUnarchiveToast"), {
      dismissAriaLabel: t("globals.snackbarDismiss"),
    });
  };

  const starterItems = [
    {
      id: "summarize",
      label: t("globals.chatStarter1Label"),
      prompt: t("globals.chatStarter1Prompt"),
    },
    {
      id: "outline",
      label: t("globals.chatStarter2Label"),
      prompt: t("globals.chatStarter2Prompt"),
    },
    {
      id: "rewrite",
      label: t("globals.chatStarter3Label"),
      prompt: t("globals.chatStarter3Prompt"),
    },
    {
      id: "checklist",
      label: t("globals.chatStarter4Label"),
      prompt: t("globals.chatStarter4Prompt"),
    },
    {
      id: "compare",
      label: t("globals.chatStarter5Label"),
      prompt: t("globals.chatStarter5Prompt"),
    },
    {
      id: "explain",
      label: t("globals.chatStarter6Label"),
      prompt: t("globals.chatStarter6Prompt"),
    },
  ];

  const resetToNewChatLanding = () => {
    setSessionsEmpty(true);
    setSessionsExpanded(false);
    setActiveSession(null);
    setArchivedIds(["beta"]);
    setRowMenu((prev) => ({ ...prev, open: false, targetId: null }));
    setDemoEpoch((value) => value + 1);
  };

  const closeRowMenu = () =>
    setRowMenu((prev) => ({ ...prev, open: false, targetId: null }));

  /** Right-click a history row opens the same actions as the row More menu. */
  const openRowMenu = (event: MouseEvent<HTMLElement>, id: "alpha" | "beta") => {
    event.preventDefault();
    setRowMenu({ open: true, x: event.clientX, y: event.clientY, targetId: id });
  };

  /** Shift+F10 / ContextMenu key mirrors right-click for keyboard users. */
  const rowKeyboardMenu = (
    event: KeyboardEvent<HTMLElement>,
    id: "alpha" | "beta",
  ) => {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setRowMenu({ open: true, x: rect.left, y: rect.bottom, targetId: id });
    }
  };

  /** Rename / Archive / Delete — shared by the row More menu and right-click. */
  const sessionMenuItems = (id: "alpha" | "beta") => (
    <>
      <DropdownMenuItem icon={<PencilIcon />}>
        {t("globals.navDrawerModeEntryRename")}
      </DropdownMenuItem>
      <DropdownMenuItem
        icon={<ArchiveIcon />}
        onClick={() => {
          closeRowMenu();
          archiveSession(id);
        }}
      >
        {t("globals.navDrawerModeEntryArchive")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem icon={<TrashIcon />} tone="danger">
        {t("globals.navDrawerModeEntryDelete")}
      </DropdownMenuItem>
    </>
  );

  const renderSessionItem = (
    id: "alpha" | "beta",
    onSelect: () => void,
  ) => (
    <NavigationDrawerItem
      label={sessionLabel(id)}
      active={activeSession === id}
      onClick={onSelect}
      aria-haspopup="menu"
      onContextMenu={(event) => openRowMenu(event, id)}
      onKeyDown={(event) => rowKeyboardMenu(event, id)}
      trailing={
        <DropdownMenu
          trigger={<MoreHorizontalIcon />}
          ariaLabel={t("globals.navDrawerModeEntryMore")}
          align="end"
          iconOnly
          size="sm"
          variant="ghost"
        >
          {sessionMenuItems(id)}
        </DropdownMenu>
      }
    />
  );

  /** New-chat landing: centered greeting + starter; composer pinned bottom. */
  const isNewChatLanding = sessionsEmpty;

  return (
    <>
      <div className="sandbox-globals-row sandbox-globals-row--stack">
        <Switch
          labelSide="end"
          label={t("layouts.chatProductNavMode")}
          checked={navOpen}
          onCheckedChange={setNavOpen}
        />
        <Button variant="ghost" onClick={() => setModalNavOpen(true)}>
          {t("globals.navDrawerSessionAria")}
        </Button>
        <Switch
          labelSide="end"
          label={t("layouts.chatProductSessionsEmpty")}
          checked={sessionsEmpty}
          onCheckedChange={(empty) => {
            setSessionsEmpty(empty);
            setSessionsExpanded(false);
            setDemoEpoch((value) => value + 1);
            if (empty) {
              setActiveSession(null);
            } else {
              setActiveSession("alpha");
            }
          }}
        />
      </div>
      <NavigationDrawer
        variant="modal"
        open={modalNavOpen}
        onClose={() => setModalNavOpen(false)}
        ariaLabel={t("globals.navDrawerSessionAria")}
        headline={t("globals.navDrawerSessionAria")}
        footer={
          <NavDrawerFooterAccount
            accountLabel={t("layouts.chatProductAccountLabel")}
            settingsLabel={t("globals.appBarSettings")}
            onSettingsClick={() => {
              setModalNavOpen(false);
              setSettingsOpen(true);
            }}
          />
        }
      >
        <NavigationDrawerNewChat
          label={t("globals.navDrawerSessionNew")}
          onClick={() => {
            resetToNewChatLanding();
            setModalNavOpen(false);
          }}
        />
        {visibleIds.length === 0 ? (
          <EmptyState
            size="sm"
            title={t("layouts.chatProductSessionsEmptyTitle")}
            description={t("layouts.chatProductSessionsEmptyBody")}
          />
        ) : (
          <>
            {visibleIds.map((id) =>
              renderSessionItem(id, () => setModalNavOpen(false)),
            )}
          </>
        )}
      </NavigationDrawer>
      <div className="sandbox-chat-product-stage sandbox-chat-landing-host">
        {/*
         * New-chat landing matches product chrome without TopAppBar
         * (drawer + FillColumn→Chat only — same keep-set tree as product chat).
         */}
        <ClippedNavShell
          className="fynns-destination-app-shell"
          navMode={navOpen ? "drawer" : "hidden"}
          onNavCrowded={() => setNavOpen(false)}
          topBar={withTopBar ? <TopAppBar title={t("layouts.chatProductChatLabel")} trailing={
            <Tooltip content="Inspector"><IconButton aria-label="Inspector" variant="ghost" size="sm"><PanelRightIcon /></IconButton></Tooltip>
          } /> : null}
          nav={
            <NavigationDrawer
              variant="standard"
              ariaLabel={t("globals.navDrawerSessionAria")}
              footer={
                <NavDrawerFooterAccount
                  accountLabel={t("layouts.chatProductAccountLabel")}
                  settingsLabel={t("globals.appBarSettings")}
                  settingsTip={t("globals.appBarSettings")}
                  onSettingsClick={() => setSettingsOpen(true)}
                />
              }
            >
              <NavigationDrawerNewChat
                label={t("globals.navDrawerSessionNew")}
                onClick={() => {
                  resetToNewChatLanding();
                  snackbar(t("layouts.chatProductNewToast"), {
                    dismissAriaLabel: t("globals.snackbarDismiss"),
                  });
                }}
                trailing={
                  <DropdownMenu
                    trigger={<MoreHorizontalIcon />}
                    ariaLabel={t("globals.navDrawerSessionMore")}
                    align="end"
                    iconOnly
                    size="sm"
                    variant="ghost"
                  >
                    <DropdownMenuItem
                      icon={<TrashIcon />}
                      tone="danger"
                      disabled={visibleIds.length === 0}
                      onClick={() => {
                        resetToNewChatLanding();
                        snackbar(t("layouts.chatProductDeleteAllToast"), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        });
                      }}
                    >
                      {t("globals.navDrawerSessionDeleteAll")}
                    </DropdownMenuItem>
                  </DropdownMenu>
                }
              />
              {visibleIds.length === 0 ? (
                <EmptyState
                  size="sm"
                  title={t("layouts.chatProductSessionsEmptyTitle")}
                  description={t("layouts.chatProductSessionsEmptyBody")}
                />
              ) : (
                <>
                  {visibleIds.map((id) =>
                    renderSessionItem(id, () => setActiveSession(id)),
                  )}
                  <RevealMore
                    canRevealMore={!sessionsExpanded}
                    onRevealMore={() => setSessionsExpanded(true)}
                    label={t("globals.listRevealMore")}
                  />
                  {sessionsExpanded ? (
                    <NavigationDrawerItem
                      label={t("globals.navDrawerSessionEntry")}
                      onClick={() => snackbar(t("layouts.chatProductNewToast"))}
                    />
                  ) : null}
                </>
              )}
            </NavigationDrawer>
          }
        >
          <div className="fynns-destination-app-shell-canvas">
            <FillColumn>
              <ChatConversationDemo
                key={demoEpoch}
                label={t("layouts.chatProductChatLabel")}
                ariaLabel={t("layouts.fillColumnComposerAria")}
                placeholder={t("layouts.chatProductComposerPlaceholder")}
                sendLabel={t("layouts.fillColumnSend")}
                starterItems={starterItems}
                landing={isNewChatLanding}
                activeSessionId={activeSession}
                onFirstSend={() => {
                  setSessionsEmpty(false);
                  // A first send after archiving everything revives the landing target.
                  setArchivedIds((prev) => prev.filter((id) => id !== "alpha"));
                  setActiveSession("alpha");
                }}
              />
            </FillColumn>
          </div>
        </ClippedNavShell>
      </div>
      {/* Right-click parity with the row More menu: Rename / Archive / Delete. */}
      <ContextMenu
        open={rowMenu.open}
        x={rowMenu.x}
        y={rowMenu.y}
        ariaLabel={t("globals.navDrawerModeEntryMore")}
        onOpenChange={(open) => {
          if (!open) closeRowMenu();
        }}
      >
        {rowMenu.targetId == null ? null : sessionMenuItems(rowMenu.targetId)}
      </ContextMenu>
      {/* ChatGPT-style settings: footer gear opens the settings window. */}
      <ArchivedChatsSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        sessions={archivedIds.map((id) => ({ id, label: sessionLabel(id) }))}
        labels={{
          title: t("globals.appBarSettings"),
          categories: t("layouts.chatProductSettingsCategories"),
          general: t("layouts.chatProductGeneral"),
          generalSample: t("layouts.chatProductGeneralSample"),
          archived: t("layouts.chatProductArchivedTitle"),
          unarchive: t("layouts.chatProductArchivedUnarchive"),
          close: t("layouts.chatProductSettingsClose"),
          archivedEmptyTitle: t("layouts.chatProductArchivedEmptyTitle"),
          archivedEmptyDescription: t("layouts.chatProductArchivedEmptyBody"),
        }}
        onUnarchive={unarchiveSession}
      />
      <SandboxHelp text={t("layouts.chatProductHelp")} />
    </>
  );
}
