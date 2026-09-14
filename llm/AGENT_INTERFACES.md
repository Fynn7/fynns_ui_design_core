# Consumer-agent interfaces

**Authoritative documentation catalog** for agents working in apps that consume `@fynns/ui`.  
Machine twin: [`agent-interfaces.json`](agent-interfaces.json).

Design language SoT is [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) (index) + [`docs/design-system/`](../docs/design-system/) — **not** the slim root [`AGENTS.md`](../AGENTS.md).

Two interfaces:

1. **Documentation** — every natural-language doc in this package (table below).
2. **Technical** — lightweight custom `CodeBlock` highlighting for app-owned languages (line-command / Raycaster `.gsc` shape).

Install wiring stays in [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json).

---

## Documentation interface

Read by role; do not duplicate specs across files — follow the links.

| Role | Path | Use when |
| --- | --- | --- |
| Agent interfaces (this file) | [`llm/AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Full documentation map or custom highlight recipe |
| Agent interfaces (JSON) | [`llm/agent-interfaces.json`](agent-interfaces.json) | Machine catalog of docs + technical exports |
| Design system SoT (index) | [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) | Hard rules / catalog / density — start here, then open a subpage |
| Design system chapters | [`docs/design-system/`](../docs/design-system/) | Split SoT chapters (philosophy, hard-rules, …) |
| Agent always-on slim | [`AGENTS.md`](../AGENTS.md) | OpenCode resident summary only — not full SoT |
| Consume install | [`llm/CONSUME.md`](CONSUME.md) | Zero-token sibling `file:` + Vite alias |
| Consume install (JSON) | [`llm/consume.json`](consume.json) | Machine install / check contract |
| Consumer failure slug index | [`llm/CONSUMER_TREATY.md`](CONSUMER_TREATY.md) | Failure-mode slug → sandbox / DESIGN_SYSTEM |
| Pasteable consumer rule | [`llm/consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) | Paste into consumer `.cursor/rules/` |
| Breaking purge | [`llm/BREAKING_PURGE.md`](BREAKING_PURGE.md) | Deleted / restored public APIs |
| Breaking purge archive | [`llm/archive/BREAKING_PURGE_ARCHIVE.md`](archive/BREAKING_PURGE_ARCHIVE.md) | Older behavioral churn history |
| Frontend performance | [`llm/PERF.md`](PERF.md) | Shells, inspectors, catalogs, live token drafts |
| Local LLM / repomix | [`llm/LOCAL_LLM.md`](LOCAL_LLM.md) | Small-model budgets + repomix configs |
| Short-prompt rule | [`llm/opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Always open CONSUME on short UI prompts |
| Package propagation | [`docs/package-propagation.md`](../docs/package-propagation.md) | Publish / version bumps |
| Submodule notes (archived) | [`docs/archive/submodule-propagation.md`](../docs/archive/submodule-propagation.md) | Legacy git-submodule only |
| OpenWiki index | [`openwiki/index.md`](../openwiki/index.md) | In-package agent wiki hub |
| OpenWiki quickstart | [`openwiki/quickstart.md`](../openwiki/quickstart.md) | Start coding in this package |
| OpenWiki architecture | [`openwiki/architecture/overview.md`](../openwiki/architecture/overview.md) | Package structure |
| Add primitive | [`openwiki/workflows/add-primitive.md`](../openwiki/workflows/add-primitive.md) | New component workflow |
| OpenWiki consume | [`openwiki/operations/consume.md`](../openwiki/operations/consume.md) | Consume ops notes |
| OpenWiki brief | [`openwiki/INSTRUCTIONS.md`](../openwiki/INSTRUCTIONS.md) | Wiki regeneration brief |
| Cursor rule | [`.cursor/rules/fynns-ui.mdc`](../.cursor/rules/fynns-ui.mdc) | Always-on pointer → AGENTS + DESIGN_SYSTEM |
| OpenCode rule | [`.opencode/rules/fynns-ui.md`](../.opencode/rules/fynns-ui.md) | OpenCode mirror of constraints |
| Claude entry | [`CLAUDE.md`](../CLAUDE.md) | Short entry → AGENTS + DESIGN_SYSTEM + CONSUME |
| Repo entry | [`README.md`](../README.md) | Package overview / sandbox |

Chat-only deep dives (read only when the task hits Chat): [`CHAT_ARIA_PARITY.md`](CHAT_ARIA_PARITY.md), [`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md), [`CHAT_USER_EDIT_UX.md`](CHAT_USER_EDIT_UX.md).

