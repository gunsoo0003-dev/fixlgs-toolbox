$ErrorActionPreference = 'Stop'

$Root = (Get-Location).Path
$Desktop = [Environment]::GetFolderPath('Desktop')
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$OutDir = Join-Path $Desktop "TOOL035_GIT_PREDEPLOY_$Stamp"
$Txt = Join-Path $OutDir 'TOOL035_GIT_PREDEPLOY_RESULT.txt'
$Zip = Join-Path $Desktop "TOOL035_GIT_PREDEPLOY_$Stamp.zip"
$ExitCode = 1

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Add-Line([string]$Text = '') {
    Write-Host $Text
    $Text | Out-File -FilePath $Txt -Encoding utf8 -Append
}

function Run-Git([string]$Label, [string[]]$GitArgs) {
    Add-Line ("=== " + $Label + " ===")
    Add-Line ("COMMAND=git " + ($GitArgs -join ' '))

    $StdOutFile = Join-Path $OutDir ("git_stdout_" + [Guid]::NewGuid().ToString('N') + '.tmp')
    $StdErrFile = Join-Path $OutDir ("git_stderr_" + [Guid]::NewGuid().ToString('N') + '.tmp')

    try {
        # PowerShell 5.1 can promote native stderr (for example LF->CRLF warnings)
        # into a terminating NativeCommandError when ErrorActionPreference=Stop.
        # Start-Process keeps stderr separate and the real Git process exit code is authoritative.
        $Proc = Start-Process -FilePath 'git' -ArgumentList $GitArgs -NoNewWindow -Wait -PassThru `
            -RedirectStandardOutput $StdOutFile -RedirectStandardError $StdErrFile
        $Code = [int]$Proc.ExitCode

        if (Test-Path -LiteralPath $StdOutFile) {
            Get-Content -LiteralPath $StdOutFile -Encoding UTF8 -ErrorAction SilentlyContinue |
                ForEach-Object { Add-Line ([string]$_) }
        }
        if (Test-Path -LiteralPath $StdErrFile) {
            $ErrLines = @(Get-Content -LiteralPath $StdErrFile -Encoding UTF8 -ErrorAction SilentlyContinue)
            if ($ErrLines.Count -gt 0) {
                Add-Line '--- STDERR (warning/info unless EXIT_CODE is non-zero) ---'
                $ErrLines | ForEach-Object { Add-Line ([string]$_) }
            }
        }

        Add-Line ("EXIT_CODE=" + $Code)
        if ($Code -eq 0) {
            Add-Line 'COMMAND_STATUS=PASS'
        } else {
            Add-Line 'COMMAND_STATUS=FAIL'
        }
        Add-Line ''
        return $Code
    } catch {
        Add-Line ("ERROR=" + $_.Exception.Message)
        Add-Line 'EXIT_CODE=999'
        Add-Line 'COMMAND_STATUS=FAIL'
        Add-Line ''
        return 999
    } finally {
        Remove-Item -LiteralPath $StdOutFile -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $StdErrFile -Force -ErrorAction SilentlyContinue
    }
}

function Finalize-Result {
    param([int]$Code)

    Add-Line '=== FINAL SENTINEL ==='
    Add-Line ("STATUS=" + $(if ($Code -eq 0) { 'PASS_PREDEPLOY_REVIEW_REQUIRED' } else { 'FAIL_PREDEPLOY' }))
    Add-Line ("EXIT_CODE=" + $Code)
    Add-Line ("RESULT_TXT=" + $Txt)

    try {
        if (Test-Path $Zip) { Remove-Item -Force $Zip }
        Compress-Archive -Path (Join-Path $OutDir '*') -DestinationPath $Zip -Force
        Add-Line ("RESULT_ZIP=" + $Zip)
    } catch {
        Add-Line ("ZIP_CREATE_FAIL=" + $_.Exception.Message)
    }

    Add-Line 'END_OF_TOOL035_GIT_PREDEPLOY=1'
    Add-Line ''
    Add-Line ("Saved TXT: " + $Txt)
    if (Test-Path $Zip) {
        Add-Line ("Saved ZIP: " + $Zip)
    }
}

Add-Line 'FIXLGS TOOLBOX 035 - Git pre-deploy check'
Add-Line ("TIME=" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Add-Line ("ROOT=" + $Root)
Add-Line ("POWERSHELL_VERSION=" + $PSVersionTable.PSVersion.ToString())
Add-Line 'GIT_EXIT_POLICY=Only the native Git process exit code determines command PASS/FAIL; stderr warnings are logged but do not fail the command.'
Add-Line ''

try {
    if (-not (Test-Path (Join-Path $Root '.git'))) {
        Add-Line 'RESULT=FAIL'
        Add-Line 'REASON=.git directory not found. Run this script from the real Git repository root.'
        $ExitCode = 2
    } else {
        $GitCommandFailures = @()
        $GitChecks = @(
          @('git rev-parse --show-toplevel', @('rev-parse','--show-toplevel')),
          @('git branch --show-current', @('branch','--show-current')),
          @('git status --short', @('status','--short')),
          @('git diff --name-status', @('diff','--name-status')),
          @('git diff --numstat', @('diff','--numstat')),
          @('git diff --ignore-space-at-eol --name-only', @('diff','--ignore-space-at-eol','--name-only')),
          @('git diff --cached --name-status', @('diff','--cached','--name-status')),
          @('git diff --cached --numstat', @('diff','--cached','--numstat'))
        )
        foreach ($Check in $GitChecks) {
            $Code = Run-Git ([string]$Check[0]) ([string[]]$Check[1])
            if ($Code -ne 0) { $GitCommandFailures += ([string]$Check[0]) }
        }

        Add-Line '=== TOOL035 expected paths present ==='
        $Expected = @(
          'app/[locale]/pdf-text-image-extractor/page.tsx',
          'components/pdf-text-image-extractor-page.tsx',
          'components/pdf-text-image-extractor-tool.tsx',
          'components/pdf-text-image-extractor-tool.module.css',
          'lib/tool-035-pdf-extractor.ts',
          'scripts/tool-035/run-validation.mjs',
          'tests/tool-035-core.spec.ts',
          'tests/tool-035-boundary.spec.ts',
          'tests/tool-035-feature.spec.ts',
          'tests/tool-035-regression.spec.ts',
          'tests/tool-035-limit.spec.ts',
          'docs/tool-035/FINAL_PASS_035_20260816.md'
        )
        $Missing = @()
        foreach ($Rel in $Expected) {
            if (Test-Path -LiteralPath (Join-Path $Root $Rel)) {
                Add-Line ("PASS | " + $Rel)
            } else {
                Add-Line ("FAIL | " + $Rel)
                $Missing += $Rel
            }
        }
        Add-Line ''

        Add-Line '=== protected/common accidental change review ==='
        $ProtectedPatterns = @(
          '^app/globals\.css$',
          '^styles/legacy-',
          '^styles/global-base\.css$'
        )
        $Changed = @(& git status --porcelain | ForEach-Object {
            if ($_.Length -ge 4) { $_.Substring(3).Trim('"') }
        })
        $ProtectedHits = @()
        foreach ($Path in $Changed) {
            foreach ($Pattern in $ProtectedPatterns) {
                if ($Path -match $Pattern) { $ProtectedHits += $Path; break }
            }
        }
        if ($ProtectedHits.Count -eq 0) {
            Add-Line 'PASS | no protected CSS path detected in current Git changes'
        } else {
            Add-Line 'REVIEW_REQUIRED | protected/common paths changed:'
            $ProtectedHits | Sort-Object -Unique | ForEach-Object { Add-Line ("  " + $_) }
        }
        Add-Line ''

        Add-Line '=== binary fixture attribute review ==='
        $BinaryFiles = @(& git status --porcelain | ForEach-Object {
            if ($_.Length -ge 4) { $_.Substring(3).Trim('"') }
        } | Where-Object { $_ -match '\.(pdf|png|jpg|jpeg|zip)$' })
        if ($BinaryFiles.Count -eq 0) {
            Add-Line 'PASS | no changed PDF/image/ZIP binary path detected'
        } else {
            foreach ($Binary in ($BinaryFiles | Sort-Object -Unique)) {
                Add-Line ("BINARY | " + $Binary)
                (& git check-attr text diff -- "$Binary" 2>&1) | ForEach-Object { Add-Line ([string]$_) }
            }
        }
        Add-Line ''

        if ($GitCommandFailures.Count -gt 0) {
            Add-Line 'RESULT=FAIL'
            Add-Line ("GIT_COMMAND_FAILURES=" + $GitCommandFailures.Count)
            $GitCommandFailures | ForEach-Object { Add-Line ("  FAIL_GIT | " + $_) }
            if ($Missing.Count -gt 0) { Add-Line ("MISSING_EXPECTED_PATHS=" + $Missing.Count) }
            $ExitCode = 1
        } elseif ($Missing.Count -gt 0) {
            Add-Line 'RESULT=FAIL'
            Add-Line ("MISSING_EXPECTED_PATHS=" + $Missing.Count)
            $ExitCode = 1
        } else {
            Add-Line 'RESULT=PASS_PREDEPLOY_REVIEW_REQUIRED'
            Add-Line 'NOTE=No staging, commit, or push was performed.'
            Add-Line 'NEXT=Review the terminal/TXT result, then perform selective staging only for verified TOOL035 changes.'
            $ExitCode = 0
        }
    }
} catch {
    Add-Line 'RESULT=FAIL'
    Add-Line ("UNHANDLED_ERROR=" + $_.Exception.Message)
    $ExitCode = 3
} finally {
    Finalize-Result -Code $ExitCode
}

# Intentionally return control to the caller. When invoked with powershell -File,
# the caller terminal session remains open. No staging/commit/push is performed here.
if ($ExitCode -ne 0) {
    $global:LASTEXITCODE = $ExitCode
}
