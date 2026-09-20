# Chat conversation entrance

The public OpenAI [ChatGPT UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines)
describe inline components as part of the conversation flow and call for
lightweight, predictable surfaces. They describe a shimmer for a streaming
response in a full-screen chat sheet, but publish no message entrance distance,
duration, or easing. [ChatKit](https://openai.github.io/chatkit-js/) documents
streaming replies, inline widgets, and thread lifecycle events; its public
`Transition` widget type documents a wrapper, not a motion curve. The numbers
below are **fynns design decisions**, not claimed ChatGPT measurements.

## Contract

- A newly mounted `ChatMessage` in an already painted `ChatThread` rises by
  `--fynns-chat-entry-offset` while fading to full opacity over
  `--fynns-chat-entry-duration` with `--fynns-ease-out`.
- Initial history in a newly mounted `ChatThread` is fully visible immediately.
  Existing rows retain their state across later thread updates. Keep stable
  React keys for messages and appended blocks.
- Wrap any other appended content in `<ChatReveal key={id}>…</ChatReveal>`.
  It works as a thread sibling or inside a message body. Streaming text tokens
  stay in the same DOM node and use `ChatMessage.streaming` for the incomplete
  cue; do not replay an entrance animation for every token.
- The same rules apply in main chat and EndAside. `prefers-reduced-motion:
  reduce` removes the entrance animation. Motion never changes focus or live
  region semantics.

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
message or choose a starter to see a user message, inline component, and
assistant message enter the thread.
