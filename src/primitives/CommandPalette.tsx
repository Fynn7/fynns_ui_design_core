import type { ReactNode } from "react";
import { Combobox, type ComboboxRenderRowArgs, type ComboboxRow } from "./Combobox";
import { DialogShell } from "./Dialog";

/**
 * Command-palette shell: a top-anchored modal hosting the headless `Combobox`.
 * Business data (items, filtering, row rendering, selection) is injected by the
 * caller, so each app keeps its own command set while sharing the chrome.
 */
export type CommandPaletteProps<Item> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: (query: string) => ComboboxRow<Item>[];
  onPick: (item: Item, index: number) => void;
  renderRow: (args: ComboboxRenderRowArgs<Item>) => ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  renderEmpty?: () => ReactNode;
};

export function CommandPalette<Item>({
  open,
  onOpenChange,
  filter,
  onPick,
  renderRow,
  placeholder = "Type a command or search...",
  ariaLabel = "Command palette",
  renderEmpty,
}: CommandPaletteProps<Item>) {
  return (
    <DialogShell open={open} onClose={() => onOpenChange(false)} variant="command" ariaLabel={ariaLabel}>
      <Combobox<Item>
        open={open}
        autoFocus
        filter={filter}
        onPick={(item, index) => {
          onPick(item, index);
          onOpenChange(false);
        }}
        renderRow={renderRow}
        renderEmpty={renderEmpty}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        classes={{
          root: "fynns-command-palette",
          input: "fynns-command-palette-input",
          list: "fynns-command-palette-list",
          empty: "fynns-command-palette-empty",
        }}
      />
    </DialogShell>
  );
}