---

## Technical interface: custom CodeBlock highlight

Built-in languages use zero-dep `--fynns-code-*` coloring:
- **C-like tokenizer:** `ts` / `tsx` / `js` / `jsx` / `py` / `cpp` / `css` / `json` / `bash` / `sh`
- **Markup / prose:** `xml` / `html` / `markdown` / `md` (+ aliases)
- **Markup tokenizer:** `xml` / `html` (tags → `keyword`, attributes → `property`, strings / comments / entities → `string` / `comment` / `escape`)

**App-owned DSLs** (e.g. Raycaster `.gsc`) use a **simple line-command profile** — same idea as the thesis Monaco highlighter: line head = keyword / command / invalid; args = number / `$var` / operator / parameter; `#` comments.

Colors are always `--fynns-code-*` (see `CODE_TOKENS` in `AGENTS.md`). Core does **not** ship `gsc` or Monaco/Shiki.

### Role map (GSC → `--fynns-code-*`)

| DSL role | Token / class |
| --- | --- |
| keyword | `keyword` |
| command (gscFunc) | `function` |
| constant | `constant` |
| number | `number` |
| parameter | `parameter` |
| comment | `comment` |
| `$var` / `${…}` | `variable` |
| operator | `operator` |
| unknown line-head command | `invalid` |

### API

```ts
import {
  CodeBlock,
  registerHighlightLanguage,
  highlightWithProfile,
  type SimpleHighlightProfile,
} from "@fynns/ui";

const gscProfile: SimpleHighlightProfile = {
  keywords: ["if", "else", "endif", "repeat", "endrepeat", "set", "unset"],
  commands: ["setvolume", "setrotation", "reset", "quit"],
  // constants default to true/false; hashComment + dollarVariables default true
};

// App boot (once):
registerHighlightLanguage("gsc", gscProfile);

// Then:
<CodeBlock language="gsc" code={source} label="scene.gsc" />

// Or one-shot without registry:
<CodeBlock highlightProfile={gscProfile} code={source} label="scene.gsc" />
```

