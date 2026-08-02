import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "cases.json"), "utf8"));
const outDir = path.join(__dirname, "out");
const agent = path.join(process.env.LOCALAPPDATA, "cursor-agent", "agent.cmd");
const maxParallel = 4;
const timeoutMs = 180_000;

fs.mkdirSync(outDir, { recursive: true });

function promptFor(c) {
  return `Repo workspace: ${root}

STRICT PROTOCOL:
1) First read openwiki/quickstart.md (or openwiki/index.md).
2) Follow links inside openwiki/ before searching elsewhere.
3) You may open AGENTS.md / llm/* that wiki points to.
4) Only search src/ if wiki + authority docs cannot answer.

USE CASE #${c.id}: ${c.q}

Respond with ONLY one JSON object (no markdown fence):
{"id":${c.id},"useCase":${JSON.stringify(c.q)},"wikiEntry":"path","pathTaken":["ordered","files"],"answer":"1-3 sentences","wikiHelped":true,"neededSrc":false,"confidence":"high","gap":null}`;
}

function runOne(c) {
  return new Promise((resolve) => {
    const outFile = path.join(outDir, `cli-${String(c.id).padStart(2, "0")}.txt`);
    const args = ["/c", agent, "-p", "-f", "--mode", "ask", "--model", "auto", "--workspace", root, promptFor(c)];
    const child = spawn("cmd.exe", args, { cwd: root, windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ id: c.id, ok: false, error: "timeout", stdout, stderr });
    }, timeoutMs);
    child.stdout.on("data", (b) => (stdout += b));
    child.stderr.on("data", (b) => (stderr += b));
    child.on("close", (code) => {
      clearTimeout(timer);
      fs.writeFileSync(outFile, stdout || "", "utf8");
      resolve({ id: c.id, ok: code === 0 && stdout.trim().length > 0, code, stdout, stderr });
    });
  });
}

function extractJson(text) {
  if (!text) return null;
  const t = text.trim();
  try {
    return JSON.parse(t);
  } catch {}
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(t.slice(start, end + 1));
    } catch {}
  }
  return null;
}

const queue = [...cases];
const results = [];
async function worker() {
  while (queue.length) {
    const c = queue.shift();
    process.stdout.write(`start #${c.id}\n`);
    const r = await runOne(c);
    const parsed = extractJson(r.stdout);
    results.push({ ...r, parsed });
    process.stdout.write(`done #${c.id} ok=${Boolean(parsed)} out=${r.stdout.length}\n`);
  }
}

await Promise.all(Array.from({ length: maxParallel }, () => worker()));

const parsedRows = results.map((r) => r.parsed).filter(Boolean);
const helped = parsedRows.filter((r) => r.wikiHelped === true).length;
const summary = {
  source: "cursor-agent-cli-ask",
  total: cases.length,
  parsedOk: parsedRows.length,
  wikiHelpedTrue: helped,
  wikiHelpedRate: parsedRows.length ? Number((helped / parsedRows.length).toFixed(3)) : 0,
  neededSrcTrue: parsedRows.filter((r) => r.neededSrc === true).length,
  openedWikiPath: parsedRows.filter((r) =>
    (r.pathTaken || []).some((p) => String(p).includes("openwiki")),
  ).length,
  rows: parsedRows,
};
fs.writeFileSync(path.join(outDir, "cli-summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  total: summary.total,
  parsedOk: summary.parsedOk,
  wikiHelpedTrue: summary.wikiHelpedTrue,
  wikiHelpedRate: summary.wikiHelpedRate,
  neededSrcTrue: summary.neededSrcTrue,
  openedWikiPath: summary.openedWikiPath,
}, null, 2));
