# LLM / agent: consume `@fynns/ui` (zero-token sibling)

**Single source of truth for *installing* this design system into any app repo.**  
Design language & component catalog remain in [`AGENTS.md`](../AGENTS.md).  
Machine contract: [`consume.json`](consume.json).  
**Consumer-agent doc + custom-highlight map:** [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) / [`agent-interfaces.json`](agent-interfaces.json).  
**Publish / version bumps:** [`docs/package-propagation.md`](../docs/package-propagation.md).

**Short user prompts:** humans often say only “use `@fynns/ui` / build a Collapsible page”. Treat this file as mandatory before writing UI code — do **not** wait for a long task doc.

**Pasteable consumer treaty** (drop into any app’s `.cursor/rules/` so agents
obey without opening this file): pasteable rule
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) + slug index
[`CONSUMER_TREATY.md`](CONSUMER_TREATY.md). **Default app chrome:**
`DestinationAppShell` (sandbox Layout templates). If composing
`ClippedNavShell` slots: `navMode` must stay in sync with Drawer vs Rail
children (never a rail-width track hosting a labeled drawer); `nav` =
destinations only (never wiki / page body / Chat). “Clipped” = M3 chrome
topology, not text clipping — see [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md)
index slugs **squashed drawer** + **wrong shell slot**.

## Hard rules

1. **Zero-token day-to-day (default)** — this git repo is **public**. Consumers
   depend on **`@fynn7/ui-design-core`** via a **sibling checkout**
   `../fynns_ui_design_core` + `file:` link (Vite/tsconfig alias
   **`@fynns/ui`** → `node_modules/@fynn7/ui-design-core/src/index.ts`).
   **No** `NODE_AUTH_TOKEN` / `GITHUB_TOKEN` / `gh` packages login for clone →
   `npm install` → `npm run dev`. Auto-clone the sibling on first setup/dev
   (reference: CV Generator `scripts/ensure-node.mjs`; core helper
   `scripts/ensure-sibling-ui-core.mjs`). Do **not** use a git submodule.
   Do **not** commit
   `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}` in consumer `.npmrc`
   (empty expansion → E401). Prefer a safe `.npmrc` that keeps `@fynn7` off
   GitHub Packages while on sibling (`@fynn7:registry=https://registry.npmjs.org`).
2. **Do** add `@fynn7/ui-design-core` to consumer `package.json` `dependencies`
   (usually `file:../../fynns_ui_design_core` or absolute `file:` URL after
   ensure). Do **not** depend on obsolete registry names `@fynns/ui` /
   `@fynns/ui-design-core` (not the published package id).
3. Alias name is **`@fynns/ui`** →
   `node_modules/@fynn7/ui-design-core/src/index.ts` (Vite `resolve.alias` +
   tsconfig `paths`). App code keeps `import { … } from "@fynns/ui"`.
4. Vite must **`dedupe: ["react", "react-dom"]`**.
5. Do not edit `node_modules/@fynn7/ui-design-core` for consumer features —
   change this core repo, then refresh the sibling (`git pull` / ensure script)
   or bump. Authority:
   [`docs/package-propagation.md`](../docs/package-propagation.md).
   **Do** use sibling `file:` for day-to-day. Do **not** point *only* the Vite
   alias at a sibling while `package.json` still resolves a registry tarball
   (inconsistent / looks like rollback). Optional GitHub Packages
   (`npm.pkg.github.com`) is for **publishers / bump workflows only** and still
   needs a packages token — never require it for “anyone clones the consumer”.
5a. **Install freshness (mandatory before UI work):** ensure sibling exists and
    `file:` links; run
    `node scripts/ensure-sibling-ui-core.mjs --target <CONSUMER_ROOT> --install --npmrc`
    and/or `npm run consume:check -- --target <CONSUMER_ROOT>`. Fails when the
    dependency / alias is missing, or a legacy submodule tree remains.
    Re-paste [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) after
    treaty updates (installer does not overwrite an existing rule file).
6. **TypeScript:** consumer `compilerOptions.target` and `lib` must be **ES2022** (or later).
7. **Do not** import deleted symbols — [`BREAKING_PURGE.md`](BREAKING_PURGE.md).
   Transient feedback: `snackbar` + `SnackbarHost`. Modals: `Dialog` /
   `ConfirmDialog` / `Drawer`.
8. **Entry:** `createRoot(...).render(<App />)` — CSS-only main is a fail.
9. **No fakes:** no hand-rolled Collapsible; no `@radix-ui/*` / `sonner`. Nest
   surface children with `chrome="plain"` / `.fynns-nest`.
