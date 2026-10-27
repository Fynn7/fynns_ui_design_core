import { useEffect, useId, useState } from "react";
import { ArchiveIcon, SettingsIcon, UndoIcon } from "./icons";
import { Button } from "./Button";
import type { ChatSessionsDrawerSession } from "./ChatSessionsDrawer";
import { ControlRow } from "./ControlRow";
import { Dialog } from "./Dialog";
import { EmptyState } from "./EmptyState";
import { FieldStack } from "./FieldStack";
import { NavigationDrawerItem } from "./NavigationDrawer";
import { Switch } from "./Switch";

/**
 * Localized copy for the archived-chats settings window. Every field is a
 * **human sentence** — no counts, no parenthetical glosses.
 */
export type ArchivedChatsSettingsDialogLabels = {
  /** Window title — e.g. "Settings" (this surface really is settings). */
  title: string;
  /** Settings category nav label — e.g. "Settings categories". */
  categories: string;
  /** Sample category — e.g. "General". */
  general: string;
  /** Sample switch inside General — e.g. "Dark theme". */
  generalSample: string;
  /** Archived category + sub-page title — e.g. "Archived chats". */
  archived: string;
  /** Per-row restore action — e.g. "Unarchive". */
  unarchive: string;
  /** Dialog close (X) accessible name — e.g. "Close settings". */
  close: string;
  /** Empty-state title when nothing is archived. */
  archivedEmptyTitle: string;
  /** Empty-state body hinting at the archive gesture. */
  archivedEmptyDescription?: string;
};

export type ArchivedChatsSettingsDialogProps = {
  /** Controlled open state — the consumer opens it from the drawer footer settings. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Archived sessions; display order is caller-owned. */
  sessions: readonly ChatSessionsDrawerSession[];
  /** Localized copy. */
  labels: ArchivedChatsSettingsDialogLabels;
  /** Restore request: the consumer moves the session back to history. */
  onUnarchive: (sessionId: string) => void;
};

type SettingsCategory = "general" | "archived";

/**
 * ChatGPT-shaped settings window for archived chats: the drawer footer
 * settings gear opens this surface — left settings-category nav (`general` +
 * `archived`, nav-body item styles), right sub-page. The archived sub-page is
 * title + rows with `Unarchive` only: no search, no filters, no bulk delete.
 * Pair with `ChatSessionsDrawer onArchive` (row Rename / Archive / Delete) —
 * the drawer only requests; the consumer owns archived storage, dialogs and
 * persistence. Live: sandbox Layouts `#layouts-demo-chat-sessions-drawer`.
 */
export function ArchivedChatsSettingsDialog({
  open,
  onOpenChange,
  sessions,
  labels,
  onUnarchive,
}: ArchivedChatsSettingsDialogProps) {
  const [category, setCategory] = useState<SettingsCategory>("archived");
  const [sampleOn, setSampleOn] = useState(true);
  const headingId = useId();
  // The entry point is archive browsing — always land on the archived sub-page.
  useEffect(() => {
    if (open) {
      setCategory("archived");
    }
  }, [open ]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={labels.title}
      className="fynns-settings-dialog"
      size="lg"
      showCloseButton
      closeAriaLabel={labels.close}
    >
      <div className="fynns-settings-layout">
        <nav className="fynns-settings-nav" aria-label={labels.categories}>
          <NavigationDrawerItem
            icon={<SettingsIcon aria-hidden />}
            label={labels.general}
            active={category === "general"}
            onClick={() => setCategory("general")}
          />
          <NavigationDrawerItem
            icon={<ArchiveIcon aria-hidden />}
            label={labels.archived}
            active={category === "archived"}
            onClick={() => setCategory("archived")}
          />
        </nav>
        <section className="fynns-settings-content" aria-labelledby={headingId}>
          <h3 className="fynns-settings-heading" id={headingId}>
            {category === "general" ? labels.general : labels.archived}
          </h3>
          {category === "general" ? (
            <ControlRow label={labels.generalSample}>
              <Switch
                label=""
                ariaLabel={labels.generalSample}
                checked={sampleOn}
                onCheckedChange={setSampleOn}
              />
            </ControlRow>
          ) : sessions.length === 0 ? (
            <EmptyState
              size="sm"
              title={labels.archivedEmptyTitle}
              description={labels.archivedEmptyDescription}
            />
          ) : (
            <FieldStack>
              {sessions.map((session) => (
                <ControlRow key={session.id} label={session.label}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={session.disabled}
                    onClick={() => onUnarchive(session.id)}
                  >
                    <UndoIcon aria-hidden />
                    {labels.unarchive}
                  </Button>
                </ControlRow>
              ))}
            </FieldStack>
          )}
        </section>
      </div>
    </Dialog>
  );
}
