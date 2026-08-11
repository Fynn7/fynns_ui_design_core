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
stays ~40dp (Input / field-shell density — not SearchBar 56dp chrome).

## DOM

```text
form.fynns-chat-composer
  .fynns-chat-composer-shell[data-expanded?]
    [?].fynns-chat-composer-attachments
    .fynns-chat-composer-body
      textarea.fynns-chat-composer-input
      .fynns-chat-composer-toolbar[role="toolbar"]
        [?].fynns-chat-composer-leading   ← wraps `leading` automatically
        .fynns-chat-composer-primary-slot ← Send / Stop / Dictate / `trailing`
```

Public props stay `leading` / `trailing` / `attachments` / `busy` / … — no
rename required for consumers.

## Compact vs expanded (`data-expanded`)

| State | When | Layout |
| --- | --- | --- |
| **Collapsed** (default) | Empty draft, single visual line, no attachments | Body is a horizontal flex row. Toolbar uses `display: contents` so leading / textarea / primary share one line (`order` 1 / 2 / 3). |
| **Expanded** | Newline in value, measured height &gt; one line (+tolerance), or `attachments` present | Body is a column. Textarea full width on top. Toolbar is a real flex row (`justify-content: space-between`) — tools start, Send end. |

Detection runs inside the JS auto-grow (`resize`). When the morph flips
expanded on/off, `resize` **re-runs** after `data-expanded` CSS applies so
height is measured under the expanded `text-line-height` (~22dp), not the
collapsed 32dp control row (avoids a tall empty “fixed” shell). Empty value
forces collapsed (unless attachments force expand). Textarea height =
`min(max(scrollHeight, one-line), max-height)` — content-driven, not a
hardcoded multi-line well. Collapsed **empty**: visible hint is
`.fynns-chat-composer-placeholder` > `.fynns-chat-composer-placeholder-text`
(flex host + nowrap/`text-overflow: ellipsis` on the inner text — ellipsis
does not apply to a flex container itself). Native `<textarea>` placeholder
cannot ellipsize in Chromium (mid-glyph hard clip into Send); HTML
`placeholder` stays empty and `aria-label` carries the accessible name.

## Geometry tokens

Reuse `--fynns-chat-composer-*` (`CHAT_TOKENS`):

- **Collapsed** shell pad: `composer-pad-inline` (capsule ~4dp),
  `composer-pad-block` (3dp; + 32dp control row + hairline → ~40dp = Input)
- **Expanded** shell pad: `composer-expanded-pad-inline` /
  `composer-expanded-pad-block` (= `strip-pad-inline − composer-glyph-inset`,
  ~12dp). Textarea inline pad = `composer-glyph-inset` (~8dp) so copy
  start/end share the toolbar + / Send **glyph** edges; text still sits at
  strip-pad (~20dp) from the shell edge.
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
  (`strip-pad-inline − capsule-chrome`).
- Collapsed, with primary: textarea end pad 0 (button owns the edge).
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
