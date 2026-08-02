# Parallel Cursor Agent CLI eval: wiki-first navigation usefulness.
# Usage: powershell -ExecutionPolicy Bypass -File openwiki/_eval/run-agent-cases.ps1
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "../..")
$CasesPath = Join-Path $PSScriptRoot "cases.json"
$OutDir = Join-Path $PSScriptRoot "out"
$Agent = Join-Path $env:LOCALAPPDATA "cursor-agent\agent.cmd"
$MaxParallel = 6
$TimeoutSec = 180

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Get-ChildItem $OutDir -Filter "case-*.json" -ErrorAction SilentlyContinue | Remove-Item -Force

$cases = Get-Content $CasesPath -Raw | ConvertFrom-Json
Write-Host "Cases: $($cases.Count)  root=$Root  parallel=$MaxParallel"

function Build-Prompt([object]$c) {
  @"
Repo workspace: $Root

You are evaluating whether OpenWiki helps agents navigate this repo.

STRICT PROTOCOL:
1) First open and read openwiki/quickstart.md (or openwiki/index.md).
2) Follow links inside openwiki/ before searching the rest of the repo.
3) You may then open linked authority docs (AGENTS.md, llm/*) that wiki points to.
4) Only search src/ if wiki + those authority docs cannot answer.

USE CASE #$($c.id): $($c.q)

Respond with ONLY one JSON object (no markdown fence, no prose):
{"id":$($c.id),"useCase":$([string]($c.q | ConvertTo-Json)),"wikiEntry":"path","pathTaken":["ordered","files","read"],"answer":"1-3 sentence answer","wikiHelped":true,"neededSrc":false,"confidence":"high","gap":null}
"@
}

$queue = [System.Collections.Queue]::new()
foreach ($c in $cases) { $queue.Enqueue($c) }
$running = @{}

function Start-One($c) {
  $prompt = Build-Prompt $c
  $outFile = Join-Path $OutDir ("case-{0:D2}.json" -f $c.id)
  $errFile = Join-Path $OutDir ("case-{0:D2}.err.txt" -f $c.id)
  $argList = @(
    "-p","-f",
    "--mode", "ask",
    "--model", "auto",
    "--output-format", "text",
    "--workspace", "$Root",
    $prompt
  )
  $p = Start-Process -FilePath $Agent -ArgumentList $argList -NoNewWindow -PassThru `
    -RedirectStandardOutput $outFile -RedirectStandardError $errFile
  $running[$c.id] = @{ proc = $p; started = Get-Date; out = $outFile; err = $errFile; case = $c }
  Write-Host ("started #{0}" -f $c.id)
}

while ($queue.Count -gt 0 -or $running.Count -gt 0) {
  while ($running.Count -lt $MaxParallel -and $queue.Count -gt 0) {
    Start-One ($queue.Dequeue())
  }
  Start-Sleep -Seconds 3
  foreach ($id in @($running.Keys)) {
    $info = $running[$id]
    $p = $info.proc
    $elapsed = ((Get-Date) - $info.started).TotalSeconds
    if (-not $p.HasExited -and $elapsed -gt $TimeoutSec) {
      try { $p.Kill() } catch {}
      Write-Host ("TIMEOUT #{0}" -f $id)
      Set-Content -Path $info.out -Value (@{ id = $id; error = "timeout"; wikiHelped = $false } | ConvertTo-Json -Compress) -Encoding utf8
      $running.Remove($id)
      continue
    }
    if ($p.HasExited) {
      Write-Host ("done #{0} exit={1} ({2:N0}s)" -f $id, $p.ExitCode, $elapsed)
      $running.Remove($id)
    }
  }
}

Write-Host "All finished. Summarizing..."
node (Join-Path $PSScriptRoot "summarize.mjs")

