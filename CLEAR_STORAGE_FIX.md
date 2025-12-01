# Fix "Invalid Token" Error

## The Problem
Your browser has an old/invalid authentication token stored in localStorage. When you visit the site, it tries to use this expired token, causing "Invalid token" errors.

## Quick Fix (Browser Console)

1. Open your deployed Render site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type this command and press Enter:
   ```javascript
   localStorage.clear()
   ```
5. **Refresh the page** (F5 or Ctrl+R)
6. The error should be gone!

## Alternative Fix (Application Tab)

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (top menu)
3. In the left sidebar, expand **Local Storage**
4. Click on your site URL
5. Find `auth_token` in the list
6. Right-click → **Delete**
7. **Refresh the page**

## After Clearing Storage

You should now see the login/signup page without errors.

### To Sign Up:
1. Click **"Sign Up"** 
2. Enter a username, password, and name
3. Click **"Create Account"**

### To Log In:
1. Enter your username and password
2. Click **"Sign In"**

## Why This Happened

- You may have logged in with a different backend (local vs Render)
- Your session expired
- The backend was redeployed with a different JWT secret

The localStorage stores the auth token on your browser. When the backend changes or restarts with a new secret, old tokens become invalid.

## Prevent This in the Future

The app should automatically clear invalid tokens, but you can manually clear browser data anytime by:
- Using the console command above
- Or going to **Browser Settings → Privacy → Clear Browsing Data → Cookies and site data**
