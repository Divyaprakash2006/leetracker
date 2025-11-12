# Authentication System Guide

## Overview
LeetTracker now includes a complete authentication system with:
- ✅ **Email/Password** registration and login (works immediately)
- ✅ **Google OAuth** login (requires setup - optional)
- ✅ **GitHub OAuth** login (requires setup - optional)
- ✅ JWT token-based authentication
- ✅ Separate user database (AuthUser collection)
- ✅ Protected routes

---

## 🚀 Quick Start (No OAuth Setup Required)

### 1. Start the Application
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### 2. Create Your First Account
1. Navigate to: `http://localhost:3000/signup`
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: At least 6 characters
   - **Confirm Password**: Same password
3. Click "Create account"
4. You'll be automatically logged in and redirected to the home page

### 3. Log Out and Log Back In
1. Click your name in the navigation bar
2. Click "Logout"
3. Go to: `http://localhost:3000/login`
4. Enter your email and password
5. Click "Sign in"

---

## 📁 Database Structure

### Separate Authentication
The authentication system uses its own database collection: `AuthUser`

This is **separate** from LeetCode tracking data:
```
MongoDB Database (leetracker)
├── authusers (Login credentials - NEW)
│   ├── email
│   ├── password (hashed)
│   ├── name
│   ├── provider (local/google/github)
│   └── timestamps
├── trackedusers (LeetCode usernames tracked)
├── users (LeetCode user data)
└── solutions (LeetCode solutions)
```

### Why Separate?
- **Security**: Login data isolated from app data
- **Flexibility**: One login account can track multiple LeetCode profiles
- **OAuth Support**: Google/GitHub users don't need passwords
- **Privacy**: LeetCode username not required for account creation

---

## 🔐 How It Works

### 1. User Registration (`/signup`)
```
User fills form → Backend validates → Password hashed with bcrypt →
User saved to AuthUser collection → JWT token generated →
Token stored in localStorage → User redirected to home
```

### 2. User Login (`/login`)
```
User enters credentials → Backend verifies email exists →
Password compared with hash → JWT token generated →
Token returned to frontend → Stored in localStorage →
User redirected to home
```

### 3. OAuth Login (Google/GitHub)
```
User clicks OAuth button → Redirected to provider (Google/GitHub) →
User authorizes → Provider redirects back with code →
Backend creates/finds user → JWT token generated →
User redirected to home with token → Token stored
```

### 4. Protected Routes
```
User visits page → ProtectedRoute checks localStorage for token →
Token sent to backend /api/auth/me → Backend verifies JWT →
If valid: User data returned, page renders →
If invalid: Redirect to /login
```

---

## 🎨 Pages

### Public Pages (No Login Required)
- `/login` - Login page
- `/signup` - Registration page
- `/auth/callback` - OAuth callback handler (automatic)

### Protected Pages (Login Required)
- `/` - Home page
- `/dashboard` - Dashboard
- `/search` - Search LeetCode users
- `/users` - Tracked users list
- `/analytics` - Analytics
- `/user/:username` - User progress
- `/user/:username/submissions` - User submissions

---

## 🔧 Frontend Components

### AuthContext (`frontend/src/context/AuthContext.tsx`)
Manages authentication state across the app:
```typescript
const { user, token, login, register, logout, isAuthenticated } = useAuth();

// Login
await login('email@example.com', 'password');

// Register
await register('email@example.com', 'password', 'John Doe');

// Logout
logout();

// Check if logged in
if (isAuthenticated) {
  // Show user content
}
```

### ProtectedRoute (`frontend/src/components/ProtectedRoute.tsx`)
Wraps routes that require authentication:
```typescript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

---

## 🔌 Backend API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### GET `/api/auth/me`
Get current user information (requires JWT token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/logout`
Logout (client removes token).

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### OAuth Routes

#### GET `/api/auth/google`
Initiates Google OAuth flow. Redirects to Google.

#### GET `/api/auth/google/callback`
Google OAuth callback. Generates JWT and redirects to frontend.

#### GET `/api/auth/github`
Initiates GitHub OAuth flow. Redirects to GitHub.

#### GET `/api/auth/github/callback`
GitHub OAuth callback. Generates JWT and redirects to frontend.

