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
5. **Atomic delete (sandbox ↔ source).** Never drop a Globals/catalog demo while
   the symbol stays in `src/index.ts`. That half-delete fails `check:wysiwyg`
   (export without demo) and historically led agents to *restore the demo*
   instead of removing the export. One change must include **all** of:
   - remove barrel export (+ types)
   - delete primitive TSX + `.fynns-*` CSS
   - remove Globals demo + `globalsCatalog` entry + i18n help
   - update `AGENTS.md` / keep-set Cursor rules
   - add a **Removed** row below (machine-checked: Removed ∩ barrel = ∅)

## How to verify the allowlist

Run the machine check (fails CI / local when surface drifts):

```bash
npm run check:wysiwyg
```

Contract:

```text
Value exports from src/index.ts
  − imports in GlobalsPage + CardPreviewCanvas + CollapsiblePreviewCanvas
    + SandboxShell
  − symbols in llm/wysiwyg-companion.json
= must be empty

Removed-table identifiers (first column only)
  ∩ (value ∪ type exports from src/index.ts)
= must be empty

Companion must not list src/primitives/<Name>.tsx component basenames
globalsCatalog must not label purged PascalCase names
SANDBOX_DEFAULT_OVERRIDES must be {}
--fynns-radius-md in tokens.ts == theme.css
```

Companions are theme/token infrastructure, mount-once hosts (`SnackbarHost`),
shell-only icons, and pure helpers (date/time formatters, highlight registry,
overflow free functions, busy schedulers). Components and visual anatomy must
be demoed — do not park them in the companion list.

Anything else must be deleted or kept as a non-exported internal.

## Snackbar status

- Old **Toast / Toaster / toast / ToastProvider / useToast** are **deleted**.
- **Do not** import or reimplement those names.
- Use **`snackbar(...)` + `<SnackbarHost />`** (M3 Snackbar). Mount the host
  once near the app root. Never re-add sonner-shaped toast APIs.

## Removed → how consumers should fix

| Removed | Consumer fix |
| --- | --- |
| `Badge` / `BadgeProps` / `BadgeSize` / `BadgeVariant` / `.fynns-badge` / `.fynns-badge--*` | Non-M3 outlined pill labels (clashed with InfoHint / inline chrome). Use `Chip` (interactive), `InlineAlert` / `Banner` (status), or `BadgedBox` + `NavigationRailBadge` (notification overlay). Do not revive pill `Badge`. |
| `toast` / `Toaster` / `Toast` / `ToastProvider` / `useToast` | Use `snackbar` + `SnackbarHost`. Do not revive toast/sonner names. |
| `Popover` | Build a local anchored panel, or use `DropdownMenu` / `Tooltip` where they fit. |
| `SearchInput` | Use `SearchBar` (chrome) or `Input` (dense forms). |
| `Counter` | `Input type="number"` (+ steppers if needed in the app). |
| `ToggleControl` | Prefer `Checkbox` / `Radio` / `Switch` / `ToggleGroup`. |
| `SwitchSize` / Switch `size` prop (`md` / `sm`) | Dense track only (former sm ~39×24). Drop the `size` prop; `--fynns-toggle-*-sm` keys removed — use `--fynns-toggle-track-*` etc. Do **not** treat `Switch` itself as removed. |
| `InfoBanner` / `WarningBanner` / `ErrorBanner` / `SuccessBanner` / `AlertMessageBase` | Use `InlineAlert` for in-panel severity, or chrome `Banner`. Do not revive Alert `*Banner` names. |
| `ListGroup*` / `ListRow*` / `NavItem*` / `ShellNav*` | Deleted — rebuild with `List`/`ListItem`, `Navigation*` chrome, or app layout. |
| `Panel` / `PanelCard` / `ScrollArea` | Compose with `Surface` (bordered / tonal well, any children), `Card`, `ClippedNavShell` + `EndAside` (destination + inspector), `Drawer` for modal content sheets, app flex/grid, and `fynns-scroll`. Do not revive the old `Panel` / `PanelCard` / `ScrollArea` names. |
| `Kbd` / `Combobox` / `CommandPalette` | Delete usage or reimplement in the app. |
| `UnitStack` | `display: flex; flex-direction: column; gap: var(--fynns-layout-unit-stack-gap)` (sandbox: `.sandbox-stack`). |
| `captions` / `splitCaptionByBackticks` | Copy helper into the app (sandbox: `examples/sandbox/src/utils/captionSegments.ts`). |
| `Spinner` / `PanelSkeleton` / `BlockingLoadingOverlay` | Use `LinearProgress` / `CircularProgress`, `BusyScrim` (fullscreen) / `BusyRegion` (section), or `EmptyState`. Do not revive the old `BlockingLoadingOverlay` name. `Spinner` remains **internal** for `Button` `loading` (not a barrel export). |
| `CardHeader` / `CardContent` / `CardActions` / `CardMedia` / `CardActionArea` / `variant` / `interactive` / `selected` / `CARD_VARIANT_MAP` | Use one-shot `Card` (`title` / optional `icon` / `actions` + children). Same shell as Collapsible; head is static (no hover layer, no chevron). Title-less wells → `Surface`. App-level selected chrome via consumer class / `Surface`, not Card `selected`. |
| Unused glyph exports beyond the public icon subset | Prefer icons from the barrel, or ship app icons. Do not revive deleted glyphs. Sandbox chrome keeps `Sun`/`Moon`/`PanelLeft`/`PanelRight`/`Sparkles`/`Bot`/`Download` exported. |

