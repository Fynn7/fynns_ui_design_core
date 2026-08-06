# ChatGPT chat ARIA (parity target)

Authoritative reference for ARIA / screen-reader parity of `Chat` /
`ChatThread` / `ChatComposer` / `ChatMessage`. Visual / layout dumps stay under
`scripts/_focus-verify/`; this file is the **a11y contract**.

Sources (2026-08):

| Source | What it proved |
| --- | --- |
| [`scripts/_focus-verify/chatgpt-home.html`](../scripts/_focus-verify/chatgpt-home.html) | Live chatgpt.com empty-home DOM: skip link, `#main`, composer labels, dual notify live regions |
| Community selectors (`data-testid="send-button"` / `stop-button`, `.result-streaming[aria-busy]`) | Busy/send/stop wiring on conversation pages (login-gated here) |
| [ISU AT tips for ChatGPT](https://help.illinoisstate.edu/accessibility/website-and-digital/tips-for-using-assistive-technology-with-chatgpt) | Web client announces “responding” + “complete”; per-turn **headings** for H navigation |
| [WAI ARIA23 `role="log"`](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA23) | Normative-adjacent technique for chat history |
| Streaming a11y writeups ([tianpan.co](https://tianpan.co/blog/2026-04-17-ai-accessibility-streaming-screen-readers), [frontendpatterns message-thread](https://frontendpatterns.dev/message-thread)) | Do **not** pipe tokens into an active live region |

Live chatgpt.com conversation pages were **login-gated** during this pass.
Empty-home HTML is primary DOM evidence; conversation-turn details below mix
that dump + community selectors + AT-user reports. Re-check live when logged
in if product DOM drifts.

---

## Verdict (one screen)

ChatGPT does **not** treat the transcript as a classic `role="log"` live
region. It uses:

1. Landmarks + skip (`Skip to content` → `<main id="main" tabindex="-1">`)
2. Two **sr-only notify** regions (assertive `alert` + polite `status`) that
   announce discrete lifecycle strings
3. Per-turn headings + `data-message-author-role` for browse navigation
4. Composer autofocus; after send, **keep focus in the composer** and announce
   status via notify regions — do **not** move focus onto the streaming bubble

`@fynns/ui` already has `role="region"` / `role="log"` / bubble `aria-live`
while streaming. For ChatGPT parity, prefer **lifecycle notify regions** over
token-level live updates on the bubble.

---

## 1. Landmarks & roles (`log` / `region` / `main`)

### ChatGPT (empty home dump)

```html
<a data-skip-to-content="" href="#main">Skip to content</a>
…
<main id="main" tabindex="-1" class="…">
  <div role="presentation" class="contents">
    <div id="thread" class="group/thread …">
      <div class="composer-parent …">
        <form data-type="unified-composer" autocomplete="off" class="group/composer …">
          … #prompt-textarea …
        </form>
      </div>
    </div>
  </div>
</main>
```

| Node | Role / attrs | Notes |
| --- | --- | --- |
| Skip link | link → `#main` | Label **"Skip to content"**; clipped until focus (`not-has-focus-visible:sr-only`) |
| Main | native `<main>` + `id="main"` + `tabindex="-1"` | Skip target; programmatic focusable |
| Thread | `#thread` — **no** `role="log"` / `role="region"` in dump | Presentation wrapper |
| Chat shell | (implicit in main) | Not exposed as a named `region` on home |
| Form | `data-type="unified-composer"` | Real `<form>`, `autocomplete="off"` |

**No `role="log"`** appears in the home dump. ChatGPT relies on notify regions
+ headings rather than an implicit-live transcript.

### W3C / kit baseline

ARIA23 still recommends `role="log"` (implicit `aria-live="polite"`,
`aria-atomic="false"`) for sequential chat history. That remains a valid
**WCAG-oriented** choice even when ChatGPT itself omits it.

### fynns today → parity

| Piece | fynns | Parity target |
| --- | --- | --- |
| Outer shell | `Chat` → `role="region"` + `aria-label` (default `"Chat"`) | Keep named region **or** nest under app `<main id="…">`; either is fine |
| Thread | `ChatThread` → `role="log"` + `aria-label` + `aria-relevant="additions"` | **Keep `role="log"`** for WCAG; do **not** also live-announce every token |
| Skip | `SkipLink` primitive (`href="#main"`, label `"Skip to content"`) | App wires `SkipLink` → chat/main id; Chat does not ship its own skip |

---

## 2. Live regions for streaming (critical)

### ChatGPT pattern — dedicated notify hosts

From `chatgpt-home.html` (always present, empty `<span>` until JS writes):

```html
<div
  id="aria-notify-live-region-assertive"
  class="sr-only"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  aria-relevant="additions text"
><span></span></div>

<div
  id="aria-notify-live-region-polite"
  class="sr-only"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  aria-relevant="additions text"
><span></span></div>
```

Observed product behavior (ISU AT tips + SR walkthroughs):

- After send → announce that ChatGPT **is responding**
- When the turn finishes → announce **response complete** (and often read the
  finished reply once)
- Users navigate turns with **heading** shortcuts, not by chasing focus into
  the bubble

Community DOM for in-flight turns:

- Streaming marker: `.result-streaming` with **`aria-busy="true"`**
- Stable author hook: `[data-message-author-role="assistant"|"user"]`

### What **not** to do

Token-append into an active `aria-live` container causes either:

- re-read storms (`aria-atomic="true"`), or
- dropped / fragmented speech (`aria-atomic="false"` under high-frequency updates)

ChatGPT avoids that by **separating** visual streaming from SR notifications.

### fynns today → parity

| Piece | fynns | Parity target |
| --- | --- | --- |
| Streaming article | `aria-busy` + `aria-label={streamingLabel}` | Keep `aria-busy`; label = short status (“Generating response”) |
| Bubble | `aria-live="polite"` + `aria-relevant="additions text"` **while streaming** | **Remove / off while streaming**; announce start/complete via notify |
| Thinking disclosure (`ChatThinking`) | `aria-busy` while `streaming`; trigger `aria-expanded` / `aria-controls`; closed body `inert` | **Never** pipe thought tokens into a live region; lifecycle polite notify stays app / Chat contract |
| Notify hosts | none | Add dual sr-only `alert` + `status` (or one polite status + optional assertive for errors) owned by `Chat` or the app |
| Announcement text | (bubble content) | Discrete strings only, e.g. “Generating response” → “Response complete” (localize in app) |
| System rows | `role="status"` | Keep |

Recommended lifecycle (consumer or future Chat helper):

1. On send → set assistant `streaming` + write polite status “Generating…”
2. Tokens append to `children` with **live off**
3. On finish / stop / error → clear busy; polite (or assertive for error)
   “Response complete” / “Generation stopped” / error copy
4. Optional: one-shot polite dump of the **finished** reply text (ChatGPT-like),
   never mid-token

---

## 3. Focus after send

| Event | ChatGPT-oriented behavior | fynns guidance |
| --- | --- | --- |
| Page load / empty home | Composer `#prompt-textarea` has `autofocus` | App may autofocus composer; not required in core |
| Send (Enter / Send button) | Draft clears; **focus remains in composer**; Stop replaces Send | After `onSubmit`, keep focus on the textarea (consumer: don’t `blur()`; core should not move focus to the new message) |
| Streaming | Focus stays in composer so user can Esc / Stop | `Esc` → `onStop` while `busy` (already) |
| Response complete | Announce via live/notify; **do not** force-focus the assistant turn | Same — let SR users use headings / browse mode |
| Skip link activate | Focus moves to `#main` (`tabindex="-1"`) | Target must be focusable |

Anti-pattern (generic chatbots): focus jumps to page top or into the new
assistant node after every send — breaks long threads for SR users.

---

## 4. Skip links

ChatGPT:

```html
<a data-skip-to-content="" href="#main">Skip to content</a>
<main id="main" tabindex="-1">…</main>
```

fynns:

- Use existing **`SkipLink`** (`label` default `"Skip to content"`,
  `href` default `"#main"`).
- Destination: app main / chat host with matching `id` and `tabindex={-1}`.
- Do **not** bake a second skip control into `Chat` — one page-level skip is
  enough (sandbox Globals already uses `SkipLink`).

---

## 5. Composer / Send / Stop ARIA

### ChatGPT empty-home labels (dump)

| Control | Accessible name | Notes |
| --- | --- | --- |
| Prompt | **`aria-label="Chat with ChatGPT"`** | `#prompt-textarea`; placeholder `"Ask anything"`; `autofocus` |
| Attach / plus | **`aria-label="Add files and more"`** | `data-testid="composer-plus-btn"` |
| Dictate | **`aria-label="Start dictation"`** | Idle empty |
| Voice | **`aria-label="Start Voice"`** | `data-testid="composer-speech-button"` |
| Form | — | `data-type="unified-composer"` |

### Conversation page (community; re-verify logged-in)

| Control | Selectors / names |
| --- | --- |
| Send | `button[data-testid="send-button"]` — names like **Send** / **Send prompt** / locale variants |
| Stop | `button[data-testid="stop-button"]` — stop / stop generating |
| Streaming busy | `.result-streaming[aria-busy="true"]` |

Four-state primary (assistant-ui ChatGPT clone = visual mirror):

`Cancel/Stop (running)` → `Stop dictation` → `Send` → `Dictate` (+ optional voice)

**fynns idle without `onDictate`:** always keep **Send** in the primary slot;
empty draft → `disabled` (not hidden). With `onDictate`, empty idle still swaps
to Dictate (ChatGPT empty-home).

### fynns defaults → parity

| Prop / control | fynns default | ChatGPT-aligned string |
| --- | --- | --- |
| `ChatComposer` `ariaLabel` | **required** (app) | Prefer product phrasing, e.g. “Chat with …” / “Message” |
| `sendLabel` | `"Send"` | OK; optional `"Send message"` / `"Send prompt"` |
| `stopLabel` | `"Stop generating"` | OK |
| `dictateLabel` / `stopDictateLabel` | `"Dictate"` / `"Stop dictation"` | ChatGPT idle: **"Start dictation"** |
| Leading attach | `"Attach"` | ChatGPT: **"Add files and more"** |
| Form | `aria-busy` while `busy` | Keep |
| Primary | `IconButton` + `Tooltip` + `aria-label` | Keep (icon-only needs name) |

Keyboard (already matched): Enter send, Shift+Enter newline, Esc stop while
busy, IME composition must not send — see AGENTS.md **Composer keys**.

---

## 6. Message structure (browse mode)

| Concern | ChatGPT | fynns parity |
| --- | --- | --- |
| Author hook | `data-message-author-role` | Already on `ChatMessage` |
| Turn chrome | Often `section` / turn testids; actions `role="group"` / toolbar **“Message actions”** | Pass actions slot; prefer `role="toolbar"` + `aria-label` on the cluster |
| Headings | Each user / assistant turn under its **own heading** (ISU) | Gap — consider optional `heading` / `aria-labelledby` or visually-hidden `hN` per turn |
| System | muted notice | `role="status"` — keep |

---

## 7. Gap checklist (implement next)

Priority for code changes (this doc is the contract; implementation is separate):

1. **Streaming live:** stop putting `aria-live` on the bubble while tokens append;
   add Chat-owned (or documented app-owned) polite/assertive **notify** regions
   for start / complete / stopped / error.
2. **Focus:** document + optionally ensure composer retains focus after submit
   (no focus steal to the new `ChatMessage`).
3. **Skip:** document app composition (`SkipLink` → focusable main/chat id) —
   already available.
4. **Labels:** optional default string tweaks (`Start dictation`, attach copy)
   when touching composer chrome.
5. **Headings:** optional per-turn heading API for H-navigation parity.
6. **Keep** `role="log"` on `ChatThread` unless product explicitly wants
   ChatGPT’s “no log” DOM — log + notify is stricter than ChatGPT and still
   compatible if token live is off.

---

## Related

- Multiline composer layout (compact ↔ expanded): [`llm/CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md)
- User-edit UX: [`llm/CHAT_USER_EDIT_UX.md`](CHAT_USER_EDIT_UX.md)
- Catalog / composer keys / reduced-motion: [`AGENTS.md`](../AGENTS.md) Chat keep-set
- Action anatomy HTML: `scripts/_focus-verify/chatgpt-{user-actions,assistant-anatomy}.html`
