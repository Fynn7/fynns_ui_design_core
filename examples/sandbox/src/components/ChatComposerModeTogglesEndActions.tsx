import {
  BrainIcon,
  ChatComposerToggle,
  EyeIcon,
  Tooltip,
} from "@fynns/ui";
import {
  ChatComposerModelMenuSections,
  type ChatComposerModelSection,
} from "./ChatComposerModelMenuSections";

export type ChatComposerModeTogglesEndActionsProps = {
  modelTrigger: string;
  modelAriaLabel: string;
  modelEmptyLabel: string;
  modelSections: ChatComposerModelSection[];
  thinkingPressed: boolean;
  onThinkingChange: (value: boolean) => void;
  thinkingLabel: string;
  thinkingAriaLabel: string;
  thinkingTip: string;
  visionPressed: boolean;
  onVisionChange: (value: boolean) => void;
  visionLabel: string;
  visionAriaLabel: string;
  visionTip: string;
};

/**
 * Sandbox / consumer recipe for ChatComposer `endActions` mode chrome:
 * Model Menu → Thinking → Vision (Tooltip on each pill).
 * Core ≤ **36rem** composer container hides pill labels (icon-only; tip +
 * `aria-label` remain — ≥ **0.5.293**) — live
 * `#sandbox-chat-composer-thinking-toggle` (wide) /
 * `#sandbox-chat-composer-thinking-toggle-narrow`.
 */
export function ChatComposerModeTogglesEndActions({
  modelTrigger,
  modelAriaLabel,
  modelEmptyLabel,
  modelSections,
  thinkingPressed,
  onThinkingChange,
  thinkingLabel,
  thinkingAriaLabel,
  thinkingTip,
  visionPressed,
  onVisionChange,
  visionLabel,
  visionAriaLabel,
  visionTip,
}: ChatComposerModeTogglesEndActionsProps) {
  return (
    <>
      <ChatComposerModelMenuSections
        trigger={modelTrigger}
        ariaLabel={modelAriaLabel}
        emptyLabel={modelEmptyLabel}
        sections={modelSections}
      />
      <Tooltip content={thinkingTip}>
        <ChatComposerToggle
          pressed={thinkingPressed}
          onPressedChange={onThinkingChange}
          ariaLabel={thinkingAriaLabel}
          leadingIcon={<BrainIcon size={16} />}
        >
          {thinkingLabel}
        </ChatComposerToggle>
      </Tooltip>
      <Tooltip content={visionTip}>
        <ChatComposerToggle
          pressed={visionPressed}
          onPressedChange={onVisionChange}
          ariaLabel={visionAriaLabel}
          leadingIcon={<EyeIcon size={16} />}
        >
          {visionLabel}
        </ChatComposerToggle>
      </Tooltip>
    </>
  );
}
