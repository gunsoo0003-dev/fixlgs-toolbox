$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Split-Path -Parent $root
$runtime = Join-Path $project ".next-tool016-runtime"
if (Test-Path $runtime) {
  Remove-Item $runtime -Recurse -Force
  Write-Host "[CLEANUP] removed .next-tool016-runtime"
} else {
  Write-Host "[CLEANUP] .next-tool016-runtime not present"
}
