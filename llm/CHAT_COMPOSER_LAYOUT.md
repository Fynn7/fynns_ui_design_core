# ChatComposer multiline layout

Authoritative layout contract for docked `ChatComposer`. Consumers must use
this primitive — do **not** invent a parallel multi-line shell.

ARIA / focus / keys: [`CHAT_ARIA_PARITY.md`](CHAT_ARIA_PARITY.md). Catalog /
tokens: [`AGENTS.md`](../AGENTS.md) Chat keep-set.

## Layout models (competitive)

| Model | Meaning | Examples |
| --- | --- | --- |
| A | Single flex row, `align-items: center` (icons float mid when tall) | Legacy fynns, Discord desktop |
| B | Single flex row, `align-items: end` (icons sit on text baseline) | Telegram Web, many ChatGPT clones |
| **C** | **Full-width editor + bottom action toolbar** | **Cursor expanded**, Continue, VS Code Copilot Chat, Open WebUI, LibreChat, Slack / Linear / Raycast |

**fynns uses model C** with a **compact morph** so the empty / single-line shell
stays ~44dp (32dp control + 6dp pad — Cursor-dense circle, one step below
IconButton md 40dp; not SearchBar 56dp chrome).

## DOM

```text
form.fynns-chat-composer
  [?].fynns-chat-composer-todos          ← `todoList` progress card
  .fynns-chat-composer-shell[data-expanded?]
    [?].fynns-chat-composer-attachments
    .fynns-chat-composer-body
      .fynns-chat-composer-field
        [?].fynns-chat-composer-placeholder > .fynns-chat-composer-placeholder-text
        textarea.fynns-chat-composer-input
      .fynns-chat-composer-toolbar[role="toolbar"]
        [?].fynns-chat-composer-leading   ← wraps `leading` automatically
        .fynns-chat-composer-primary-slot ← `endActions` + Send / Stop / Dictate / `trailing`
```

Public props stay `leading` / `trailing` / `attachments` / `busy` / … — no
rename required for consumers.

**Task progress variant (live `#sandbox-chat-composer-todos`):** pass
`todoList={{ items, progressLabel, ... }}` to show a read-only numbered
progress card above the input. Each item has a stable `id`, `label`, and
optional `status: "pending" | "active" | "completed"`. The caller owns
statuses and localization. The card header toggles its list open/closed;
`expanded` / `onExpandedChange` may control that state externally. **Omit
`todoList` to restore the ordinary composer**, without replacing the input
or losing its draft. The variant keeps the editor and bottom toolbar in the
expanded layout even while the list is collapsed. A divider separates the
progress header from the first item; opening and closing animate the card
height and ink (respecting reduced motion). Do not recreate its card
or interpose a separate scroll container in the consumer.

**Labeled Menus (≥ 0.5.288):** pass **string**
`DropdownMenu` `trigger` values (core wraps `OverflowTip`). Core caps each
labeled menu at `--fynns-chat-composer-leading-menu-max` so long ids
ellipsize inside the shell — never mid-glyph hard-clip, and never invent
consumer `max-width` / manual `slice` / private chip-label CSS.

**Placement recipe (live `#sandbox-chat-composer-leading-menus`):**
- **Start / left** — `leading`: + IconButton + volume (or tools) Menu,
  `align="start"`.
- **End / right (before Send)** — `endActions`: model Menu, `align="end"`.
  Do **not** park the model picker in `leading` (stays start-clustered) and
  do **not** use `trailing` for it (`trailing` **replaces** Send).

**Mode toggles (≥ 0.5.289, live `#sandbox-chat-composer-thinking-toggle` /
`#sandbox-chat-composer-thinking-toggle-narrow`):** ChatGPT-style Thinking /
Vision pills use keep-set `ChatComposerToggle` in `endActions` — order
**Model Menu → Thinking → Vision → Send/Dictate**. Wrap each toggle in
`Tooltip` for tip copy (required when the pill goes icon-only). Do **not**
bury mode switches in the leading `+` Menu, or invent a consumer chip CSS
clone. Labeled pills use `--fynns-line-height-snug` (≥ **0.5.294**) so Latin
descenders (Thinking **g**) are never clipped by `overflow: hidden`. On ≤
**36rem** composer containers (≥ **0.5.293**; was 26rem in 0.5.291),
core hides the pill label (icon-only; Tooltip + `aria-label` keep the name)
so mid-width landing shells never ellipsize to “T.” / one-glyph crumbs —
do **not** invent consumer icon-only CSS. Sandbox teaches **wide** (labeled,
host &gt; 36rem) and **narrow** (icon-only) hosts side by side.

**Model Menu sections (≥ 0.5.290, live `#sandbox-chat-composer-model-sections`
/ `#sandbox-chat-composer-model-empty`):** partition the model picker with
`DropdownMenuGroup` + `DropdownMenuSeparator` into **Local** / **Cloud** /
**CLI** (Cursor / Codex / Claude Code, …). **Only render a section when that
source is configured** (local endpoint reachable / API key present / CLI
auth file or login). Omit empty sections entirely. If **no** section has
models, show one disabled “No models available” row (then optional
Connection refresh foot). Do **not** dump every provider into one flat list.