9a. **CodeBlock** titled `default` requires non-empty `label`; else `variant="plain"`.
9b. **CodeBlock `language`:** always pass matching `language` / profile — `label` is not a detector.
9c. **CodeBlock headless copy:** core reserves an end column (`--copy-float`) so
    glyphs never sit under Copy. Do **not** pad `.fynns-code-block-pre` in the app.
9d. **Suffixed file bodies:** any real extension other than `.txt` / `.text`
    (`.md`, `.xml`, `.py`, `.ts`, `.json`, …) → **`CodeBlock`**, not `Textarea`.
    Use `codeLanguageFromPath(path)` for `language` (`null` → Textarea OK).
    Card host → `chrome="plain"`; **default autoGrow** on PageScroll / Card /
    Dialog (page scrolls). `autoGrow={false}` **only** for height-resolved
    fill hosts (FullscreenDialog fill, SplitPane, `textarea { height: 100% }`).
    Authority: [`AGENTS.md`](../AGENTS.md) Content density +
    [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md).
10. **API-only:** props/children/labels only; never restyle `.fynns-*`. Missing
    capability → implement in this core first. Chat radius floor ≥ `--fynns-radius-22`;
    fonts: body `ui`, code `mono`, never serif for main prose.
10a. Prefer `ChatMessage markdown` / `ChatMarkdown` for LLM turns.
11. **CSS for tsc:** `vite-env.d.ts` with `vite/client` when needed.
12. **Preview pages:** mirror sandbox `*PreviewCanvas`.
13. **Performance:** read [`PERF.md`](PERF.md) for shells / inspectors / catalogs.
14. **Default chrome:** `DestinationAppShell`. ClippedNavShell slot sync — see
    [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md). Main Preview+Chat → `FillColumn`.
    Catalog in that band → `.fynns-unit-stack` + `fynns-scroll`; default
    `Surface` is content-sized (`fill` only for stretching wells).
15. **WYSIWYG:** sandbox resting look = consumer default; `check:wysiwyg`.
16. **Loading placement:** pane cold-start → `BusyRegion` `fill` as
    **`FillColumn` children** / shell main **or** PageScroll →
    `.fynns-content-column` (core ≥ **0.5.136** fills the scrollport + passes
    thin section wrappers so BusyStack centers) — **not** nested under App-level
    `.fynns-unit-stack` / `Card` / `List` / Dialog body without height.
    Dialog / Card / section **body** load → `BusyRegion` (+ `fill` only when
    height-resolved) — **not** bare default-`md` `CircularProgress` as the
    body. Do **not** use `EmptyState` + `CircularProgress` (content-sized →
    ring stuck at the top). Known % / counts → `indicator="linear"` + `value`;
    `message` is copy only (never nest a bar or ring). Full-app block →
    `BusyScrim`. Inline widget busy → `CircularProgress` `sm` only.
    Authority: [`AGENTS.md`](../AGENTS.md) Feedback **Loading placement**.
    Live: sandbox `#busy-region` / `#sandbox-busy-region-page-scroll-fill`.
    Index: [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md)
    **BusyRegion fill nested in unit-stack / Card** /
    **BusyRegion fill BusyStack top overflow in PageScroll**.

## Agent checklist (greenfield / short prompt)

1. Read this file + `consume.json`.
2. **No packages token.** Ensure sibling `../fynns_ui_design_core` (public HTTPS
   clone) + safe `.npmrc` (no `_authToken=${NODE_AUTH_TOKEN}`).
3. `node scripts/ensure-sibling-ui-core.mjs --target <CONSUMER_ROOT> --install --npmrc`
   (or wire the same into consumer `setup` / first `dev`).
4. `npm run consume:check -- --target <CONSUMER_ROOT>` until exit 0; remove leftover submodule trees.
5. Scaffold React + Vite + TS; `lib`/`target` ES2022+.
6. Default chrome: `DestinationAppShell` unless the user names another template.
7. Playground / inspector / shell → [`PERF.md`](PERF.md).
8. `npm install` → `npm run build` exit 0.

## One-shot install (zero-token)

```bash
# from a core checkout (or after cloning core anywhere)
node scripts/ensure-sibling-ui-core.mjs --target ../my-app --install --npmrc --json
npm run consume:install -- --target ../my-app --sibling --json   # wire alias + rule
npm run consume:check -- --target ../my-app --json
```

Bootstrap for a fresh machine (no PAT):

```bash
git clone https://github.com/Fynn7/my-consumer.git
git clone --depth 1 --branch dev https://github.com/Fynn7/fynns_ui_design_core.git ../fynns_ui_design_core
# or let the consumer's setup / ensure script clone the sibling automatically
cd my-consumer && npm install && npm run dev
```

