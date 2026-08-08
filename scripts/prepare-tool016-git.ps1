$ErrorActionPreference = "Stop"

$root = (git rev-parse --show-toplevel 2>$null)
if (-not $root) {
    throw "Git repository root not found."
}

Set-Location $root

Write-Host "[1/6] Unstage current index only (working files are preserved)..."
git reset

Write-Host "[2/6] Remove generated TOOL016 Next.js validation folders..."
Remove-Item -Recurse -Force ".next-tool016-regression" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".next-tool016-runtime" -ErrorAction SilentlyContinue

Write-Host "[3/6] Remove only UNTRACKED transfer/i18n artifacts..."
# git clean never removes files already tracked by Git.
git clean -f -- docs/i18n handoff-source

Write-Host "[4/6] Stage current project while excluding transfer/build artifacts..."
git add -A -- . `
  ':(exclude)docs/i18n/**' `
  ':(exclude)handoff-source/**' `
  ':(exclude).next-tool016-regression/**' `
  ':(exclude).next-tool016-runtime/**'

Write-Host "[5/6] Ensure .gitignore is staged..."
git add .gitignore

Write-Host "[6/6] Status:"
git status

Write-Host ""
Write-Host "Done. Review 'Changes to be committed'."
Write-Host "If it contains only intended 016/source files, run:"
Write-Host 'git commit -m "Complete TOOLBOX 016 add text to image"'
Write-Host "git push origin main"
