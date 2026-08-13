$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# V1에서 새로 추가된 파일 제거
Remove-Item '.\lib\image-file-pixel-size.ts' -Force -ErrorAction SilentlyContinue

# Next 개발 캐시 제거 (이전 V1 번들이 남아 보이는 경우 방지)
Remove-Item '.\.next' -Recurse -Force -ErrorAction SilentlyContinue

Write-Host '[TOOL016] V1 원본픽셀 판정 패치 원복 완료'
Write-Host '[TOOL016] maxPixels = 12,000,000'
Write-Host '[TOOL016] npm run dev 를 다시 실행하세요.'
