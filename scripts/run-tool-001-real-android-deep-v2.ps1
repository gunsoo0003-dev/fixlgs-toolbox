param(
  [Parameter(Mandatory=$true)][string]$Url,
  [int]$Attempts = 3,
  [int]$WaitChange = 90000,
  [int]$Settle = 3500,
  [string]$Selector = "input[type=file]"
)

node scripts/run-tool-001-real-android-deep-v2.mjs `
  --url $Url `
  --attempts $Attempts `
  --wait-change $WaitChange `
  --settle $Settle `
  --selector $Selector