Consumer **safe** `.npmrc` (sibling mode — commit this shape):

```
# Zero-token sibling consume: do not point @fynn7 at npm.pkg.github.com.
@fynn7:registry=https://registry.npmjs.org
```

**Do not** commit:

```
@fynn7:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

**If you still see E401:** you are on the optional Packages path (or a leftover
`.npmrc` / user `~/.npmrc` with empty `${NODE_AUTH_TOKEN}`). Switch back to
sibling `file:` + safe `.npmrc`. GitHub Packages npm **always** needs a token
even when the package is public — that is why day-to-day consume is sibling,
not Packages. Optional Packages bump for publishers only:
[`docs/package-propagation.md`](../docs/package-propagation.md).

Treaty: [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md) **zero-token sibling consume** /
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **安装与 API**.

## What the scripts do

**`ensure-sibling-ui-core.mjs`:** clone/update
`<consumer-git-root>/../fynns_ui_design_core` over public HTTPS; optional
`--install` (`file:`) + `--npmrc` (safe scope). **No token.**

**`install-as-npm.mjs` (wire + optional Packages):**

1. Resolves the nearest `package.json` above `--target` (so monorepo apps
   like `agents-hub/gui` or `tools/gsc-live-preview` work) and the git root
   (for the Cursor consumer rule).
2. Default **`--sibling`**: safe `.npmrc` + prefer `file:` sibling (no token).
   Opt-in **`--packages`**: GitHub Packages install (needs token — publishers).
3. Wires Vite `@fynns/ui` → `node_modules/@fynn7/ui-design-core/src/index.ts` + React dedupe.
4. Wires tsconfig `paths`.
5. Writes `.cursor/rules/fynns-ui-consumer.mdc` if missing (from `consumer-cursor-rule.mdc`).
6. Wires **`fynns-ui:check-update`** into consumer
   `predev` / `prebuild` / `prepreview` / `postinstall`. On sibling/`file:`
   the registry lookup is skipped quietly without a token. Silence:
   `FYNNS_UI_SKIP_UPDATE_CHECK=1`. Cache: `.fynns-ui-update-check.json`.
7. `--json` structured result for agents.

**Monorepo bump (hard):** `fynns-ui:check-update` runs from the **consumer app
package** (the nearest `package.json` above `--target` / cwd — e.g.
`apps/web`), not the git root. Vite resolves
`node_modules/@fynn7/ui-design-core` from that package first. Installing only
at the repo root updates a parent copy the app does not use; `npm run dev`
will keep warning until you run `npm install @fynn7/ui-design-core@x.y.z` (or
`npm run consume:install -- --target <app>`) **in the app package**. The notice
names that package path and flags parent drift when detected.

Flags: `--check`, `--wire-only` / `--skip-install`, `--dry-run`, `--vite`, `--tsconfig`, `--version`.

## After install

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": {
      "@fynns/ui": ["./node_modules/@fynn7/ui-design-core/src/index.ts"]
    }
  }
}
```

```ts
/// <reference types="vite/client" />
```

```tsx
import { Button, Collapsible, FullscreenDialog } from "@fynns/ui";
```

See [`BREAKING_PURGE.md`](BREAKING_PURGE.md) and [`AGENTS.md`](../AGENTS.md).

**Token / layout pointers (do not invent hex, rem, or private inset vars):**
- Style only with `--fynns-*` from `src/theme/tokens.ts` (`npm run gen:theme`).
- **Scroll hosts:** every `overflow: auto/scroll` surface must use `.fynns-scroll`
  (primitives already do). Importing `@fynns/ui` auto-starts overlay thumbs
  (`ensureOverlayScrollbars` — fixed portal at `--fynns-z-toast`; native bars
  hidden so they never steal width). Textarea / single-line inputs hide the
  native bar only (no overlay rail). Do not reintroduce classic bars or
  `scrollbar-gutter: stable`. Authority: AGENTS.md **Scrollbar discipline**.
- **Hard gate:** never hardcode shell / column / chat margins in consumer CSS
  (`padding: 16px`, `1.25rem`, ad-hoc `--app-chat-pad`, etc.). Reuse
  `--fynns-layout-*` or the component alias that already points at one. Missing
  value → land it in this core package first, then consume.
