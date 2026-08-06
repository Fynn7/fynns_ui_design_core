# ChatGPT user-message edit UX (parity target)

Authoritative reference for implementing ChatGPT-parity **edit** on
`Chat` / `ChatMessage`. Visual anatomy for Copy/Edit chrome:
[`scripts/_focus-verify/chatgpt-user-actions.html`](../scripts/_focus-verify/chatgpt-user-actions.html).
Edit-surface mock:
[`scripts/_focus-verify/chatgpt-user-edit.html`](../scripts/_focus-verify/chatgpt-user-edit.html).

Sources (2026-08): [assistant-ui ChatGPT clone](https://github.com/assistant-ui/assistant-ui/blob/main/apps/docs/components/examples/chatgpt.tsx)
(mirrors chatgpt.com), [Editing guide](https://www.assistant-ui.com/docs/guides/editing),
[BranchPicker](https://www.assistant-ui.com/docs/primitives/branch-picker),
community reports of live chatgpt.com (Enter-while-editing; `< N/M >` branch UI).
Live chatgpt.com was login-gated during research — treat the clone + guides as
the implementable contract; call out live deltas below.

---

## Verdict (one screen)

**Inline replace the user turn** with a full-host edit composer (Cancel + Send).
Do **not** move the draft into the docked bottom `ChatComposer`. On Send, **fork**
the thread at that user message and show a **`< N/M >` branch picker**; Cancel
restores the bubble with no branch.

---

## 1. Entry — pencil / Edit

| Rule | ChatGPT / clone |
| --- | --- |
| Affordance | Pencil glyph; tooltip + `aria-label` **"Edit"** (never HTML `title`) |
| Placement | Sibling **below** the user bubble, **end-aligned** (LTR right) — not overlaid on the bubble |
| Order | **Copy → Edit** (32×32 tiles, ~20px icons, tooltip `side="top"`) |
| Visibility | Pointer: hover / focus-within row only; `(hover: none)`: always; hide while thread is running (`hideWhenRunning`) |
| Scope | **User messages only** — assistant has Regenerate, not Edit |
| Concurrent edits | Only **one** edit composer active at a time |

Anti-pattern: absolute icons inside the bubble corner (see user-actions HTML).

---

## 2. Inline edit vs docked composer

### What happens on Edit

1. The **user message row** switches from bubble + actions → **EditComposer**.
2. The **docked bottom composer stays** in place (still visible for new turns).
   Edit text does **not** replace / migrate into the bottom bar.
3. Render gate (clone):

```ts
if (message.composer.isEditing) return <EditComposer />;
if (message.role === "user") return <UserMessage />;
return <AssistantMessage />;
```

### EditComposer chrome (≠ bubble, ≠ bottom composer)

| Aspect | Edit surface | User bubble | Bottom composer |
| --- | --- | --- | --- |
| Width | **100%** of chat host (`max-w-3xl` / 48rem) | **70%** max | **100%** of host |
| Shape | `rounded-3xl` muted well | High-contrast pill `~22px` | Border / inset edge, `~28px` |
| Fill (clone) | Light `#e9e9e9`/50; dark `#323232` | Light `#0d0d0d`; dark `#ececec` | Light white; dark `#212121` |
| Chrome | Textarea + **Cancel / Send** text pills | Copy / Edit icons | Attach / input / send↑ / dictate |
| Alignment | Full column (not end-shrunk to bubble) | `items-end` | Sticky footer |

**Parity rule for `@fynns/ui`:** edit UI = host-width muted surface with Cancel/Send;
keep using `--fynns-*` (e.g. `radius-3xl`, control / surface tokens) — do not
hardcode ChatGPT hex. Do not reuse the 70% bubble as the edit field.

### Focus

- Entering edit: focus the textarea; seed with current message text; caret at end
  (clone / usual ChatGPT behavior).
- Esc: cancel edit (see below).

---

## 3. Cancel / Send

| Control | Role | Visual (clone) |
| --- | --- | --- |
| **Cancel** | Exit edit; restore original bubble; **no** new branch; discard draft | Secondary pill, text **"Cancel"** |
| **Send** | Commit edit; **re-submit from that point**; create / append a **branch**; regenerate assistant continuation | Primary filled pill, text **"Send"** (not save / update) |

Footer: end-aligned row, Cancel then Send (`gap` ~8px). Not icon-only.

### Keyboard (parity)

| Context | Enter | Shift+Enter | Esc | Ctrl/Cmd+Enter |
| --- | --- | --- | --- | --- |
| Docked compose (AGENTS) | Send | Newline | Stop while busy | (optional) |
| **Edit composer (live ChatGPT)** | **Newline** | Newline | Cancel edit | Submit (or click Send) |

Live chatgpt.com treats edit Enter as newline (extensions exist to make Enter
send). Prefer that for parity so long prompt edits are safe. Explicit **Send**
click always submits. Empty draft → Send disabled / no-op.

### Streaming

If Edit is allowed while the assistant is still generating, the in-progress run
is cancelled and a new branch starts from the edited user message. Safer UX
(and clone default): **hide Edit while running** (`hideWhenRunning`).

---

## 4. Branching after edit

### Mental model

Editing is **not** in-place overwrite of a linear list. It **re-submits from a
past user node** and creates a **new branch**. Messages after the edited node
are dropped from the *active path*; the prior path remains reachable via the
branch picker. Each branch has its own continuation.

Same picker is also used when the assistant **regenerates** (fork at assistant
node). User-edit forks at the **user** message.

### Branch picker UI

| Rule | Spec |
| --- | --- |
| Control | `<` · `N/M` · `>` (chevrons + current / count) |
| Visibility | `hideWhenSingleBranch` — hidden until ≥2 branches |
| Placement (user) | Same footer row as Copy/Edit (after the action bar) |
| Placement (assistant) | Beside assistant action bar |
| Tooltips | Previous / Next |
| Effect | Flip active branch → swap that node **and** its downstream messages |

No tree canvas, no sidebar list of forks inside the thread — pagination only.

### Related but out of scope for message-edit

ChatGPT also ships **"Branch in new chat"** (⋯ menu → separate sidebar
conversation). That is a **new chat** fork, not the `< N/M >` in-thread
versioning. Do not conflate the two when implementing `Chat` edit.

---

## 5. Sequence (happy path)

```mermaid
sequenceDiagram
  participant U as User
  participant Row as User message row
  participant Dock as Docked composer
  participant Tree as Thread branches

  U->>Row: Hover → Edit (pencil)
  Row->>Row: Swap bubble → EditComposer (host width)
  Note over Dock: Stays docked; not filled with edit text
  alt Cancel / Esc
    U->>Row: Cancel
    Row->>Row: Restore bubble; no branch
  else Send
    U->>Row: Send
    Row->>Tree: Fork at this user node; regenerate below
    Tree->>Row: Show bubble + BranchPicker N/M
  end
```

---

## 6. `@fynns/ui` implementation checklist

Primitives today expose `actions` on `ChatMessage` and a docked `ChatComposer`
only — **no** built-in edit/branch runtime. When adding parity:

1. **App or shell** owns branch tree + edit state; keep markdown/LLM out of core
   (same as current ChatMessage contract).
2. Prefer a dedicated **inline edit slot** (or `editing` prop that swaps the
   bubble for an edit surface) — never pipe edit text into `ChatComposer`.
3. Edit surface: host width, Cancel + Send, Esc cancels, Enter = newline in edit.
4. After Send: caller updates messages + shows branch chrome in `actions` (or a
   sibling) as `< N/M >`.
5. Tokens only; reuse IconButton + Tooltip for pencil; Button (or tonal/ghost
   pills) for Cancel/Send — no private radius aliases.
6. Sandbox Globals sample must demo edit + branch picker when the API ships.

---

## 7. Non-goals

- Editing assistant / system turns via pencil
- Moving edit into the bottom composer
- Full conversation-tree canvas
- "Branch in new chat" sidebar workflow (document separately if needed)
- TimePicker dial / other permanent skip-list items
