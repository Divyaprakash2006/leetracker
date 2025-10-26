# Start Both Servers Script
Write-Host "🚀 LeetTrack Server Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is responding
function Test-Port {
    param(
        [string]$HostName = "127.0.0.1",
        [int]$Port = 5001
    )
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect($HostName, $Port)
        $true
    }
    catch {
        $false
    }
    finally {
        $tcp.Close()
    }
}

# Start Backend Server
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd e:\tracker\backend; npm run dev" -PassThru
Write-Host "Backend PID: $($backendProcess.Id)" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "⏳ Waiting for backend to start on port 5001..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while (-not (Test-Port "127.0.0.1" 5001) -and $attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempt++
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (Test-Port "127.0.0.1" 5001) {
    Write-Host "✅ Backend Server is READY on port 5001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Server failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd e:\tracker\frontend; npm run dev" -PassThru
Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor Green
Write-Host ""

# Wait for frontend to be ready
Write-Host "⏳ Waiting for frontend to start on port 3000/3001..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$frontendReady = $false
while (-not $frontendReady -and $attempt -lt $maxAttempts) {
    $portReady3000 = Test-Port "127.0.0.1" 3000
    $portReady3001 = Test-Port "127.0.0.1" 3001
    $frontendReady = $portReady3000 -or $portReady3001
    
    if (-not $frontendReady) {
        Start-Sleep -Seconds 1
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if ($frontendReady) {
    Write-Host "✅ Frontend Server is READY on port 3000/3001" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend Server failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ ALL SERVERS ARE RUNNING!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000 or http://localhost:3001" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Backend PID: $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check if processes are still running
        if (-not (Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️  Backend process stopped!" -ForegroundColor Red
        }
        if (-not (Get-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️  Frontend process stopped!" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}
