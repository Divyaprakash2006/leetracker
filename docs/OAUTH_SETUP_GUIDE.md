# OAuth Setup Guide

This guide explains how to set up Google and GitHub OAuth authentication for LeetTracker.

## Prerequisites
- Google Cloud Console account
- GitHub account

---

## 🔵 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "LeetTracker" → Click "Create"

### Step 2: Enable Google+ API
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" → Click "Create"
3. Fill in the required fields:
   - App name: `LeetTracker`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
6. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
7. Click "Save and Continue"
8. On "Test users", add your email for testing
9. Click "Save and Continue"

### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: `Web application`
4. Name: `LeetTracker Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:5001
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   ```
7. Click "Create"
8. **Copy your Client ID and Client Secret**

### Step 5: Add to Backend .env
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 🟣 GitHub OAuth Setup

### Step 1: Register OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"

### Step 2: Fill Application Details
```
Application name: LeetTracker
Homepage URL: http://localhost:3000
Application description: Track your LeetCode progress
Authorization callback URL: http://localhost:5001/api/auth/github/callback
```

### Step 3: Register Application
1. Click "Register application"
2. **Copy your Client ID**
3. Click "Generate a new client secret"
4. **Copy your Client Secret** (shown only once!)

### Step 4: Add to Backend .env
```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

---

## ✅ Testing OAuth Flow

### 1. Ensure Environment Variables are Set
Check your `backend/.env` file has:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
```

### 2. Restart Backend Server
```bash
cd backend
npm run dev
```

### 3. Test Login Flow
1. Navigate to: `http://localhost:3000/login`
2. Click "Google" or "GitHub" button
3. Authorize the application
4. You should be redirected back and logged in

---

## 🚀 Production Deployment

### For Google OAuth:
1. Update authorized origins:
   - Add your production domain: `https://yourapp.com`
2. Update redirect URIs:
   - Add: `https://yourapp.com/api/auth/google/callback`

### For GitHub OAuth:
1. Create a new OAuth app for production OR
2. Update existing app:
   - Homepage URL: `https://yourapp.com`
   - Callback URL: `https://yourapp.com/api/auth/github/callback`

### Update Backend .env for Production:
```env
BACKEND_URL=https://your-backend.com
FRONTEND_URL=https://yourapp.com
NODE_ENV=production
```

---

## 🔒 Security Notes

1. **Never commit** your `.env` file to version control
2. Use strong, random secrets for `JWT_SECRET` and `SESSION_SECRET`
3. In production, set `NODE_ENV=production`
4. Use HTTPS in production (OAuth requires it)
5. Regularly rotate your secrets

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the callback URL in Google/GitHub exactly matches the one in your code
- Check for trailing slashes (include or exclude consistently)

### "Access Denied" or "401 Unauthorized"
- Verify your client ID and secret are correct
- Check if APIs are enabled in Google Cloud Console
- Ensure OAuth app is not suspended in GitHub

### Users Can't See Login Buttons
- Confirm environment variables are loaded in backend
- Check browser console for errors
- Verify CORS settings allow frontend domain

### OAuth Works Locally But Not in Production
- Update authorized domains in Google Cloud Console
- Update GitHub OAuth app URLs
- Ensure `BACKEND_URL` and `FRONTEND_URL` are set correctly
- Check HTTPS is configured properly

---

## 📚 Additional Resources

- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## 🎯 Quick Start (Development)

If you just want to test locally without OAuth:

1. **Option 1**: Use email/password authentication (already works)
   - Go to `/signup` and create an account
   - Log in with email and password

2. **Option 2**: Skip OAuth setup
   - Comment out or hide the Google/GitHub buttons
   - Focus on core LeetCode tracking features

OAuth is optional and can be added later when needed!
