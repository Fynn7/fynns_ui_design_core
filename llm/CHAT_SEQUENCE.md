# Chat questions, thinking rows and event order

Live default: Components → **ChatQuestion · chronological conversation**
(`#chat-question` / DOM `#globals-demo-chat-question`). API:
`node scripts/api.mjs ChatQuestion`, `ChatThinking`, `ChatThinkingStack`.

## Question well

Use `ChatQuestion` inside a keyed `ChatReveal` in `ChatThread`. Core owns the
Card heading, information glyph, question label, radio list and final **Other +
inline Input**. The Input stays mounted, disabled until Other is selected;
switching choices preserves its draft. Each card has its own radio name and IDs.

Pass concise `options: { value, label }[]`. `other` is a reserved value; do not
include it in `options` or duplicate Other. Default structure has no progress,
round metadata, descriptions or regeneration option. Only when explicitly
requested, add option `description` or use `other={false}` for a special
structure. Localize `title`, `otherLabel`, `otherPlaceholder`, `submitLabel`.

Draft can be internal (`defaultAnswer`) or controlled (`answer` +
`onAnswerChange`). `ChatQuestionAnswer` is `{ value: string, text: string }`.
`onSubmit` adds Continue, enabled only for a known choice or non-blank Other;
submitted text is trimmed (empty string for coded choices). `readOnly` disables
editing, removes Continue and retains controls/text; pass localized
`title="Answered"`. Answering never moves or removes the original card.
Asynchronous question generation uses `BusyRegion` / `InlineAlert` as usual.

```tsx
<ChatReveal key={event.id}>
  <ChatQuestion
    question="How should the response be presented?"
    options={[
      { value: "concise", label: "Concise paragraph" },
      { value: "detailed", label: "Detailed explanation" },
    ]}
    onSubmit={(answer) => submitAnswer(event.id, answer)}
  />
</ChatReveal>
```

## Structured thinking content

One operation uses one outer `ChatThinking`. Inside it, use only muted small
thought text or indented nested `ChatThinking`. Prefer the structured
`details: ChatThinkingDetail[]` API: a detail is either `{ id, text }` or
`{ id, label, summary?, icon?, marker?, artifact?, details?, streaming?, streamingLabel?, defaultOpen?, open?, onOpenChange? }`.
`text` also accepts an array of strings / `{ code: string }` for safe inline code.
`artifact` is a non-interactive `{ label, icon? }` filename capsule. Icons are
decorative existing library glyphs, never controls. Markers default to an icon
at the first nesting level and a dot deeper; an explicit icon selects the icon
column. Use `marker="none"` to omit the mark. Child dot headings remain keyboard
operable disclosures but have no redundant chevron; group chevrons stay adjacent
to their complete visible label. `summary` is muted continuation text.
Stable IDs preserve nested open state during progress/text updates. Core owns
typography, wrapping, indentation and disclosure geometry. Each nested row has
the reference anatomy: an outer thin nesting guide, an icon column for top-level
entries, a dot column for deeper headings, and a short circular elbow only into
the first child of a group. Paragraphs align with their heading text and have a
separate thin guide at the dot center. This is decorative ChatThinking nesting,
not a ChatActivity timeline. Guides/marks mirror in RTL and add no focus or
announcements. The 1dp stroke and 8dp outer corner radius produce a 7.5dp
stroke-center circular turn. Text remains 14dp with 22dp line boxes; controls
never inherit reference-review magnification. All geometry lives in tokens.
Empty nested details
render as a static status; no empty toggle. The explicit `details` prop owns
the body when supplied; legacy `children` is ignored in that case.

Do not put `Collapsible`, `ChatActivity`, `Card`, `Surface`, `Button`,
attempt selectors, tabs or a timeline inside thinking. Attempts, phases and
technical details are nested thinking disclosures, never boxed/pill controls.
Keep results, artifact viewers, retry/stop controls and questions outside the
outer disclosure. This restriction applies to legacy `children` too; it is
not a reason to override core CSS. Live: `#thinking-details`.
Run `node <core>/scripts/check-thinking-content.mjs <consumer-src>` to catch
forbidden JSX, including aliases and same-file helpers. The check cannot resolve
imported helpers or dynamic styling; `details` is the safe API across boundaries.