## Still public (companion / demoed helpers)

These stay on the barrel but are **not** required as Globals demos — listed in
`llm/wysiwyg-companion.json` (or live next to their host control). Do **not**
put them in the Removed table above; `check:wysiwyg` treats Removed ∩ barrel
as a hard fail.

| Symbol | Notes |
| --- | --- |
| `formatDateValue` / `parseDateValue` / `formatTimeValue` / `parseTimeValue` | Companion APIs with DatePicker / TimePicker. |
| `measureOverflow` / `overflowsBounds` / `measureContentOverflow` / `OVERFLOW_EPSILON` | Layout overflow free functions — companion APIs. Prefer `useOverflowBounds` (demoed in Globals). |

## Restored after purge (use these)

| Symbol | Notes |
| --- | --- |
| `Dialog` / `DialogShell` / `ConfirmDialog` | Centered modals via `DialogFrame`. M3 shape: `radius-3xl`, no default close X on Dialog/Confirm. |
| `Drawer` | Content side sheet (~25rem / open-edge `radius-xl`); not `NavigationDrawer`. Always modal (no `modal={false}`). Layout token `--fynns-layout-drawer-width` is now `25rem` (was `72vw`). |
| `Textarea` | Multiline dense field aligned to Input chrome; **not** full M3 floating-label Text Field. |
| `Tabs` | M3 primary underline tabs — **not** a `ToggleGroup` substitute. |
| `InlineAlert` | In-panel severity strip (**fynns utility, not M3**): soft `color-mix` tonal fill. Pad / gap / icon size reuse `--fynns-banner-*` strip tokens (same constants as chrome Banner). Icon tinted by severity; body on-surface. Width follows parent (`width: 100%`). Long paths wrap. Replaces old Alert `*Banner` exports. Do not invent a second bordered status shell. |
| Dialog sizes | `--fynns-layout-dialog-max-width-lg` is now `35rem` (was `42rem`; stays within M3 ≤560dp). |
| `SplitButton` | M3 Expressive split: leading `Button` + trailing menu (`DropdownMenu`); flush segments (no gap); variants `primary` / `tonal` / `default` / `elevated`. Demoed in Globals Actions. |
| `Button` `danger` | Filled like `primary`: `--fynns-color-danger` surface + `--fynns-color-on-accent` ink (outlined red chrome retired). IconButton danger mirrors filled primary. |
| `Card` | One-shot static section: `title` + optional `icon` / `actions` + always-visible `children`. Shares Collapsible shell; not a disclosure. Anatomy parts and elevated/filled/outlined variants deleted. |
| `ClippedNavShell` / `EndAside` | Destination app chrome (full-bleed TopAppBar + drawer\|rail) and end-edge inspector width morph. Not `Drawer` (modal content). Demoed in Globals Navigation. |

## Related docs

- Catalog summary + **Platform targeting**: [`AGENTS.md`](../AGENTS.md)
- Install contract: [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json)
