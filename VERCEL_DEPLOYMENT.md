# Vercel Deployment Guide for LeetTracker

## Overview
This project requires **TWO separate deployments**:
1. **Backend** - Deploy to Render, Railway, or other Node.js hosting
2. **Frontend** - Deploy to Vercel (this guide)

## Prerequisites
- Backend must be deployed FIRST and accessible via HTTPS
- MongoDB database accessible from your backend (use MongoDB Atlas for production)

---

## Backend Deployment (Do This First!)

### Option 1: Render.com (Recommended)
1. Go to [Render.com](https://render.com) and sign up
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables:
   ```
   LOCAL_MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-secure-random-string>
   PORT=5001
   NODE_ENV=production
   ```
6. Deploy and note the URL (e.g., `https://your-app.onrender.com`)

### Option 2: Railway.app
1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project from GitHub
3. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
4. Add same environment variables as above
5. Deploy and note the URL

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Environment Variable
After backend is deployed, you need its URL for the frontend.

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**IMPORTANT**: Replace `https://your-backend-url.onrender.com` with your actual backend URL!

### Step 2: Deploy to Vercel

#### Method A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? leetracker (or your choice)
# - In which directory is your code? ./
# - Want to override settings? Yes
# - Build Command? npm run build
# - Output Directory? frontend/dist
# - Development Command? npm run dev

# Add environment variable
vercel env add VITE_API_URL production
# Paste your backend URL when prompted

# Deploy to production
vercel --prod
```

#### Method B: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://your-app.onrender.com`)
6. Click "Deploy"

---

## Post-Deployment Configuration

### Update Backend CORS
After frontend is deployed, update your backend's CORS configuration to allow your Vercel domain.

In `backend/src/index.ts`, update CORS:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app', // Add your Vercel URL
    'https://your-custom-domain.com' // If using custom domain
  ],
  credentials: true
}));
```

Redeploy your backend after this change.

---

## Verification

### Test Your Deployment
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Open browser DevTools → Network tab
3. Try to sign up/login
4. Verify API calls go to your backend URL
5. Check for CORS errors (if any, update backend CORS)

### Common Issues

#### Issue: "Network Error" on signup/login
**Solution**: Check that `VITE_API_URL` is set correctly in Vercel environment variables

#### Issue: CORS error in browser console
**Solution**: Add your Vercel domain to backend CORS configuration and redeploy backend

#### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Use MongoDB Atlas (not local MongoDB) for production
- Update `LOCAL_MONGODB_URI` in backend environment variables
- Whitelist backend's IP address in MongoDB Atlas Network Access

#### Issue: Build fails with TypeScript errors
**Solution**: 
```bash
# Test build locally first
cd frontend
npm run build

# Fix any TypeScript errors shown
```

---

## Environment Variables Summary

### Backend (Render/Railway)
```env
LOCAL_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/leetracker
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=5001
NODE_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel project settings → Domains
2. Add your domain (e.g., `leetracker.com`)
3. Follow DNS configuration instructions
4. Update backend CORS to include your custom domain

### Add Custom Domain to Backend
1. In Render/Railway, go to Settings → Custom Domain
2. Add your backend subdomain (e.g., `api.leetracker.com`)
3. Update `VITE_API_URL` in Vercel to use new backend domain

---

## Monitoring & Logs

### Vercel Logs
- Dashboard → Your Project → Deployments → View Function Logs

### Backend Logs
- **Render**: Dashboard → Your Service → Logs
- **Railway**: Dashboard → Your Project → Deployments → View Logs

---

## Troubleshooting Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Force redeploy
vercel --prod --force
```

---

## Security Checklist

✅ Backend environment variables are set (JWT_SECRET, MONGODB_URI)
✅ Frontend uses HTTPS backend URL
✅ CORS is configured with specific origins (not '*')
✅ MongoDB Atlas IP whitelist includes backend server
✅ JWT_SECRET is at least 32 characters random string
✅ .env files are NOT committed to git
✅ Production MongoDB is separate from development

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

**Last Updated**: December 1, 2025
