# Consume `@fynns/ui` — install + greenfield skeleton

**Single source of truth for installing this design system into any app** and
for starting a new app with it. Design rules live in
[`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) (index) — do not restate
them here. Machine twin of the install contract: [`consume.json`](consume.json).

Short user prompts (“build X with @fynns/ui”) still mean: read **this file**
first, then look props up with `node scripts/api.mjs <Name>` (never read whole
source files).

For media/caption/prose layouts, use the shipped CSS recipe from
[`Content rhythm`](../docs/design-system/content-rhythm.md): body line height,
8dp image→caption, 16dp gallery/block gaps. Re-copy the always-apply consumer
rule after updates; existing copied rules are not automatically overwritten.

For action rows and drawer section titles, follow the shipped
[Form rhythm](../docs/design-system/form-rhythm.md) recipe: Toolbar / public
control-cluster owns 8dp labeled/mixed rows and 4dp icon-only rows; first drawer
title clears chrome by 24dp, internal Divider→title by 16dp. Do not tune private
gaps or reset core padding. Live references: `#sandbox-action-spacing` and
`#sandbox-navdrawer-title-spacing`.

**Mandatory greenfield defaults:** read
[Workspace chrome and error feedback](../docs/design-system/workspace-chrome.md)
before choosing chrome. Live `#layouts-demo-workspace-chrome` includes top-bar
ghost Home/Back/one inspector toggle, a first New resource menu, targeted
right-click/keyboard rename, horizontal ghost object actions and Dialog Cancel.
Errors default to snackbar. Persistent InlineAlert uses `onDismiss` and a
content-width centered ghost-X template (`#sandbox-inline-alert-dismiss`).
The installed export gate checks static workspace composition as well as exports;
dynamic/localized behavior still requires browser verification.

**Gate failure recovery:** read the actual file/rule diagnostics first. A
`workspace-contract` failure is consumer JSX, not a stale sibling. Run
`node ../fynns_ui_design_core/scripts/check-ui-exports.mjs --target <app> --fix`
to migrate simple legacy Cancel/retry rows, review the diff and rerun the gate.
Complex/dynamic cases still require source edits. Checks without `--fix` are
read-only. Keep Retry callbacks/disabled state reachable in a sibling
`.fynns-control-cluster`; `onDismiss` only dismisses presentation. See the
[error recovery recipe](../docs/design-system/workspace-chrome.md).
Wrappers must preserve JSON `issues[].code` / `message` (or the CLI diagnostic),
never label every nonzero exit as stale core or suggest skipping sibling sync.
Only missing core/exports calls for linking/sync; `dev-cache` calls for
`install-as-npm.mjs --dev-cache-only`, tooling failures for installing TypeScript.

**Canvas workspaces (≥ 0.5.310):** use `.fynns-workspace-canvas` and
`.fynns-workspace-tools` → floating Toolbar, with core 16dp clearance and a
restore icon after closing. In-flow page tools use `.fynns-docked-tools-inset`.
Only one editing toolbar per canvas; document mode/direction/arrange/export
go in one top-bar ghost icon DropdownMenu. `.fynns-workspace-panes` keeps canvas
and EndAside in one full-height row directly under TopAppBar. Never put a toolbar
above that row and break the inspector's top edge. Opening menus preserves bounds.
Persistent actionable errors use `WorkspaceNoticeStack`: top/end 16dp,
content-sized independent cards, 16dp stacking, stable ids, ghost recovery/X,
and built-in entry/exit/reflow + reduced motion. Do not rebuild this in local
CSS or create another retry toolbar. Live `#layouts-demo-canvas-workspace`.
Agent quality rewards: [UI_REWARD_SIGNALS.md](UI_REWARD_SIGNALS.md), target 10/10
with actual visual/behavior evidence and no hard-contract violations.

## 1. Quickstart (zero-token sibling, ~2 min)

Day-to-day consume = public sibling checkout `../fynns_ui_design_core` +
`file:` dependency. **No** `NODE_AUTH_TOKEN`, no GitHub Packages login, no git
submodule.

```bash
# 1. new app (skip if it exists)
npm create vite@latest my-app -- --template react-ts && cd my-app

# 2. clone core next to the app (public HTTPS), link it, wire alias + rule
node ../fynns_ui_design_core/scripts/ensure-sibling-ui-core.mjs --target . --install --npmrc --json
node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --sibling --json

# 3. verify (exit 0 = dependency + .npmrc + alias + dev cache policy + rule OK)
node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --check --json
npm run dev
```

What the two scripts leave behind (all idempotent):

| File | Change |
| --- | --- |
| `package.json` | `dependencies["@fynn7/ui-design-core"] = "file:../fynns_ui_design_core"`; scripts `fynns-ui:gate` / `fynns-ui:check-update` on `predev` / `prebuild` / `prepreview` / `postinstall` |
| `.npmrc` | `@fynn7:registry=https://registry.npmjs.org` (safe; never commit an `_authToken=${NODE_AUTH_TOKEN}` line) |
| `vite.config.*` | `resolve.alias["@fynns/ui"] → node_modules/@fynn7/ui-design-core/src/index.ts` + `resolve.dedupe: ["react", "react-dom"]` + `server.headers["Cache-Control"] = "no-store"` |
| `tsconfig*.json` | `paths["@fynns/ui"]` → same entry; `target` / `lib` **ES2022+** |
| `.cursor/rules/fynns-ui-consumer.mdc` | copy of [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) (written once; `--sync-consumer-rule` to refresh) |
| `AGENTS.md` | copy of [`consumer-AGENTS.md`](consumer-AGENTS.md) when the app has none (OpenCode / small local models) |

App code imports only the alias: `import { Button } from "@fynns/ui";` — CSS
(tokens + primitives) loads with the barrel, and overlay scrollbars start
automatically. `vite-env.d.ts` needs `/// <reference types="vite/client" />`
when `tsc` runs against the sources.

## 1b. Install contract without scripts (escape hatch)

The table above **is** the install contract. `ensure-sibling-ui-core.mjs` /
`install-as-npm.mjs` only accelerate it. If either script fails, is missing, or
misbehaves in this environment:

1. **Do not** open, debug, or edit `fynns_ui_design_core/scripts/**` (or other
   core sources) to unblock a **consumer** task.
2. **Hand-apply** the same outcomes as the table (adjust the relative path to
   the sibling if the app is not a direct neighbor):

```bash
# from the app package that owns package.json / vite
npm pkg set dependencies.@fynn7/ui-design-core=file:../fynns_ui_design_core
# .npmrc: @fynn7:registry=https://registry.npmjs.org
# vite: resolve.alias["@fynns/ui"] → node_modules/@fynn7/ui-design-core/src/index.ts
#       + resolve.dedupe: ["react", "react-dom"]
#       + server.headers: { "Cache-Control": "no-store" }
# tsconfig: paths["@fynns/ui"] → same; target/lib ES2022+
npm install
```

3. Continue **product work in the consumer app** (`import` from `@fynns/ui`).
4. If the failure looks like a core-script bug: note it and stop; fix upstream
   only in a task whose goal is the design-system / installer — not mid
   consumer feature work.

The dev header prevents embedded browsers from reusing an old native ESM
response when the linked core gains a new export. The predev export gate also
checks this policy, so an existing consumer fails before launching Vite until
`install-as-npm.mjs --wire-only` updates its config. A browser that already
stored an old response before this policy was installed may need one hard
reload or cache clear when first migrating.

Same class of recovery as **E401** below: return to sibling `file:` wiring,
do not fight Packages auth or patch installers in-session.

## 2. Greenfield skeleton (generic content app)

Explicitly requested fixed destinations can use **`DestinationAppShell`** (labeled drawer +
TopAppBar + optional `EndAside`); resource menus/context callbacks use the
existing **`ClippedNavShell`** composition below. Main canvas = **`PageScroll`** → Cards /
List / EmptyState (the inner `.fynns-content-column` already has gap + inset;
never add your own padding or scroll containers). Props below are verified with
`node scripts/api.mjs ClippedNavShell NavigationDrawer DropdownMenu TopAppBar PageScroll Dialog`.
For per-resource rename and inspector actions copy the small
[live workspace recipe](../examples/sandbox/src/components/WorkspaceChromeDemo.tsx),
replacing its sandbox localization/data with the app's own.

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";
createRoot(document.getElementById("root")!).render(<App />);
```

```tsx
// src/App.tsx
import { useState } from "react";
import {
  Button, Card, ChatMarkdown, ClippedNavShell, Dialog, EmptyState,
  FieldBlock, FieldStack, FileIcon, Input, List, ListItem, PageScroll,
  PersonIcon, SnackbarHost, Textarea, snackbar, CheckIcon, CloseIcon,
  HomeIcon, IconButton, PanelLeftIcon, NavigationDrawer, NavigationDrawerItem,
  DropdownMenu, DropdownMenuItem, PlusIcon, TopAppBar, Tooltip,
} from "@fynns/ui";

const destinations = [
  { id: "entries", icon: <FileIcon />, label: "Entries" },
  { id: "about", icon: <PersonIcon />, label: "About" },
];

export function App() {
  const [active, setActive] = useState("entries");
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const entries = [{ id: "a", title: "Sample entry", date: "2026-09", body: "# Hello\n\nMarkdown body." }];

  return (
    <>
      <ClippedNavShell
        navMode={navOpen ? "drawer" : "hidden"}
        onNavCrowded={() => setNavOpen(false)}
        topBar={<TopAppBar title="Sample app" leading={<>
          <Tooltip content="Navigation"><IconButton variant="ghost" aria-label="Navigation"
            aria-pressed={navOpen} onClick={() => setNavOpen(!navOpen)}><PanelLeftIcon /></IconButton></Tooltip>
          <Tooltip content="Home"><IconButton variant="ghost" aria-label="Home"
            onClick={() => setActive("entries")}><HomeIcon /></IconButton></Tooltip>
        </>} />}
        nav={navOpen ? <NavigationDrawer variant="standard" ariaLabel="Sections">
          <DropdownMenu trigger="New entry" leadingIcon={<PlusIcon />} variant="ghost" ariaLabel="New entry">
            <DropdownMenuItem icon={<FileIcon />} onClick={() => setOpen(true)}>Blank entry</DropdownMenuItem>
          </DropdownMenu>
          {destinations.map(d => <NavigationDrawerItem key={d.id} icon={d.icon} label={d.label}
            active={active === d.id} onClick={() => setActive(d.id)} />)}
        </NavigationDrawer> : null}
      >
        <PageScroll>
          {active === "entries" ? (
            <Card title="Latest">
              {entries.length ? (
                <List>
                  {entries.map((e) => (
                    <ListItem
                      key={e.id}
                      headline={e.title}
                      trailingSupportingText={e.date}
                      onClick={() => snackbar(`Opened ${e.title}`)}
                    />
                  ))}
                </List>
              ) : (
                <EmptyState title="No entries yet" description="Create the first one." />
              )}
            </Card>
          ) : (
            <Card title="About">
              <ChatMarkdown source={entries[0].body} />
            </Card>
          )}
        </PageScroll>
      </ClippedNavShell>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="New entry"
        size="lg"
        showCloseButton
        feet={
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><CloseIcon />Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => { setOpen(false); snackbar("Saved"); }}><CheckIcon />Save</Button>
          </div>
        }
      >
        <FieldStack>
          <FieldBlock label="Title" htmlFor="title"><Input id="title" /></FieldBlock>
          <FieldBlock label="Body" htmlFor="body"><Textarea id="body" minRows={6} /></FieldBlock>
        </FieldStack>
      </Dialog>
      <SnackbarHost />
    </>
  );
}
```

Pick primitives by job (details: `node scripts/api.mjs <Name>`; catalog:
[`docs/design-system/catalog.md`](../docs/design-system/catalog.md)):

| Job | Primitive |
| --- | --- |
| Long text / readonly code preview | `ExpandableText text={fullText}` / `ExpandableCodeBlock code={fullCode}` (`previewLines`, controlled `expanded` / `onExpandedChange`, localized `expandLabel` / `collapseLabel`). No consumer heights, masks or toggle state. Full Copy; short content has no toggle. Framed code owns its toggle inside the frame; do not add a border between code and toggle. Live `#sandbox-content-expand` / `#sandbox-content-expand-text`. ChatMessage already owns its behavior. |
| Mixed components / rich content | `ExpandableContent preview={completeVisibleUnits}` with additional complete units as `children`; hidden children stay mounted and leave keyboard/accessibility traversal. Place inside the owning Card so preview, detail and toggle share one shell. Never clip Card, fields, tables, or media. Live `#sandbox-content-expand-units`. |
| Record collection (posts, paths, bookmarks) | one `List` of `ListItem` (`headline` / `supportingText` / `trailingSupportingText`), `Pagination` or `useRevealMore` + `RevealMore` for long lists |
| Titled section | `Card` (static) / `Collapsible`; untitled well → `Surface` |
| Markdown body | `ChatMarkdown source={md}` (GFM subset); source code → `CodeBlock language="ts" label="file.ts"` |
| Chat question / thinking / order | `ChatQuestion` (Other/Input built in); `ChatThinking variant="status"` / `"disclosure"` in `ChatThinkingStack`; one chronological list ([recipe](CHAT_SEQUENCE.md)) |
| Forms | `FieldStack` → `FieldBlock` → `Input` / `Textarea` / `Switch` / `Checkbox` / `Radio`; discrete choices → `DropdownMenu` / `ToggleGroup` |
| Modal | `Dialog` (`size="lg"` for forms; `size="viewport"` for a large inset code/config workspace) / `ConfirmDialog` / `FullscreenDialog` |
| Feedback | `snackbar()` + root `<SnackbarHost />`; default theme surface/no icon; `severity: "info" / "success" / "warning" / "error"` uses flat tones matching InlineAlert rendered on app-bg + corresponding icon. No glass, backdrop blur or see-through text. `icon: true` enables an icon on the default; `false` / `null` hides it without changing color. Transient chat/request errors → fixed error snackbar rising from bottom-center; never shift Chat or reserve a footer. Persistent notices/recovery → InlineAlert. Capsule action: `action: { label, onClick, variant: "tonal" }`, `dismissible` toggles X, no X → `duration: "long"` ([recipe](../docs/design-system/catalog.md#snackbar-action-variants)); announcement → `Banner` |
| Application startup / reinitialization | `AppLoadingScreen open={starting} label={accessibleStatus}`: opaque theme background + centered sweeping logo, no visible copy / skeleton / ring / app chrome. Automatically uses configured page / manifest icons, then initials Avatar from app identity, then core mark. Reuse existing JS-configured assets via `logoSrc`; never invent a new project logo. Close on success, error, timeout or cancellation; no artificial delay. [Convention](../docs/design-system/loading.md#application-startup-logo-screen) |
| Content loading inside an initialized app | default = large, thick, full-width text skeleton at upcoming text bounds; six rows without fill, adaptive rows with fill and omitted lines. Bare pane cold-start `BusyRegion busy fill` owns its core inset; never zero padding or fix six rows across a whole pane. ChatThread.empty also uses busy fill. Explicit `LoadingSkeleton variant="block"` only for image / iframe / canvas. No visible loading copy; `BusyScrim` only for explicitly blocking in-app content waits, never startup. Actions disabled + aria-busy. Rings / Button loading / busy message+circular are permanently archived, strongly discouraged. Real `value` = linear progress. [Convention](../docs/design-system/loading.md) |
| Search / filter | `SearchBar` (requires `ariaLabel`); tags → `Chip` / `ChipSet` (never as status) |
| Icons | `*Icon` from the barrel (`node scripts/api.mjs --search Icon$`) |

## 3. Rules (consumer side, short)

1. **API-only:** props / children / labels. Never restyle `.fynns-*`, never
   hardcode hex / px / rem — only `var(--fynns-*)` (`node scripts/api.mjs --tokens <regex>`).
   Missing capability → implement in this core first, then refresh the sibling.
2. **No fakes:** no `@radix-ui/*`, `sonner`, native `<select>` / `<dialog>` /
   `alert()`, hand-rolled Collapsible, purged symbols
   ([`BREAKING_PURGE.md`](BREAKING_PURGE.md)). `Select` / `Autocomplete` are
   soft-deprecated — use `DropdownMenu` / `SearchBar`.
3. **Every state visible:** startup (`AppLoadingScreen`), content loading (`BusyRegion` / `BusyScrim`), empty
   (`EmptyState`), error (default `snackbar`; persistent recovery only:
   `InlineAlert` + Retry).
4. **Chrome:** destinations only in the shell nav; inspector = `EndAside`
   (toggle `open`, keep mounted); page scroll only via `PageScroll`.
5. **Copy:** no `·` / `—` glue in titles or list rows; org → `supportingText`,
   dates → `trailingSupportingText`.
6. **CodeBlock:** titled needs non-empty `label` (else `variant="plain"`);
   always pass a matching `language` (`codeLanguageFromPath`).
7. Full failure-mode index (when a screen looks wrong):
   [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md); pasteable Cursor rule:
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc); shells / inspectors
   performance: [`PERF.md`](PERF.md).

## 4. Install mechanics (reference)

**`scripts/ensure-sibling-ui-core.mjs --target <app> [--install] [--npmrc] [--update] [--json]`**
— clones / fast-forwards `<git-root>/../fynns_ui_design_core` over public HTTPS
(branch `dev`, or `FYNNS_UI_CORE_REF`), optionally `npm install`s the `file:`
link and writes the safe `.npmrc`. `--update` on a **clean** sibling
fast-forwards to `origin/dev` (or `reset --hard FETCH_HEAD` when the remote
semver is newer and FF is impossible); a **dirty** or **ahead** sibling is
soft-skipped with a notice (`FYNNS_UI_STRICT_SIBLING_SYNC=1` hard-fails;
`FYNNS_UI_SKIP_SIBLING_SYNC=1` skips while editing core).

**`scripts/install-as-npm.mjs --target <app>`** — resolves the Vite app package
that owns the UI dependency and the git root (for the Cursor rule / `AGENTS.md`).
From a monorepo root it selects the sole UI app; if multiple UI apps exist,
pass `--target` for one app. It also removes installer-generated hooks left on
a parent package without the UI dependency, even when targeting the app directly.
Existing app-owned gate wrappers
are preserved. Flags: `--sibling` (default: safe `.npmrc` + `file:`),
`--packages` (GitHub Packages, publishers only — needs a token), `--check`,
`--wire-only` / `--skip-install`, `--dev-cache-only` (patch Vite header only),
`--sync-consumer-rule`, `--dry-run`,
`--vite <file>`, `--tsconfig <file>`, `--json`. Wires `fynns-ui:gate`
(`ensure-sibling --update` + `check-ui-exports`) and the soft registry notice
`fynns-ui:check-update` (`FYNNS_UI_SKIP_UPDATE_CHECK=1` silences; cache
`.fynns-ui-update-check.json`). Optional floor: consumer `package.json`
`"fynnsUi": { "minVersion": "0.5.x" }`.

**`scripts/check-ui-exports.mjs --target <app>`** — hard gate: every named
import from `@fynns/ui` must exist on the linked barrel, and Vite dev responses
must use `Cache-Control: no-store` (prevents stale ESM blank pages).

**Monorepo:** prefer `--target` at the app package that owns `predev` (e.g.
`apps/web`); Vite resolves its nested `node_modules` first. A root target is
accepted when the installer can identify exactly one UI app.

**E401 on install:** a leftover Packages `.npmrc` (`npm.pkg.github.com` /
empty `${NODE_AUTH_TOKEN}`). Switch back to sibling `file:` + the safe
`.npmrc`. GitHub Packages always needs a token even for public packages —
that is why day-to-day consume is the sibling. Publishing / optional Packages
bumps: [`docs/package-propagation.md`](../docs/package-propagation.md).

**Unreleased core changes:** when the **task is to change the design system
itself**, edit the sibling checkout (Vite serves its sources) or `npm link`.
There is no `consume:sync` / `consume:watch`. **Consumer** tasks still use
§1 / §1b — do not treat install friction as a reason to edit core.

## 5. Verify

```bash
node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --check --json
npm run build
```

Exit `0` + a green build means: `@fynn7/ui-design-core` declared (`file:`),
safe `.npmrc`, `@fynns/ui` alias + React dedupe, ES2022+, consumer rule in
sync, no leftover submodule tree, and every `@fynns/ui` import exists.
