# Icons

← back to [Design system index](../DESIGN_SYSTEM.md)

## Full library (not a subset gate)

Every glyph in
[`src/primitives/icons.tsx`](../../src/primitives/icons.tsx) is exported from
`@fynns/ui`. Consumers may use **any** of them — do **not** treat older “public
subset” lists as an allowlist. Missing semantic → add the glyph to `icons.tsx` +
barrel + sandbox `#icons` in the same change. Prefer `IconButton` + `Tooltip`
over `title=`. Live catalog: Globals `#icons`.

## Action → glyph

Pick by meaning, not nearest shape:

| Action | Use | Avoid |
| --- | --- | --- |
| Enter bulk / multi-select | `ListChecksIcon` | `ClipboardIcon` |
| Exit bulk | `CloseIcon` | `ArrowLeftIcon` as mode dismiss |
| Select all / Deselect all | `CheckSquareIcon` / `SquareIcon` | bare `CheckIcon` |
| Archive | `ArchiveIcon` | |
| Restore from archive | `UndoIcon` | `ArchiveIcon` (archive again) |
| Delete | `TrashIcon` | |
| Cancel / discard / leave edit mode | `CloseIcon` + visible label | text-only app CTA; icon-only X in a footer |
| Apply / confirm a non-destructive change | `CheckIcon` + visible label | icon-only check disk |
| Refresh / retry | `RefreshIcon` + visible label | text-only app CTA when space permits |
| Nav / mode exit back (TopAppBar) | `ArrowLeftIcon` | `CloseIcon` as destination back |
| Export (write file / format menu — Word, PDF, …) | `UploadIcon` | `DownloadIcon` (pull/download semantics) |
| Download (fetch / pull from remote) | `DownloadIcon` | `UploadIcon` for export menus |
| Copy to clipboard | `ClipboardIcon` (+ Tooltip) | Labeled ghost `Button` “Copy …” in Card chrome |
| Save defaults / draft save (icon chrome) | `SaveIcon` (+ Tooltip) | Labeled ghost `Button` “Save defaults” mid Select cluster |

## Default action button: icon + visible label

Consumer app action buttons **default to** a regular `Button` with a semantic
leading icon followed by visible text. This applies across `primary`, `tonal`,
`elevated`, `default`, `ghost`, and `danger`, and across every Button size.
For example, Cancel is `CloseIcon` + “Cancel”; Apply is `CheckIcon` + “Apply”.

The Button centers the pair and owns exactly one
`--fynns-space-2` icon-to-label gap. Put the icon and text directly in the
Button; do **not** add icon `margin`, consumer `gap`, `{" "}`, or `&nbsp;`.
The visible text already supplies the accessible name, so the icon is
decorative and must use `aria-hidden`.

Reserve `IconButton` + `Tooltip` + `aria-label` for compact, self-evident
chrome (for example a Card copy disk or a top-corner close control). A
text-only Button is acceptable when no stable semantic glyph exists, such as
an arbitrary value/choice; do not invent a decorative icon merely to satisfy
the default. Live matrix: Components `#globals-demo-button-icon-label-matrix`
([source](../../examples/sandbox/src/pages/GlobalsPage.tsx)).

## Bulk row check

Hard ≥ 0.5.65: multi-select uses leading/icon **`Checkbox`** only — never map
`checked` → `NavigationDrawerItem` `active` or `ListItem` `selected`. Live:
Layouts `#layouts-demo-navigation-drawer` (third column).
