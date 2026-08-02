import fs from "node:fs";
import path from "node:path";

const dir =
  "C:/Users/fynna/.cursor/projects/d-fynns-local-ws-fynns-ui-design-core/agent-transcripts/a2bc444f-2549-480e-a90a-e31581c35b65/subagents";
const outDir = "D:/fynns_local_ws/fynns_ui_design_core/openwiki/_eval/out";

function tryParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function extractFromTranscript(raw) {
  let found = null;

  // Direct JSON object in file
  for (const m of raw.matchAll(/\{[^{}]*"wikiHelped"[^{}]*\}/g)) {
    const o = tryParseJson(m[0]);
    if (o && "wikiHelped" in o) found = o;
  }

  // Assistant text payloads that embed JSON (possibly escaped)
  for (const line of raw.split(/\n/)) {
    if (!line.includes("wikiHelped")) continue;
    let o = tryParseJson(line);
    if (!o && line.includes('"text"')) {
      try {
        o = JSON.parse(line);
      } catch {
        /* ignore */
      }
    }
    const text = o?.message?.content?.find?.((c) => c.type === "text")?.text;
    if (typeof text === "string" && text.includes("wikiHelped")) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) {
        const parsed = tryParseJson(text.slice(start, end + 1));
        if (parsed && "wikiHelped" in parsed) found = parsed;
      }
    }
    // line may be the whole jsonl event with escaped JSON in text
    const m = line.match(/"text":"(\{.*\})"/);
    if (m) {
      const unescaped = tryParseJson(`"${m[1]}"`);
      if (typeof unescaped === "string") {
        const parsed = tryParseJson(unescaped);
        if (parsed && "wikiHelped" in parsed) found = parsed;
      }
    }
  }

  // Fallback: decode common \\ escaping around {\"id\":\"T
  const marker = raw.lastIndexOf('{\\"id\\":\\"T');
  if (marker >= 0) {
    let s = raw.slice(marker, marker + 2000);
    s = s.replace(/\\"/g, '"').replace(/\\n/g, " ");
    const end = s.indexOf("}");
    if (end > 0) {
      const parsed = tryParseJson(s.slice(0, end + 1));
      if (parsed && "wikiHelped" in parsed) found = parsed;
    }
  }

  return found;
}

const rows = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".jsonl"))) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8");
  const found = extractFromTranscript(raw);
  if (found) rows.push({ ...found, _file: f });
}

const helped = rows.filter((r) => r.wikiHelped === true).length;
const neededSrc = rows.filter((r) => r.neededSrc === true).length;
const openedWiki = rows.filter((r) =>
  (r.pathTaken || []).some((p) => String(p).replace(/\\/g, "/").includes("openwiki")),
).length;

const summary = {
  source: "cursor-task-explore-subagents",
  total: rows.length,
  wikiHelpedTrue: helped,
  wikiHelpedRate: rows.length ? Number((helped / rows.length).toFixed(3)) : 0,
  neededSrcTrue: neededSrc,
  openedWikiPath: openedWiki,
  gaps: rows.filter((r) => r.gap).map((r) => ({ id: r.id, gap: r.gap })),
  all: rows.map((r) => ({
    id: r.id,
    wikiHelped: r.wikiHelped,
    neededSrc: r.neededSrc,
    pathTaken: r.pathTaken,
    answer: String(r.answer || "").slice(0, 160),
    gap: r.gap ?? null,
  })),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "task-summary.json"), JSON.stringify(summary, null, 2));
console.log(
  JSON.stringify(
    {
      total: summary.total,
      wikiHelpedTrue: helped,
      wikiHelpedRate: summary.wikiHelpedRate,
      neededSrcTrue: neededSrc,
      openedWikiPath: openedWiki,
      gaps: summary.gaps.length,
    },
    null,
    2,
  ),
);
