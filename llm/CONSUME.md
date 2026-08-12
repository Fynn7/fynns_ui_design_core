# LLM / agent: consume `@fynns/ui` via submodule

**Single source of truth for *installing* this design system into any app repo.**  
Design language & component catalog remain in [`AGENTS.md`](../AGENTS.md).  
Machine contract: [`consume.json`](consume.json).  
**Consumer-agent doc + custom-highlight map:** [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) / [`agent-interfaces.json`](agent-interfaces.json).

**Short user prompts:** humans often say only “use `@fynns/ui` / build a Collapsible page”. Treat this file as mandatory before writing UI code — do **not** wait for a long task doc.

**Pasteable consumer treaty** (drop into any app’s `.cursor/rules/` so agents
obey without opening this file): [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md) /
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc). **Default app chrome:**
`DestinationAppShell` (sandbox Layout templates). If composing
`ClippedNavShell` slots: `navMode` must stay in sync with Drawer vs Rail
children (never a rail-width track hosting a labeled drawer).

## Hard rules

1. **Git submodule + source alias** — not an npm package for day-to-day use.
2. **Never** add `@fynns/ui` or `@fynns/ui-design-core` to `package.json` `dependencies` / `devDependencies`.
3. Alias name is **`@fynns/ui`** → `packages/fynns_ui_design_core/src/index.ts`.
4. Vite must **`dedupe: ["react", "react-dom"]`**.
5. Do not edit submodule sources for consumer features; bump the pin instead.
5a. **Pin freshness (mandatory before UI work):** from a checkout of this core
    (or the submodule itself), run
    `node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check`
    (or `npm run consume:install -- --target <CONSUMER_ROOT> --check`). Check
    **fails** when the consumer submodule SHA is behind remote `main` tip.
    Bump the pin (`cd packages/fynns_ui_design_core && git fetch && git checkout origin/main`,
    then commit the pointer in the consumer) and re-check before writing UI.
    Escape hatch only when intentional: `--skip-pin-check` or
    `FYNNS_UI_SKIP_PIN_CHECK=1`. Network failure during tip lookup also fails
    (no silent “fresh”). Push-triggered bump PRs
    ([`docs/submodule-propagation.md`](../docs/submodule-propagation.md)) do
    **not** replace this local check — agents must still verify. Consumers not
    listed in [`.github/ui-consumers.json`](../.github/ui-consumers.json) get no
    auto bump PR and rely entirely on this check. Re-paste
    [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) into existing apps
    after treaty updates (installer does not overwrite an existing rule file).
6. **TypeScript:** set consumer `compilerOptions.target` and `lib` to **ES2022** (or later). `tsc` follows `@fynns/ui` into this repo’s `.ts` sources (e.g. `String.replaceAll`); `ES2020` alone will fail typecheck even when Vite builds fine.
7. **Do not** import deleted symbols (`toast`, `Toaster`, `Popover`,
   `UnitStack`, …). Migration table: [`BREAKING_PURGE.md`](BREAKING_PURGE.md).
   Transient feedback: `snackbar(...)` + root `<SnackbarHost />` (not toast).
   Centered modals / side inspectors: `Dialog` / `ConfirmDialog` / `Drawer`
   (restored; see BREAKING_PURGE “Restored after purge”).
8. **Entry:** `main.tsx` (or equivalent) must `createRoot(...).render(<App />)` (or equivalent). Importing CSS alone produces an empty build that still “succeeds”.
9. **No fakes:** never hand-roll a disclosure/collapsible chrome; never define a local `Collapsible` that replaces `@fynns/ui`; never use `@radix-ui/*` / `sonner`. When nesting a surface-owning child (CodeBlock / Surface / canvas / BusyRegion) inside Collapsible or Card, pass **`chrome="plain"`** — body uses `--fynns-layout-nest-gap` (plain ≠ flush); do not cancel nest-gap with negative margins or override `.fynns-*`. Outside those shells use `.fynns-nest`.
9a. **CodeBlock chrome (strict):** titled head (`variant="default"` / omit
    variant) = filename + hairline + copy → **requires** non-empty `label`;
    missing / `label=""` **throws** at runtime. No filename/title →
    **`variant="plain"`** (frame + floating copy only). Never open a titled
    head without a real title (empty title bar is a consumer bug).
9b. **CodeBlock `language` (strict):** `label` is **not** a language detector.
    Always pass `language` (or `highlightProfile` / registered id) that matches
    the source — e.g. `label="system-prompt.xml"` **and** `language="xml"`.
    Filename extensions in `label` alone leave the block **plain mono**.
    Built-ins: `ts`/`js`/`py`/`cpp`/`css`/`json`/`xml`/`html`/`bash`/…;
    app DSLs → [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md). Editable fill
    hosts (FullscreenDialog / `textarea { height: 100% }`) →
    **`autoGrow={false}`** (default autoGrow is content-sized).
