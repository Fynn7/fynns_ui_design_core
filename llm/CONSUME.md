# LLM / agent: consume `@fynns/ui` via submodule

**Single source of truth for *installing* this design system into any app repo.**  
Design language & component catalog remain in [`AGENTS.md`](../AGENTS.md).  
Machine contract: [`consume.json`](consume.json).  
**Consumer-agent doc + custom-highlight map:** [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) / [`agent-interfaces.json`](agent-interfaces.json).

**Short user prompts:** humans often say only “use `@fynns/ui` / build a Collapsible page”. Treat this file as mandatory before writing UI code — do **not** wait for a long task doc.

## Hard rules

1. **Git submodule + source alias** — not an npm package for day-to-day use.
2. **Never** add `@fynns/ui` or `@fynns/ui-design-core` to `package.json` `dependencies` / `devDependencies`.
3. Alias name is **`@fynns/ui`** → `packages/fynns_ui_design_core/src/index.ts`.
4. Vite must **`dedupe: ["react", "react-dom"]`**.
5. Do not edit submodule sources for consumer features; bump the pin instead.
6. **TypeScript:** set consumer `compilerOptions.target` and `lib` to **ES2022** (or later). `tsc` follows `@fynns/ui` into this repo’s `.ts` sources (e.g. `String.replaceAll`); `ES2020` alone will fail typecheck even when Vite builds fine.
7. **Do not** import deleted symbols (`toast`, `Toaster`, `Popover`,
   `UnitStack`, …). Migration table: [`BREAKING_PURGE.md`](BREAKING_PURGE.md).
   Transient feedback: `snackbar(...)` + root `<SnackbarHost />` (not toast).
   Centered modals / side inspectors: `Dialog` / `ConfirmDialog` / `Drawer`
   (restored; see BREAKING_PURGE “Restored after purge”).
8. **Entry:** `main.tsx` (or equivalent) must `createRoot(...).render(<App />)` (or equivalent). Importing CSS alone produces an empty build that still “succeeds”.
9. **No fakes:** never hand-roll a disclosure/collapsible chrome; never define a local `Collapsible` that replaces `@fynns/ui`; never use `@radix-ui/*` / `sonner`.
10. **API-only consumption:** treat `@fynns/ui` as a **function** — pass props /
    children / localized labels only. **Never** wrap keep-set primitives in
    consumer restyles, local CSS overrides of `.fynns-*`, or parallel “variants”.
    Missing look/behavior → **explicitly tell the user** the change must be
    implemented in `fynns_ui_design_core` first; then call the new API from the
    consumer. Design language (including Chat container radius floor ≥
    `--fynns-radius-22`): [`AGENTS.md`](../AGENTS.md) Hard rules.
11. **CSS modules for `tsc`:** if `package.json` build runs `tsc` (not Vite-only), add `src/vite-env.d.ts` with `/// <reference types="vite/client" />` (or equivalent `declare module "*.css"`). Otherwise `tsc` fails on this package’s `import "./theme/theme.css"` from the `@fynns/ui` barrel.
12. **Preview pages:** for a component playground/preview, mirror the matching sandbox `*PreviewCanvas` under `examples/sandbox/src/pages/` (anatomy + controlled props). Copy/strings may differ; chrome must come from `@fynns/ui`. Then skim the primitive in `src/primitives/` and [`AGENTS.md`](../AGENTS.md).
13. **Performance:** shells (`ClippedNavShell`), token inspectors, Globals-style
    catalogs, and live draft GUIs → read [`PERF.md`](PERF.md) before coding
    (no observer↔probe loops, no tip forests, lazy-mount dense sections).

## Agent checklist (greenfield / short prompt)

1. Read this file + `consume.json`.
2. Run the one-shot installer (below) against the **consumer** root (use `--url` to a local checkout when offline).
3. Run `--check` until exit 0.
4. Scaffold React + Vite + TS only (no design-system npm dep); keep `lib`/`target` at ES2022+.
5. Implement the page from sandbox Globals/Preview + AGENTS catalog (never deleted symbols — see `BREAKING_PURGE.md`).
6. If the page is a playground / inspector / shell / live-token UI, read [`PERF.md`](PERF.md) and apply its DoD.
7. `npm install` → `npm run build` must exit 0.

## One-shot install (any consumer repo)

If this core repo is not yet available on disk, clone it to a temp folder first, then run the installer against the **consumer** root:

### Windows (PowerShell)

