# Fix Network Error - Complete Checklist

## Current Status:
- ✅ Backend deployed on Render: `https://leetracker-cxzv.onrender.com`
- ✅ Frontend deployed on Vercel
- ❌ Network Error: Frontend doesn't know where backend is

---

## 🔴 IMMEDIATE FIX REQUIRED

### Problem:
Your Vercel frontend has NO environment variable pointing to your backend.

### Solution:

#### Method 1: Vercel Dashboard (5 minutes)

1. **Go to**: https://vercel.com/dashboard
2. **Click** on your `leetracker` project
3. **Click** "Settings" (top menu)
4. **Click** "Environment Variables" (left sidebar)
5. **Click** "Add Another" button
6. **Enter**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://leetracker-cxzv.onrender.com`
   - **Environments**: Check ALL THREE ✅
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
7. **Click** "Save"
8. **Go to** "Deployments" tab
9. **Click** the "..." menu on latest deployment
10. **Click** "Redeploy"
11. **Wait** 2-3 minutes

#### Method 2: Vercel CLI (2 minutes)

```powershell
# Install Vercel CLI if needed
npm install -g vercel

# Login
vercel login

# Link project (if not linked)
cd e:\tracker
vercel link

# Add environment variable
vercel env add VITE_API_URL production
# When prompted, paste: https://leetracker-cxzv.onrender.com

# Redeploy
vercel --prod
```

---

## ✅ Verify Backend is Running

Before adding to Vercel, verify your backend works:

### Test 1: Health Check
Open in browser: https://leetracker-cxzv.onrender.com/health

**Expected**: Should show `{"status":"ok"}` or similar

### Test 2: Check Render Logs
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for:
   - ✅ `✅ MongoDB Atlas connected successfully`
   - ✅ `🚀 Server running on port 5001`
   - ❌ Any errors (fix them first)

---

## ⚠️ Common Render Issues

### Issue 1: Backend not starting
**Symptoms**: Render logs show connection errors
**Fix**: Check environment variables in Render:
- ✅ `MONGODB_URI` (NOT LOCAL_MONGODB_URI)
- ✅ `JWT_SECRET`
- ✅ `SESSION_SECRET`
- ✅ `PORT=5001`
- ✅ `NODE_ENV=production`

### Issue 2: MongoDB connection fails
**Symptoms**: "MongoNetworkError" in logs
**Fix**: 
1. Go to https://cloud.mongodb.com
2. Network Access → Verify `0.0.0.0/0` is whitelisted
3. If not, add it and wait 2 minutes

### Issue 3: "Module not found" errors
**Symptoms**: Build fails with import errors
**Fix**: Already fixed in latest commit

---

## 📋 Complete Environment Variables

### Render Backend (REQUIRED):
```env
MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=RADafFeyKYbojL3t1mzvs7pSGNPiVuI68wUEghB4
SESSION_SECRET=3RTu7QqPN5k9MzHYbnZh0KU1EOl8C6doaVLsBvwc
PORT=5001
NODE_ENV=production
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYXV0aF91c2VyX2lkIjoiMTUzNTg1MjEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjA4OWE0NzhlNDc2ZDIxYTljN2VmZjMxYmE3YTcxZDVhZTc3ODlkMmNlZTBiMzM4OTVmZmQyNDkyYjE3MzMxODgiLCJzZXNzaW9uX3V1aWQiOiI0N2JmY2Y1ZCIsImlkIjoxNTM1ODUyMSwiZW1haWwiOiJkaXZpeWFwcmFrYXNoMzJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJEaXZ5YXByYWthc2hfMTIzIiwidXNlcl9zbHVnIjoiRGl2eWFwcmFrYXNoXzEyMyIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9EaXZ5YXByYWthc2hfMTIzL2F2YXRhcl8xNzQ5NjQ3MDQwLnBuZyIsInJlZnJlc2hlZF9hdCI6MTc2NDQ5NTY2OSwiaXAiOiIyNDA5OjQwZjQ6MzA1ODo0ZDNjOjE3ODphMDI4OjM4OTc6NmM4MiIsImlkZW50aXR5IjoiM2M5ZmM3ZGRlYzliNTg4MjNjMWM5Njc1NmRiZDQ1ZDgiLCJkZXZpY2Vfd2l0aF9pcCI6WyI5YmY0MTgwMWIwNGRlZDlkZTQzZWJjNzNjNzFkOWZhZCIsIjI0MDk6NDBmNDozMDU4OjRkM2M6MTc4OmEwMjg6Mzg5Nzo2YzgyIl0sIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.qQfTy03CnflG8CmhH3S0DwboIGBdsjpk6RkMkIBrDKs
LEETCODE_CSRF_TOKEN=FJ5PdAzDRzwwLL4MxZitg7dMCGi25UC5
```

### Vercel Frontend (REQUIRED - THIS IS MISSING!):
```env
VITE_API_URL=https://leetracker-cxzv.onrender.com
```

---

## 🧪 Testing After Fix

1. **Visit**: Your Vercel URL (e.g., https://leetracker.vercel.app)
2. **Try to signup**: Enter name, username, password
3. **Expected**: No "Network Error" - account created successfully ✅
4. **If still error**: Check browser console (F12) for actual error message

---

## 🆘 Still Not Working?

### Step 1: Check Backend Health
```bash
# In PowerShell or browser
curl https://leetracker-cxzv.onrender.com/health
# Should return: {"status":"ok"}
```

### Step 2: Check Vercel Environment
```bash
vercel env ls
# Should show: VITE_API_URL
```

### Step 3: Check Browser Console
1. Open your Vercel site
2. Press F12
3. Go to "Console" tab
4. Try to signup
5. Look for the actual error (copy and share it)

---

## 📞 Quick Commands Reference

```powershell
# Check if backend is reachable
curl https://leetracker-cxzv.onrender.com/health

# Add env to Vercel
vercel env add VITE_API_URL production

# Redeploy Vercel
vercel --prod

# Check Vercel envs
vercel env ls
```

---

## ✅ Success Criteria

After completing steps above, you should:
1. ✅ See no "Network Error" on signup
2. ✅ Be able to create an account
3. ✅ Be redirected to dashboard after signup
4. ✅ See "LeetCode Stats" dashboard page

---

**CRITICAL**: The ONLY missing piece is `VITE_API_URL` in Vercel. Add it and redeploy, then everything will work! 🚀