`details` is presentation data, not a transport/execution contract. Apps own
truthful status, progress, retained attempts and persisted open preferences.
`streaming` means active UI; it never authorizes invented model reasoning.

Reference review: `/?demo=thinking-reference` (normal 1× and explicit 2× image
comparison). The fixture preserves the supplied paragraph breaks and uses generic sample
names. Normal task text wraps naturally. It is a visual reproduction,
not a claim of access to Copilot source CSS. Isolated task review: `/?demo=thinking-details`. It uses the same
component and includes processing/completion/stop simulations outside thinking.

## Clocks, counts and motion

Keep the same `ChatThinking` and stable `details[].id` mounted while seconds,
counts or phase copy change. Never derive React keys from labels, durations,
timestamps or summaries. Core updates text in place and preserves OverflowTip,
focus, disclosure choices and the current streaming sweep. It does not fade,
crossfade or slide text on every refresh. Entry motion belongs to mounting and
streaming lifecycle changes; expansion motion belongs to disclosure state.

Prefer `summary={elapsedText}` for a muted clock after a semantic `label` /
`streamingLabel`; existing inline clock labels and `durationLabel` updates are
also stable. Core uses tabular digits in the heading: equal-length numbers keep
their advance width, while minute/hour rollovers may naturally change width.
Sample elapsed wall time at most once per second; calculate from recorded start
and end timestamps rather than counting interval callbacks. Stop sampling when
the operation settles, clean up the interval on unmount and keep timer text out
of live regions. Consumers own the clock and truthful status; core owns motion.

Live `#thinking-clock` / isolated `/?demo=thinking-clock`: inline and summary
clocks, nested body text, pause/resume, minute/hour boundaries, phase changes and
manual folding. Reduced motion removes entry, sweep and chevron travel while
retaining legible updates. Do not patch `.fynns-chat-thinking-*` in consumers.

## Thinking variants and rhythm

- `variant="status"`: muted label only; no chevron, body or toggle.
- `variant="disclosure"` (default): same label + adjacent chevron when `children`
  exists. Streaming opens unless pinned closed; completion collapses once and
  retains the body for reopening. No body falls back to a static row.
- Put consecutive rows in `ChatThinkingStack` in `ChatMessage.thinking`. Both
  variants use `--fynns-chatmessage-thinking-stack-gap` (unit-stack breath +
  thinking clearance, default 22dp). Core cancels individual trailing margins
  inside the stack. Do not clone plain status divs or override core spacing.
- Labels are progressive while running, past tense when done. Flat activities
  use these rows. Multi-stage processing stays inside one outer `ChatThinking`
  with nested `details`; `ChatActivity` is not a processing-thinking substitute.
- **Chevron placement is label-owned for `ChatThinking` and `ChatActivity`:**
  it follows visible label text by `--fynns-chatmessage-thinking-trigger-gap`
  (default 6dp). `--fynns-chatmessage-activity-trigger-gap` aliases that token.
  Tool-count summaries (`1 read`, `2 tool calls`) and Thinking/Thought use the
  same gap. Host/output width, output growth and open/closed state must not
  move the chevron away from the label. Longer labels move it by their added
  width; it is not a fixed page coordinate. Core keeps headers intrinsic and
  expanded bodies full-width. Consumers must not add `width: 100%`, `flex: 1`,
  `space-between`, auto margins, spacers or absolute positioning to headers,
  labels or chevrons. Use concise string labels. Narrow hosts shrink/ellipsis
  the label while retaining OverflowTip. Live `#chat-chevron` / DOM
  `#globals-demo-chat-chevron`.

```tsx
<ChatMessage role="assistant" thinking={
  <ChatThinkingStack>
    <ChatThinking variant="disclosure" label="Read the sample">
      Reviewed the relevant passage.
    </ChatThinking>
    <ChatThinking variant="status" label="Checked wording" />
  </ChatThinkingStack>
} />
```

