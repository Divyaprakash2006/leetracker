# Fix Network Error on Render Frontend

## The Problem
Your Render frontend doesn't know where the backend is, causing "Network error" on login/signup.

## The Solution
Add the backend URL as an environment variable in Render.

## Steps to Fix:

### 1. Go to Render Dashboard
Visit: https://dashboard.render.com

### 2. Find Your Frontend Service
Click on your frontend service (the static site where your React app is deployed)

### 3. Go to Environment Tab
- Click **"Environment"** in the left sidebar
- Or go to Settings → Environment

### 4. Add Environment Variable
Click **"Add Environment Variable"** and add:

```
Key:   VITE_API_URL
Value: https://leetracker-cxzv.onrender.com
```

### 5. Save and Redeploy
- Click **"Save Changes"**
- Render will automatically trigger a new deployment
- Wait 2-3 minutes for the build to complete

## Verify the Fix:
After deployment completes:
1. Visit your Render frontend URL
2. Try to sign up or log in
3. The "Network error" should be gone!

## Important Notes:
- **VITE_API_URL must be set BEFORE the build** - Vite bakes environment variables into the build at compile time
- If you change the environment variable, you MUST redeploy for changes to take effect
- Make sure the backend URL doesn't have a trailing slash: ✅ `https://leetracker-cxzv.onrender.com` ❌ `https://leetracker-cxzv.onrender.com/`

## Alternative: Use Build Command with Env Variable
If the above doesn't work, you can also set it in the build command:

**Build Command:**
```bash
VITE_API_URL=https://leetracker-cxzv.onrender.com npm install && npm run build
```

This ensures the variable is available during build time.

## Test Backend is Working:
Your backend should respond at:
```
https://leetracker-cxzv.onrender.com/health
```

Visit this URL in your browser - you should see a success response.
