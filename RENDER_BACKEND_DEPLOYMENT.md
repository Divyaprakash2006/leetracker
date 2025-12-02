# Backend Deployment Guide (Render.com)

## Quick Deploy to Render

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your repository: `Divyaprakash2006/leetracker`
3. Configure:
   - **Name**: `leetracker-backend` (or any name you prefer)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm run render:build`
   - **Start Command**: `npm run render:start`
   - **Instance Type**: Free

   > ✅ `npm ci` installs only production dependencies and skips lockfile rewrites. The new `npm run build` step compiles TypeScript into `dist/` so the start script can launch the pre-built server with `node dist/index.js`.

### Step 3: Add Environment Variables
Click "Advanced" → "Add Environment Variable" and add these:

```env
MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random-at-least-32-characters
SESSION_SECRET=your-session-secret-also-change-this-to-random-string
PORT=5001
NODE_ENV=production
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYXV0aF91c2VyX2lkIjoiMTUzNTg1MjEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjA4OWE0NzhlNDc2ZDIxYTljN2VmZjMxYmE3YTcxZDVhZTc3ODlkMmNlZTBiMzM4OTVmZmQyNDkyYjE3MzMxODgiLCJzZXNzaW9uX3V1aWQiOiI0N2JmY2Y1ZCIsImlkIjoxNTM1ODUyMSwiZW1haWwiOiJkaXZpeWFwcmFrYXNoMzJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJEaXZ5YXByYWthc2hfMTIzIiwidXNlcl9zbHVnIjoiRGl2eWFwcmFrYXNoXzEyMyIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9EaXZ5YXByYWthc2hfMTIzL2F2YXRhcl8xNzQ5NjQ3MDQwLnBuZyIsInJlZnJlc2hlZF9hdCI6MTc2NDQ5NTY2OSwiaXAiOiIyNDA5OjQwZjQ6MzA1ODo0ZDNjOjE3ODphMDI4OjM4OTc6NmM4MiIsImlkZW50aXR5IjoiM2M5ZmM3ZGRlYzliNTg4MjNjMWM5Njc1NmRiZDQ1ZDgiLCJkZXZpY2Vfd2l0aF9pcCI6WyI5YmY0MTgwMWIwNGRlZDlkZTQzZWJjNzNjNzFkOWZhZCIsIjI0MDk6NDBmNDozMDU4OjRkM2M6MTc4OmEwMjg6Mzg5Nzo2YzgyIl0sIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.qQfTy03CnflG8CmhH3S0DwboIGBdsjpk6RkMkIBrDKs
LEETCODE_CSRF_TOKEN=FJ5PdAzDRzwwLL4MxZitg7dMCGi25UC5
```

**IMPORTANT**: 
- ✅ Your MongoDB Atlas connection string is already configured
- ⚠️ CHANGE `JWT_SECRET` and `SESSION_SECRET` to random secure strings!
- ⚠️ See "Generate Secure Secrets" section below for commands

### Step 4: Configure Scaling (avoid cold starts)
1. Open the **Scaling** tab inside the Render service
2. Set **Autoscale** to **ON**
3. Set **Min Instances** to **1**

Keeping one instance warm prevents the 30–60s cold-start delay on the free tier.

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Copy your backend URL (e.g., `https://leetracker-backend.onrender.com`)

### Step 6: Configure MongoDB Atlas (Required!)
Your MongoDB Atlas cluster needs to allow connections from Render:

1. Go to https://cloud.mongodb.com
2. Select your cluster: **Cluster0**
3. Click **"Network Access"** (left sidebar under Security)
4. Click **"Add IP Address"** button
5. Choose one option:
   - **Option A (Easiest)**: Click **"Allow Access from Anywhere"** 
     - Adds: `0.0.0.0/0` (allows all IPs)
     - Click **"Confirm"**
   - **Option B (More Secure)**: Add Render's specific IP ranges
     - Check Render documentation for current IP ranges
6. Wait 1-2 minutes for changes to propagate

**Verify your MongoDB connection string**:
- Username: `Divi_01`
- Password: `Divi123`
- Cluster: `cluster0.tpjds.mongodb.net`
- Database: `leetracker`
- Connection string format is correct ✅

### Step 7: Update Vercel Environment Variable
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add or update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://leetracker-backend.onrender.com` (your backend URL from Step 4)
   - **Environment**: Check "Production", "Preview", "Development"
5. Click "Save"
6. Go to "Deployments" tab
7. Click the "..." menu on latest deployment → "Redeploy"

### Step 8: Test Your Deployment
1. Visit your Vercel URL
2. Try to sign up
3. Should work without "Network Error"!

---

## Troubleshooting

### Backend deployment fails
- Check "Logs" tab in Render dashboard
- Verify all environment variables are set
- Check MongoDB connection string is correct

### Still getting "Network Error"
1. Check backend URL is correct in Vercel env vars
2. Verify backend is running (visit `https://your-backend.onrender.com/health`)
3. Check browser console for CORS errors
4. Verify MongoDB Atlas allows Render's IP addresses

### Backend is slow
- Render free tier has "cold starts" (takes 30-60 seconds to wake up)
- Enable Autoscale with **Min Instances = 1** to keep one worker warm
- First request after inactivity will still be slower on the free tier
- Consider upgrading to paid tier for faster response

### Faster local production build/run

```bash
cd backend
npm ci --only=production
npm run build
npm run start
```

`npm run start:local` remains available if you want to execute the TypeScript entry directly with `tsx` during development.

---

## Notes

- **Free Tier Limitations**: Render free tier sleeps after 15 minutes of inactivity
- **MongoDB Atlas Free Tier**: 512MB storage, sufficient for development
- **CORS**: Backend automatically allows `.vercel.app` and `.onrender.com` domains
- **JWT Secrets**: Generate secure random strings for production!

---

## Generate Secure Secrets

Run these commands to generate random secrets:

**Windows PowerShell:**
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate SESSION_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Linux/Mac:**
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET
openssl rand -base64 32
```

Copy the output and use as your secrets in Render environment variables.

---

**After completing these steps, your app will be fully deployed!** 🚀
