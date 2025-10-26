# Start both Backend and Frontend servers for LeetCode Tracker

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  LeetCode Tracker - Full Stack Server" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "[1/2] Starting Backend Server on Port 5001..." -ForegroundColor Yellow
    $backendPath = "e:\tracker\backend"
    Push-Location $backendPath
    
    # Set PORT and run npm dev
    $env:PORT = "5001"
    npm run dev
}

# Function to start frontend
function Start-Frontend {
    Write-Host "[2/2] Starting Frontend Server on Port 3000..." -ForegroundColor Yellow
    $frontendPath = "e:\tracker\frontend"
    Push-Location $frontendPath
    npm run dev
}

# Run backend in background
Write-Host "Starting services..." -ForegroundColor Green

# Create jobs for both servers
$backendJob = Start-Job -ScriptBlock {
    Set-Location "e:\tracker\backend"
    $env:PORT = "5001"
    & npm run dev
}

# Wait for backend to initialize
Start-Sleep -Seconds 3

$frontendJob = Start-Job -ScriptBlock {
    Set-Location "e:\tracker\frontend"
    & npm run dev
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  ✅ Servers Starting..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Wait for jobs to complete
Wait-Job -Job $backendJob, $frontendJob
