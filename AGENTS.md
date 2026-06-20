# AGENTS.md — @fynns/ui-design-core

Authoritative guide for humans and AI agents working with the fynns UI design
system. This is the **single source of truth** for the design language; other
repos should link here, not duplicate it.

## What this is

A dark-teal design system: canonical `--fynns-*` CSS tokens + self-developed,
dependency-free React primitives. Consumed as source via the `@fynns/ui` alias.

## Hard rules (Do / Don't)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc.
- **DON'T** hardcode raw colors / hex / rgba in component or app CSS. If a value
  is missing, add a token in [`src/theme/tokens.ts`](src/theme/tokens.ts) and run
  `npm run gen:theme`.
- **DON'T** reintroduce `@radix-ui/*` or `sonner`. Every overlay, toggle, and
  toast here is self-developed. Extend these primitives instead.
- **DON'T** rename tokens to non-`--fynns-*` forms. App/teaching-specific tokens
  live in the app under `--afs-*` (automata canvas) or `--dsa-*` (DSA bars,
  pointers, DSU) — never in this core.
- Text is **English or German only** (no CJK), per the workspace language policy.

## Tokens

Source of truth: [`src/theme/tokens.ts`](src/theme/tokens.ts) +
[`src/theme/motionTokens.ts`](src/theme/motionTokens.ts). Generated CSS:
[`src/theme/theme.css`](src/theme/theme.css) (`:root { --fynns-* }` + reset +
scrollbar + reduced-motion). Naming: `--fynns-<group>-<key>` (the `misc` group
has no sub-prefix).

Groups: `color`, `space`, `size`, `radius`, `shadow`, `font`, `font-size`,
`font-weight`, `line-height`, `letter-spacing`, `z`, `duration`, `ease`,
`toggle`, `focus`, `layout`, `scrollbar`, plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces: `app-bg` `#031417`, `surface` `#031417`, `surface-head` `#021012`,
  `surface-muted`, `surface-hover`, `control-surface`, `control-surface-hover`,
  `flyout-item`, `flyout-item-hover`, `toast-surface` `#062126`.
