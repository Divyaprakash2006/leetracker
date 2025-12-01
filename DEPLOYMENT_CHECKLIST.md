# Render Backend Deployment Checklist

## ✅ Current Status (Based on Screenshot)

### Environment Variables Set:
- ✅ LOCAL_MONGODB_URI (verify full string is there)
- ✅ PORT = 5001
- ✅ NODE_ENV = production
- ⚠️ JWT_SECRET = needs update (currently placeholder)
- ⚠️ SESSION_SECRET = needs update (currently placeholder)
- ✅ LEETCODE_API_URL = https://leetcode.com/graphql
- ✅ LEETCODE_SESSION (set)
- ✅ LEETCODE_CSRF_TOKEN (set)
- ❓ EXAMPLE_NAME = I9JU23NF394R6HH (can be removed, not used)

---

## 🔧 Required Fixes

### 1. Update JWT_SECRET
**Current Value**: `your-super-secret-jwt-key-change-in-pr...`
**New Value** (use this):
```
RADafFeyKYbojL3t1mzvs7pSGNPiVuI68wUEghB4
```

**Steps**:
1. In Render dashboard, find `JWT_SECRET` row
2. Click the value field
3. Replace with: `RADafFeyKYbojL3t1mzvs7pSGNPiVuI68wUEghB4`
4. Save

### 2. Update SESSION_SECRET
**Current Value**: `your-session-secret-change-in-producti...`
**New Value** (use this):
```
3RTu7QqPN5k9MzHYbnZh0KU1EOl8C6doaVLsBvwc
```

**Steps**:
1. In Render dashboard, find `SESSION_SECRET` row
2. Click the value field
3. Replace with: `3RTu7QqPN5k9MzHYbnZh0KU1EOl8C6doaVLsBvwc`
4. Save

### 3. Verify LOCAL_MONGODB_URI (IMPORTANT!)
The value appears cut off in screenshot. Make sure it's the COMPLETE string:

```
mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
```

**Steps**:
1. Click on `LOCAL_MONGODB_URI` value field
2. Scroll right to see full value
3. If it's truncated, update with full string above
4. Save

### 4. Remove EXAMPLE_NAME (Optional)
This variable is not used by your app.

**Steps**:
1. Find `EXAMPLE_NAME` row
2. Click the trash/delete icon (-)
3. Confirm deletion

---

## 🗄️ MongoDB Atlas Network Access

Before clicking "Deploy", verify MongoDB Atlas is configured:

### Steps:
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click **"Network Access"** (left sidebar)
4. Verify you see an entry:
   - IP Address: `0.0.0.0/0` (Allow from Anywhere)
   - Status: Active (green)
5. If not present:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Confirm

---

## 🚀 Deploy Backend

After fixing the above:

1. Click **"Deploy"** button (at bottom of Render page)
2. Wait 5-10 minutes for build and deployment
3. Check "Logs" tab for:
   - ✅ `✅ MongoDB Connected Successfully`
   - ✅ Server starting messages
   - ✅ No errors
4. Once deployed, copy your backend URL:
   - Example: `https://leetracker-backend.onrender.com`
   - Or: `https://leetracker-backend-xxxx.onrender.com`

---

## 🌐 Update Vercel Frontend

After backend is deployed:

### Step 1: Get Backend URL
From Render dashboard, copy your service URL (top of page)

### Step 2: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **"Settings"** → **"Environment Variables"**
4. Add or update:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (your actual URL)
   - **Environments**: Check all three ✅
5. Click **"Save"**

### Step 3: Redeploy Vercel
1. Go to **"Deployments"** tab
2. Find latest deployment
3. Click **"..."** menu → **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Final Testing

### Test Backend:
1. Visit: `https://your-backend-url.onrender.com/health`
2. Should see: `{"status":"ok"}` or similar

### Test Frontend:
1. Visit your Vercel URL
2. Try to sign up with a new account
3. Should work without "Network Error" ✅

---

## 📋 Summary of Required Changes

Before clicking Deploy in Render:

1. ✅ Update `JWT_SECRET` to: `RADafFeyKYbojL3t1mzvs7pSGNPiVuI68wUEghB4`
2. ✅ Update `SESSION_SECRET` to: `3RTu7QqPN5k9MzHYbnZh0KU1EOl8C6doaVLsBvwc`
3. ✅ Verify `LOCAL_MONGODB_URI` is complete (ends with `&appName=Cluster0`)
4. ✅ MongoDB Atlas Network Access allows `0.0.0.0/0`
5. ✅ Click Deploy
6. ✅ Copy backend URL after deployment
7. ✅ Add `VITE_API_URL` to Vercel with backend URL
8. ✅ Redeploy Vercel

---

**After completing these steps, your app will be fully deployed and working!** 🚀
