$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$Desktop = [Environment]::GetFolderPath('Desktop')
$OutDir = Join-Path $Desktop ("TOOL035_POSTFINAL_CLEANUP_" + $Stamp)
$Txt = Join-Path $OutDir 'TOOL035_POSTFINAL_CLEANUP_RESULT.txt'
$Zip = $OutDir + '.zip'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Add-Line([string]$Text = '') {
    Write-Host $Text
    $Text | Out-File -LiteralPath $Txt -Encoding utf8 -Append
}

function Run-Git([string[]]$GitArgs) {
    $TmpOut = Join-Path $env:TEMP ("tool035_git_out_" + [guid]::NewGuid().ToString('N') + '.txt')
    $TmpErr = Join-Path $env:TEMP ("tool035_git_err_" + [guid]::NewGuid().ToString('N') + '.txt')
    try {
        Add-Line ("COMMAND=git " + ($GitArgs -join ' '))
        $p = Start-Process -FilePath 'git' -ArgumentList $GitArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $TmpOut -RedirectStandardError $TmpErr
        if (Test-Path -LiteralPath $TmpOut) {
            Get-Content -LiteralPath $TmpOut | ForEach-Object { Add-Line $_ }
        }
        if (Test-Path -LiteralPath $TmpErr) {
            Get-Content -LiteralPath $TmpErr | ForEach-Object { Add-Line ("STDERR: " + $_) }
        }
        Add-Line ("EXIT_CODE=" + $p.ExitCode)
        return $p.ExitCode
    } catch {
        Add-Line ("GIT_EXCEPTION=" + $_.Exception.Message)
        return 999
    } finally {
        Remove-Item -LiteralPath $TmpOut,$TmpErr -Force -ErrorAction SilentlyContinue
    }
}