10. **API-only consumption:** treat `@fynns/ui` as a **function** — pass props /
    children / localized labels only. **Never** wrap keep-set primitives in
    consumer restyles, local CSS overrides of `.fynns-*`, or parallel “variants”.
    Missing look/behavior → **explicitly tell the user** the change must be
    implemented in `fynns_ui_design_core` first; then call the new API from the
    consumer. Design language (including Chat container radius floor ≥
    `--fynns-radius-22`, and **font families** — body/chrome = `ui`, code =
    `mono`, never serif for main prose): [`AGENTS.md`](../AGENTS.md) Hard rules
    + Tokens **Font families**.
11. **CSS modules for `tsc`:** if `package.json` build runs `tsc` (not Vite-only), add `src/vite-env.d.ts` with `/// <reference types="vite/client" />` (or equivalent `declare module "*.css"`). Otherwise `tsc` fails on this package’s `import "./theme/theme.css"` from the `@fynns/ui` barrel.
12. **Preview pages:** for a component playground/preview, mirror the matching sandbox `*PreviewCanvas` under `examples/sandbox/src/pages/` (anatomy + controlled props). Copy/strings may differ; chrome must come from `@fynns/ui`. Then skim the primitive in `src/primitives/` and [`AGENTS.md`](../AGENTS.md).
13. **Performance:** shells (`ClippedNavShell`), token inspectors, Globals-style
    catalogs, and live draft GUIs → read [`PERF.md`](PERF.md) before coding
    (no observer↔probe loops, no tip forests, lazy-mount dense sections).
14. **Default chrome:** use `DestinationAppShell` for greenfield destination
    apps (Layout templates). **ClippedNavShell sync** (slot API only): `navMode`
    and the `nav` subtree must match (`drawer`→`NavigationDrawer`,
    `rail`→`NavigationRail`, `hidden`→null/omit). Crowding / narrow viewports
    densify to **rail + Rail components** — never leave a labeled drawer in an
    ~80px track (squashed drawer + bogus scrollbar).
    Pasteable rule: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
    **Main canvas fill:** Preview (or other top band) above Chat → wrap with
    **`FillColumn`** (`header` + `Chat` in `children`) so the composer docks;
    do not stack Preview / EmptyState / Composer as canvas siblings (dead band
    under content height). See [`AGENTS.md`](../AGENTS.md) Chat Shell /
    Layout helpers. Canvas `overflow-y: auto` does not replace a fill column.
15. **WYSIWYG / surface sync:** sandbox Globals/Layouts/Preview resting look is the consumer default.
    Use bare `@fynns/ui` APIs; never restyle `.fynns-*` to “match” sandbox.
    Aesthetic drift belongs in `tokens.ts` / primitives (then `npm run gen:theme`).
    `SANDBOX_DEFAULT_OVERRIDES` must stay empty (`npm run check:wysiwyg` enforces).
    Core maintainers: never drop a sandbox demo while a symbol stays exported —
    delete public APIs **atomically** (see [`BREAKING_PURGE.md`](BREAKING_PURGE.md)
    Policy §5). `check:wysiwyg` also fails if Removed-table names reappear in the
    barrel or if a visual primitive is companion-parked.
    Pin bump note: `--fynns-radius-md` shipped at **20px** (was 8px) so consumers
    match the long-standing sandbox Select/Input look.

## Agent checklist (greenfield / short prompt)

1. Read this file + `consume.json`.
2. Run the one-shot installer (below) against the **consumer** root (use `--url` to a local checkout when offline).
3. Run `--check` until exit 0 (includes pin-vs-`main` freshness). If pin is
   behind, bump the submodule pointer first — do not invent UI on a stale pin.
