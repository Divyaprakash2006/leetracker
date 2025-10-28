# Port Conflict - Permanent Fix

## Problem
Backend server was failing with `EADDRINUSE` error on port 5001.

## Solution Implemented

### 1. Auto Port Cleanup Script
Created `backend/kill-port.js` that automatically kills any process using port 5001 before starting the server.

### 2. Updated Package.json Scripts
```json
{
  "scripts": {
    "predev": "node kill-port.js 5001",  // Runs automatically before dev
    "dev": "tsx watch src/index.ts",
    "start": "node kill-port.js 5001 && tsx src/index.ts",
    "kill-port": "node kill-port.js"  // Manual port cleanup
  }
}
```

### 3. Updated PowerShell Start Script
Modified `start-all.ps1` to check and kill port 5001 before starting backend.

## Usage

### Start Both Servers (Recommended)
```powershell
.\start-all.ps1
```

### Start Backend Only
```powershell
cd backend
npm run dev
```
The `predev` script will automatically clean port 5001.

### Manual Port Cleanup
```powershell
cd backend
npm run kill-port 5001
```

## How It Works

1. **Automatic**: When you run `npm run dev`, the `predev` hook runs first
2. **Port Check**: Script checks if port 5001 is in use
3. **Process Kill**: If found, kills the process using that port
4. **Server Start**: Backend starts on clean port 5001

## Benefits

✅ No more manual port cleanup needed  
✅ Works every time you start the server  
✅ Prevents EADDRINUSE errors  
✅ Safe - only kills processes on specified port  

## Status

✅ **Backend**: Running on http://localhost:5001  
✅ **Frontend**: Running on http://localhost:3003  
✅ **Port Conflict**: Permanently resolved
