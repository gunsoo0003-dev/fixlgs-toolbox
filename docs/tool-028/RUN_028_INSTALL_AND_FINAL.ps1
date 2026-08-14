$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
  Write-Host "[FAIL] $Message" -ForegroundColor Red
  exit 1
}

$Project = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $Project
Write-Host "[1/5] Project preflight: $Project"
if (-not (Test-Path '.\package.json')) { Fail 'package.json not found at project root.' }
if (-not (Test-Path '.\package-lock.json')) { Fail 'package-lock.json not found at project root.' }
if (-not (Test-Path '.\scripts\tool-028\run-validation.mjs')) { Fail 'TOOL028 runner not found.' }

Write-Host '[2/5] Install/synchronize dependencies'
& npm install --no-audit --no-fund
$InstallExit = $LASTEXITCODE
if ($InstallExit -ne 0) {
  Write-Host "[WARN] npm install failed (exit=$InstallExit). FINAL will still run once to write ENVIRONMENT_FAIL evidence." -ForegroundColor Yellow
}

Write-Host '[3/5] Verify protected dependency versions'
if ($InstallExit -eq 0) {
  & node -e "const p=require('./node_modules/pdf-lib/package.json');const j=require('./node_modules/pdfjs-dist/package.json');if(p.version!=='1.17.1'||j.version!=='5.4.54'){console.error('dependency mismatch',p.version,j.version);process.exit(1)}console.log('[PASS] pdf-lib='+p.version+' pdfjs-dist='+j.version)"
  if ($LASTEXITCODE -ne 0) { Fail 'Installed dependency versions do not match TOOL028 contract.' }
}

Write-Host '[4/5] Mobile runner registration self-check'
& node .\scripts\check-mobile-real-photo-001-028-validator.mjs
if ($LASTEXITCODE -ne 0) { Fail 'Mobile real-device runner registration self-check failed.' }

Write-Host '[5/5] TOOL028 FINAL (16 stages; Desktop result ZIP is written on PASS/FAIL)'
& npm run test:toolbox:028-final
$FinalExit = $LASTEXITCODE
$Desktop = [Environment]::GetFolderPath('Desktop')
$Result = Get-ChildItem -LiteralPath $Desktop -Filter '028_final_*.zip' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $Result) { Fail 'FINAL ended but Desktop result ZIP is missing.' }
Write-Host "RESULT_ZIP=$($Result.FullName)"
if ($FinalExit -ne 0) {
  Write-Host '[FAIL] TOOL028 FINAL failed. Send the Desktop result ZIP back to ChatGPT.' -ForegroundColor Red
  exit $FinalExit
}
Write-Host '[PASS] TOOL028 FINAL completed. FAIL=0 / SKIP=0 required.' -ForegroundColor Green
