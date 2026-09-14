import {
  Chat,
  ChatComposer,
  ChatThread,
  ClippedNavShell,
  DropdownMenu,
  DropdownMenuItem,
  EmptyState,
  FileIcon,
  FillColumn,
  MoreHorizontalIcon,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerNewChat,
  PencilIcon,
  Switch,
  TrashIcon,
  snackbar,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";
import { NavDrawerFooterAccount } from "./NavDrawerFooterAccount";
import { ChatEmptySurfaceStarters } from "./ChatEmptySurfaceStarters";
import { ChatNewChatLandingEmpty } from "./ChatNewChatLandingEmpty";

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
export function ChatProductLayoutsDemo() {
  const { t } = useLocale();
  const [navOpen, setNavOpen] = useState(true);
  const [sessionsEmpty, setSessionsEmpty] = useState(true);
  const [draft, setDraft] = useState("");
  const [activeSession, setActiveSession] = useState<"alpha" | "beta" | null>(
    null,
  );

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
    setActiveSession(null);
    setDraft("");
  };

  /** New-chat landing: centered greeting + starter; composer pinned bottom. */
  const isNewChatLanding = sessionsEmpty;

  const composer = (
    <ChatComposer
      value={draft}
      onChange={setDraft}
      ariaLabel={t("layouts.fillColumnComposerAria")}
      placeholder={t("layouts.chatProductComposerPlaceholder")}
      sendLabel={t("layouts.fillColumnSend")}
      onSubmit={() => setDraft("")}
    />
  );

  return (
    <>
      <div className="sandbox-globals-row sandbox-globals-row--stack">
        <Switch
          labelSide="end"
          label={t("layouts.chatProductNavMode")}
          checked={navOpen}
          onCheckedChange={setNavOpen}
        />
        <Switch
          labelSide="end"
          label={t("layouts.chatProductSessionsEmpty")}
          checked={sessionsEmpty}
          onCheckedChange={(empty) => {
            setSessionsEmpty(empty);
            if (empty) {
              setActiveSession(null);
            } else {
              setActiveSession("alpha");
            }
          }}
        />
      </div>
      <div className="sandbox-chat-product-stage sandbox-chat-landing-host">
        {/*
         * New-chat landing matches product chrome without TopAppBar
         * (drawer + FillColumn→Chat only — same keep-set tree as CV chat).
         */}
        <ClippedNavShell
          className="fynns-destination-app-shell"
          navMode={navOpen ? "drawer" : "hidden"}
          onNavCrowded={() => setNavOpen(false)}
          topBar={null}
          nav={
            <NavigationDrawer
              variant="standard"
              ariaLabel={t("globals.navDrawerSessionAria")}
              footer={
                <NavDrawerFooterAccount
                  accountLabel={t("layouts.chatProductAccountLabel")}
                  settingsLabel={t("globals.appBarSettings")}
                  settingsTip={t("globals.appBarSettings")}
                  onSettingsClick={() =>
                    snackbar(t("layouts.chatProductSettingsToast"), {
                      dismissAriaLabel: t("globals.snackbarDismiss"),
                    })
                  }
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
                      disabled={sessionsEmpty}
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
              {sessionsEmpty ? (
                <EmptyState
                  size="sm"
                  title={t("layouts.chatProductSessionsEmptyTitle")}
                  description={t("layouts.chatProductSessionsEmptyBody")}
                />
              ) : (
                <>
                  <NavigationDrawerItem
                    icon={<FileIcon />}
                    label={t("layouts.chatProductSessionA")}
                    active={activeSession === "alpha"}
                    onClick={() => setActiveSession("alpha")}
                    trailing={
                      <DropdownMenu
                        trigger={<MoreHorizontalIcon />}
                        ariaLabel={t("globals.navDrawerModeEntryMore")}
                        align="end"
                        iconOnly
                        size="sm"
                        variant="ghost"
                      >
                        <DropdownMenuItem icon={<PencilIcon />}>
                          {t("globals.navDrawerModeEntryRename")}
                        </DropdownMenuItem>
                        <DropdownMenuItem icon={<TrashIcon />} tone="danger">
                          {t("globals.navDrawerModeEntryDelete")}
                        </DropdownMenuItem>
                      </DropdownMenu>
                    }
                  />
                  <NavigationDrawerItem
                    icon={<FileIcon />}
                    label={t("layouts.chatProductSessionB")}
                    active={activeSession === "beta"}
                    onClick={() => setActiveSession("beta")}
                    trailing={
                      <DropdownMenu
                        trigger={<MoreHorizontalIcon />}
                        ariaLabel={t("globals.navDrawerModeEntryMore")}
                        align="end"
                        iconOnly
                        size="sm"
                        variant="ghost"
                      >
                        <DropdownMenuItem icon={<TrashIcon />} tone="danger">
                          {t("globals.navDrawerModeEntryDelete")}
                        </DropdownMenuItem>
                      </DropdownMenu>
                    }
                  />
                </>
              )}
            </NavigationDrawer>
          }
        >
          <div className="fynns-destination-app-shell-canvas">
            <FillColumn>
              <Chat
                label={t("layouts.chatProductChatLabel")}
                className={
                  isNewChatLanding ? "sandbox-chat--landing" : undefined
                }
              >
                <ChatThread
                  empty={
                    isNewChatLanding ? (
                      <ChatNewChatLandingEmpty
                        items={starterItems}
                        composer={composer}
                        onSelect={(prompt) => {
                          snackbar(
                            t("globals.chatStarterSent", { prompt }),
                            {
                              dismissAriaLabel: t("globals.snackbarDismiss"),
                            },
                          );
                        }}
                      />
                    ) : (
                      <div className="fynns-unit-stack sandbox-chat-empty">
                        <EmptyState title={t("globals.chatEmpty")} />
                        <ChatEmptySurfaceStarters
                          ariaLabel={t("globals.chatStarterAria")}
                          items={starterItems}
                          onSelect={(prompt) => {
                            snackbar(
                              t("globals.chatStarterSent", { prompt }),
                              {
                                dismissAriaLabel: t("globals.snackbarDismiss"),
                              },
                            );
                          }}
                        />
                      </div>
                    )
                  }
                />
                {isNewChatLanding ? null : composer}
              </Chat>
            </FillColumn>
          </div>
        </ClippedNavShell>
      </div>
      <SandboxHelp text={t("layouts.chatProductHelp")} />
    </>
  );
}
