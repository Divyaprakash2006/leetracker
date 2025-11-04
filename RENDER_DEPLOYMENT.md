# 🚀 Render Deployment Guide

## Prerequisites
1. GitHub account with this repository pushed
2. Render account (free tier available)
3. MongoDB Atlas account (free M0 cluster)

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

### Create MongoDB Atlas Cluster
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Click "Build a Database"
4. Choose **M0 FREE** tier (512MB storage, forever free)
5. Select cloud provider (AWS recommended) and region (closest to your users)
6. Name your cluster: `leetracker-cluster`
7. Click "Create"

### Create Database User
1. Go to **Database Access** tab
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Username: `leetracker-admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" → **SAVE THIS PASSWORD**
6. Database User Privileges: Select "Read and write to any database"
7. Click "Add User"

### Configure Network Access
1. Go to **Network Access** tab
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Required for Render to connect
4. Click "Confirm"

### Get Connection String
1. Go to **Database** tab
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string:
```
mongodb+srv://leetracker-admin:<password>@leetracker-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with your actual password
7. Add database name: `/leetracker` before the `?`

**Final connection string format:**
```
mongodb+srv://leetracker-admin:YOUR_PASSWORD_HERE@leetracker-cluster.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render

### Create Web Service
1. Go to https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `Divyaprakash2006/leetracker`
5. Configure service:

**Basic Settings:**
- Name: `leetracker-backend`
- Region: Select closest to you
- Branch: `main`
- Root Directory: `backend`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Instance Type:**
- Select **Free** (0.1 CPU, 512MB RAM)

### Environment Variables
Click "Advanced" → Add Environment Variables:

```bash
NODE_ENV=production
PORT=5001
LOCAL_MONGODB_URI=mongodb+srv://leetracker-admin:YOUR_PASSWORD@leetracker-cluster.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=your_session_cookie_here
LEETCODE_CSRF_TOKEN=your_csrf_token_here
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual MongoDB Atlas password
- URL encode special characters in password:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - etc.

### Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your backend will be live at: `https://leetracker-backend.onrender.com`

---

## Step 3: Deploy Frontend to Render

### Create Static Site
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:

**Basic Settings:**
- Name: `leetracker-frontend`
- Branch: `main`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### Environment Variables
Add these:

```bash
VITE_API_URL=https://leetracker-backend.onrender.com
```

### Deploy
1. Click "Create Static Site"
2. Wait for deployment
3. Your app will be live at: `https://leetracker-frontend.onrender.com`

---

## Step 4: Update Frontend API Configuration

Before deploying, update the API URL in your code:

**File:** `frontend/src/config/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://leetracker-backend.onrender.com';

export const apiClient = {
  // ... rest of code
};
```

Commit and push this change to trigger redeployment.

---

## Step 5: Verify Deployment

### Test Backend
Visit: `https://leetracker-backend.onrender.com/health` or `/api/status`

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test Frontend
1. Visit: `https://leetracker-frontend.onrender.com`
2. Search for a LeetCode username
3. Verify data loads correctly

---

## Troubleshooting

### Backend won't start
**Check logs in Render dashboard:**
- Look for MongoDB connection errors
- Verify environment variables are set correctly
- Check password is URL-encoded

### Database connection fails
**Common issues:**
1. Password not URL-encoded
2. IP not whitelisted in Atlas (should be `0.0.0.0/0`)
3. Incorrect connection string format
4. Database user doesn't have write permissions

### Frontend can't connect to backend
**Fix CORS:**
Add in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://leetracker-frontend.onrender.com'
  ],
  credentials: true
}));
```

### Render free tier limitations
- Apps sleep after 15 min of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month free (enough for 1 app 24/7)

---

## Environment Variables Summary

### Backend (Render Web Service)
```bash
NODE_ENV=production
PORT=5001
LOCAL_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leetracker?retryWrites=true&w=majority
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=<your_session_token>
LEETCODE_CSRF_TOKEN=<your_csrf_token>
```

### Frontend (Render Static Site)
```bash
VITE_API_URL=https://leetracker-backend.onrender.com
```

---

## Cost Breakdown

### Free Tier (Recommended for Testing)
- **MongoDB Atlas M0**: FREE (512MB storage)
- **Render Backend**: FREE (1 web service, sleeps after inactivity)
- **Render Frontend**: FREE (100GB bandwidth/month)
- **Total**: $0/month 🎉

### Paid Tier (Production)
- **MongoDB Atlas M10**: $0.08/hour (~$57/month)
- **Render Backend**: $7/month (always-on, 512MB RAM)
- **Render Frontend**: FREE
- **Total**: ~$64/month

---

## Next Steps

1. ✅ Set up MongoDB Atlas cluster
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Render
4. ✅ Test the live application
5. 🎯 Share your live URL!

**Your live app will be accessible at:**
- **Frontend**: `https://leetracker-frontend.onrender.com`
- **Backend API**: `https://leetracker-backend.onrender.com`

---

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Render Docs: https://render.com/docs
- Check backend logs in Render dashboard
- Verify environment variables are set correctly

**Happy Deploying! 🚀**
