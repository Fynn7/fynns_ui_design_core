# Consumer treaty — pasteable `@fynns/ui` contract

**Purpose:** give any consumer repo a short, always-on agent rule so it obeys
`@fynns/ui` even when nobody opens `AGENTS.md` / `CONSUME.md`.

**Single paste source:** [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)
(copy that entire file).

Install / design catalog remain elsewhere — this file only explains *why* and
*how* to paste. Do not duplicate the full design language here.

## How to paste (any consumer)

1. Create `.cursor/rules/fynns-ui-consumer.mdc` in the **consumer** root
   (or merge into an existing always-apply rule).
2. Paste the full contents of
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
3. Optional: one line in the consumer `AGENTS.md` / README:

   > UI: follow `.cursor/rules/fynns-ui-consumer.mdc` and
   > `node_modules/@fynn7/ui-design-core/llm/CONSUME.md` (or the core checkout).

The consume installer may also drop this rule when wiring a consumer
(`scripts/install-as-npm.mjs`); if the file already exists it is left
alone unless you re-copy by hand — **re-paste after treaty updates** (e.g. npm
consume / Dialog row recipe / **CodeBlock `label` ≠ `language`** /
**ChatMessage Markdown ownership** / **shell slot ownership** /
**Clipped ≠ text-clip** / **ControlRow toolbar rhythm** /
**NavigationDrawer destination gap ≠ unit-stack**). Local install gate:
`consume --check` — see [`CONSUME.md`](CONSUME.md) Hard rule 5a. There is no
`consume:sync` / `consume:watch`; unreleased local tries use `file:` / `npm link`
/ publish. Formal delivery: GitHub Packages version bump
([`docs/package-propagation.md`](../docs/package-propagation.md)).

## Failure mode this treaty targets: sandbox-only aesthetics

Symptoms: Select / Input look rounder in the aesthetic sandbox than in a
consumer (e.g. `--fynns-radius-md` was 20px in sandbox resting but 8px in
shipped `theme.css`).

**Cause:** non-empty `SANDBOX_DEFAULT_OVERRIDES` in
`examples/sandbox/src/state/baseline.ts` — sandbox lies about the shipped
default. **Fix in core:** promote the nodded value into
`src/theme/tokens.ts` + `npm run gen:theme`, keep
`SANDBOX_DEFAULT_OVERRIDES` empty (`npm run check:wysiwyg`). Core maintainers:
public API deletes are **atomic** (export + source + sandbox demo +
`BREAKING_PURGE` Removed row) — see [`BREAKING_PURGE.md`](BREAKING_PURGE.md).

## Failure mode this treaty targets: squashed drawer

**Prefer** `DestinationAppShell` for greenfield — it syncs Drawer↔Rail for you.
Only hand-compose `ClippedNavShell` when you need a fully custom shell.

Symptoms (often on **first paint** after crowding / narrow init):

- Left column ~**80px** (`--fynns-navrail-width`)
- Labels stay **horizontal** (drawer items / headline)
- Unexpected **scrollbar** on the nav column (drawer body `overflow: auto`)
- Looks like “mini icon mode” but glyphs + text never became a real rail

**Not** a healthy `NavigationRail`. Mechanism:

1. `ClippedNavShell` sets `data-nav` / grid track from `navMode` only.
2. Crowding (`onNavCrowded` / `wouldClippedNavDrawerCrowd`) or app logic sets
   `navMode="rail"`.
3. Consumer keeps rendering `NavigationDrawer` + `NavigationDrawerItem`
   (optional `NavigationDrawerGroup` / `NavigationDrawerHeadline` for sections).
4. Drawer fills the **rail-width** track → cramped horizontal chrome + scroll.

Reference implementation:
[`examples/sandbox/src/shell/SandboxShell.tsx`](../examples/sandbox/src/shell/SandboxShell.tsx)
(`navMode` and `nav` swap together). Declarative default:
sandbox Layout templates `#layouts-demo-shell` (`DestinationAppShell`).
Catalog notes: [`AGENTS.md`](../AGENTS.md) (destination ladder).
Main canvas Preview+Chat: [`AGENTS.md`](../AGENTS.md) **FillColumn** (Layout
templates `#layouts-demo-fill-column`) — do not stack Preview / EmptyState /
Composer as canvas siblings.

Core slot shell does **not** auto-swap Drawer↔Rail. Dev builds warn when
`data-nav="rail"` still hosts `.fynns-nav-drawer`.

## Failure mode this treaty targets: wrong shell slot / “Clipped” misread

**Naming:** `ClippedNavShell` = Material 3 **clipped** chrome (full-bleed
TopAppBar; destination column under it). It does **not** mean “clip sidebar
labels” or crop prose into a vertical strip.

**Slot ownership (hard):**

