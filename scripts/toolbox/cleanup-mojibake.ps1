param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $root

$fixtureDir = Join-Path $root "test-fixtures\tool-021"
$allowed021 = @(
  "animated.png","animated.webp","corrupt.jpg","exif-rotated.jpg","landscape.jpg",
  "large-30mp.jpg","mismatch.png","no-stretch-marker.png","over-20mb.jpg","over-40mp.jpg",
  "portrait.jpg","sample.webp","square.jpg","text-cases.json","tiny.jpg","transparent.png",
  "한글 파일명.jpg","日本語ファイル名.jpg"
)

$candidates = New-Object System.Collections.Generic.List[System.IO.FileSystemInfo]

if (Test-Path $fixtureDir) {
  Get-ChildItem $fixtureDir -Force | ForEach-Object {
    if ($allowed021 -notcontains $_.Name) {
      $candidates.Add($_)
    }
  }
}

# 검수 임시 runtime
Get-ChildItem $root -Directory -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like ".tool021-runtime-*" } |
  ForEach-Object { $candidates.Add($_) }

# 명백한 깨진 이름 탐지: Unicode replacement char 또는 ZIP mojibake에서 반복되는 CP437 흔적
Get-ChildItem $root -Force -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -match "[�]" -or
    $_.Name -match "[╣║╚┐└┴┬├┤│─▓▒░]" -or
    $_.Name -match "^[φµì]"
  } |
  ForEach-Object { $candidates.Add($_) }

$candidates = $candidates | Sort-Object FullName -Unique

if (-not $candidates -or $candidates.Count -eq 0) {
  Write-Host "PASS: 깨진/임시 파일 후보가 없습니다." -ForegroundColor Green
  exit 0
}

Write-Host "발견된 정리 후보:" -ForegroundColor Yellow
$candidates | ForEach-Object { Write-Host (" - " + $_.FullName) }

if (-not $Apply) {
  Write-Host ""
  Write-Host "검토 전에는 삭제하지 않습니다." -ForegroundColor Cyan
  Write-Host "정리가 맞으면 다음을 실행하세요:" -ForegroundColor Cyan
  Write-Host "npm run toolbox:cleanup-mojibake -- --Apply"
  exit 2
}

$quarantine = Join-Path $root ".mojibake-quarantine"
New-Item -ItemType Directory -Path $quarantine -Force | Out-Null

foreach ($item in $candidates) {
  $safe = ($item.Name -replace '[^\p{L}\p{N}\._-]', '_')
  $dest = Join-Path $quarantine ((Get-Date -Format "yyyyMMdd_HHmmssfff") + "_" + $safe)
  Move-Item -LiteralPath $item.FullName -Destination $dest -Force
}

Write-Host "정리 완료: 삭제 대신 .mojibake-quarantine 으로 격리했습니다." -ForegroundColor Green
Write-Host "git status로 정상 파일만 남았는지 확인하세요."
