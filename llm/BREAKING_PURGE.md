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
  − toast / Toaster / Toast*   (hard-deleted; use snackbar + SnackbarHost)
= allowed public surface
```

Anything else must be deleted or kept as a non-exported internal.

## Snackbar status

- Old **Toast / Toaster / toast / ToastProvider / useToast** are **deleted**.
- **Do not** import or reimplement those names.
- Use **`snackbar(...)` + `<SnackbarHost />`** (M3 Snackbar). Mount the host
  once near the app root. Never re-add sonner-shaped toast APIs.

## Removed → how consumers should fix

| Removed | Consumer fix |
| --- | --- |
| `toast` / `Toaster` / `Toast` / `ToastProvider` / `useToast` | Use `snackbar` + `SnackbarHost`. Do not revive toast/sonner names. |
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
| `captions` / `splitCaptionByBackticks` | Copy helper into the app (sandbox: `examples/sandbox/src/utils/captionSegments.ts`). |
| `formatDateValue` / `parseDateValue` | Still public with `DatePicker` (date helpers); not a Globals import but kept as companion APIs. |
| `Spinner` / `PanelSkeleton` / `BlockingLoadingOverlay` | Use `LinearProgress` / `CircularProgress`, `EmptyState`, or app-local busy UI. `Spinner` remains internal for `Button` `loading`. |
| `CardActionArea` | Make the `Card` `interactive` or wrap children in a button. |
| `PanelLeftIcon` / … (other unused glyphs) | Prefer the public icon subset from the barrel, or ship app icons. Sandbox chrome keeps `Sun`/`Moon`/`PanelLeft`/`PanelRight`/`Sparkles`/`Bot`/`Download` exported. |

## Related docs

- Catalog summary: [`AGENTS.md`](../AGENTS.md)
- Install contract: [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json)
