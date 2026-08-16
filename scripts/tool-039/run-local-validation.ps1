$ErrorActionPreference = 'Continue'
$Project = 'C:\Users\Administrator\Desktop\WebProjects\fixlgs-toolbox'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
if (-not (Test-Path -LiteralPath $Desktop)) { New-Item -ItemType Directory -Force -Path $Desktop | Out-Null }
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$InternalDir = Join-Path $Project 'test-results\tool039-local'
if (-not (Test-Path -LiteralPath $InternalDir)) { New-Item -ItemType Directory -Force -Path $InternalDir | Out-Null }
$Log = Join-Path $InternalDir ("local-$Stamp.log")
$Checkpoint = Join-Path $InternalDir ("checkpoint-$Stamp.txt")
$Result = Join-Path $Desktop 'TOOL039_LOCAL_RESULT.txt'
$Diagnostic = Join-Path $Desktop ("TOOL039_LOCAL_DIAGNOSTIC_$Stamp.txt")
$ResultZip = Join-Path $Desktop 'TOOL039_LOCAL_FINAL_검수결과.zip'

function Write-FileUtf8([string]$Path, [string]$Text, [bool]$Append=$false) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  if ($Append -and (Test-Path -LiteralPath $Path)) { [System.IO.File]::AppendAllText($Path, $Text, $enc) }
  else { [System.IO.File]::WriteAllText($Path, $Text, $enc) }
}
function Append-Log([string]$Text) { Write-FileUtf8 $Log $Text $true }
function Save-Result([string]$Status, [string]$Step, [string]$Sentinel, [int]$ExitCode=0) {
  $passed = @($script:StepResults | Where-Object { $_.Status -eq 'PASS' }).Count
  $failed = @($script:StepResults | Where-Object { $_.Status -eq 'FAIL' }).Count
  $running = @($script:StepResults | Where-Object { $_.Status -eq 'RUNNING' }).Count
  $lines = @(
    'TOOL039 LOCAL RESULT'
    "STATUS=$Status"
    "STEP=$Step"
    "EXIT_CODE=$ExitCode"
    "PASS_COUNT=$passed"
    "FAIL_COUNT=$failed"
    "RUNNING_COUNT=$running"
    "FINISHED=$(Get-Date -Format o)"
    "SENTINEL=$Sentinel"
    ''
    'STEPS:'
  )
  foreach ($r in $script:StepResults) { $lines += ("{0}={1};exit={2}" -f $r.Label,$r.Status,$r.ExitCode) }
  Write-FileUtf8 $Result (($lines -join "`r`n") + "`r`n") $false
}
function Save-Diagnostic {
  if (Test-Path -LiteralPath $Log) {
    try { Copy-Item -LiteralPath $Log -Destination $Diagnostic -Force -ErrorAction Stop } catch {}
  }
}
function Invoke-Captured {
  param([string]$Label, [string]$FilePath, [string[]]$Arguments)
  Append-Log ("`r`n===== $Label =====`r`nCOMMAND: $FilePath $($Arguments -join ' ')`r`n")
  $outFile = Join-Path $env:TEMP ("tool039-out-$PID.txt")
  $errFile = Join-Path $env:TEMP ("tool039-err-$PID.txt")
  Remove-Item -LiteralPath $outFile,$errFile -Force -ErrorAction SilentlyContinue
  $p = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $Project -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outFile -RedirectStandardError $errFile
  $out = if (Test-Path -LiteralPath $outFile) { Get-Content -LiteralPath $outFile -Raw -ErrorAction SilentlyContinue } else { '' }
  $err = if (Test-Path -LiteralPath $errFile) { Get-Content -LiteralPath $errFile -Raw -ErrorAction SilentlyContinue } else { '' }
  if ($out) { Append-Log $out }
  if ($err) { Append-Log ("`r`n[stderr]`r`n" + $err) }
  Append-Log ("`r`nEXITCODE=$($p.ExitCode)`r`n")
  return $p.ExitCode
}

function New-ResultZip([string]$Status,[string]$Step,[int]$ExitCode) {
  $tmp = Join-Path $env:TEMP ("tool039-local-result-$PID")
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  if (Test-Path -LiteralPath $Log) { Copy-Item -LiteralPath $Log -Destination (Join-Path $tmp 'local.log') -Force -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $Checkpoint) { Copy-Item -LiteralPath $Checkpoint -Destination (Join-Path $tmp 'checkpoint.txt') -Force -ErrorAction SilentlyContinue }
  $summary=@("TOOL039 LOCAL FINAL","STATUS=$Status","STEP=$Step","EXIT_CODE=$ExitCode","FINISHED=$(Get-Date -Format o)","SENTINEL=$(if($Status -eq 'PASS'){'TOOL039_LOCAL_FINAL_PASS'}elseif($Status -eq 'INTERRUPTED'){'TOOL039_LOCAL_FINAL_INTERRUPTED'}else{'TOOL039_LOCAL_FINAL_FAIL'})") -join "`r`n"
  Write-FileUtf8 (Join-Path $tmp 'summary.txt') ($summary+"`r`n") $false
  $json=[pscustomobject]@{tool='039';status=$Status;step=$Step;exitCode=$ExitCode;steps=$script:StepResults} | ConvertTo-Json -Depth 5
  Write-FileUtf8 (Join-Path $tmp 'summary.json') ($json+"`r`n") $false
  if(Test-Path -LiteralPath $ResultZip){Remove-Item -LiteralPath $ResultZip -Force -ErrorAction SilentlyContinue}
  tar.exe -a -c -f $ResultZip -C $tmp . | Out-Null
  return $LASTEXITCODE
}