```powershell
$core = Join-Path $env:TEMP "fynns_ui_design_core"
if (-not (Test-Path "$core\scripts\install-as-submodule.mjs")) {
  git clone --depth 1 https://github.com/Fynn7/fynns_ui_design_core.git $core
}
node "$core\scripts\install-as-submodule.mjs" --target "<CONSUMER_ROOT>" --json
```

Or from a local checkout:

```powershell
powershell -ExecutionPolicy Bypass -File D:\path\to\fynns_ui_design_core\scripts\install-as-submodule.ps1 -Target <CONSUMER_ROOT>
```

### POSIX

```bash
git clone --depth 1 https://github.com/Fynn7/fynns_ui_design_core.git /tmp/fynns_ui_design_core
node /tmp/fynns_ui_design_core/scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --json
```

### From this repo

```bash
npm run consume:install -- --target ../my-app --json
```

## What the script does

1. Resolves the consumer **git root**.
2. `git submodule add` (default path `packages/fynns_ui_design_core`) or `submodule update --init` if already registered.
3. Wires the nearest `vite.config.*` (`@fynns/ui` alias + React dedupe) when possible.
4. Wires a nearby `tsconfig*.json` `compilerOptions.paths`.
5. Warns if a forbidden npm dependency on `@fynns/*` is present.
6. With `--json`, prints a structured result for agents.

Useful flags: `--check`, `--wire-only`, `--skip-wire`, `--dry-run`, `--vite <file>`, `--tsconfig <file>`, `--submodule-path <path>`, `--branch <name>`.

## After install

Ensure the consumer `tsconfig` (example):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": { "@fynns/ui": ["./packages/fynns_ui_design_core/src/index.ts"] }
  }
}
```

And `src/vite-env.d.ts` (when `tsc` is part of build):

```ts
/// <reference types="vite/client" />
```

```tsx
import { Button, Collapsible, FullscreenDialog } from "@fynns/ui";
```

Do not import deleted APIs (`toast`, `Toaster`, `PanelCard`, …) — see
[`BREAKING_PURGE.md`](BREAKING_PURGE.md).

Then follow [`AGENTS.md`](../AGENTS.md) (tokens, primitives, a11y).

**Token / layout pointers (do not invent hex, rem, or private inset vars):**
- Style only with `--fynns-*` from `src/theme/tokens.ts` (`npm run gen:theme`).
- **Hard gate:** never hardcode shell / column / chat margins in consumer CSS
  (`padding: 16px`, `1.25rem`, ad-hoc `--app-chat-pad`, etc.). Reuse
  `--fynns-layout-*` or the component alias that already points at one. Missing
  value → land it in this submodule first, then consume.
- Shell insets: Collapsible / Drawer / Card / Fullscreen →
  `--fynns-layout-content-inset`; centered Dialog head/foot/inline **and**
  Chat conversation column (thread + composer outer) →
  `--fynns-layout-dialog-inset` (via `--fynns-chat-thread-pad-inline`;
  composer inset aliases the thread token). Dialog body block also uses
  content-inset. Long-strip / `radius-3xl` **text** (Banner, InlineAlert,
  Snackbar, ChatComposer collapsed text-only start; expanded ChatComposer
  text edge still lands at strip via glyph-inset math) →
  `--fynns-layout-strip-pad-inline`. Expanded shell pad =
  strip − glyph-inset; textarea pad = glyph-inset (optical + / Send glyphs —
  see [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md)).
  Capsule chrome next to IconButtons
  (SearchBar / ChatComposer collapsed shell — Send flush) →
  `--fynns-layout-capsule-chrome-pad-inline`. Dense form `Input` /
  field-shell → `--fynns-layout-field-pad-inline`; `Textarea` also uses
  `--fynns-layout-field-pad-block` (not Input’s sm zero block pad). See
  AGENTS.md **Inset decision tree** / **Toolbar / unit rhythm**.
  ChatComposer multiline (full-width text + bottom toolbar when expanded):
  [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md) — do not invent a
  parallel multi-line shell in the consumer.
- Focus rings: `--fynns-focus-ring-width` + `--fynns-color-focus` (there is no
  bare `--fynns-focus`).
- Design language lives in the submodule’s `AGENTS.md` — the installer does not
  copy it to the consumer root; open `packages/fynns_ui_design_core/AGENTS.md`.

## Verify

```bash
node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check --json
```

Exit code `0` means submodule + alias look good and no forbidden npm deps were found.
