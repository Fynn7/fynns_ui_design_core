# Consumer-agent interfaces

**Authoritative index** for agents working in apps that consume `@fynns/ui`.  
Machine twin: [`agent-interfaces.json`](agent-interfaces.json).

Two interfaces:

1. **Documentation** — every natural-language doc in this package (table below).
2. **Technical** — lightweight custom `CodeBlock` highlighting for app-owned languages (line-command / Raycaster `.gsc` shape).

Install wiring stays in [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json). Design language stays in [`AGENTS.md`](../AGENTS.md).

---

## Documentation interface

Read by role; do not duplicate specs across files — follow the links.

| Role | Path | Use when |
| --- | --- | --- |
| Agent interfaces (this file) | [`llm/AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Need the dual-interface map or custom highlight recipe |
| Agent interfaces (JSON) | [`llm/agent-interfaces.json`](agent-interfaces.json) | Machine catalog of docs + technical exports |
| Design system | [`AGENTS.md`](../AGENTS.md) | Tokens, keep-set, UX rules |
| Repo entry | [`README.md`](../README.md) | Package overview / sandbox |
| Consume install | [`llm/CONSUME.md`](CONSUME.md) | Submodule + Vite alias install |
| Consume install (JSON) | [`llm/consume.json`](consume.json) | Machine install / check contract |
| Breaking purge | [`llm/BREAKING_PURGE.md`](BREAKING_PURGE.md) | Deleted / restored public APIs |
| Short-prompt rule | [`llm/opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Always open CONSUME on short UI prompts |
| Submodule propagation | [`docs/submodule-propagation.md`](../docs/submodule-propagation.md) | Pin bumps across consumers |
| OpenWiki index | [`openwiki/index.md`](../openwiki/index.md) | In-package agent wiki hub |
| OpenWiki quickstart | [`openwiki/quickstart.md`](../openwiki/quickstart.md) | Start coding in this package |
| OpenWiki architecture | [`openwiki/architecture/overview.md`](../openwiki/architecture/overview.md) | Package structure |
| Add primitive | [`openwiki/workflows/add-primitive.md`](../openwiki/workflows/add-primitive.md) | New component workflow |
| OpenWiki consume | [`openwiki/operations/consume.md`](../openwiki/operations/consume.md) | Consume ops notes |
| OpenWiki brief | [`openwiki/INSTRUCTIONS.md`](../openwiki/INSTRUCTIONS.md) | Wiki regeneration brief |
| Cursor rule | [`.cursor/rules/fynns-ui.mdc`](../.cursor/rules/fynns-ui.mdc) | Always-on keep-set + tokens |
| OpenCode rule | [`.opencode/rules/fynns-ui.md`](../.opencode/rules/fynns-ui.md) | OpenCode mirror of constraints |
| Claude entry | [`CLAUDE.md`](../CLAUDE.md) | Short entry → AGENTS + CONSUME |

---

## Technical interface: custom CodeBlock highlight

Built-in languages (`ts` / `tsx` / `js` / `jsx` / `py` / `cpp` / `css` / `json` / `bash` / `sh`) use the C-like tokenizer.  
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
- `variant="editable"` keeps the same highlighter under a transparent textarea (`value` / `defaultValue` / `onChange`). Local draft + deferred highlight keep the caret snappy; `onChange` is coalesced (~120ms, flushed on blur) and parent updates run in `startTransition` so a large controlled tree does not re-render on every key.
- `wrap` defaults to `true` (soft-wrap long lines; no horizontal scrollbar). Pass `wrap={false}` for classic horizontal `pre` scroll (textarea `wrap="off"`). Readonly and editable share the same class (`--nowrap` when scroll).

Consumers should own the command list (generate from signatures / JSON). Do not fork core to add a language.
