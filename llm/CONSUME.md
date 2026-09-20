# Consume `@fynns/ui` — install + greenfield skeleton

**Single source of truth for installing this design system into any app** and
for starting a new app with it. Design rules live in
[`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) (index) — do not restate
them here. Machine twin of the install contract: [`consume.json`](consume.json).

Short user prompts (“build X with @fynns/ui”) still mean: read **this file**
first, then look props up with `node scripts/api.mjs <Name>` (never read whole
source files).

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

Default chrome is **`DestinationAppShell`** (labeled destinations drawer +
TopAppBar + optional `EndAside`). Main canvas = **`PageScroll`** → Cards /
List / EmptyState (the inner `.fynns-content-column` already has gap + inset;
never add your own padding or scroll containers). Props below are verified with
`node scripts/api.mjs DestinationAppShell PageScroll Card ListItem Dialog`.

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
  Button, Card, ChatMarkdown, DestinationAppShell, Dialog, EmptyState,
  FieldBlock, FieldStack, FileIcon, Input, List, ListItem, PageScroll,
  PersonIcon, SnackbarHost, Textarea, snackbar,
} from "@fynns/ui";

const destinations = [
  { id: "entries", icon: <FileIcon />, label: "Entries" },
  { id: "about", icon: <PersonIcon />, label: "About" },
];

export function App() {
  const [active, setActive] = useState("entries");
  const [open, setOpen] = useState(false);
  const entries = [{ id: "a", title: "Sample entry", date: "2026-09", body: "# Hello\n\nMarkdown body." }];

  return (
    <>
      <DestinationAppShell
        title="Sample app"
        destinations={destinations}
        activeId={active}
        onActiveIdChange={setActive}
        navAriaLabel="Sections"
        expandNavLabel="Open navigation"
        collapseNavLabel="Close navigation"
        trailing={<Button variant="primary" size="sm" onClick={() => setOpen(true)}>New</Button>}
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
      </DestinationAppShell>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="New entry"
        size="lg"
        showCloseButton
        feet={
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => { setOpen(false); snackbar("Saved"); }}>Save</Button>
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
| Record collection (posts, paths, bookmarks) | one `List` of `ListItem` (`headline` / `supportingText` / `trailingSupportingText`), `Pagination` or `useRevealMore` + `RevealMore` for long lists |
| Titled section | `Card` (static) / `Collapsible`; untitled well → `Surface` |
| Markdown body | `ChatMarkdown source={md}` (GFM subset); source code → `CodeBlock language="ts" label="file.ts"` |
| Forms | `FieldStack` → `FieldBlock` → `Input` / `Textarea` / `Switch` / `Checkbox` / `Radio`; discrete choices → `DropdownMenu` / `ToggleGroup` |
| Modal | `Dialog` (`size="lg"` for forms) / `ConfirmDialog` / `FullscreenDialog` |
| Feedback | `snackbar()` + `<SnackbarHost />`; inline → `InlineAlert`; announcement → `Banner` |
| Loading | pane cold-start `BusyRegion fill`; whole app `BusyScrim`; buttons `loading` + `runLoadingTask` |
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
3. **Every state visible:** loading (`BusyRegion` / `BusyScrim`), empty
   (`EmptyState`), error (`InlineAlert` + Retry, or `snackbar`).
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

**`scripts/install-as-npm.mjs --target <app>`** — resolves the nearest
`package.json` above `--target` (monorepo apps) and the git root (for the Cursor
rule / `AGENTS.md`). Flags: `--sibling` (default: safe `.npmrc` + `file:`),
`--packages` (GitHub Packages, publishers only — needs a token), `--check`,
`--wire-only` / `--skip-install`, `--sync-consumer-rule`, `--dry-run`,
`--vite <file>`, `--tsconfig <file>`, `--json`. Wires `fynns-ui:gate`
(`ensure-sibling --update` + `check-ui-exports`) and the soft registry notice
`fynns-ui:check-update` (`FYNNS_UI_SKIP_UPDATE_CHECK=1` silences; cache
`.fynns-ui-update-check.json`). Optional floor: consumer `package.json`
`"fynnsUi": { "minVersion": "0.5.x" }`.

**`scripts/check-ui-exports.mjs --target <app>`** — hard gate: every named
import from `@fynns/ui` must exist on the linked barrel (prevents blank pages
after a stale sibling).

**Monorepo:** run the scripts against the app package that owns `predev`
(e.g. `apps/web`), not only the git root — Vite resolves the nested
`node_modules` first.

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
