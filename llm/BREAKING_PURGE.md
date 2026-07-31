# Breaking purge — public surface = Globals + Preview

**Authoritative migration guide** for agents and humans after the destructive
export cleanup. Do not reintroduce purged symbols into `src/index.ts` without a
sandbox Globals/Preview demo and review.

## Policy

1. **Legal public components** are only those imported by:
   - [`examples/sandbox/src/pages/GlobalsPage.tsx`](../examples/sandbox/src/pages/GlobalsPage.tsx)
   - [`examples/sandbox/src/pages/CardPreviewCanvas.tsx`](../examples/sandbox/src/pages/CardPreviewCanvas.tsx)
   - [`examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx`](../examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx)
   (plus their anatomy subcomponents and the icons those pages import).
2. **Theme / token infrastructure** stays public (`tokens`, `motionTokens`,
   `applyFynnsThemeMode` / `restoreFynnsThemeMode` / `getFynnsThemeMode`,
   scrollbar helpers, `fynnsVarName`, etc.).
3. **Internals** (`DialogFrame`, `MenuSurface`, `Spinner`, floating-box helpers in
   `Popover.tsx`) may exist on disk for KEEP components but are **not** barrel
   exports.
4. **Gallery** (`examples/gallery`) is removed. Foundations / Motion live under
   the sandbox pages.

## How to verify the allowlist

```text
Imports from @fynns/ui in GlobalsPage + CardPreviewCanvas + CollapsiblePreviewCanvas
  ∪ theme exports from src/theme/*
  − toast / Toaster / Toast*   (hard-deleted; never re-add without Snackbar review)
= allowed public surface
```

Anything else must be deleted or kept as a non-exported internal.

## Snackbar status

- Old **Toast / Toaster / toast / ToastProvider / useToast** are **deleted**.
- **Do not** import or reimplement them in consumers or this core.
- A future M3 Snackbar must first appear as a sandbox sample, pass design
  review, then land in `src/primitives` — not before.

## Removed → how consumers should fix

| Removed | Consumer fix |
| --- | --- |
| `toast` / `Toaster` / `Toast` / `ToastProvider` / `useToast` | No substitute yet. Inline status text, or wait for M3 Snackbar (sandbox-first). |
| `Drawer` | Prefer `NavigationDrawer` for destinations; otherwise build on app layout. |
| `Dialog` / `ConfirmDialog` / `DialogShell` | Prefer `FullscreenDialog` or `BottomSheet`; short confirms can be app-local. |
| `Popover` | Build a local anchored panel, or use `DropdownMenu` / `Tooltip` where they fit. |
| `SearchInput` | Use `SearchBar` (chrome) or `Input` (dense forms). |
| `Counter` | `Input type="number"` (+ steppers if needed in the app). |
| `Tabs` / `ToggleControl` | Prefer `ToggleGroup` (M3 segmented). |
| `*Banner` from Alert (`InfoBanner`, `WarningBanner`, …) | Prefer chrome `Banner`, or app-local alert strip with tokens. |
| `ListGroup*` / `ListRow*` / `NavItem*` / `ShellNav*` | Deleted — rebuild with `List`/`ListItem`, `Navigation*` chrome, or app layout. |
| `Panel` / `PanelCard` / `ScrollArea` | Use layout + `fynns-scroll` (or `overflow` + class); no Panel shell. |
| `Kbd` / `Combobox` / `CommandPalette` / `SplitButton` | Delete usage or reimplement in the app. |
| `Textarea` | `Input` or native `<textarea>` styled with `--fynns-*` tokens. |
| `UnitStack` | `display: flex; flex-direction: column; gap: var(--fynns-layout-unit-stack-gap)` (sandbox: `.sandbox-stack`). |
| `Spinner` / `PanelSkeleton` / `BlockingLoadingOverlay` | Use `LinearProgress` / `CircularProgress`, `EmptyState`, or app-local busy UI. `Spinner` remains internal for `Button` `loading`. |
| `CardActionArea` | Make the `Card` `interactive` or wrap children in a button. |
| `DownloadIcon` / `MoonIcon` / `SunIcon` / `SparklesIcon` / `PanelLeftIcon` / `PanelRightIcon` / `BotIcon` / … | Use the public icon subset from the barrel (see Globals imports) or ship app icons. |

## Related docs

- Catalog summary: [`AGENTS.md`](../AGENTS.md)
- Install contract: [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json)