Add-Line '=== TOOL035 POST-FINAL CLEANUP ==='
Add-Line ("START=" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Add-Line ("PWD=" + (Get-Location).Path)
Add-Line ''

$RootOut = Join-Path $env:TEMP ("tool035_root_" + [guid]::NewGuid().ToString('N') + '.txt')
$RootErr = Join-Path $env:TEMP ("tool035_root_err_" + [guid]::NewGuid().ToString('N') + '.txt')
try {
    $rp = Start-Process -FilePath 'git' -ArgumentList @('rev-parse','--show-toplevel') -NoNewWindow -Wait -PassThru -RedirectStandardOutput $RootOut -RedirectStandardError $RootErr
    if ($rp.ExitCode -ne 0) { throw 'Not inside a Git worktree.' }
    $RepoRoot = (Get-Content -LiteralPath $RootOut -Raw).Trim()
} catch {
    Add-Line ("FATAL=" + $_.Exception.Message)
    Add-Line 'STATUS=FAIL_NOT_GIT_REPOSITORY'
    try { Compress-Archive -LiteralPath $Txt -DestinationPath $Zip -Force } catch {}
    Add-Line ("RESULT_TXT=" + $Txt)
    Add-Line ("RESULT_ZIP=" + $Zip)
    exit 2
} finally {
    Remove-Item -LiteralPath $RootOut,$RootErr -Force -ErrorAction SilentlyContinue
}

Set-Location -LiteralPath $RepoRoot
Add-Line ("REPO_ROOT=" + $RepoRoot)
Add-Line ''

# 1) FINAL 직후 ZIP 존재 여부는 제품 정리와 별도 게이트이므로 여기서는 Git 작업트리의 재생성 산출물만 정리한다.
$GeneratedDirs = @('.next','node_modules','test-results','playwright-report','coverage','.turbo','out')
$Removed = 0
$SkippedProtected = 0

Add-Line '--- GENERATED DIRECTORY CLEANUP ---'
foreach ($Rel in $GeneratedDirs) {
    $Full = Join-Path $RepoRoot $Rel
    if (-not (Test-Path -LiteralPath $Full)) {
        Add-Line ("ABSENT=" + $Rel)
        continue
    }

    $TrackedTmp = Join-Path $env:TEMP ("tool035_tracked_" + [guid]::NewGuid().ToString('N') + '.txt')
    try {
        $tp = Start-Process -FilePath 'git' -ArgumentList @('ls-files','--',$Rel) -NoNewWindow -Wait -PassThru -RedirectStandardOutput $TrackedTmp
        $TrackedLines = @()
        if (Test-Path -LiteralPath $TrackedTmp) { $TrackedLines = @(Get-Content -LiteralPath $TrackedTmp) }
        if ($tp.ExitCode -ne 0) {
            Add-Line ("SKIP_GIT_CHECK_FAIL=" + $Rel)
            $SkippedProtected++
            continue
        }
        if ($TrackedLines.Count -gt 0) {
            Add-Line ("SKIP_TRACKED_PROTECTED=" + $Rel + " tracked=" + $TrackedLines.Count)
            $SkippedProtected++
            continue
        }
        Remove-Item -LiteralPath $Full -Recurse -Force -ErrorAction Stop
        Add-Line ("REMOVED_GENERATED=" + $Rel)
        $Removed++
    } catch {
        Add-Line ("REMOVE_FAIL=" + $Rel + " :: " + $_.Exception.Message)
        $SkippedProtected++
    } finally {
        Remove-Item -LiteralPath $TrackedTmp -Force -ErrorAction SilentlyContinue
    }
}
Add-Line ("REMOVED_COUNT=" + $Removed)
Add-Line ("SKIPPED_OR_FAILED_COUNT=" + $SkippedProtected)
Add-Line ''

# 2) 추적 파일 삭제(D) 여부는 배포 금지 게이트.
Add-Line '--- TRACKED DELETE GATE ---'
$StatusTmp = Join-Path $env:TEMP ("tool035_status_" + [guid]::NewGuid().ToString('N') + '.txt')
$StatusErr = Join-Path $env:TEMP ("tool035_status_err_" + [guid]::NewGuid().ToString('N') + '.txt')
$TrackedDelete = @()
try {
    $sp = Start-Process -FilePath 'git' -ArgumentList @('status','--short','--untracked-files=no') -NoNewWindow -Wait -PassThru -RedirectStandardOutput $StatusTmp -RedirectStandardError $StatusErr
    if (Test-Path -LiteralPath $StatusTmp) {
        $StatusLines = @(Get-Content -LiteralPath $StatusTmp)
        $StatusLines | ForEach-Object { Add-Line $_ }
        $TrackedDelete = @($StatusLines | Where-Object { $_ -match '^.D\s|^D.\s|^DD\s' })
    }
    if (Test-Path -LiteralPath $StatusErr) { Get-Content -LiteralPath $StatusErr | ForEach-Object { Add-Line ("STDERR: " + $_) } }
    Add-Line ("EXIT_CODE=" + $sp.ExitCode)
} catch {
    Add-Line ("STATUS_EXCEPTION=" + $_.Exception.Message)
    $TrackedDelete = @('CHECK_FAILED')
} finally {
    Remove-Item -LiteralPath $StatusTmp,$StatusErr -Force -ErrorAction SilentlyContinue
}
Add-Line ("TRACKED_DELETE_COUNT=" + $TrackedDelete.Count)
if ($TrackedDelete.Count -gt 0) {
    Add-Line 'GATE=STOP_TRACKED_DELETE_FOUND'
} else {
    Add-Line 'GATE=PASS_NO_TRACKED_DELETE'
}
Add-Line ''

# 3) 정리 후 untracked 목록은 삭제하지 않고 보고만 한다. 현재 TOOL과 무관한 파일을 자동 삭제하지 않는다.
Add-Line '--- UNTRACKED REVIEW (REPORT ONLY) ---'
$uCode = Run-Git @('status','--short','--untracked-files=all')
Add-Line ''

$FinalStatus = 'PASS_READY_FOR_GIT_GATE'
$ExitCode = 0
if ($TrackedDelete.Count -gt 0 -or $SkippedProtected -gt 0 -or $uCode -ne 0) {
    $FinalStatus = 'REVIEW_REQUIRED_BEFORE_GIT_GATE'
    $ExitCode = 1
}

Add-Line ("STATUS=" + $FinalStatus)
Add-Line ("END=" + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Add-Line ("RESULT_TXT=" + $Txt)

try {
    if (Test-Path -LiteralPath $Zip) { Remove-Item -LiteralPath $Zip -Force }
    Compress-Archive -LiteralPath $Txt -DestinationPath $Zip -Force
    Add-Line ("RESULT_ZIP=" + $Zip)
} catch {
    Add-Line ("ZIP_ERROR=" + $_.Exception.Message)
}
Add-Line '=== END TOOL035 POST-FINAL CLEANUP ==='
exit $ExitCode
