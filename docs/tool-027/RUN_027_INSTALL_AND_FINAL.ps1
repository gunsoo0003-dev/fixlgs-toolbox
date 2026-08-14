param(
  [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
  Write-Host "[FAIL] $Message" -ForegroundColor Red
  exit 1
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'package.json'))) {
  Fail "package.json not found: $ProjectRoot"
}

Set-Location -LiteralPath $ProjectRoot
Write-Host "[1/4] PROJECT: $ProjectRoot"
Write-Host "[2/4] Sync pdfjs-dist 5.4.54 and package-lock"

& npm install pdfjs-dist@5.4.54 --save
$installExit = $LASTEXITCODE
if ($installExit -ne 0) {
  Write-Host "[WARN] npm install failed (exit=$installExit). Running FINAL once so ENVIRONMENT_FAIL evidence is still written to Desktop." -ForegroundColor Yellow
  & npm run test:toolbox:027-final
  exit $LASTEXITCODE
}

Write-Host "[3/4] TOOL027 PREFLIGHT"
& npm run test:toolbox:027-preflight
if ($LASTEXITCODE -ne 0) {
  Write-Host "[FAIL] PREFLIGHT failed. See Desktop\027_preflight_검수결과.zip" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[4/4] TOOL027 FINAL"
& npm run test:toolbox:027-final
$finalExit = $LASTEXITCODE
if ($finalExit -ne 0) {
  Write-Host "[FAIL] FINAL failed. See Desktop\027_final_검수결과.zip" -ForegroundColor Red
  exit $finalExit
}

$desktop = [Environment]::GetFolderPath('Desktop')
$finalZip = Join-Path $desktop '027_final_검수결과.zip'
if (-not (Test-Path -LiteralPath $finalZip)) {
  Fail "FINAL command exited successfully but result ZIP is missing: $finalZip"
}

Write-Host "[PASS] TOOL027 FINAL complete"
Write-Host "RESULT: $finalZip"