| Slot | Owns | Must not own |
| --- | --- | --- |
| `nav` | Destinations only (`NavigationDrawer` **or** `NavigationRail`) | Page body, wiki/docs, forms, Chat, Preview |
| `children` (main) | Primary canvas / route outlet | Destination lists |
| `aside` / `EndAside` | Inspector / supporting pane | The whole primary page |
| Modal `Drawer` | Temporary **content** sheet | Destination navigation |

Symptoms agents mis-attribute to “broken clipped shell”:

- Narrow vertical strip of **documentation / wiki / FAIL prose** (not
  destination labels)
- “Agents Hub”-style title visible while the strip is actually **main**
  content or a mis-nested tree under `.fynns-clipped-nav-shell-nav`
- Healthy drawer width (~192–280px+) but the **visible** bug is elsewhere

**Diagnose before CSS** (pasteable checklist lives in
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)):

1. Read `data-nav` on `.fynns-clipped-nav-shell`.
2. Measure the nav track: ~280px → drawer; ~80px → rail (rail + still
   `.fynns-nav-drawer` → squashed drawer above).
3. Find the odd copy in the DOM: under `…-nav` → move it to `children`;
   under `…-main` crushed → fix consumer layout / nesting — **do not**
   widen with local `.fynns-*` overrides.
4. Do not confuse `NavigationDrawer` (destinations) with modal `Drawer`
   (content) or the shell itself (layout only).
5. Destination row gap ≠ form unit gap: put Item / Group / Headline as
   **direct** drawer-body children (`--fynns-navdrawer-section-gap` / **4dp**,
   same as Group leaves). Do **not** wrap the list in `.fynns-unit-stack`
   (16dp) — that makes top-level rows look sparse vs folded sections.
   Destination-density SearchBar / tools as a body sibling share the same
   **4dp** step as Item ↔ Item.

## Failure mode this treaty targets: ad-hoc Surface / inspector row chaos

Symptoms inside a `Surface` / `Card` strip:

- A field **name** and a **timestamp / hint** stacked in a left column while
  `ToggleGroup` / `Switch` / action `Button` float mid/right
- Label top-aligned, controls vertically centered — jagged baseline
- Hint alone on a second row with a wide empty band

**Cause:** hand-rolled flex/grid instead of keep-set rhythm. **Fix in the
consumer:** `ControlStack` + `ControlRow` `label` for the name; put sibling
controls in `.fynns-control-cluster`; put “as of …” / supporting copy on
`ControlBlock` `description` or `FieldHint` — never a bare `<p>` tied into the
label column. Live: sandbox `#rhythm` + `#form-recipe`. Pasteable recipe:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **标签行 / 工具条节奏**.

## Failure mode this treaty targets: fat Surface / Card per catalog row

Symptoms: bookmarks / custom links / path shortcuts each sit in a tall padded
`Surface` or `Card`; edit/delete icons under the text (or a filled danger disk);
huge empty bands; wrong type / gap rhythm.

**Cause:** treating every datum as a section shell instead of a list row.
Nested `IconButton` inside interactive `ListItem` used to be invalid HTML, so
apps invented Surface wrappers — core now keeps interactive `trailing` **outside**
the row button. **Fix in the consumer:** one `List` of `ListItem`s —
`headline` + path `supportingText` + `trailing` = ghost `sm` `IconButton`s
(`.fynns-control-cluster`); open/confirm destructive work in `ConfirmDialog`.
Section chrome stays **one** outer `Card` if needed. Live: sandbox `#list`.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **内容密度**.

## Failure mode this treaty targets: plain CodeBlock despite a filetype label

Symptoms: titled head shows `system-prompt.xml` / `theme.json` / `tokens.ts`, but
the body is **one-color mono** (no keyword / string spans).

**Cause:** consumer set `label` (filename chrome) but omitted `language` (or
passed an unknown id). Core does **not** infer language from the label
extension. **Fix in the consumer:** pass matching `language` / profile; for
fill editors also `autoGrow={false}`. Authority:
[`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) (`label` ≠ `language`) +
[`CONSUME.md`](CONSUME.md) Hard rule 9b. Pasteable checklist:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: literal backticks in Chat bubbles

Symptoms: assistant/user turns show raw `` `token` `` / unrendered `**bold**` /
GFM lists inside `.fynns-chat-message-prose`.

**Cause:** the app passed the LLM Markdown **string** as bare `ChatMessage`
`children`. Prefer **`markdown={md}`** or **`<ChatMarkdown source={md} />`**
(core L2 subset). Raw children stay plain prose. Authority:
[`AGENTS.md`](../AGENTS.md) **Parity note (markdown / GFM)** + pasteable
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **ChatMessage Markdown**.

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) | Install GitHub Packages + hard consume rules |
| [`consume.json`](consume.json) | Machine contract |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Custom highlight + CodeBlock language hard rules |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Short-prompt reminder |
| [`AGENTS.md`](../AGENTS.md) | Tokens + component catalog |