- Lines/text: `border` `#0d2e2c`, `text` `#e2f0ed`, `text-muted` `#7a9e98`.
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-soft`, `accent-mid`,
  `accent-24`, `accent-42`, `accent-ring`, `focus`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `toggle-track`, `toggle-track-hover`,
  `scrollbar-thumb*` (also under the `scrollbar` group).

Fonts: `--fynns-font-ui` (system), `--fynns-font-mono` (Cascadia/Fira),
`--fynns-font-serif` (CMU Serif). Motion: `--fynns-ease-standard`,
`--fynns-ease-emphasized`, `--fynns-duration-{instant,tooltip,toggle,fast,base,
slow,pointer,loop-pulse,loading-spin,loading-skeleton,presentation-hint,
reduced-motion-spin}`.

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

Import everything from `@fynns/ui`. Components emit `.fynns-*` classes.

- **Button** `{ variant?: "default"|"primary"|"danger"|"ghost", size?: "md"|"sm",
  active?, danger?, iconOnly? }` + native button attrs. `forwardRef`.
- **IconButton** — `Button` with `iconOnly`; pass `aria-label`.
- **SplitButton** `{ children, onMainClick, menu, menuOpen, onMenuOpenChange,
  disabled?, mainAriaLabel?, menuAriaLabel? }`.
- **Input** / **Textarea** — native attrs + `.fynns-input`/`.fynns-textarea`.
- **Counter** `{ value, onChange, min?, max?, step?, ariaLabel?, disabled? }` — numeric
  field + press-and-hold steppers (`CounterRoot`, `CounterField`, `CounterSteppers`,
  `CounterIncrement`, `CounterDecrement` for custom layouts via `CounterProvider`).
- **SearchInput** `{ leadingIcon?, wrapClassName?, ...inputAttrs }`.
- **Select** `{ value, options: (string | { value, label?, disabled? })[],
  onChange, ariaLabel, disabled?, placeholder? }` — custom listbox.
- **Combobox** — headless search + keyboard list (generic `<Item>`); caller
  supplies `filter`, `onPick`, `renderRow`, `classes`.
- **DropdownMenu** + **DropdownMenuItem** `{ trigger, children, ariaLabel?,
  align? }`.
- **Popover** `{ open, onOpenChange, anchorRef, side?, align?, offset? }` +
  `useAnchoredPosition(anchorEl, floatingEl, open, opts)` — flips top/bottom (or
  left/right), auto `align` start/end near viewport edges, and clamps without
  covering the anchor. Tooltips use `pos.side` + `pos.align` with
  `floatingTransformForSide`.
- **Tooltip** `{ content, side?, align?, children, className? }` + **TooltipProvider**
  (compat passthrough). Renders a caret centered on the bubble's edge facing the
  anchor (the bubble prefers `align="center"` so the midpoint also points at the
  trigger). **InfoHint** `{ content, ariaLabel?, iconSize? }`.
- **Dialog** `{ open, onOpenChange, title, visibleTitle?, description?,
  headActions?, variant?: "centered"|"command", showCloseButton?, closeAriaLabel?
  }` — portal + focus-trap + scrim + Esc. **DialogShell** is the low-level shell
  `{ open, onClose, labelledBy?, ariaLabel?, variant?, children }`. **DialogFrame**
  is the shared low-level frame reused by Dialog/Drawer (`modal?`, `side?`,
  `dataState?`).
- **Drawer** `{ open, onClose, side?: "left"|"right", modal?, title?, visibleTitle?,
  description?, headActions?, showCloseButton?, closeAriaLabel?, ariaLabel?,
  className?, children }` — side sheet that slides in from `side` (default right)
  with its own enter/exit animation. `modal` defaults to `true`; pass
  `modal={false}` for a non-modal drawer that leaves the page behind interactive
  (no scroll lock / focus trap / blocking scrim). Width via
  `--fynns-layout-drawer-width`.
- **Switch** `{ label, checked, onCheckedChange, ariaLabel?, size?, disabled? }`
  (`role="switch"`). **ToggleControl** — checkbox/radio styled as a switch.
- **ToggleGroup** `{ options, value, onChange }` — segmented chips. **Tabs**
  `{ tabs, activeId, onChange }`.
- **Slider** `{ value, onChange, min?, max?, step?, ariaLabel, disabled? }` —
  styled native range.
- **Panel** (sidebar `<aside>`) / **PanelCard** `{ title, actions?, fill?,
  noScroll?, fillBody? }` / **ScrollArea** (custom scrollbar skin).
- **Toaster** (mount once) + imperative **toast** `toast(msg, opts?)`,
  `toast.message/.success/.error/.warning/.info(msg, opts?)`, `toast.dismiss(id?)`
  — drop-in for the `sonner` subset. **ToastProvider** + **useToast** compat.
- **AlertMessageBase** `{ severity: "warning"|"error"|"info"|"success", message? }`
  + **WarningBanner / ErrorBanner / InfoBanner / SuccessBanner**.
- **Spinner / PanelSkeleton / BlockingLoadingOverlay** (loading states).
- **Badge** `{ variant?: "neutral"|"success"|"danger"|"info"|"accent", icon? }`.
  **Kbd**. **CommandPalette** (generic shell over Combobox + DialogShell).
- Inline icons (dependency-free): `ChevronDownIcon`, `ChevronUpIcon`,
  `ChevronRightIcon`, `ChevronLeftIcon`, `ArrowLeftIcon`, `CloseIcon`,
  `InfoIcon`, `SearchIcon`, `AlertCircleIcon`, `AlertTriangleIcon`,
  `CheckCircleIcon`, `CheckIcon`, `PlusIcon`, `SaveIcon`, `TrashIcon`,
  `PencilIcon`, `EyeIcon`, `RocketIcon`, `ArchiveIcon`. Components also accept
  your own icon nodes where an `icon` prop exists.

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in
   `src/primitives/primitives.css` using `.fynns-*` + tokens), export from
   `src/index.ts`, and document it here.
3. Keep `npm run typecheck` and `npm run lint` green.
