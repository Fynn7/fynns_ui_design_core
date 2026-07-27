# @fynns/ui-design-core

Fynn's shared **dark-teal UI design system**: one canonical set of `--fynns-*`
design tokens plus a kit of **self-developed React primitives** (no `radix`, no
`sonner`). Extracted from `awesome_afs_visualizer`, `awesome_dsa_visualizer`,
and the thesis `gsc-live-preview` so the look and behavior stay identical across
projects and are easy for humans and agents to reuse.

- **Tokens:** single source of truth in [`src/theme/tokens.ts`](src/theme/tokens.ts)
  (+ [`motionTokens.ts`](src/theme/motionTokens.ts)) → generated, committed
  [`src/theme/theme.css`](src/theme/theme.css).
- **Components:** [`src/primitives/`](src/primitives) — Button, Input, Select,
  Dialog, Switch, Toast, Tooltip, and more (see [AGENTS.md](AGENTS.md)).
- **Agent guide / API catalog:** [AGENTS.md](AGENTS.md) is the authoritative doc.
- **Submodule propagation:** push-triggered + Dependabot fallback workflow is
  documented in [`docs/submodule-propagation.md`](docs/submodule-propagation.md).

## Consume it (git submodule + source alias)

This package is consumed **as source** through a Vite path alias `@fynns/ui`. No
build step or npm publish is required.

1. Add the submodule (path `packages/fynns_ui_design_core` by convention):

```bash
git submodule add https://github.com/Fynn7/fynns_ui_design_core.git packages/fynns_ui_design_core
git submodule update --init --recursive
```

