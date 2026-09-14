# Tokens

← back to [Design system index](../DESIGN_SYSTEM.md)

Source of truth: [`src/theme/tokens.ts`](../../src/theme/tokens.ts) +
[`src/theme/motionTokens.ts`](../../src/theme/motionTokens.ts). Generated CSS:
[`src/theme/theme.css`](../../src/theme/theme.css) (`:root { --fynns-* }` + light
override + reset + scrollbar + reduced-motion). Naming: `--fynns-<group>-<key>`
(the `misc` group has no sub-prefix).

**Light theme:** dark is the default (no attribute). Activate light via
`applyFynnsThemeMode("light")` from `@fynns/ui`, which sets
`data-fynns-theme="light"` on `<html>` and overrides a subset of color/shadow/
scrollbar/`code` tokens. `restoreFynnsThemeMode()` reads `localStorage` key
`fynns-theme-mode`.

Groups: `color`, `space`, `size`, `radius`, `shadow`, `state`, `font`,
`font-size`, `font-weight`, `line-height`, `letter-spacing`, `z`, `duration`,
`ease`, `toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`,
`appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `chatmessage`,
`chat`, `list`, `datepicker`, `timepicker`, `carousel`, `breadcrumb`,
`pagination`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`,
`code` (CodeBlock highlight roles), plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`, `chat-user-bubble`.
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
  `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
  `accent-ring`, `on-accent`, container roles, `focus` (faint keyboard ring).
- Focus geometry (`--fynns-focus-*`): `ring-width`, `ring-offset-control`,
  `ring-offset-input`, `border-mix` (accent % into resting border for fields).
- Lines/text: `border` `#0d2e2c`, `border-strong`, `outline-subtle`, `text`
  `#e2f0ed`, `text-muted` `#7a9e98`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `busy-region-mask` (BusyRegion sectional wash — not
  BusyScrim `overlay`), `toggle-track`, `toggle-track-hover`, `scrollbar-thumb*`
  (also under the `scrollbar` group).
- State layers (`--fynns-state-*`): `hover` 8%, `focus` 10%, `pressed` 12%,
  `dragged` 16% — used via `color-mix(...)` for interactive overlays.
- Elevation lookups (TS only, not CSS vars): `ELEVATION_TOKENS`. M3 reference
  mirror: [`llm/m3-draft-tokens.md`](../../llm/m3-draft-tokens.md).

Spacing: prefer t-shirt keys `--fynns-space-{2xs,xs,sm,md,lg,xl,2xl,3xl}`;
legacy numeric keys (`--fynns-space-1` …) remain as aliases. Standard chrome
glyph: `--fynns-size-icon` (`1rem` / 16dp) + TS `ICON_SIZE` (exported from
`@fynns/ui`). Nav / Banner / SearchBar / BottomAppBar / Toolbar action icons
share this. Fab `sm` stays on `--fynns-size-icon-md` (20dp). Dense micro glyphs
(chip trailing, select chevron, steppers) may stay smaller. Font sizes: prefer
t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`; legacy semantic keys
remain. Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`,
`toggle-thumb`, `glow-accent`, `glow-danger`. Motion:
`--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,tooltip-show-delay,tooltip-skip-delay,toggle,
fast,flyout,base,slow,scrollbar,loading-spin,activity,presentation-hint,
thinking-shimmer,reduced-motion-spin}`.

**Font families (`--fynns-font-*`) — when to use:**

| Token | Stack | Use for | Do **not** use for |
| --- | --- | --- | --- |
| `ui` | system-ui / Segoe / Roboto | **Default everything:** page body, chrome, forms, Dialog, Chat, lists, buttons, captions. `theme.css` already sets `body { font-family: var(--fynns-font-ui) }` — prefer inheriting | — |
| `mono` | Consolas-first | Code only: `CodeBlock`, bare `code` / `kbd` / `samp` / `pre`, technical identifiers | Running prose, UI labels, Chat bubbles |
| `serif` | CMU Serif / Times-like | **Rare** academic / editorial *prose* when the user explicitly asks (theorem / definition / proof, paper-like passages). Not a math renderer | App chrome, main body, forms, Chat, Dialog, lists, buttons; live formula rendering |

If you are about to write `font-family`, stop — inherit `ui` unless the content
is literally code (`mono`) or the user demanded serif for a narrow display
passage. Never pick serif to make body text “more serious”.

**Code highlight (`--fynns-code-*`):** semantic roles for `CodeBlock` (fg, bg,
comment, keyword, string, number, type, function, variable, property, parameter,
operator, module, constant, constant-named, escape, invalid). Distilled from
cpptools VS dark/light TextMate themes — readable CodeBlock ink, not a full VS
Code grammar. Zero-dep tokenizer in `src/primitives/codeHighlight/`; no
Shiki/Prism. **Consumer custom languages:** see
[`llm/AGENT_INTERFACES.md`](../../llm/AGENT_INTERFACES.md)
(`SimpleHighlightProfile` / `registerHighlightLanguage`).

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).
