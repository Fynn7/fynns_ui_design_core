# Install fynns_ui_design_core as a git submodule into a consumer repo.
# Wrapper around scripts/install-as-submodule.mjs
param(
  [Parameter(Mandatory = $true)]
  [string]$Target,
  [string]$SubmodulePath = "packages/fynns_ui_design_core",
  [string]$Url = "https://github.com/Fynn7/fynns_ui_design_core.git",
  [string]$Branch,
  [string]$Vite,
  [string]$Tsconfig,
  [switch]$SkipWire,
  [switch]$WireOnly,
  [switch]$Check,
  [switch]$DryRun,
  [switch]$Json
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mjs = Join-Path $scriptDir "install-as-submodule.mjs"

$argsList = @($mjs, "--target", $Target, "--submodule-path", $SubmodulePath, "--url", $Url)
if ($Branch) { $argsList += @("--branch", $Branch) }
if ($Vite) { $argsList += @("--vite", $Vite) }
if ($Tsconfig) { $argsList += @("--tsconfig", $Tsconfig) }
if ($SkipWire) { $argsList += "--skip-wire" }
if ($WireOnly) { $argsList += "--wire-only" }
if ($Check) { $argsList += "--check" }
if ($DryRun) { $argsList += "--dry-run" }
if ($Json) { $argsList += "--json" }

& node @argsList
exit $LASTEXITCODE