2. Add the alias in `vite.config.ts` (point at the barrel; keep React deduped so
   the submodule source shares the app's single React instance):

```ts
resolve: {
  alias: {
    "@fynns/ui": path.resolve(__dirname, "packages/fynns_ui_design_core/src/index.ts"),
  },
  dedupe: ["react", "react-dom"],
}
```

For an app nested in a subfolder (e.g. the thesis `tools/gsc-live-preview`),
point the alias up to the repo-root submodule:
`path.resolve(__dirname, "../../packages/fynns_ui_design_core/src/index.ts")`.

3. Add a `tsconfig` path so the editor resolves types:

```json
{ "compilerOptions": { "paths": { "@fynns/ui": ["./packages/fynns_ui_design_core/src/index.ts"] } } }
```

4. Use it (the barrel imports the theme + component CSS for you):

```tsx
import { Button, Dialog, toast, Toaster } from "@fynns/ui";
```

If you prefer to load only the stylesheet (no JS), import
`@fynns/ui-design-core/theme.css` or `@fynns/ui-design-core/styles.css`.

## Theme

All visual values come from `--fynns-*` CSS variables defined in `theme.css`
(generated). Never hardcode colors — reference tokens such as
`var(--fynns-color-accent)`, `var(--fynns-space-sm)`, `var(--fynns-radius-md)`.
App-specific / teaching tokens stay in the app under `--afs-*` / `--dsa-*`.

**Dark** is the default. **Light** theme: call `applyFynnsThemeMode("light")`
from `@fynns/ui` (sets `data-fynns-theme="light"` on `<html>`). Use
`restoreFynnsThemeMode()` on boot to read `localStorage`. See
[AGENTS.md](AGENTS.md) for the full token catalog.

## Scripts

- `npm run gen:theme` — regenerate `src/theme/theme.css` from the token tables.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint.
- `npm run gallery` — run the design gallery in [`examples/gallery`](examples/gallery)
  (foundations, motion, component state matrix, dark/light toggle).
- `npm run sandbox` — run the aesthetic sandbox in
  [`examples/sandbox`](examples/sandbox) (Globals shape ladder, live Card
  token overrides, Apply changes). Drafts persist in `localStorage` until you
  click **Apply changes** (review per-file diffs, then confirm), which writes
  `src/theme/tokens.ts` and runs `npm run gen:theme` via the Vite dev middleware.

## Aesthetic sandbox

The sandbox is a consumer of `@fynns/ui` (same primitives + tokens), not a
separate design language. Pages: **Playground** (Card or Collapsible target),
**Globals** (system shape / radius), Foundations, Motion, and **Templates**
(gear icon in the nav footer — settings: language, config JSON export/import,
and named templates).
Editing `--fynns-radius-*` on Globals
injects CSS variable overrides at runtime (including light theme, so hue knobs
are not masked by `:root[data-fynns-theme="light"]`) so Button, Input, Card, and
sandbox chrome update together. See the plan layers: `tokens.m3-draft.ts` (M3
reference) → `tokens.ts` (fynns base) → sandbox overrides (fynns-override).

### Language (English / 中文)

- Open **Templates** via the gear control and use the **Language** toggle
  (`English` / `中文`) at the top of the settings page.
- Choice persists in `localStorage` (`fynns-sandbox-locale`) and sets
  `document.documentElement.lang` plus `data-fynns-locale`.
- Catalog: [`examples/sandbox/src/i18n/`](examples/sandbox/src/i18n/).
  `@fynns/ui` default labels stay English; the sandbox passes localized chrome.

### Templates & config JSON

- Open via the **gear** control at the bottom of the left nav (special page,
  no inspector aside).
- **Language** switch (English / 中文) sits at the top of this settings page.
- **Export JSON** / **Import JSON** move the full sandbox configuration:
  `{ kind, version, theme, overrides, baseTokensHash, exportedAt }`.
- **Save as template** stores the same bundle under a name in `localStorage`
  (`fynns-sandbox-templates`). Apply / export / rename / delete from the list.
- Templates do not write `tokens.ts` by themselves — use **Apply changes** on
  Playground / Globals after loading a template if you want source writeback.

### Globals (system shape)

- Shape ladder: editable `--fynns-radius-{xs,sm,md,lg,xl}` (+ Align M3 /
  Reset ladder)
- Read-only: `none` / `pill` / `round`
- Presets: M3-aligned radius, Restrained radius
- Preview stage shows Button, Input, Select, Badge, Card variants, Collapsible

### Preview toggles (Playground)

Switch the canvas target with **Card | Collapsible** (preview-only; does not
change Apply writeback).

**Card**

- Anatomy: Media on/off
- States: Interactive, Disabled
- Actions: align start|end

**Collapsible**

- States: Open (controlled preview)
- Anatomy: Header actions on/off

### Inspector knobs (Playground)

Shared token draft for both Card and Collapsible targets (Apply still writes
`tokens.ts` only — no component recipe writeback):

- Color: accent hue presets + rainbow chip (opens hue ring); editable degree /
  hex fields; card surfaces `surface-1` / `surface-4` / `app-bg` brightness;
  outlined `--fynns-color-border-strong`
- Elevation: tonal ladder swatches; writable `--fynns-shadow-xs` presets
- State layers: hover / focus / pressed / dragged
- Spacing: Card anatomy `--fynns-space-lg` / `md` / `sm`; inspector **Block gap**
  (`--sandbox-block-gap`) between adjacent chrome blocks in every inspector stack
  (sandbox-only, not Apply writeback)
- Typography: `--fynns-font-size-{sm,md,lg}`

**Undo / Redo** (Ctrl/Cmd+Z / Ctrl+Y; no toolbar buttons) only cover the token
draft history: inspector knobs, Apply preset, and confirmed agent proposals. One hue
gesture is a single undo step (accent family batched). Preview toggles,
light/dark theme, and page nav are not in the draft history.

**Apply changes** opens a review dialog with unified diffs for
`src/theme/tokens.ts` and regenerated `src/theme/theme.css`. Confirming writes
the draft and runs `npm run gen:theme` (Vite dev middleware). That updates the
design-system source consumed by every `@fynns/ui` client. Until then, overrides
stay in the draft / `localStorage` and only affect the sandbox preview.

## Optional package distribution

`package.json` is preconfigured (`exports`, `publishConfig`) so the library can
later be published to GitHub Packages (`@fynns/ui-design-core`). The submodule +
source-alias flow above is the primary, recommended path.
