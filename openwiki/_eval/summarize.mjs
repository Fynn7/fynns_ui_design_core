import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "out");
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "cases.json"), "utf8"));

function extractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {}
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {}
  }
  return null;
}

const rows = [];
for (const c of cases) {
  const file = path.join(outDir, `case-${String(c.id).padStart(2, "0")}.json`);
  const errFile = path.join(outDir, `case-${String(c.id).padStart(2, "0")}.err.txt`);
  const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const err = fs.existsSync(errFile) ? fs.readFileSync(errFile, "utf8") : "";
  const parsed = extractJson(raw);
  rows.push({
    id: c.id,
    question: c.q,
    parsed: Boolean(parsed),
    wikiHelped: parsed?.wikiHelped ?? null,
    neededSrc: parsed?.neededSrc ?? null,
    confidence: parsed?.confidence ?? null,
    pathTaken: parsed?.pathTaken ?? [],
    answer: parsed?.answer ?? null,
    gap: parsed?.gap ?? null,
    error: parsed?.error ?? (raw ? null : "missing_output"),
    rawLen: raw.length,
    errTail: err.slice(-300),
  });
}

const helped = rows.filter((r) => r.wikiHelped === true).length;
const neededSrc = rows.filter((r) => r.neededSrc === true).length;
const parsedOk = rows.filter((r) => r.parsed).length;
const openedWiki = rows.filter((r) =>
  (r.pathTaken || []).some((p) => String(p).replace(/\\/g, "/").includes("openwiki/")),
).length;

const summary = {
  total: rows.length,
  parsedOk,
  wikiHelpedTrue: helped,
  wikiHelpedRate: rows.length ? helped / rows.length : 0,
  neededSrcTrue: neededSrc,
  openedWikiPath: openedWiki,
  generatedAt: new Date().toISOString(),
  rows,
};

fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(
  JSON.stringify(
    {
      total: summary.total,
      parsedOk,
      wikiHelpedTrue: helped,
      wikiHelpedRate: Number(summary.wikiHelpedRate.toFixed(3)),
      neededSrcTrue: neededSrc,
      openedWikiPath: openedWiki,
    },
    null,
    2,
  ),
);
