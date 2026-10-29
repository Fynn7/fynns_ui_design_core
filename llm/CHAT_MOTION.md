# Chat append and streaming motion

ChatGPT's current web conversation CSS (inspected on a public
`chatgpt.com/share/...` page: `conversation-small-*.css` + `root-*.css`) paints
messages at full opacity. There are no per-message entrance keyframes, no
`translate`/`opacity` entrance, and no staggered row reveal. While an answer
streams, ChatGPT appends text in place and adds a small dot after the newest
text (`.result-streaming … :after { content: "●" }`); thinking rows use a
pulsing dot. The thread simply grows downward and the scroll container follows.
The public [OpenAI UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines)
and [ChatKit](https://openai.github.io/chatkit-js/) document surfaces and
streaming, not a message entrance curve. This contract follows the observed
ChatGPT behavior, not a stylized rise/fade.

## Contract

- A newly appended `ChatMessage` or `ChatReveal` paints at full opacity in its
  final position. Do **not** add a per-row fade, rise, scale, blur or stagger.
  Opening a recorded run and appending a live row look the same; the thread
  grows downward instead of each turn entering.
- Keep one chronological event list with stable React keys. Appended rows
  extend the thread; never reorder, collapse or replay a row already painted.
- `useChatSequencer` still gates live rows: paint one row at a time and wait
  until every painted row has settled (streaming stopped, media decoded or
  failed) before painting the next. Its default interval is **0** (next task).
  A positive `intervalMs` is an explicit staged-demo option, never the
  production default.
- `ChatMessage.streaming` marks an incomplete answer with a small ink dot after
  the newest glyph (pseudo-element, so it is not copied and does not change the
  accessible name) plus `aria-busy`. Streaming markdown words fade in over
  `--fynns-duration-fast` with opacity only (no translate); earlier words keep
  their DOM nodes and never replay, so text fills downward without a
  whole-bubble fade. Do not animate non-text rows per token.
- `ChatReveal` is a semantic wrapper for appended non-message blocks (cards,
  tool results, caller content), not an animation. Keep a stable key.
- `prefers-reduced-motion: reduce` keeps the tail dot static. There is no
  entrance animation to remove.

```tsx
<ChatThread>
  {turns.map((turn) =>
    turn.kind === "message" ? (
      <ChatMessage key={turn.id} role={turn.role} markdown={turn.text} />
    ) : (
      <ChatReveal key={turn.id}>{turn.content}</ChatReveal>
    ),
  )}
</ChatThread>
```

Live review: sandbox Layouts → Chat product host and Chat aside host. Send a
message or choose a starter; the user message, inline component and assistant
message append immediately, and the assistant tail shows the streaming dot
until the answer settles.
