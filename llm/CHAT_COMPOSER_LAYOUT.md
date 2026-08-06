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
stays ~52–54px (ChatGPT capsule), not a permanently stacked text+footer tower.

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

- Shell pad: `composer-pad-inline` (= capsule chrome ~4dp), `composer-pad-block`
- Gap: `composer-gap` (4px)
- Controls: `composer-control-size` (32dp; text line stays 36dp)
- Line / max: `composer-line-height` / `composer-max-height` (13rem)
- Radius: `--fynns-radius-3xl` (not Cursor’s pill→12px compact switch)

**Pad rules**

- Collapsed, no leading: textarea start = strip breath
  (`strip-pad-inline − capsule-chrome`).
- Collapsed, with primary: textarea end pad 0 (button owns the edge).
- Expanded: textarea is full-bleed above the toolbar; start uses strip breath;
  toolbar controls stay capsule-flush to the shell edges.

## Not this primitive

- SearchBar / field-shell single-line capsules (stay model A).
- Suggestion chips **below** the composer outside the shell (thread-owned).
- ProseMirror / TipTap — plain controlled `<textarea>` only (AGENTS composer
  input model).
- Consumer restyle wrappers — missing behavior lands in this core first
  ([`CONSUME.md`](CONSUME.md)).