## Chronological append contract

Render **one ordered event list** for prompts, LLM calls/replies, thinking,
questions and result cards. Append each new event below all earlier events
when it occurs, with a unique stable ID/key. Preserve arrival order even when
requests finish out of order. Streaming tokens/status stay in that call's
existing event; completion updates it in place. A new call/result appends.

End a thinking stack at any intervening question, prompt or result. Later
activity starts a new stack **after** that event; never backfill an earlier
stack above it. Do not render role/type buckets, sort by status, reuse a
perpetual “current result” card, move completed events, use CSS `order` /
`column-reverse`, or dock questions/results/thinking at the bottom. Only the
composer and optional composer task summary are docked. Scroll following
changes the viewport, never event order or focus.

## Live reveal contract (mandatory)

A live run is a recording being written, not a state to re-render. The painted
thread is append-only and single-flight:

1. **Never rewrite painted history.** Do not collapse a finished run into a
   summary, remove a row that merged into another row, re-sort a block inserted
   mid-list, or replay an entrance on a row that is already visible. Terminal
   state appends rows; it never replaces them. Opening a recorded run paints
   its history at once because it is history, not a live step.
2. **One new row at a time, top to bottom.** At most one row may begin its
   entrance per cadence. Wrap the event list in `useChatSequencer` with stable
   event keys; it reveals one queued row per
   `--fynns-chat-entry-duration` and never reorders. Do not append an array of
   new rows in one commit.
3. **No empty frame.** From submit to the first recorded row, paint the user's
   turn immediately and keep a live status row at the tail. Every real backend
   phase needs a visible row while it runs: starting the run, the initial
   frame, starting the harness, the model call, each tool call, saving the
   frame/result, the closing answer, and stopping. A phase that produces no
   row is a defect, not a gap.
4. **No temporal inversion.** A later row waits until every painted row has
   settled: entrance motion finished, media decoded or failed, streaming
   stopped. Never let a middle row flicker, sweep or show a skeleton while a
   newer row is already visible below it. `isSettled` on the sequencer is the
   gate; image/iframe rows report load and error, streaming rows report their
   open state.
5. **The tail status is a status, not an event.** Keep one live status row
   (`ChatThinking variant="status" streaming`) outside the recorded list. It
   updates in place, changes wording only from recorded phases, and disappears
   when the run is terminal and the queue is empty. It is the only persistent
   animation at the tail.
6. **Stable identity.** Keys come from recorded event identity (`id`, stable
   timestamp plus kind), never the array index alone. Keep a key mounted while
   its label, clock, count or streamed text changes; completion updates it in
   place. A poll that returns the same event must not mount a second row.
7. **Reduced motion.** With `prefers-reduced-motion: reduce`, the reveal
   cadence is zero and entrance motion is removed; ordering and the tail
   status remain.

```tsx
const { visibleItems, waiting } = useChatSequencer({
  items: recordedEvents,              // one ordered, append-only list
  getKey: (event) => event.id,        // stable recorded identity
  seed: startedHere ? "first" : "all",
  isSettled: (event) => !isStreaming(event) && mediaSettled(event.id),
  resetKey: runId,
});
```

Live review: sandbox `#layouts-demo-chat-product` appends a component and an
assistant row through the sequencer, one at a time. The recorded ordering
source remains the consumer's transport; core owns the gate and the cadence.


Example: prompt → thinking rows → question → answer prompt → new thinking →
result → next prompt → next call. Submission locks the original card in place
and appends subsequent events. Retry appends a new call after the existing
failure; stopping retains the interrupted event. Restore saved history order
without changing IDs. The sandbox demonstrates one event array and keyed
rendering; app transport/persistence owns events, core owns chrome and rhythm.

Entrance: [`CHAT_MOTION.md`](CHAT_MOTION.md). Streaming/focus announcements:
[`CHAT_ARIA_PARITY.md`](CHAT_ARIA_PARITY.md).