- Shell insets: Collapsible / Drawer / Card / Fullscreen →
  `--fynns-layout-content-inset` (`chrome="card"` and `chrome="plain"` share
  the outer shell; **`plain` body pad = `content-inset`, column gap =
  `--fynns-layout-nest-gap`** — nested surfaces inset; plain ≠ flush).
  **FullscreenDialog flush-start:** first body child a bordered well
  (`CodeBlock` / `Surface` / table wrap) → core drops `padding-block-start`
  (one unpadded fill wrapper allowed). Do not add consumer pad-top. See
  AGENTS.md **Inset decision tree** / `#fullscreen-flush`. Outside
  Card/Collapsible use `.fynns-nest`. Centered Dialog head/foot/inline **and**
  Chat conversation column (thread + composer outer) →
  `--fynns-layout-dialog-inset` (via `--fynns-chat-thread-pad-inline`;
  composer inset aliases the thread token). Dialog body block also uses
  content-inset. **Dialog ControlStack rows:** full-width `ControlStack` /
  `ControlRow` / track-only `Switch` (`label=""` + `ariaLabel`) — one visible
  name per row; form-host row gap is `--fynns-layout-control-stack-form-gap` (**12dp**). **Do not** copy Globals `#info-hint` (labeled Switch + trailing
  `InfoHint`) as a Preferences/Settings Dialog shell; do **not** stack
  `ControlRow` label + Switch visible label on the same row; do **not** add a
  second padding wrapper or toolbar `max-content` stack (Switch tracks must
  share the **CloseIcon glyph** end edge, not the 40dp hit box). Authority:
  [`AGENTS.md`](../AGENTS.md) keep-set **Dialog** + **Inset decision tree**.
  Long-strip / `radius-3xl` **text** (Banner, InlineAlert,
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
  field-shell → `capsule-chrome-pad-inline` + `field-pad-inline` (Select text
  start parity); `Textarea` also uses
  `--fynns-layout-field-pad-block` (not Input’s sm zero block pad) and
  auto-grows by default (`--fynns-layout-textarea-max-height` soft cap). See
  AGENTS.md **Inset decision tree** / **Toolbar / unit rhythm** / nested
  containment (`chrome="plain"` = content-inset pad + nest-gap child).
  **Control + related note:** wrap in `ControlBlock` (`description` /
  `errorText`). On a single ControlRow the hint docks in the **label column**;
  ToggleGroup / cluster vertically centers on name + hint — not a full-bleed
  next row. Padded `Surface` is a form host (same as Card body).
  **Semantic form clusters (strongly recommended):** partition
  inspector / settings / Dialog options with `FieldStack` by kind (identity
  FieldBlocks, Radio/Checkbox/Slider choice FieldBlocks, Preference
  ControlBlocks, …) — plain FieldBlocks share `field-stack-gap` 12dp;
  FieldBlocks with description/error (no choice cluster) open the next
  sibling to `unit-stack-gap` 16dp; FieldBlocks hosting a
  `.fynns-control-cluster` open to visual `form-cluster-gap` 32dp; sibling
  ControlBlocks to `unit-stack-gap` 16dp; adjacent FieldStacks use
  `form-cluster-gap` (32dp) **and strongly prefer a horizontal `Divider`
  between stacks** on kind jumps; other Card / Collapsible siblings use
  `unit-stack-gap` (16dp). Choice lists use `.fynns-control-cluster--stack`
  (`--choice-extra` = Google-style Other+Input same-row; keep Input mounted,
  `disabled` when Other is not selected — draft text preserved). Do **not**
  flatten multi-topic forms as
  bare siblings or invent muted subtitle classes. Live tree: sandbox
  `#form-recipe` (Card / Collapsible / Dialog) / AGENTS.md **FieldStack
  semantic clusters**. Outside Card use `.fynns-unit-stack`.
  ChatComposer multiline (full-width text + bottom toolbar when expanded):
  [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md) — do not invent a
  parallel multi-line shell in the consumer.
- Focus rings: `--fynns-focus-ring-width` + `--fynns-color-focus` (there is no
  bare `--fynns-focus`).
- Design language lives in the package `AGENTS.md` (also in this git repo) — open
  `node_modules/@fynn7/ui-design-core/AGENTS.md` or the core checkout.

## Local development (no worktree sync)

There is **no** `consume:sync` / `consume:watch`. To try unreleased core changes
in an app:

- temporary `"@fynn7/ui-design-core": "file:../fynns_ui_design_core"`, or
- `npm link`, or
- publish a prerelease / bump the semver after Release.

Formal delivery: publish to GitHub Packages then bump the consumer dependency.
See [`docs/package-propagation.md`](../docs/package-propagation.md).

## Verify

```bash
npm run consume:check -- --target <CONSUMER_ROOT> --json
```

Exit `0` means `@fynn7/ui-design-core` is declared, `.npmrc` scopes `@fynn7`,
`@fynns/ui` alias + React dedupe look good, and no legacy submodule tree remains.