---

## 🛡️ Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds (10)
- ✅ Never stored in plain text
- ✅ Minimum 6 characters required

### JWT Tokens
- ✅ 7-day expiration
- ✅ Signed with secret key
- ✅ Stored in localStorage
- ✅ Sent in Authorization header

### Session Security
- ✅ HttpOnly cookies for sessions
- ✅ Secure flag in production
- ✅ CSRF protection ready

### OAuth Security
- ✅ State parameter validation
- ✅ Redirect URI validation
- ✅ Token exchange over HTTPS (production)

---

## 🐛 Troubleshooting

### "Invalid credentials" on Login
- ✅ Check email is correct (case-insensitive)
- ✅ Verify password is correct
- ✅ If using OAuth account, click Google/GitHub button instead

### "Please use OAuth login" Message
- ✅ Account was created with Google/GitHub
- ✅ Use the OAuth button to log in
- ✅ Password login not available for OAuth accounts

### Redirected to Login After Accessing Page
- ✅ Token may have expired (7 days)
- ✅ Log in again to get new token
- ✅ Check localStorage has `auth_token`

### OAuth Buttons Don't Work
- ✅ OAuth credentials not set up (optional feature)
- ✅ Use email/password registration instead
- ✅ See `OAUTH_SETUP_GUIDE.md` to enable OAuth

### Registration Fails
- ✅ Email already exists - try logging in
- ✅ Password too short - use 6+ characters
- ✅ Check backend is running on port 5001
- ✅ Check MongoDB is connected

---

## 🎯 Testing the System

### Test Email/Password Flow
1. **Register:**
   ```
   Go to: http://localhost:3000/signup
   Email: test@example.com
   Password: test123456
   Name: Test User
   Click: Create account
   ```

2. **Verify Login:**
   ```
   Should redirect to home page
   Name should show in navigation
   ```

3. **Logout:**
   ```
   Click your name → Logout
   Should redirect to login page
   ```

4. **Login Again:**
   ```
   Go to: http://localhost:3000/login
   Email: test@example.com
   Password: test123456
   Click: Sign in
   ```

### Test Protected Routes
1. **While Logged Out:**
   ```
   Try accessing: http://localhost:3000/dashboard
   Should redirect to: /login
   ```

2. **While Logged In:**
   ```
   Access: http://localhost:3000/dashboard
   Should load dashboard normally
   ```

### Test Token Persistence
1. **Login and Refresh:**
   ```
   Log in → Refresh page (F5)
   Should stay logged in
   Token loaded from localStorage
   ```

2. **Close and Reopen:**
   ```
   Log in → Close browser → Reopen
   Navigate to app → Still logged in
   ```

---

## 📊 MongoDB Verification

### Check Users in Database
```javascript
// In MongoDB Compass or mongo shell
use leetracker

// View all authentication users
db.authusers.find().pretty()

// Count users
db.authusers.countDocuments()

// Find specific user
db.authusers.findOne({ email: "test@example.com" })

// Check user provider
db.authusers.find({ provider: "local" })
db.authusers.find({ provider: "google" })
```

---

## 🚀 Next Steps

### Recommended Enhancements
1. **Email Verification**
   - Send confirmation email after registration
   - Verify email before allowing login

2. **Password Reset**
   - "Forgot password" functionality
   - Email reset link with temporary token

3. **Account Settings**
   - Change password
   - Update profile information
   - Delete account

4. **Enhanced Security**
   - Two-factor authentication (2FA)
   - Login history tracking
   - Suspicious activity alerts

5. **Social Features**
   - Link multiple OAuth providers
   - Profile pictures from OAuth
   - Public profiles

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Required
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
JWT_SECRET=your-secret-key-change-in-production

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Configuration
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
SESSION_SECRET=your-session-secret
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## ✅ Success! 

Your authentication system is now fully functional with:
- ✅ User registration
- ✅ Login/Logout
- ✅ Protected routes
- ✅ Separate user database
- ✅ JWT token authentication
- ✅ OAuth ready (optional)

**Start using it:**
1. Go to `http://localhost:3000/signup`
2. Create an account
3. Start tracking LeetCode progress!

For OAuth setup, see: `OAUTH_SETUP_GUIDE.md`
