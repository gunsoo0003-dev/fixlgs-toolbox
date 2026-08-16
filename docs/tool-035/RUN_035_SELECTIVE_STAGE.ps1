$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$Start = Get-Date
$Stamp = $Start.ToString('yyyyMMdd_HHmmss')
$Desktop = [Environment]::GetFolderPath('Desktop')
$ResultDir = Join-Path $Desktop ("TOOL035_SELECTIVE_STAGE_" + $Stamp)
$ResultTxt = Join-Path $ResultDir 'TOOL035_SELECTIVE_STAGE_RESULT.txt'
$ResultZip = $ResultDir + '.zip'
New-Item -ItemType Directory -Force -Path $ResultDir | Out-Null

function Add-Line([string]$Text = '') {
    Write-Host $Text
    Add-Content -LiteralPath $ResultTxt -Value $Text -Encoding UTF8
}

function Run-Git {
    param(
        [Parameter(Mandatory=$true)][string]$Label,
        [Parameter(Mandatory=$true)][string[]]$GitArgs
    )
    Add-Line ''
    Add-Line ("=== " + $Label + " ===")
    Add-Line ("COMMAND=git " + ($GitArgs -join ' '))
    $Stdout = Join-Path $ResultDir ('stdout_' + [Guid]::NewGuid().ToString('N') + '.txt')
    $Stderr = Join-Path $ResultDir ('stderr_' + [Guid]::NewGuid().ToString('N') + '.txt')
    try {
        $p = Start-Process -FilePath 'git.exe' -ArgumentList $GitArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $Stdout -RedirectStandardError $Stderr
        if (Test-Path -LiteralPath $Stdout) {
            Get-Content -LiteralPath $Stdout -ErrorAction SilentlyContinue | ForEach-Object { Add-Line $_ }
        }
        if (Test-Path -LiteralPath $Stderr) {
            $errLines = @(Get-Content -LiteralPath $Stderr -ErrorAction SilentlyContinue)
            if ($errLines.Count -gt 0) {
                Add-Line '--- STDERR (warning/info unless EXIT_CODE is non-zero) ---'
                $errLines | ForEach-Object { Add-Line $_ }
            }
        }
        Add-Line ("EXIT_CODE=" + $p.ExitCode)
        if ($p.ExitCode -eq 0) { Add-Line 'COMMAND_STATUS=PASS' } else { Add-Line 'COMMAND_STATUS=FAIL' }
        return $p.ExitCode
    }
    catch {
        Add-Line ('RUN_GIT_EXCEPTION=' + $_.Exception.Message)
        Add-Line 'EXIT_CODE=999'
        Add-Line 'COMMAND_STATUS=FAIL'
        return 999
    }
    finally {
        Remove-Item -LiteralPath $Stdout,$Stderr -Force -ErrorAction SilentlyContinue
    }
}

function Get-GitLines([string[]]$GitArgs) {
    $out = & git.exe @GitArgs 2>$null
    if ($LASTEXITCODE -ne 0) { throw "git failed: $($GitArgs -join ' ')" }
    return @($out)
}

Add-Line '=== FIXLGS TOOLBOX 035 - SELECTIVE STAGING ==='
Add-Line ('START=' + $Start.ToString('yyyy-MM-dd HH:mm:ss'))
Add-Line ('PWD=' + (Get-Location).Path)
Add-Line 'POLICY=TOOL035_ONLY / NO git add . / NO COMMIT / NO PUSH'

$Root = (& git.exe rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $Root) {
    Add-Line 'STATUS=FAIL_NOT_GIT_REPOSITORY'
    Add-Line ('RESULT_TXT=' + $ResultTxt)
    Compress-Archive -LiteralPath $ResultDir -DestinationPath $ResultZip -Force -ErrorAction SilentlyContinue
    Add-Line ('RESULT_ZIP=' + $ResultZip)
    exit 2
}
Set-Location -LiteralPath $Root
Add-Line ('REPO_ROOT=' + $Root)

