import { forwardRef, useRef, useState } from "react";
import { Chip, ChipSet } from "./Chip";
import { Input, type InputProps } from "./Input";

export type TagInputProps = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "children"> & {
  /** Controlled tag list. Entries are trimmed and deduplicated when added. */
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  /** Localized accessible name for the selected-tag group. */
  tagsAriaLabel: string;
  /** Localized accessible name for each built-in remove control. */
  removeAriaLabel: (tag: string) => string;
};

/** Selected chips above a text field. Enter/blur commits comma-separated tags.
 * Supply the field label with FieldBlock + id, or aria-label/aria-labelledby.
 * Draft text stays local; name/form apply to the draft input, not the tag list.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput({
  value, onValueChange, tagsAriaLabel, removeAriaLabel, className,
  disabled, readOnly, onKeyDown, onBlur, onCompositionStart, onCompositionEnd, ...inputProps
}, ref) {
  const [draft, setDraft] = useState("");
  const composing = useRef(false);
  const commit = () => {
    if (disabled || readOnly || composing.current) return;
    const next = [...value];
    for (const tag of draft.split(/[,，]/).map(item => item.trim()).filter(Boolean)) {
      if (!next.includes(tag)) next.push(tag);
    }
    if (next.length !== value.length) onValueChange(next);
    setDraft("");
  };

  return <div className={["fynns-tag-input", className].filter(Boolean).join(" ")}>
    {value.length > 0 && <ChipSet ariaLabel={tagsAriaLabel}>
      {value.map((tag, index) => <Chip key={`${index}:${tag}`} variant="input" selected
        disabled={disabled || readOnly} removeAriaLabel={removeAriaLabel(tag)}
        onRemove={() => {
          if (!disabled && !readOnly) onValueChange(value.filter((_, itemIndex) => itemIndex !== index));
        }}>{tag}</Chip>)}
    </ChipSet>}
    <Input {...inputProps} ref={ref} type="text" value={draft} disabled={disabled} readOnly={readOnly}
      onChange={event => setDraft(event.target.value)}
      onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
      onCompositionEnd={event => { composing.current = false; onCompositionEnd?.(event); }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Enter" && !event.nativeEvent.isComposing && !composing.current && event.keyCode !== 229) {
          event.preventDefault();
          commit();
        }
      }}
      onBlur={event => { onBlur?.(event); if (!event.defaultPrevented) commit(); }} />
  </div>;
});
