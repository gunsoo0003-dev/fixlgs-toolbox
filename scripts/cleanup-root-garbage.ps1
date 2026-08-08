$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

Write-Host "`n=== FIXLGS root cleanup ===" -ForegroundColor Cyan

function Test-SuspiciousRootName([string]$Name) {
    if ([string]::IsNullOrWhiteSpace($Name)) { return $false }

    foreach ($ch in $Name.ToCharArray()) {
        $code = [int][char]$ch

        # Control characters.
        if (($code -lt 32) -or ($code -eq 127)) { return $true }

        # Latin-1 supplement often seen in mojibake.
        if (($code -ge 0x00C0) -and ($code -le 0x00FF)) { return $true }

        # Greek/Coptic characters observed in corrupted ZIP names.
        if (($code -ge 0x0370) -and ($code -le 0x03FF)) { return $true }

        # Box drawing characters are a strong corruption signal in filenames.
        if (($code -ge 0x2500) -and ($code -le 0x257F)) { return $true }

        # Unicode replacement character.
        if ($code -eq 0xFFFD) { return $true }
    }

    return $false
}

$protectedRootNames = @(
    '.git', '.github', '.vscode',
    'app', 'components', 'docs', 'icons', 'lib', 'public', 'scripts', 'styles',
    'test-fixtures', 'tests', 'node_modules'
)

$removed = @()

Get-ChildItem -Force -LiteralPath $projectRoot | ForEach-Object {
    $item = $_

    if ($protectedRootNames -contains $item.Name) { return }
    if (-not (Test-SuspiciousRootName $item.Name)) { return }

    $relative = $item.Name
    Write-Host "Suspicious root item: $relative" -ForegroundColor Yellow

    $tracked = @(& git ls-files -- $relative 2>$null)
    if ($LASTEXITCODE -ne 0) {
        throw "git ls-files failed while checking: $relative"
    }

    if ($tracked.Count -gt 0) {
        Write-Host "  -> tracked: git rm" -ForegroundColor Magenta
        & git rm -r -f -- $relative
        if ($LASTEXITCODE -ne 0) {
            throw "git rm failed: $relative"
        }
    }
    else {
        Write-Host "  -> untracked: remove from disk" -ForegroundColor DarkYellow
        Remove-Item -LiteralPath $item.FullName -Recurse -Force
    }

    $removed += $relative
}

Write-Host "`n=== Temporary validation artifacts ===" -ForegroundColor Cyan

$tempNames = @('.next', 'test-results', 'playwright-report')
foreach ($name in $tempNames) {
    $path = Join-Path $projectRoot $name
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force
        Write-Host "Removed temp: $name"
    }
}

Get-ChildItem -Force -LiteralPath $projectRoot -Directory | Where-Object {
    ($_.Name -like '.next-tool*-runtime') -or ($_.Name -like '.next-tool*-regression')
} | ForEach-Object {
    Remove-Item -LiteralPath $_.FullName -Recurse -Force
    Write-Host "Removed temp: $($_.Name)"
}

Write-Host "`n=== Cleanup result ===" -ForegroundColor Cyan
if ($removed.Count -eq 0) {
    Write-Host "No suspicious root names found." -ForegroundColor Green
}
else {
    Write-Host ("Removed suspicious root items: " + ($removed -join ', ')) -ForegroundColor Green
}

Write-Host "`n=== Remaining suspicious root names ===" -ForegroundColor Cyan
$remaining = @(Get-ChildItem -Force -LiteralPath $projectRoot | Where-Object {
    (-not ($protectedRootNames -contains $_.Name)) -and (Test-SuspiciousRootName $_.Name)
})

if ($remaining.Count -eq 0) {
    Write-Host "0 found" -ForegroundColor Green
}
else {
    $remaining | Select-Object Name | Format-Table -AutoSize
    throw "Suspicious root names still remain."
}

Write-Host "`n=== git status --short ===" -ForegroundColor Cyan
& git status --short
