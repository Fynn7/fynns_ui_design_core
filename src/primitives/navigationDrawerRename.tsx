import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";
import { isDevEnv } from "./devEnv";
import { Dialog } from "./Dialog";
import { FieldBlock } from "./FieldHeader";
import { FieldStack } from "./FieldStack";
import { CheckIcon, CloseIcon } from "./icons";
import { Input } from "./Input";

/**
 * Localized copy for the core rename dialog. Every field is a **human
 * sentence** — no counts, no parenthetical glosses.
 */
export type NavigationDrawerRenameLabels = {
  /** Dialog title — e.g. "Rename document". */
  title: string;
  /** Field label — e.g. "Name". */
  field: string;
  /** Cancel action label — e.g. "Cancel". */
  cancel: string;
  /** Save action label — e.g. "Save". */
  save: string;
};

const DEFAULT_RENAME_LABELS: NavigationDrawerRenameLabels = {
  title: "Rename",
  field: "Name",
  cancel: "Cancel",
  save: "Save",
};

/** Merge consumer copy over the English defaults. */
export function resolveRenameLabels(
  labels?: Partial<NavigationDrawerRenameLabels>,
): NavigationDrawerRenameLabels {
  return { ...DEFAULT_RENAME_LABELS, ...labels };
}

export type NavigationDrawerRenameOptions = {
  /** The gesture is enabled (`renamable`). */
  renamable: boolean;
  /** Current destination label — seeds the field. */
  label: string;
  /** A disabled destination never opens the dialog. */
  disabled?: boolean;
  /** Commit the trimmed label; fires only when the name changed. */
  onRename?: (nextLabel: string) => void;
  /** Controlled open state (pair it with `onRenameOpenChange`). */
  renameOpen?: boolean;
  /** Notified when the dialog opens or closes. */
  onRenameOpenChange?: (open: boolean) => void;
};

export type NavigationDrawerRenameState = {
  /** Whether the rename dialog is open. */
  visible: boolean;
  /** Field value — the current label until the user types. */
  value: string;
  /** Record a typed value. */
  setValue: (next: string) => void;
  /** Open the dialog (double-click / F2). */
  open: () => void;
  /** Close without committing. */
  cancel: () => void;
  /** Commit the trimmed value; an empty name is a no-op. */
  commit: () => void;
};

/**
 * Rename state for a nav drawer destination: gesture, controlled/uncontrolled
 * open state, the draft value and the commit rules.
 */
export function useNavigationDrawerRename({
  renamable,
  label,
  disabled,
  onRename,
  renameOpen,
  onRenameOpenChange,
}: NavigationDrawerRenameOptions): NavigationDrawerRenameState {
  const controlled = renameOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  /** `null` = untouched, so the field always starts from the current label. */
  const [draft, setDraft] = useState<string | null>(null);
  const visible = controlled ? renameOpen === true : internalOpen;
  const value = draft ?? label;
  const warnedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!isDevEnv()) return;
    const warn = (key: string, message: string) => {
      if (warnedRef.current[key]) return;
      warnedRef.current[key] = true;
      console.warn(message);
    };
    if (renamable && onRename == null) {
      warn(
        "onRename",
        "[fynns] NavigationDrawerItem: `renamable` needs `onRename` to commit the new name. " +
          "Without it the core rename dialog opens but Save discards the typed name.",
      );
    }
    if (renamable && controlled && onRenameOpenChange == null) {
      warn(
        "onRenameOpenChange",
        "[fynns] NavigationDrawerItem: `renameOpen` makes the rename dialog controlled. " +
          "Pair it with `onRenameOpenChange`, otherwise the double-click / F2 gesture cannot open it.",
      );
    }
    if (!renamable && controlled) {
      warn(
        "renamable",
        "[fynns] NavigationDrawerItem: `renameOpen` needs `renamable` — without it the core rename dialog is not rendered.",
      );
    }
  }, [renamable, onRename, controlled, onRenameOpenChange]);

  const open = () => {
    if (disabled) return;
    setDraft(null);
    if (!controlled) setInternalOpen(true);
    onRenameOpenChange?.(true);
  };

  const cancel = () => {
    setDraft(null);
    if (!controlled) setInternalOpen(false);
    onRenameOpenChange?.(false);
  };

  const commit = () => {
    const next = value.trim();
    // An empty name is not a rename — keep the dialog open (Save is disabled).
    if (!next) return;
    cancel();
    if (next !== label) onRename?.(next);
  };

  return { visible, value, setValue: setDraft, open, cancel, commit };
}

export type NavigationDrawerRenameDialogProps = {
  /** Whether the dialog is open. */
  open: boolean;
  /** Field value. */
  value: string;
  /** Record a typed value. */
  onValueChange: (next: string) => void;
  /** Commit the typed name. */
  onCommit: () => void;
  /** Close without committing. */
  onCancel: () => void;
  /** Localized copy. */
  labels: NavigationDrawerRenameLabels;
};

/**
 * Core rename dialog: title, one `Name` field, `feet` = ghost Cancel (X) then
 * the single primary Save (✓). `Enter` commits, `Escape` cancels.
 */
export function NavigationDrawerRenameDialog({
  open,
  value,
  onValueChange,
  onCommit,
  onCancel,
  labels,
}: NavigationDrawerRenameDialogProps) {
  const fieldId = useId();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title={labels.title}
      feet={
        <div className="fynns-control-cluster fynns-control-cluster--end-align">
          <Button variant="ghost" onClick={onCancel}>
            <CloseIcon />
            {labels.cancel}
          </Button>
          <Button variant="primary" disabled={!value.trim()} onClick={onCommit}>
            <CheckIcon />
            {labels.save}
          </Button>
        </div>
      }
    >
      <FieldStack>
        <FieldBlock label={labels.field} htmlFor={fieldId}>
          <Input
            id={fieldId}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              onCommit();
            }}
          />
        </FieldBlock>
      </FieldStack>
    </Dialog>
  );
}