**Narrow shells (≥ 0.5.288 / floor ≥ 0.5.291 / hug ≥ 0.5.300):** labeled
menus shrink under `--fynns-chat-composer-leading-menu-max` (tighter
`*-narrow` caps ≤ **26rem**). Leading **and** endActions model Menus are
content-first (`flex: 0 1 auto` + `width: fit-content`) with soft floor
`min(--fynns-chat-composer-leading-menu-min, max-content)` so short ids hug
the chevron (no empty mid-capsule pad) while long ids still refuse to crush
to chevron-only beside toggles / Send. The draft keeps
`--fynns-chat-composer-field-min`.
Live `#sandbox-chat-composer-leading-menus-narrow` /
`#sandbox-chat-composer-thinking-toggle` (wide &gt; 36rem, labeled) /
`#sandbox-chat-composer-thinking-toggle-narrow` (≤ 36rem icon-only).

## Compact vs expanded (`data-expanded`)

| State | When | Layout |
| --- | --- | --- |
| **Collapsed** (default) | Empty draft and no attachments or todo list (clearing the value collapses) | Body is a horizontal flex row. Toolbar uses `display: contents` so leading / field / primary share one line (`order` 1 / 2 / 3). |
| **Expanded** | Measured height &gt; one line (+tolerance), `attachments` or `todoList` present | Body is a column. Textarea full width on top. Toolbar is a real flex row (`justify-content: space-between`) — tools start, Send end. |

Detection runs inside the JS auto-grow (`resize`). Expand freely when content
needs it. **Do not auto-collapse a non-empty draft** when height would fit one
line again — EndAside / narrow hosts morph width when `data-expanded` flips
(toolbar row ↔ bottom bar), so scrollHeight can oscillate and hit
`Maximum update depth exceeded` (blank `#root`). Collapse only when the value
is cleared (attachments may still force expand). When expand flips on,
`resize` **re-runs** after `data-expanded` CSS applies so height is measured
under the expanded `text-line-height` (~22dp), not the collapsed 32dp control
row. Textarea height = `min(max(scrollHeight, one-line), max-height)` —
content-driven, not a hardcoded multi-line well. Collapsed **empty**: visible
hint is `.fynns-chat-composer-placeholder` >
`.fynns-chat-composer-placeholder-text` (flex host + nowrap/`text-overflow:
ellipsis` on the inner text — ellipsis does not apply to a flex container
itself). Native `<textarea>` placeholder cannot ellipsize in Chromium
(mid-glyph hard clip into Send); HTML `placeholder` stays empty and
`aria-label` carries the accessible name.

## Geometry tokens

Reuse `--fynns-chat-composer-*` (`CHAT_TOKENS`):

- **Collapsed** shell pad: `composer-pad-inline` / `composer-pad-block`
  (6dp equal inset around the control circle; + 32dp control row + hairline
  → ~44dp shell).
- **Expanded** shell pad: `composer-expanded-pad-inline` /
  `composer-expanded-pad-block` (= `strip-pad-inline − composer-glyph-inset`,
  ~12dp with 32dp controls). Textarea inline pad = `composer-glyph-inset`
  (~8dp) so copy start/end share the toolbar + / Send **glyph** edges; text
  still sits at strip-pad (~20dp) from the shell edge.
- Gap: `composer-gap` (4px collapsed); `composer-expanded-gap` (8dp
  text↔toolbar)
- Controls: `composer-control-size` (32dp)
- Line: `composer-line-height` (32dp **control-row** / collapsed
  `line-height`); `composer-text-line-height` (22dp **typography** when
  `data-expanded`); max `composer-max-height` (13rem) — scroll inside the
  field after that (`overflow-y` stays `hidden` until the auto-grow effect
  sets `data-scrollable` at the cap; collapsed / mid-grow never paints a
  thumb)
- Radius: `--fynns-radius-3xl` (not Cursor’s pill→12px compact switch; not
  Input’s `radius-md`)

**Pad rules**

- Collapsed, no leading: textarea start = strip breath
  (`strip-pad-inline − composer-pad-inline`).
- Collapsed, with primary: textarea end pad 0 (button owns the edge).
- **Collapsed optical gaps (hard — ≥ 0.4.140):** measure leading **glyph** →
  field (not IconButton hit box → field). Body `composer-gap` alone makes
  field → filled Send/Stop **disk** match the hit-box gap and read too tight.
  Core adds `composer-glyph-inset` as `padding-inline-start` on
  `.fynns-chat-composer-primary-slot` so **field → primary disk == leading
  glyph → field**. Do not “fix” in the consumer with private margin on
  Send. Expanded toolbar stays `space-between` (no extra primary pad).
- Expanded: shell `expanded-pad-*` + textarea `glyph-inset` (optical glyphs).

## Column alignment (thread ↔ composer)

`--fynns-chat-thread-pad-inline` aliases `--fynns-layout-dialog-inset`
(24dp reading-column breath). `--fynns-chat-composer-inset-inline`
aliases **the thread token** (not a second layout key). Thread applies
that pad on `.fynns-chat-thread-inner` (inside the `chat-max-width` box);
composer applies it on the form — same box model — so the **user bubble
end edge** and **composer shell end edge** share one vertical line, with
equal L/R margins on the capped column.

Do not conflate **column** outer inset (`dialog-inset`) with **shell**
expanded pad (strip − glyph-inset), or with Banner-only / collapsed
text-start use of `strip-pad-inline`.

## Not this primitive

- SearchBar / field-shell single-line capsules (stay model A).
- Suggestion chips **below** the composer outside the shell (thread-owned).
- ProseMirror / TipTap — plain controlled `<textarea>` only (AGENTS composer
  input model).
- Consumer restyle wrappers — missing behavior lands in this core first
  ([`CONSUME.md`](CONSUME.md)).