# Safety gate: preserve any pre-existing staging.
$ExistingStaged = @(Get-GitLines @('diff','--cached','--name-only'))
if ($ExistingStaged.Count -gt 0) {
    Add-Line ''
    Add-Line 'STATUS=ABORT_EXISTING_STAGED_CHANGES'
    Add-Line 'Reason: Existing staged changes detected. Nothing was modified.'
    $ExistingStaged | ForEach-Object { Add-Line ('EXISTING_STAGED=' + $_) }
    Add-Line ('RESULT_TXT=' + $ResultTxt)
    Compress-Archive -LiteralPath $ResultDir -DestinationPath $ResultZip -Force -ErrorAction SilentlyContinue
    Add-Line ('RESULT_ZIP=' + $ResultZip)
    exit 3
}

# Exact/common content changes verified as TOOL035 integration.
$ExactPaths = @(
    'app/sitemap.ts',
    'lib/site.ts',
    'package.json',
    'components/pdf-text-image-extractor-page.tsx',
    'components/pdf-text-image-extractor-tool.module.css',
    'components/pdf-text-image-extractor-tool.tsx',
    'lib/tool-035-pdf-extractor.ts',
    'scripts/check-mobile-real-photo-001-035-validator.mjs',
    'scripts/run-mobile-real-photo-001-035.mjs'
)

# TOOL035-only directories/patterns.
$LiteralDirs = @(
    'app/[locale]/pdf-text-image-extractor',
    'docs/tool-035',
    'scripts/tool-035',
    'test-fixtures/tool-035'
)

$TestSpecs = @(
    'tests/tool-035-preflight.spec.ts',
    'tests/tool-035-core.spec.ts',
    'tests/tool-035-boundary.spec.ts',
    'tests/tool-035-feature.spec.ts',
    'tests/tool-035-regression.spec.ts',
    'tests/tool-035-limit.spec.ts'
)

$StageFailures = New-Object System.Collections.Generic.List[string]

Add-Line ''
Add-Line '--- SELECTIVE STAGING TARGETS ---'
foreach ($p in ($ExactPaths + $TestSpecs)) {
    if (Test-Path -LiteralPath $p) {
        Add-Line ('STAGE_EXACT=' + $p)
        & git.exe --literal-pathspecs add -- $p
        if ($LASTEXITCODE -ne 0) { $StageFailures.Add($p) }
    } else {
        Add-Line ('MISSING_EXACT=' + $p)
        $StageFailures.Add($p)
    }
}
foreach ($p in $LiteralDirs) {
    if (Test-Path -LiteralPath $p) {
        Add-Line ('STAGE_DIR=' + $p)
        & git.exe --literal-pathspecs add -- $p
        if ($LASTEXITCODE -ne 0) { $StageFailures.Add($p) }
    } else {
        Add-Line ('MISSING_DIR=' + $p)
        $StageFailures.Add($p)
    }
}

# Never stage top-level temporary TOOL035 notes; they remain untracked unless intentionally moved under docs/tool-035.
Add-Line ''
Add-Line 'EXCLUDED_BY_POLICY=top-level TOOL035_*.md / TOOL035_*.txt work notes'
Add-Line 'EXCLUDED_BY_POLICY=docs/MOBILE_REALPHOTO_001_025_SOURCE_AUDIT.json'
Add-Line 'EXCLUDED_BY_POLICY=app/globals.css and protected shared CSS'

$exit1 = Run-Git -Label 'git diff --cached --name-status' -GitArgs @('diff','--cached','--name-status')
$exit2 = Run-Git -Label 'git diff --cached --numstat' -GitArgs @('diff','--cached','--numstat')

$Staged = @(Get-GitLines @('diff','--cached','--name-only'))

function Is-AllowedStagedPath([string]$Path) {
    if ($ExactPaths -contains $Path) { return $true }
    if ($TestSpecs -contains $Path) { return $true }
    if ($Path.StartsWith('app/[locale]/pdf-text-image-extractor/')) { return $true }
    if ($Path.StartsWith('docs/tool-035/')) { return $true }
    if ($Path.StartsWith('scripts/tool-035/')) { return $true }
    if ($Path.StartsWith('test-fixtures/tool-035/')) { return $true }
    return $false
}

