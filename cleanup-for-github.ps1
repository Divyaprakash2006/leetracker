# Cleanup script for GitHub push
# Run this before pushing to GitHub

Write-Host "Starting cleanup for GitHub push..." -ForegroundColor Cyan
Write-Host ""

# Remove development/test files
$filesToRemove = @(
    "backend\clearUsers.js",
    "check_and_create_user.html",
    "create_test_user.js",
    "DEV_USER_MANAGEMENT.html",
    "frontend\office-desk-workspace-bright-color-yellow-background.jpg"
)

Write-Host "Removing unnecessary files..." -ForegroundColor Yellow
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "   Removed: $file" -ForegroundColor Green
    } else {
        Write-Host "   Skipped (not found): $file" -ForegroundColor Gray
    }
}

# Check .env files
Write-Host ""
Write-Host "Checking for .env files..." -ForegroundColor Yellow

$envFiles = @(
    "backend\.env",
    "frontend\.env.development"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "   Found: $envFile (should be in .gitignore)" -ForegroundColor Yellow
        Write-Host "   Keeping file locally but ensuring .gitignore covers it" -ForegroundColor Gray
    }
}

# Check .env.example
Write-Host ""
Write-Host "Checking example environment files..." -ForegroundColor Yellow

if (Test-Path "backend\.env.example") {
    Write-Host "   backend\.env.example exists" -ForegroundColor Green
} else {
    Write-Host "   backend\.env.example missing" -ForegroundColor Red
}

# Check node_modules
Write-Host ""
Write-Host "Checking node_modules..." -ForegroundColor Yellow

$nodeModulesPaths = @("node_modules", "backend\node_modules", "frontend\node_modules")
foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   $path : $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    }
}

Write-Host "   node_modules are in .gitignore" -ForegroundColor Gray

# Check dist folders
Write-Host ""
Write-Host "Checking build outputs..." -ForegroundColor Yellow

$distPaths = @("frontend\dist", "backend\dist")
foreach ($path in $distPaths) {
    if (Test-Path $path) {
        Write-Host "   Found: $path (will be ignored)" -ForegroundColor Cyan
    }
}

# Documentation files
Write-Host ""
Write-Host "Documentation files in root:" -ForegroundColor Yellow

$mdFiles = Get-ChildItem -Path . -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
Write-Host "   Found $($mdFiles.Count) documentation files" -ForegroundColor Cyan

$mdFiles | ForEach-Object {
    Write-Host "   $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "   Consider organizing these into a docs folder" -ForegroundColor Gray

# Git status
Write-Host ""
Write-Host "Git Status:" -ForegroundColor Yellow

if (Test-Path .git) {
    Write-Host "   Git repository initialized" -ForegroundColor Green
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "   You have uncommitted changes:" -ForegroundColor Yellow
        git status --short
    } else {
        Write-Host "   Working tree clean" -ForegroundColor Green
    }
} else {
    Write-Host "   Not a git repository" -ForegroundColor Red
}

# Final recommendations
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "BEFORE PUSHING TO GITHUB:" -ForegroundColor Yellow
Write-Host "   1. Review .gitignore (updated)" -ForegroundColor White
Write-Host "   2. Ensure .env files are NOT committed" -ForegroundColor White
Write-Host "   3. Consider organizing MD files" -ForegroundColor White
Write-Host "   4. Verify backend/.env.example exists" -ForegroundColor White
Write-Host ""
Write-Host "Ready to push commands:" -ForegroundColor Green
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m `"Clean up project for GitHub`"" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
