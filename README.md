# @fynns/ui-design-core

Fynn's shared **dark-teal UI design system**: one canonical set of `--fynns-*`
design tokens plus a kit of **self-developed React primitives** (no `radix`, no
`sonner`). Extracted from `awesome_afs_visualizer`, `awesome_dsa_visualizer`,
and the thesis `gsc-live-preview` so the look and behavior stay identical across
projects and are easy for humans and agents to reuse.

- **Tokens:** single source of truth in [`src/theme/tokens.ts`](src/theme/tokens.ts)
  (+ [`motionTokens.ts`](src/theme/motionTokens.ts)) → generated, committed
  [`src/theme/theme.css`](src/theme/theme.css).
- **Components:** [`src/primitives/`](src/primitives) — public surface is sandbox
  Globals + Layouts + Preview only (see [AGENTS.md](AGENTS.md) and
  [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md)).
- **Agent guide / API catalog:** [AGENTS.md](AGENTS.md) is the authoritative doc.
  **Frontend performance (shells / inspectors / catalogs):** [`llm/PERF.md`](llm/PERF.md).
  **Agent wiki (nav + workflows):** [`openwiki/quickstart.md`](openwiki/quickstart.md)
  (seeded; refresh via Agents Hub → OpenWiki).
  **Breaking purge / consumer migration:** [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
- **Package propagation:** publish `@fynn7/ui-design-core` to GitHub Packages —
  [`docs/package-propagation.md`](docs/package-propagation.md)
  (legacy submodule bumps: [`docs/submodule-propagation.md`](docs/submodule-propagation.md)).

## Consume it (GitHub Packages + source alias)

Install **`@fynn7/ui-design-core`** from `https://npm.pkg.github.com`, then point
Vite/tsconfig **`@fynns/ui`** at
`node_modules/@fynn7/ui-design-core/src/index.ts`. App imports stay
`from "@fynns/ui"`. Do **not** use a git submodule for day-to-day consume.

### One-shot (humans & LLM agents)

Authoritative install contract + script:

- Agent guide: [`llm/CONSUME.md`](llm/CONSUME.md)
- Machine JSON: [`llm/consume.json`](llm/consume.json)
- Installer: `npm run consume:install -- --target <consumer-root>`
  (`scripts/install-as-npm.mjs`)

```bash
# from a checkout of this repo (needs NODE_AUTH_TOKEN / GITHUB_TOKEN read:packages)
npm run consume:install -- --target ../my-app --json
npm run consume:check -- --target ../my-app --json
```

The script writes `.npmrc`, installs the package, and wires Vite/tsconfig when it
can.

### Manual steps (same outcome)

1. Consumer `.npmrc`:

```
@fynn7:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

2. `npm install @fynn7/ui-design-core@^0.5.0 --save`

3. Alias in `vite.config.ts`:

```ts
resolve: {
  alias: {
    "@fynns/ui": path.resolve(
      __dirname,
      "node_modules/@fynn7/ui-design-core/src/index.ts",
    ),
  },
  dedupe: ["react", "react-dom"],
}
```

4. `tsconfig` paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@fynns/ui": ["./node_modules/@fynn7/ui-design-core/src/index.ts"]
    }
  }
}
```

5. Use it:

```tsx
import { Button, Collapsible, FullscreenDialog } from "@fynns/ui";
```

Do not import purged symbols — see [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
Stylesheets: `@fynn7/ui-design-core/theme.css` / `styles.css`.

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
- `npm run check:wysiwyg` — public barrel must appear in Globals/Preview/Shell
  or `llm/wysiwyg-companion.json` (see [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md)).
- `npm run check:perf-sandbox` — inspector lazy-mount / no shell probe thrash
  (see [`llm/PERF.md`](llm/PERF.md)).
- `npm run lint` — ESLint.
- `npm run consume:install -- --target <dir>` — install `@fynn7/ui-design-core`
  from GitHub Packages and wire `@fynns/ui` (see [`llm/CONSUME.md`](llm/CONSUME.md)).
- `npm run consume:check -- --target <dir>` — validate dependency + alias + `.npmrc`.
- `npm run sandbox` — run the aesthetic sandbox in
  [`examples/sandbox`](examples/sandbox) (Globals shape levels, **Toolbar / unit rhythm**
  sample for `ControlStack` / unit-stack gap tokens, live Card
  token overrides, Apply changes). Drafts persist in `localStorage` until you
  click **Apply changes** (review per-file diffs, then confirm), which writes
  `src/theme/tokens.ts` and runs `npm run gen:theme` via the Vite dev middleware.
  Chrome UI session restore / fresh-boot search focus: see **Aesthetic sandbox**
  below. Collapsible sections
  animate open/close with a height slide; the inspector
  aside opens/closes by clipping its width on wide layouts (hard seam with the
  canvas — no translate slide that morphs the corner). Below 900px the shell
  stacks: nav densifies to an icon **rail** (not a chip strip), the inspector
  overlays as a bottom
  sheet (canvas keeps full height), and it starts closed so the preview is not
  crushed.

## Aesthetic sandbox

The sandbox is a consumer of `@fynns/ui` (same primitives + tokens), not a
separate design language. Dev server defaults to port **5174** (same default as
GSC Live Preview). On Windows, `localhost` and `127.0.0.1` can bind different
processes on that port; sandbox Vite **refuses `/wasm/*`** and sets
`frame-ancestors 'self'` so a GSC twin-host iframe cannot paint the sandbox UI
under “Loading Raycaster…”. Top-level tabs / Cursor Simple Browser are
unchanged — still stop one app if you need a single owner of 5174.
**Every new public symbol must ship with a sandbox
Globals or Surfaces Preview sample** (or an explicit companion entry in
[`llm/wysiwyg-companion.json`](llm/wysiwyg-companion.json)) in the same change
set — enforce with `npm run check:wysiwyg`. Pages: **Surfaces** (preview target
**Card | Collapsible**), **Globals / Components** (full catalog via
`globalsCatalog` + SearchBar jump-to-demo; system radius + live control anatomy),
**Foundations**, **Motion**, and **Settings**
(gear icon in the nav — language, config JSON export/import,
and named templates). **Chrome UI session** (page, inspector, nav, playground
  target, open Components categories, main-canvas scroll per page) restores
  across browser refresh for the current Vite process via `sessionStorage` +
  `__SANDBOX_BOOT_ID__`. A fresh Vite process opens **Components** and focuses
  the catalog SearchBar (dev convenience — skips SkipLink first-focus). On
  Surfaces / Globals, the topbar **inspector** toggle
shows or hides the right aside; when hidden (and on pages
without an inspector), the canvas uses a single full-width column. On narrow
viewports (≤900px) the aside is a bottom overlay instead of an in-flow panel.
Editing `--fynns-radius-*` on Globals
injects CSS variable overrides at runtime (including light theme, so hue knobs
are not masked by `:root[data-fynns-theme="light"]`) so Button, Input, Card, and
sandbox chrome update together. See the plan layers: `llm/m3-draft-tokens.md` (M3
reference) → `tokens.ts` (fynns base) → sandbox overrides (fynns-override).
**WYSIWYG:** `SANDBOX_DEFAULT_OVERRIDES` in
`examples/sandbox/src/state/baseline.ts` must stay **empty** — nodded looks go
into `tokens.ts` + `npm run gen:theme` (enforced by `npm run check:wysiwyg`).
Never leave an aesthetic only in the sandbox draft layer (that was how
`--fynns-radius-md` looked 20px in Globals while consumers still got 8px).
A topbar search icon focuses the Components SearchBar from any page.

### Language (English / 中文)

- Open **Settings** (gear) and use the **Language** Select (`English` /
  `中文`) at the top of the settings page:
  [`examples/sandbox/src/components/LanguageSwitcher.tsx`](examples/sandbox/src/components/LanguageSwitcher.tsx).
- Choice persists in `localStorage` (`fynns-sandbox-locale`) and sets
  `document.documentElement.lang` plus `data-fynns-locale`.
- Catalog: [`examples/sandbox/src/i18n/`](examples/sandbox/src/i18n/).
  `@fynns/ui` default labels stay English; the sandbox passes localized chrome.

### Settings (language, templates & config JSON)

- Open via the **gear** control at the bottom of the left nav (special page,
  no inspector aside). Label: **Settings** (`设置`).
- **Language** Select (English / 中文) sits at the top of this settings page.
- **Export JSON** / **Import JSON** move the full sandbox configuration:
  `{ kind, version, theme, overrides, baseTokensHash, exportedAt }`.
- **Save as template** stores the same bundle under a name in `localStorage`
  (`fynns-sandbox-templates`). Apply / export / rename / delete from the list.
- Templates do not write `tokens.ts` by themselves — use **Apply changes** on
  Surfaces / Globals after loading a template if you want source writeback.

### Globals (system shape + Components catalog)

- Shape levels: every `RADIUS_TOKENS` key is listed in the Globals shape
  inspector — editable `--fynns-radius-{2xs,xs,sm,md,lg,xl,22,3xl}` (+ Reset)
- Read-only: `none` / `pill` / `round`
- Named configs: use **Settings** JSON export/import (no built-in radius preset dropdown)
- Live Components catalog: Actions, Fields, Selection, Communication,
  Containment, Patterns, Navigation, Toolbar rhythm, Swatches — see
  [`examples/sandbox/src/catalog/globalsCatalog.ts`](examples/sandbox/src/catalog/globalsCatalog.ts)
- Radius legend: Checkbox ≈ `2xs`; badges / chips ≈ `sm`; cards / inputs ≈ `md`;
  buttons ≈ `xl`; Chat user bubble ≈ `22`; long chrome strips ≈ `3xl`; switch
  capsule ≈ `pill`

### Preview toggles (Surfaces)

Switch the canvas target with **Card | Collapsible** (Surfaces page only;
preview-only — does not change Apply writeback).

**Card**

- Contents: Header icon on/off, header actions on/off
- Same shell as Collapsible; head is static (no hover layer, no chevron)

**Collapsible**

- Behavior: Expanded (controlled preview)
- Contents: Extra header button on/off

### Inspector knobs (Surfaces)

Shared token draft for both Card and Collapsible targets (Apply still writes
`tokens.ts` only — no component recipe writeback):

- Color: accent chips + rainbow hue wheel; elevated / filled / page background
  brightness; outlined card border
- Hover overlays: hover / focus / pressed / dragged
- Spacing: card body / title row / footer button gaps; inspector **Section gap**
  (sandbox-only, not Apply writeback)
- Type size: `--fynns-font-size-{sm,md,lg}`

Elevation / `--fynns-shadow-xs` stay on the token baseline (no Surfaces inspector
knobs).

**Undo / Redo** (Ctrl/Cmd+Z / Ctrl+Y; no toolbar buttons) only cover the token
draft history: inspector knobs and confirmed agent proposals. One hue
gesture is a single undo step (accent family batched). Preview toggles,
light/dark theme, and page nav are not in the draft history.

**Apply changes** opens a review dialog with unified diffs for
`src/theme/tokens.ts` and regenerated `src/theme/theme.css`. Confirming writes
the draft and runs `npm run gen:theme` (Vite dev middleware). That updates the
design-system source consumed by every `@fynns/ui` client. Until then, overrides
stay in the draft / `localStorage` and only affect the sandbox preview.

## Package distribution

Publish **`@fynn7/ui-design-core`** to GitHub Packages via
[`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml)
(Release or `workflow_dispatch`). Consumers install that package and keep the
`@fynns/ui` alias — see [`docs/package-propagation.md`](docs/package-propagation.md).
