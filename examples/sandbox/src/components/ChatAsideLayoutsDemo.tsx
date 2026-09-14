import {
  Chat,
  ChatComposer,
  ChatThread,
  DestinationAppShell,
  EmptyState,
  FolderOpenIcon,
  Switch,
  snackbar,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";
import { ChatNewChatLandingEmpty } from "./ChatNewChatLandingEmpty";

/**
 * Aside chat product recipe — same new-chat landing content as
 * `#layouts-demo-chat-product`, hosted in EndAside (`.fynns-chat-host--fill`).
 * Main canvas stays a generic placeholder so the sidebar is the theme screen.
 *
 * Live: `#layouts-demo-chat-aside`.
 */
export function ChatAsideLayoutsDemo() {
  const { t } = useLocale();
  const [navOpen, setNavOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(true);
  const [draft, setDraft] = useState("");

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

  const composer = (
    <ChatComposer
      value={draft}
      onChange={setDraft}
      ariaLabel={t("layouts.chatAsideComposerAria")}
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
          label={t("layouts.chatAsideOpen")}
          checked={asideOpen}
          onCheckedChange={setAsideOpen}
        />
      </div>
      <div className="sandbox-chat-aside-product-stage sandbox-chat-landing-host">
        <DestinationAppShell
          className="fynns-destination-app-shell"
          title={t("layouts.chatAsideShellTitle")}
          navAriaLabel={t("layouts.chatAsideNavAria")}
          expandNavLabel={t("nav.expand")}
          collapseNavLabel={t("nav.collapse")}
          asideToggleLabel={t("layouts.chatAsideToggle")}
          navOpen={navOpen}
          onNavOpenChange={setNavOpen}
          asideOpen={asideOpen}
          onAsideOpenChange={setAsideOpen}
          activeId="home"
          onActiveIdChange={() => {}}
          destinations={[
            {
              id: "home",
              icon: <FolderOpenIcon />,
              label: t("layouts.chatAsideDestHome"),
            },
          ]}
          aside={
            <div className="fynns-chat-host--fill">
              <Chat
                label={t("layouts.chatAsideChatLabel")}
                className="sandbox-chat--landing"
              >
                <ChatThread
                  empty={
                    <ChatNewChatLandingEmpty
                      items={starterItems}
                      composer={composer}
                      onSelect={(prompt) => {
                        snackbar(t("globals.chatStarterSent", { prompt }), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        });
                      }}
                    />
                  }
                />
              </Chat>
            </div>
          }
        >
          <EmptyState
            fill
            title={t("layouts.chatAsideCanvasTitle")}
            description={t("layouts.chatAsideCanvasBody")}
          />
        </DestinationAppShell>
      </div>
      <SandboxHelp text={t("layouts.chatAsideHelp")} />
    </>
  );
}