Set-Location -LiteralPath $Project
$Node = (Get-Command node -ErrorAction Stop).Source
$TscJs = Join-Path $Project 'node_modules\typescript\lib\tsc.js'
$NextJs = Join-Path $Project 'node_modules\next\dist\bin\next'
$script:StepResults = @()
Write-FileUtf8 $Log ("TOOL039 LOCAL VALIDATION START`r`nPROJECT=$Project`r`nSTART=$(Get-Date -Format o)`r`n") $false
Write-FileUtf8 $Checkpoint ("START|$(Get-Date -Format o)`r`n") $false
Save-Result 'RUNNING' 'START' 'TOOL039_LOCAL_RUNNING' 0

$Interrupted = $false
trap {
  $Interrupted = $true
  Append-Log ("`r`nINTERRUPTED`r`n" + ($_ | Out-String))
  Save-Result 'INTERRUPTED' 'CURRENT_OR_UNKNOWN' 'TOOL039_LOCAL_INTERRUPTED' 130
  New-ResultZip 'INTERRUPTED' 'CURRENT_OR_UNKNOWN' 130
  Save-Diagnostic
  break
}

try {
  $steps = @(
    @{Label='01 STATIC'; File=$Node; Args=@('scripts/tool-039/run-static-validation.mjs')},
    @{Label='02 MAIN'; File=$Node; Args=@('scripts/tool-039/check-main-integration.mjs')},
    @{Label='03 SOURCE'; File=$Node; Args=@('scripts/check-tool-039-source.mjs')},
    @{Label='04 PREFLIGHT'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','preflight')},
    @{Label='05 CORE'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','core-only')},
    @{Label='06 BOUNDARY'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','boundary-only')},
    @{Label='07 FEATURE'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','feature-only')},
    @{Label='08 REGRESSION'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','regression-only')},
    @{Label='09 LIMIT'; File=$Node; Args=@('scripts/tool-039/run-validation.mjs','limit-only')},
    @{Label='10 TYPESCRIPT'; File=$Node; Args=@($TscJs,'--noEmit')},
    @{Label='11 BUILD'; File=$Node; Args=@($NextJs,'build')}
  )
  foreach ($s in $steps) {
    Append-Log ("STEP_START|$(Get-Date -Format o)|$($s.Label)`r`n")
    $script:StepResults += [pscustomobject]@{Label=$s.Label;Status='RUNNING';ExitCode=-1}
    Save-Result 'RUNNING' $s.Label 'TOOL039_LOCAL_RUNNING' 0
    $exit = Invoke-Captured $s.Label $s.File $s.Args
    $idx = $script:StepResults.Count - 1
    if ($exit -ne 0) {
      $script:StepResults[$idx].Status='FAIL'; $script:StepResults[$idx].ExitCode=$exit
      Append-Log ("STEP_END|$(Get-Date -Format o)|$($s.Label)|FAIL|EXIT=$exit`r`n")
      Save-Result 'FAIL' $s.Label 'TOOL039_LOCAL_NOT_PASS' $exit
      New-ResultZip 'FAIL' $s.Label $exit
      Save-Diagnostic
      exit $exit
    }
    $script:StepResults[$idx].Status='PASS'; $script:StepResults[$idx].ExitCode=0
    Append-Log ("STEP_END|$(Get-Date -Format o)|$($s.Label)|PASS`r`n")
    Save-Result 'RUNNING' $s.Label 'TOOL039_LOCAL_RUNNING' 0
  }
  $script:StepResults += [pscustomobject]@{Label='12 FINAL';Status='RUNNING';ExitCode=-1}
  Save-Result 'RUNNING' '12 FINAL' 'TOOL039_LOCAL_RUNNING' 0
  $env:TOOL039_BUILD_ALREADY_DONE='1'
  $finalExit = Invoke-Captured '12 FINAL' $Node @('scripts/run-tool-039-final-validation.mjs')
  Remove-Item Env:TOOL039_BUILD_ALREADY_DONE -ErrorAction SilentlyContinue
  $idx = $script:StepResults.Count - 1
  if ($finalExit -eq 0) {
    $script:StepResults[$idx].Status='PASS'; $script:StepResults[$idx].ExitCode=0
    Append-Log "STEP_END|$(Get-Date -Format o)|12 FINAL|PASS`r`n"
    Save-Result 'PASS' '12 FINAL' 'TOOL039_LOCAL_FINAL_PASS' 0
    New-ResultZip 'PASS' '12 FINAL' 0
  } else {
    $script:StepResults[$idx].Status='FAIL'; $script:StepResults[$idx].ExitCode=$finalExit
    Append-Log ("STEP_END|$(Get-Date -Format o)|12 FINAL|FAIL|EXIT=$finalExit`r`n")
    Save-Result 'FAIL' '12 FINAL' 'TOOL039_LOCAL_FINAL_NOT_PASS' $finalExit
    New-ResultZip 'FAIL' '12 FINAL' $finalExit
    Save-Diagnostic
    exit $finalExit
  }
}
catch {
  Append-Log ("`r`nEXCEPTION`r`n" + ($_ | Out-String))
  Save-Result 'FAIL' 'EXCEPTION' 'TOOL039_LOCAL_EXCEPTION' 1
  New-ResultZip 'FAIL' 'EXCEPTION' 1
  Save-Diagnostic
  exit 1
}
finally {
  Append-Log ("END=$(Get-Date -Format o)`r`n")
}

Write-Host ("TOOL039 LOCAL RESULT: " + (Get-Content -LiteralPath $Result -Raw))
