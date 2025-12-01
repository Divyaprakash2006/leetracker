# 🚀 LeetCode Tracker - Quick Start Guide

## ✅ Current Status
Both servers are **RUNNING** and ready to use!

- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:3000 ✅
- **MongoDB**: Connected to Local MongoDB Compass ✅

## 📸 Screenshot Feature Active

The tracker now automatically captures **screenshots** of your LeetCode solution code!

## 🎯 How to Use

### Step 1: Open the Application
Open your browser and go to: **http://localhost:3000**

### Step 2: Enter Your LeetCode Username
- Type your LeetCode username in the search box
- Click the search button

### Step 3: Sync Your Submissions
1. Click the **"💾 Sync to Database"** button
2. Wait for the sync to complete (shows progress message)
3. The system will:
   - Fetch your recent 20 submissions from LeetCode
   - Capture screenshots of each solution
   - Save screenshots to `backend/uploads/screenshots/`
   - Store screenshot paths in MongoDB

### Step 4: View Your Solutions
- Click on any submission card
- See the **screenshot** of your solution code
- View problem details, difficulty, runtime, and memory usage

## 🔄 No Manual Code Pasting Needed!

The manual code paste feature has been **removed**. The tracker now works completely automatically:
- Screenshots are captured during sync
- No authentication needed for viewing
- Works for all your accepted submissions

## 📁 Where Are Screenshots Stored?

```
backend/
  └── uploads/
      └── screenshots/
          ├── 1234567890.png
          ├── 1234567891.png
          └── 1234567892.png
```

## 🛠️ If Servers Are Not Running

### Start Backend:
```powershell
cd e:\tracker\backend
npm run dev
```

### Start Frontend:
```powershell
cd e:\tracker\frontend
npm run dev
```

## ⚡ Features

### ✅ Automatic Screenshot Capture
- Screenshots are taken automatically during sync
- No manual intervention needed

### ✅ MongoDB Storage
- All data stored in local MongoDB Compass
- Fast retrieval and display

### ✅ Modern UI
- Clean, responsive design
- Difficulty badges (Easy/Medium/Hard)
- Performance metrics (Runtime/Memory)

### ✅ Auto-Sync Scheduler
- Runs daily at 2:00 AM automatically
- Keeps your tracker up to date

## 🎨 What You'll See

### Submissions Page
```
┌─────────────────────────────────────────┐
│  🔍 Search: your_username               │
├─────────────────────────────────────────┤
│  💾 Sync to Database     [Syncing...]   │
├─────────────────────────────────────────┤
│  ✅ Two Sum                    [Easy]    │
│     python3 • 45 ms • 14.2 MB          │
├─────────────────────────────────────────┤
│  ✅ Add Two Numbers          [Medium]    │
│     java • 2 ms • 44.1 MB              │
└─────────────────────────────────────────┘
```

### Submission Viewer Page
```
┌─────────────────────────────────────────┐
│  ← Back                                  │
│  Two Sum                                 │
│  Submitted by username • 18 hours ago   │
├─────────────────────────────────────────┤
│  Submitted Code: 18 hours ago           │
│  Language: python3                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │  [SCREENSHOT OF SOLUTION CODE]    │ │
│  │  class Solution:                  │ │
│  │      def twoSum(self, ...):       │ │
│  │          # your code here         │ │
│  └───────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Performance                            │
│  Runtime: 45 ms    Memory: 14.2 MB     │
└─────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Screenshot Not Showing?
1. Make sure you clicked "Sync to Database" first
2. Check the backend logs for any errors
3. Verify screenshots exist in `backend/uploads/screenshots/`

### Sync Failed?
- Check your internet connection
- Verify the LeetCode username is correct
- Check backend terminal for error messages

### MongoDB Connection Issues?
- Ensure MongoDB Compass is installed and running
- Verify MongoDB service is started (check Task Manager or `mongod` process)
- Check `backend/.env` has correct LOCAL_MONGODB_URI
- Look for connection errors in backend logs

## 📊 Sync Information

### What Gets Synced:
- ✅ Recent 20 accepted submissions
- ✅ Problem name and difficulty
- ✅ Programming language used
- ✅ Runtime and memory usage
- ✅ Screenshot of solution code
- ✅ Submission timestamp

### What Doesn't Get Synced:
- ❌ Failed/rejected submissions
- ❌ Private contest submissions (may require auth)
- ❌ Submissions older than recent 20

### Sync Frequency:
- **Manual**: Click "Sync to Database" anytime
- **Automatic**: Daily at 2:00 AM

## 🎉 You're All Set!

The tracker is **fully operational** and ready to capture your LeetCode journey!

### Next Steps:
1. Open http://localhost:3000
2. Enter your LeetCode username
3. Click "Sync to Database"
4. View your submissions with screenshots

---

**Need Help?** Check `SCREENSHOT_FEATURE.md` for detailed technical documentation.

**Last Updated**: October 26, 2025
