# OpenWiki verification report

Generated: 2026-08-02

## 1. Existence / smoke

| Check | Result |
|-------|--------|
| `openwiki/` seed pages present | PASS (index, quickstart, INSTRUCTIONS, architecture, workflows, operations) |
| Relative links after fix | PASS (`ALL_LINKS_OK`) |
| HTTP static smoke `http://127.0.0.1:8766` | PASS **7/7** pages (200 + body) |
| Agents Hub GUI repo entry | PASS `hasWikiDir=true`, lastRunOk |
| cursor-ide-browser MCP | UNAVAILABLE in this session |
| Playwright screenshot | FAIL (browser binary version mismatch); HTTP smoke used instead |

## 2. Agent usefulness (Task explore subagents)

- **N = 42** Cursor Task `explore` subagents, wiki-first protocol
- **wikiHelped = 40/42 (95.2%)**
- **opened `openwiki/` path = 42/42 (100%)**
- **neededSrc = 0/42** (no agent needed to dig `src/` for these Qs)
- Documented gaps (patched after eval):
- **ControlStack / ControlRow** (T30) → `architecture/overview.md`
- **SnackbarHost** once near app root (T29) → `operations/consume.md`

## 3. Agent CLI batch (48 cases)

`agent -p --mode ask` did **not** follow the eval prompt (workspace greeting only). Treat as harness limitation, not wiki failure. Reliable signal is the Task subagent cohort.

## 4. Verdict

OpenWiki **exists, links resolve, and is useful for agent navigation** on high-frequency design-system questions (consume, tokens, purge replacements, skips, architecture paths). It is a **router** to `AGENTS.md` / `llm/*`, not a second catalog — that design worked.
