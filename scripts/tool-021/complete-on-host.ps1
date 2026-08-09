$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $Root

function Assert-CommandFile([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path)) {
    throw "BLOCKED: $Label is missing: $Path"
  }
}

Assert-CommandFile (Join-Path $Root 'node_modules\next\dist\bin\next') 'Next.js runtime'
Assert-CommandFile (Join-Path $Root 'node_modules\@playwright\test\cli.js') 'Playwright runtime'

Write-Host "=== TOOL 021 validator/runner contract audit ===" -ForegroundColor Cyan
& node 'scripts/tool-021/check-runner-contract.mjs'
if ($LASTEXITCODE -ne 0) { throw 'TOOL 021 validator contract audit failed. Runtime validation was not started.' }

$modes = @('preflight','core-only','boundary-only','feature-only','regression-only','limit-only','final')
$failed = @()

foreach ($mode in $modes) {
  Write-Host "`n=== TOOL 021 $mode ===" -ForegroundColor Cyan
  & node 'scripts/tool-021/run-validation.mjs' $mode
  if ($LASTEXITCODE -ne 0) {
    $failed += $mode
    Write-Host "FAILED: $mode" -ForegroundColor Red
    break
  }
}

if ($failed.Count -gt 0) {
  throw "TOOL 021 NOT READY. Failed stage: $($failed -join ', ')"
}

Write-Host "`nTOOL 021 COMPLETION GATE PASSED: all validation stages returned exit 0." -ForegroundColor Green
Write-Host "Check the fixed result ZIP files on the validation output path before packaging." -ForegroundColor Green