4. Scaffold React + Vite + TS only (no design-system npm dep); keep `lib`/`target` at ES2022+.
5. **Default main chrome:** `DestinationAppShell` (sandbox Layout templates
   `#layouts-demo-shell`) unless the user names another template. Do **not**
   greenfield from standalone `NavigationRail` / invent parallel topbar+sidebar.
   Controls/parts: sandbox Components (Globals) + Preview + AGENTS catalog
   (never deleted symbols — see `BREAKING_PURGE.md`).
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
6. If missing, writes `.cursor/rules/fynns-ui-consumer.mdc` from
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) (does not overwrite).
7. With `--json`, prints a structured result for agents.

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
  `--fynns-layout-content-inset` (`chrome="card"` and `chrome="plain"` share
  the outer shell; **`plain` body uses `--fynns-layout-nest-gap`** — pad + gap —
  so nested surfaces inset; plain ≠ flush). Outside Card/Collapsible use
  `.fynns-nest`. Centered Dialog head/foot/inline **and**
  Chat conversation column (thread + composer outer) →
  `--fynns-layout-dialog-inset` (via `--fynns-chat-thread-pad-inline`;
  composer inset aliases the thread token). Dialog body block also uses
  content-inset. **Dialog ControlStack rows:** full-width `ControlStack` /
  `ControlRow` / track-only `Switch` (`label=""` + `ariaLabel`) — one visible
  name per row. **Do not** copy Globals `#info-hint` (labeled Switch + trailing
  `InfoHint`) as a Preferences/Settings Dialog shell; do **not** stack
  `ControlRow` label + Switch visible label on the same row; do **not** add a
  second padding wrapper or toolbar `max-content` stack (Switch tracks must
  share the **CloseIcon glyph** end edge, not the 40dp hit box). Authority:
  [`AGENTS.md`](../AGENTS.md) **Dismissible Dialog + ControlStack**. Long-strip / `radius-3xl` **text** (Banner, InlineAlert,
  Snackbar, ChatComposer collapsed text-only start; expanded ChatComposer
  text edge still lands at strip via glyph-inset math) →
  `--fynns-layout-strip-pad-inline`. Expanded shell pad =
  strip − glyph-inset; textarea pad = glyph-inset (optical + / Send glyphs —
  see [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md)).
  Capsule chrome next to IconButtons
  (SearchBar only — not ChatComposer shell) →
  `--fynns-layout-capsule-chrome-pad-inline`. ChatComposer collapsed shell →
  `--fynns-chat-composer-pad-inline` / `pad-block` (see
  [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md)). Dense form `Input` /
  field-shell → `--fynns-layout-field-pad-inline`; `Textarea` also uses
  `--fynns-layout-field-pad-block` (not Input’s sm zero block pad) and
  auto-grows by default (`--fynns-layout-textarea-max-height` soft cap). See
  AGENTS.md **Inset decision tree** / **Toolbar / unit rhythm** / nested
  containment (`chrome="plain"` = outer shell + nest-gap child).
  **Control + related note:** wrap in `ControlBlock` (`description` /
  `errorText`). **Semantic form clusters (strongly recommended):** partition
  inspector / settings / Dialog options with `FieldStack` by kind (identity
  FieldBlocks together, Preference ControlBlocks together, …) —
  `field-stack-gap` 8dp inside; adjacent FieldStacks use `form-cluster-gap`
  (32dp); other Card / Collapsible siblings use `unit-stack-gap` (16dp). Do
  **not** flatten multi-topic forms as bare siblings or invent muted subtitle
  classes. Live tree: sandbox `#form-recipe` / AGENTS.md **FieldStack semantic
  clusters**. Outside Card use `.fynns-unit-stack`.
  ChatComposer multiline (full-width text + bottom toolbar when expanded):
  [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md) — do not invent a
  parallel multi-line shell in the consumer.
- Focus rings: `--fynns-focus-ring-width` + `--fynns-color-focus` (there is no
  bare `--fynns-focus`).
- Design language lives in the submodule’s `AGENTS.md` — the installer does not
  copy it to the consumer root; open `packages/fynns_ui_design_core/AGENTS.md`.

## Local sync (instant)

When you edit this core checkout locally and need the **consumer Vite app** to
pick up the same `src/` immediately (including **uncommitted** files), run from
core:

```bash
npm run consume:sync -- --target <CONSUMER_ROOT>
# or:
node scripts/sync-to-consumer.mjs --target <CONSUMER_ROOT> --dry-run
```

`--target` may be the consumer git root or any path inside it (e.g.
`tools/gsc-live-preview`). The script compares this core’s `src/` +
`package.json` to `packages/fynns_ui_design_core` in the consumer, mirrors when
different, and prints `already in sync` when equal. **Core is the source of
truth** (overwrites conflicting dirty files in the submodule worktree). It does
**not** commit the submodule pin or push — day-to-day local loop only. Unreadable
source/dest files abort the sync (exit non-zero) instead of treating a read miss
as “delete on dest” (e.g. Windows locks).

Formal release / CI still **bump the pin** (checkout a published SHA + commit
the pointer). See [`docs/submodule-propagation.md`](../docs/submodule-propagation.md).
Pin freshness `--check` (Hard rule 5a) is separate from this worktree mirror.

## Verify

```bash
node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check --json
# intentional old pin / offline:
node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check --skip-pin-check --json
# local worktree mirror (instant; not a pin bump):
npm run consume:sync -- --target <CONSUMER_ROOT>
```

Exit code `0` for `--check` means submodule + alias look good, no forbidden npm
deps, and (unless `--skip-pin-check`) the submodule pin is not behind remote
`main`.
