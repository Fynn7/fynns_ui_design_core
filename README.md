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
  Card, Dialog, Switch, Toast, Tooltip, and more (see [AGENTS.md](AGENTS.md)).
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
- `npm run sandbox` — run the interactive M3 Card aesthetic sandbox in
  [`examples/aesthetic-sandbox`](examples/aesthetic-sandbox). Card tokens,
  preset JSON behavior, and the authoritative API description are documented
  in [AGENTS.md](AGENTS.md#card-gallery-and-aesthetic-sandbox).
- `npm run sandbox:build` — production-build the standalone sandbox.

## Optional package distribution

`package.json` is preconfigured (`exports`, `publishConfig`) so the library can
later be published to GitHub Packages (`@fynns/ui-design-core`). The submodule +
source-alias flow above is the primary, recommended path.
