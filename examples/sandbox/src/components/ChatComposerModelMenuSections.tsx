import { Fragment, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@fynns/ui";

export type ChatComposerModelSectionId = "local" | "cloud" | "cli";

export type ChatComposerModelSection = {
  id: ChatComposerModelSectionId;
  /** Visible group label (Local / Cloud / CLI). */
  label: string;
  /** Model ids to list. Empty → omit this section entirely. */
  models: string[];
};

export type ChatComposerModelMenuSectionsProps = {
  trigger: ReactNode;
  ariaLabel: string;
  /** Sections with models. Omit empty ones — caller filters. */
  sections: ChatComposerModelSection[];
  /** Shown when `sections` is empty (no configured providers). */
  emptyLabel: string;
  /** Optional foot action after sections (e.g. refresh / open connection). */
  footer?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "tonal" | "elevated" | "danger" | "ghost";
  align?: "start" | "end";
  onSelectModel?: (sectionId: ChatComposerModelSectionId, model: string) => void;
};

/**
 * Sandbox / consumer recipe for ChatComposer `endActions` model Menu:
 * Local · Cloud · CLI groups separated by hairlines. Only render a group when
 * that source is configured and has models; if none — `emptyLabel` only.
 * Live `#sandbox-chat-composer-model-sections` / `#sandbox-chat-composer-model-empty`.
 */
export function ChatComposerModelMenuSections({
  trigger,
  ariaLabel,
  sections,
  emptyLabel,
  footer,
  disabled = false,
  size = "sm",
  variant = "ghost",
  align = "end",
  onSelectModel,
}: ChatComposerModelMenuSectionsProps) {
  const visible = sections.filter((s) => s.models.length > 0);

  return (
    <DropdownMenu
      trigger={trigger}
      ariaLabel={ariaLabel}
      align={align}
      size={size}
      variant={variant}
      disabled={disabled}
    >
      {visible.length === 0 ? (
        <DropdownMenuItem disabled>{emptyLabel}</DropdownMenuItem>
      ) : (
        visible.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup label={section.label}>
              {section.models.map((model) => (
                <DropdownMenuItem
                  key={`${section.id}:${model}`}
                  onClick={() => onSelectModel?.(section.id, model)}
                >
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </Fragment>
        ))
      )}
      {footer != null ? (
        <>
          <DropdownMenuSeparator />
          {footer}
        </>
      ) : null}
    </DropdownMenu>
  );
}