$Violations = New-Object System.Collections.Generic.List[string]
Add-Line ''
Add-Line '--- STAGED ALLOWLIST GATE ---'
foreach ($p in $Staged) {
    if (Is-AllowedStagedPath $p) {
        Add-Line ('ALLOW=' + $p)
    } else {
        Add-Line ('VIOLATION=' + $p)
        $Violations.Add($p)
    }
}

$Protected = @(
    'app/globals.css',
    'styles/global-base.css',
    'styles/legacy-site-sealed.css',
    'styles/legacy-tools-sealed.css'
)
Add-Line ''
Add-Line '--- PROTECTED PATH STAGING GATE ---'
foreach ($p in $Protected) {
    if ($Staged -contains $p) {
        Add-Line ('FAIL_PROTECTED_STAGED=' + $p)
        $Violations.Add($p)
    } else {
        Add-Line ('PASS_NOT_STAGED=' + $p)
    }
}

Add-Line ''
Add-Line '--- REQUIRED TOOL035 STAGED GATE ---'
$Required = @(
    'app/[locale]/pdf-text-image-extractor/page.tsx',
    'components/pdf-text-image-extractor-page.tsx',
    'components/pdf-text-image-extractor-tool.tsx',
    'components/pdf-text-image-extractor-tool.module.css',
    'lib/tool-035-pdf-extractor.ts',
    'scripts/tool-035/run-validation.mjs',
    'tests/tool-035-core.spec.ts',
    'tests/tool-035-feature.spec.ts',
    'docs/tool-035/FINAL_PASS_035_20260816.md',
    'app/sitemap.ts',
    'lib/site.ts',
    'package.json'
)
foreach ($p in $Required) {
    if ($Staged -contains $p) { Add-Line ('PASS_STAGED=' + $p) }
    else { Add-Line ('FAIL_NOT_STAGED=' + $p); $Violations.Add($p) }
}

# Binary fixture attribute protection review on staged PDF/JPG/PNG/ZIP files.
Add-Line ''
Add-Line '--- STAGED BINARY ATTRIBUTE REVIEW ---'
$Binary = @($Staged | Where-Object { $_ -match '\.(pdf|png|jpe?g|zip)$' })
foreach ($p in $Binary) {
    Add-Line ('BINARY=' + $p)
    & git.exe check-attr text diff -- $p 2>&1 | ForEach-Object { Add-Line $_ }
}

# Ensure no staged deletion.
Add-Line ''
Add-Line '--- STAGED DELETE GATE ---'
$CachedStatus = @(Get-GitLines @('diff','--cached','--name-status'))
$Deletes = @($CachedStatus | Where-Object { $_ -match '^D\s' })
if ($Deletes.Count -gt 0) {
    foreach ($d in $Deletes) { Add-Line ('FAIL_STAGED_DELETE=' + $d); $Violations.Add($d) }
} else {
    Add-Line 'PASS_NO_STAGED_DELETES'
}

$Status = 'PASS_READY_FOR_COMMIT'
$ExitCode = 0
if ($StageFailures.Count -gt 0 -or $Violations.Count -gt 0 -or $exit1 -ne 0 -or $exit2 -ne 0) {
    $Status = 'FAIL_STAGING_REVIEW_REQUIRED'
    $ExitCode = 4
}

Add-Line ''
Add-Line ('STAGE_FAILURE_COUNT=' + $StageFailures.Count)
Add-Line ('VIOLATION_COUNT=' + $Violations.Count)
Add-Line ('STAGED_FILE_COUNT=' + $Staged.Count)
Add-Line ('STATUS=' + $Status)
Add-Line ('EXIT_CODE=' + $ExitCode)
Add-Line ('END=' + (Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))
Add-Line ('RESULT_TXT=' + $ResultTxt)

try {
    if (Test-Path -LiteralPath $ResultZip) { Remove-Item -LiteralPath $ResultZip -Force }
    Compress-Archive -LiteralPath $ResultDir -DestinationPath $ResultZip -Force
    Add-Line ('RESULT_ZIP=' + $ResultZip)
} catch {
    Add-Line ('RESULT_ZIP_ERROR=' + $_.Exception.Message)
}
Add-Line '=== END TOOL035 SELECTIVE STAGING ==='
exit $ExitCode
