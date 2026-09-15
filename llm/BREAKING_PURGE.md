# Breaking purge — public surface = Globals + Layouts + Preview

**Authoritative migration guide** for agents and humans after the destructive
export cleanup. Do not reintroduce purged symbols into `src/index.ts` without a
sandbox Globals/Preview demo and review.

## Policy

1. **Legal public components** are only those imported by:
   - [`examples/sandbox/src/pages/GlobalsPage.tsx`](../examples/sandbox/src/pages/GlobalsPage.tsx)
   - [`examples/sandbox/src/pages/LayoutsPage.tsx`](../examples/sandbox/src/pages/LayoutsPage.tsx)
   - [`examples/sandbox/src/pages/CardPreviewCanvas.tsx`](../examples/sandbox/src/pages/CardPreviewCanvas.tsx)
   - [`examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx`](../examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx)
   (plus their anatomy subcomponents and the icons those pages import).
2. **Theme / token infrastructure** stays public (`tokens`, `motionTokens`,
   `applyFynnsThemeMode` / `restoreFynnsThemeMode` / `getFynnsThemeMode`,
   scrollbar helpers, `fynnsVarName`, etc.).
3. **Internals** (`DialogFrame`, `MenuSurface`, `Spinner`, floating-box helpers in
   `floatingBox.tsx`; `Popover.tsx` is a deprecate re-export shim only) may exist
   on disk for KEEP components but are **not** barrel exports.
4. **Gallery** (`examples/gallery`) is removed. Foundations / Motion live under
   the sandbox pages.
5. **Atomic delete (sandbox ↔ source).** Never drop a Globals/Layouts/catalog demo while
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
| `Kbd` / `Combobox` | Delete usage or reimplement in the app. (`CommandPalette` restored — see Restored.) |
| `UnitStack` | `.fynns-unit-stack` or Card / Collapsible / Dialog body (built-in `unit-stack-gap`). Control + its note → `ControlBlock`, not a revived stack component. Related form fields / preference switches by **semantic kind** → `FieldStack` (not a flat Card-body list). Sandbox demos may still use `.sandbox-stack`. |
| `captions` / `splitCaptionByBackticks` | Copy helper into the app (sandbox: `examples/sandbox/src/utils/captionSegments.ts`). |
| `Spinner` / `PanelSkeleton` / `BlockingLoadingOverlay` | Use `LinearProgress` / `CircularProgress` (inline / determinate), `BusyScrim` (fullscreen) / `BusyRegion` (section; **pane cold-start = `fill`**; **one** progress chrome — `indicator="linear"` for known %). `EmptyState` is **zero-result catalogs only** — not a loading shell. Do not revive the old `BlockingLoadingOverlay` name. `Spinner` remains **internal** for `Button` `loading` (not a barrel export). |
| `CardHeader` / `CardContent` / `CardActions` / `CardMedia` / `CardActionArea` / `variant` / `interactive` / `selected` / `CARD_VARIANT_MAP` | Use one-shot `Card` (`title` / optional `icon` / `actions` + children). Same shell as Collapsible; head is static (no hover layer, no chevron). Title-less wells → `Surface`. App-level selected chrome via consumer class / `Surface`, not Card `selected`. |
| `ChatStarterPrompts` / `ChatStarterPromptItem` / `CHAT_STARTER_*` / `sliceChatStarterWindow` / `.fynns-chat-starter*` / `--fynns-chat-starter-*` (≥ **0.5.155**, withdrawn **0.5.156**) | Compose empty-thread starters in `ChatThread.empty`: slim `EmptyState` + full-width clickable **`Surface` `variant="soft"`** (message-bar width; wrap). App owns rotate / `onSelect`. Do **not** revive the primitive or use `Chip`/`ChipSet` / Banner for this. Live: `#chat` Empty. |
| Deleted / unused private glyphs (not in `icons.tsx`) | Prefer any glyph from the **full** `@fynns/ui` icon barrel (`icons.tsx` — not a subset gate ≥ **0.5.64**). Missing meaning → add SVG + export + Globals `#icons` in the same change. Do not revive glyphs removed from `icons.tsx`. |

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
| `Dialog` / `DialogShell` / `ConfirmDialog` | Centered modals via `DialogFrame`. M3 shape: `radius-3xl`, no default close X on Dialog/Confirm. Sticky dismiss/confirm → Dialog **`feet`** (`.fynns-dialog-foot`, ≥ **0.5.297**) or Confirm stock foot — not body-end clusters. Dismissible labeled rows: `Dialog` + `showCloseButton` + full-width `ControlStack` (see Behavioral). |
| `Drawer` | Content side sheet (~25rem / open-edge `radius-xl`); not `NavigationDrawer`. Always modal (no `modal={false}`). Layout token `--fynns-layout-drawer-width` is now `25rem` (was `72vw`). |
| `Textarea` | Multiline dense field aligned to Input chrome; **not** full M3 floating-label Text Field. |
| `Tabs` | M3 primary underline tabs — **not** a `ToggleGroup` substitute. |
| `InlineAlert` | In-panel severity strip (**fynns utility, not M3**): soft `color-mix` tonal fill. Pad / gap / icon size reuse `--fynns-banner-*` strip tokens (same constants as chrome Banner). Icon tinted by severity; body on-surface. Width follows parent (`width: 100%`). Long paths wrap. **Phrasing copy only** — stack `List` / form clusters below as unit-stack siblings, not inside `children`. Replaces old Alert `*Banner` exports. Do not invent a second bordered status shell. |
| Dialog sizes | `--fynns-layout-dialog-max-width-lg` is now `35rem` (was `42rem`; stays within M3 ≤560dp). |
| `SplitButton` | M3 Expressive split: leading `Button` + trailing menu (`DropdownMenu`); flush segments (no gap); variants `primary` / `tonal` / `default` / `elevated`. Demoed in Globals Actions. |
| `CommandPalette` | Spotlight / ⌘K filter dialog (`open` / `onOpenChange` / `items[]`). Apps own the global accelerator. Live: sandbox Globals `#command-palette`. Not DropdownMenu / SearchBar alone. |
| `Button` `danger` | Filled like `primary`: `--fynns-color-danger` surface + `--fynns-color-on-accent` ink (outlined red chrome retired). IconButton danger mirrors filled primary. |
| `Card` | One-shot static section: `title` + optional `icon` / `actions` + always-visible `children`. Shares Collapsible shell; not a disclosure. Anatomy parts and elevated/filled/outlined variants deleted. |
| `ClippedNavShell` / `EndAside` | Low-level destination chrome (full-bleed TopAppBar + drawer\|rail) and end-edge inspector width morph. Prefer **`DestinationAppShell`** for greenfield. Not `Drawer` (modal content). Demoed in Layout templates. |
| `DestinationAppShell` | **Default** declarative app chrome (`destinations` / `title` / `trailing` / `children` / optional `aside`). Wraps ClippedNavShell + Drawer|Rail sync. Demoed in Layout templates `#layouts-demo-shell`. |

