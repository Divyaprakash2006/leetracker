@echo off
REM Start LeetCode Tracker - Both Frontend and Backend
echo.
echo ===============================================
echo    LeetCode Tracker - Full Stack Server
echo ===============================================
echo.

REM Start Backend on Port 5001
echo [1/2] Starting Backend Server on Port 5001...
start cmd /k "cd /d e:\tracker\backend && set PORT=5001 && npm run dev"

REM Wait for backend to initialize
timeout /t 3 /nobreak

REM Start Frontend on Port 3000
echo [2/2] Starting Frontend Server on Port 3000...
start cmd /k "cd /d e:\tracker\frontend && npm run dev"

echo.
echo ===============================================
echo    Servers Starting...
echo ===============================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press CTRL+C in each window to stop the servers
echo ===============================================
echo.