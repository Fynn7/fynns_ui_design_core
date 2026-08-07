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

Detection runs inside the existing JS auto-grow (`resize`): empty value forces
collapsed (unless attachments force expand).

## Geometry tokens

Reuse `--fynns-chat-composer-*` (`CHAT_TOKENS`):

- **Collapsed** shell pad: `composer-pad-inline` (capsule ~4dp),
  `composer-pad-block` (3dp; + 32dp control row + hairline → ~40dp = Input)
- **Expanded** shell pad: `composer-expanded-pad-inline` =
  `bubble-pad-inline − glyph-inset` (8dp when bubble pad is 16dp) /
  `composer-expanded-pad-block` (**12dp**)
- **Expanded text optical inset:** `composer-glyph-inset` =
  `(composer-control-size − --fynns-size-icon) / 2` (8dp). Applied as
  textarea `padding-inline` so copy aligns with the **glyph**, not the 32dp
  hit target. **Shell pad + glyph-inset = `--fynns-chatmessage-bubble-pad-inline`**
  (same text↔border breath as the user bubble).
- Gap: `composer-gap` (4px collapsed); `composer-expanded-gap` (8dp
  text↔toolbar)
- Controls: `composer-control-size` (32dp)
- Line: `composer-line-height` (32dp **control-row** / collapsed
  `line-height`); `composer-text-line-height` (22dp **typography** when
  `data-expanded`); max `composer-max-height` (13rem)
- Radius: `--fynns-radius-3xl` (not Cursor’s pill→12px compact switch; not
  Input’s `radius-md`)

**Pad rules**

- Collapsed, no leading: textarea start = strip breath
  (`strip-pad-inline − capsule-chrome`).
- Collapsed, with primary: textarea end pad 0 (button owns the edge).
- Expanded: shell `expanded-pad-*` insets the toolbar; textarea adds
  `glyph-inset` so text ↔ icon artwork share one vertical edge and the
  combined inset matches user-bubble `bubble-pad-inline`.

## Column alignment (thread ↔ composer)

`--fynns-chat-thread-pad-inline` aliases `--fynns-layout-dialog-inset`
(24dp reading-column breath). `--fynns-chat-composer-inset-inline`
aliases **the thread token** (not a second layout key). Thread applies
that pad on `.fynns-chat-thread-inner` (inside the `chat-max-width` box);
composer applies it on the form — same box model — so the **user bubble
end edge** and **composer shell end edge** share one vertical line, with
equal L/R margins on the capped column.

Do not conflate **column** outer inset (`dialog-inset`) with **shell**
expanded pad / **glyph** optical inset (together = bubble text breath), or
with Banner `strip-pad-inline` (collapsed text-only start only).

## Not this primitive

- SearchBar / field-shell single-line capsules (stay model A).
- Suggestion chips **below** the composer outside the shell (thread-owned).
- ProseMirror / TipTap — plain controlled `<textarea>` only (AGENTS composer
  input model).
- Consumer restyle wrappers — missing behavior lands in this core first
  ([`CONSUME.md`](CONSUME.md)).
