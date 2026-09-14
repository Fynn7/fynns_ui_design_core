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
| Nav / mode exit back (TopAppBar) | `ArrowLeftIcon` | `CloseIcon` as destination back |
| Export (write file / format menu — Word, PDF, …) | `UploadIcon` | `DownloadIcon` (pull/download semantics) |
| Download (fetch / pull from remote) | `DownloadIcon` | `UploadIcon` for export menus |
| Copy to clipboard | `ClipboardIcon` (+ Tooltip) | Labeled ghost `Button` “Copy …” in Card chrome |
| Save defaults / draft save (icon chrome) | `SaveIcon` (+ Tooltip) | Labeled ghost `Button` “Save defaults” mid Select cluster |

## Bulk row check

Hard ≥ 0.5.65: multi-select uses leading/icon **`Checkbox`** only — never map
`checked` → `NavigationDrawerItem` `active` or `ListItem` `selected`. Live:
Layouts `#layouts-demo-navigation-drawer` (third column).