## Behavioral breaking (still exported)

| Change | Consumer fix |
| --- | --- |
| ChatActivity minimal tree / step band / done accent / pulse rail mask (≥ **0.5.272**–**0.5.275**); pending wash + rail end (≥ **0.5.276**) | Default step chrome = status **mark** + continuous rail (node-center → next). Do **not** default tool icons or require `ChatActivityArtifact`. Step band **2rem**; gap = `unit-stack-gap`. **Done** marks = Timeline `--fynns-color-accent`. Opaque `node::before` wash under pulsing / pending marks (never whole-step `opacity`). Rail `bottom` = half next band only (gap already in padding — no stub past last mark). Live: `#activity`. Re-paste `consumer-cursor-rule.mdc`. |

| FillColumn guide Surface flush to Chat (≥ **0.5.277**) | Short soft `Surface` / compact preview above Chat → `FillColumn` **`header`**; Chat (+ optional `ChatActivity`) → `children`. Core gaps header↔main and main siblings with `unit-stack-gap`. Do **not** stack the form as a `children` sibling with `paddingBottom: 0`. Live: `#layouts-demo-fill-column` / `#sandbox-fill-column-guide`. Re-paste `consumer-cursor-rule.mdc`. |

| FillColumn header mid-scroll edge fade / content-sized band (≥ **0.5.278**–**0.5.279**) | Canvas-capped `.fynns-fill-column-header` soft-masks mid-scroll (`data-fade-top` / `data-fade-bottom`, same family as PageScroll) — do **not** invent consumer `mask-image`. Header is **content-sized** (`flex: 0 0 auto` ≥ **0.5.279**) and only scrolls when content exceeds the max-height cap — do **not** rely on flex-shrink to crush short guide Surfaces into a nested scrollbar. Live: `#sandbox-fill-column-guide`. Re-paste `consumer-cursor-rule.mdc`. |

Older version-churn rows (ChatMessage, Pagination Select history, NavDrawer footer tunes, …) were archived and then removed from the tree — recover them from git history (`git log --all -- llm/archive/BREAKING_PURGE_ARCHIVE.md`) if ever needed.

When a **new** behavioral break ships, add a short row here (and keep ## Removed → how consumers should fix machine-checked). Do not paste multi-version history essays back into this file.

## Related docs

- Design language SoT: [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) (+ [`docs/design-system/`](../docs/design-system/))
- Install contract: [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json)
- Doc catalog: [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md)
