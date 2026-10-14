# TagInput

← back to [Design system index](../DESIGN_SYSTEM.md)

`TagInput` owns a selected `ChipSet` above an `Input`, including the remove
controls and token-based spacing. Use it for an editable list of short strings;
keep product labels and messages in consumer localization. Live sandbox:
`#globals-demo-tag-input` / `#sandbox-tag-input`.

```tsx
import { FieldBlock, TagInput } from "@fynns/ui";

<FieldBlock label={label} htmlFor="tags">
  <TagInput
    id="tags"
    value={tags}
    onValueChange={setTags}
    tagsAriaLabel={label}
    removeAriaLabel={(tag) => removeLabel(tag)}
    placeholder={placeholder}
    supportingText={hint}
    disabled={busy}
  />
</FieldBlock>
```

- `value: readonly string[]` is controlled; `onValueChange` receives the next
  list. The text draft is internal, separate from the selected list.
- Enter and blur commit the draft. English and Chinese commas split entries;
  each entry is trimmed, empty entries discarded, and exact duplicates ignored.
  Case is preserved and duplicate comparison is case-sensitive. Pasting comma
  separated text waits for Enter or blur. Enter prevents form submission.
- IME composition Enter does not commit. No custom Backspace deletion or
  automatic paste/keystroke commit is added.
- `disabled` and `readOnly` prevent addition and removal. `errorText`,
  `supportingText`, input ARIA attributes, input event handlers and forwarded
  input ref follow `Input`. Preventing default in `onKeyDown` or `onBlur`
  suppresses the corresponding commit.
- Use `FieldBlock` + matching `htmlFor`/`id`, or name the input with
  `aria-label`/`aria-labelledby`. `tagsAriaLabel` names the chip group;
  `removeAriaLabel(tag)` supplies a localized remove-button name.
- `className` applies to the composite host. `name`/`form` apply only to the
  draft input; serialize the controlled list through application state.
- The empty list shows the input, without a blank chip row. Long chip labels
  truncate within narrow hosts and keep their remove controls visible.

Consumers must use this primitive instead of copying its ChipSet + Input
state machine or overriding `.fynns-tag-input` spacing.