- `highlightWithProfile(code, profile)` → `CodeSegment[]` for custom rendering.
- `unregisterHighlightLanguage(id)` / `getRegisteredHighlightLanguage(id)`.
- `highlightCode` / `isHighlightableLanguage` consult built-ins first, then the registry.
- `CodeBlock` `highlightProfile` wins over `language` lookup. Clipboard always uses the raw source string (`code`, or current `value` when `variant="editable"`).
- **Chrome (strict):** titled head (`default`) needs a non-empty `label` (filename) or the component **throws**. No title → `variant="plain"` (frame + copy in a reserved end column — glyphs never sit under the button). Never `label=""` to fake a headless titled block. Nested under Collapsible/Card with no filename → plain CodeBlock + outer `chrome="plain"`. Do **not** pad `.fynns-code-block-pre` in the app to dodge copy.
- **`label` ≠ `language` (hard — consumer agents):** `label` is **chrome only** (filename in the head). It does **not** pick a highlighter. You **must** pass `language` (or `highlightProfile` / a registered id) that matches the source. Extension in the label (`.xml`, `.json`, `.ts`, …) is a hint for humans — **never** rely on it for coloring. Omitted / unknown `language` → single plain mono span (looks “unhighlighted”). Built-ins: `ts`/`tsx`/`js`/`jsx`/`py`/`cpp`/`css`/`json`/`xml`/`html`/`bash`/`sh`/`markdown`/`md` (+ aliases). App DSLs → `registerHighlightLanguage` / `highlightProfile` (this file). Checklist when shipping a CodeBlock: (1) non-empty `label` xor `plain`, (2) explicit `language` or profile, (3) smoke that `.fynns-code-block--highlighted` appears for known languages.
- **`codeLanguageFromPath(path)`:** maps a filename / path to a CodeBlock
  `language` id when the body should use **CodeBlock** (not `Textarea`).
  Returns `null` for `.txt` / `.text` / extensionless names (Textarea OK).
  Known suffixes (`.md` → `markdown`, `.xml` → `xml`, …) map to built-ins or
  plain-mono ids; any other suffix still returns the bare ext so consumers
  keep CodeBlock. Does **not** replace the hard rule above — still pass the
  result as `language`. Suffixed file-body host rule: [`AGENTS.md`](../AGENTS.md)
  Content density + [`CONSUMER_TREATY.md`](CONSUMER_TREATY.md).
- `variant="editable"` keeps the same highlighter under a transparent textarea (`value` / `defaultValue` / `onChange`). Local draft + deferred highlight keep the caret snappy; `onChange` is coalesced (~120ms, flushed on blur) and parent updates run in `startTransition` so a large controlled tree does not re-render on every key. Pass non-empty `label` for a titled head; omit `label` for reserved-column copy chrome.
- Editable: soft-wrap + known `language` / `highlightProfile` → **live deferred token overlay** (dual-layer; wrap/selection may stripe — ≥ **0.5.52**). **`readOnly`** or **`wrap={false}`** when alignment matters. `wrap={false}` → classic dual-layer `<pre>` under transparent caret (deferred tokenize). Keyword/module spans on the nowrap overlay path **must not** bold against the transparent textarea. Highlight scroll re-locks after deferred tokenize; overflow observers stay mounted across keystrokes (content remounts do not reset `scrollTop` every paint). Editable height defaults to **autoGrow** (content-sized from `rows` floor `1` up to `maxHeight`) — prefer this on **PageScroll / Card / Dialog** (page scrolls). **Fill hosts only** (FullscreenDialog body, flex column with definite height, host `textarea { height: 100% }`): pass **`autoGrow={false}`**, stretch the CodeBlock root (`flex: 1` / definite height) — core does not put percentage height on the editor (collapses when parent height is indefinite). Do not leave default autoGrow on a fill editor (inline content height fights `height: 100%`). Do not pin `autoGrow={false}` + large `rows` on page catalogs (inner scrollbar anti-pattern).
- `wrap` defaults to `true` (soft-wrap long lines; no horizontal scrollbar; editable + highlight → **live deferred token overlay** on a transparent textarea — ≥ **0.5.52**; wrap/selection may stripe). Pass `wrap={false}` for classic horizontal `pre` scroll + nowrap dual-layer highlight. **`readOnly`** → single `.fynns-code-block-pre` (full tokens + native `::selection`). Readonly and editable share the same class (`--nowrap` when scroll).

```tsx
// Wrong — looks like XML but stays plain mono
<CodeBlock variant="editable" label="system-prompt.xml" value={prompt} />

// Right — language matches; PageScroll/Card keeps default autoGrow
<CodeBlock
  variant="editable"
  label="system-prompt.xml"
  language="xml"
  value={prompt}
/>

// Fill host only
<CodeBlock variant="editable" language="xml" autoGrow={false} value={prompt} />
```

Consumers should own the command list (generate from signatures / JSON). Do not fork core to add a **DSL**; missing **general** languages (e.g. a new markup id) → land in `fynns_ui_design_core` first, then bump the pin.
