# Dashboard Usage Guide

## ✅ System Status: Working Correctly

The individual dashboard is **functioning as designed**. Here's how to use it:

---

## 🔐 Step 1: Authentication Required

The dashboard displays data only for **logged-in users**. Each user sees ONLY their own tracked LeetCode profiles.

### How to Log In:

1. **Option A: Use Existing Account**
   - Go to: `http://localhost:5173/login`
   - Enter your username and password
   - Click "Sign In"

2. **Option B: Create New Account**
   - Go to: `http://localhost:5173/signup`
   - Enter:
     - Username (3+ characters)
     - Password (6+ characters)
     - Your name
   - Click "Sign Up"

### Current Test Accounts in Database:
```
Username: divi_123
Username: gokilan_123
Username: testuser1 (created by demonstratePrivacy.ts)
Username: testuser2 (created by demonstratePrivacy.ts)
```

---

## 📊 Step 2: Add LeetCode Users to Track

After logging in, you need to add LeetCode profiles you want to monitor:

1. Click **"Track now"** button on dashboard
   - OR navigate to: `http://localhost:5173/search`

2. Enter a **LeetCode username** (e.g., `tourist`, `Errichto`, `neal_wu`)

3. Click **"Track User"**

4. The system will:
   - Fetch their LeetCode profile data
   - Store it in YOUR private tracking list
   - Display stats on your dashboard

---

## 🎯 What the Dashboard Shows

Once you've added tracked users, the dashboard displays:

### Summary Cards:
- **Tracked Profiles**: Number of LeetCode users you're monitoring
- **Problems Solved**: Total problems solved by all tracked users
- **Last Update**: When data was last refreshed (auto-refreshes every 5 minutes)

### Top Performers Section:
- Top 3 tracked users ranked by:
  1. Total problems solved (primary)
  2. LeetCode ranking (tiebreaker)
- For each user:
  - Avatar with first letter of name
  - Username and real name (if provided)
  - LeetCode rank
  - Easy/Medium/Hard problem breakdown
  - Links to Progress and Submissions pages

### Empty State:
- If no users tracked: Shows "No users tracked yet" with button to add first user

---

## 🔒 Privacy Verification

Your dashboard is **100% private**:

### Database Level Isolation:
- All data has `authUserId` field linking to your account
- MongoDB compound index: `{authUserId + normalizedUsername}` unique
- Backend queries **always filter by** `req.userId` from JWT token

### Proof:
```bash
cd backend
npx tsx src/scripts/demonstratePrivacy.ts
```

This script proves:
- **User 1** tracks: `alice_codes`, `bob_solver`, `charlie_dev` (3 users)
- **User 2** tracks: `david_coder`, `emma_python` (2 users)
- Neither can see each other's data (0 results when cross-querying)

---

## 🛠️ Testing the Dashboard

### Test Flow:

1. **Start Backend:**
   ```cmd
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```cmd
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   ```
   http://localhost:5173
   ```

4. **Create Account:**
   - Go to `/signup`
   - Username: `john_doe`
   - Password: `password123`
   - Name: `John Doe`

5. **Add Tracked Users:**
   - Go to `/search`
   - Add: `tourist` (top competitive programmer)
   - Add: `Errichto` (famous YouTuber)
   - Add: `neal_wu` (Google engineer)

6. **View Dashboard:**
   - Go to `/dashboard`
   - You'll see:
     - 3 tracked profiles
     - Total problems solved by all 3
     - Top 3 performers ranked
     - Easy/Medium/Hard breakdowns

---

## 🚨 Common Issues

### Issue: "No users tracked yet"
**Cause:** You haven't added any LeetCode users to track
**Solution:** Click "Track now" → Search page → Add users

### Issue: Dashboard empty after adding users
**Cause:** Not logged in (viewing as guest)
**Solution:** 
1. Check top-right corner - is username shown?
2. If not, go to `/login` and sign in
3. Refresh dashboard

### Issue: "Failed to fetch tracked users"
**Cause:** Backend not running or wrong API URL
**Solution:**
1. Check backend terminal - should show `✅ Server running on port 5001`
2. Check MongoDB - should be running on port 27017
3. Check `.env` file - `LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker`

---

## 🔍 How It Works Internally

### Frontend Flow:
1. **UserContext.tsx** - Manages tracked users state
   - On mount: Fetches tracked users from API
   - Uses JWT token from localStorage
   - Endpoint: `GET /api/tracked-users`

2. **DashboardPage.tsx** - Displays dashboard UI
   - Uses `useTrackedUsers()` hook
   - For each tracked user, fetches stats: `GET /api/user/:username`
   - Sorts by problems solved + ranking
   - Auto-refreshes every 5 minutes

### Backend Flow:
1. **trackedUserRoutes.ts** - API endpoints
   - `GET /api/tracked-users` - Returns users for authenticated user
   - `POST /api/tracked-users` - Adds new tracked user
   - `DELETE /api/tracked-users/:username` - Removes tracked user
   - All use `authenticateToken` middleware

2. **authenticateToken** middleware:
   - Extracts JWT token from `Authorization: Bearer <token>` header
   - Verifies token signature
   - Decodes `{userId, username}` payload
   - Attaches `req.userId` to request
   - All queries filter by this `userId`

### Database Structure:
```javascript
// TrackedUser collection
{
  authUserId: ObjectId("..."),      // Links to AuthUser
  username: "tourist",              // LeetCode username
  normalizedUsername: "tourist",    // Lowercase for queries
  realName: "Gennady Korotkevich", // Optional display name
  addedAt: ISODate("..."),
  lastViewedAt: ISODate("..."),
  // Compound index: {authUserId: 1, normalizedUsername: 1} unique
}

// User collection (LeetCode data)
{
  authUserId: ObjectId("..."),      // Links to AuthUser
  username: "tourist",
  normalizedUsername: "tourist",
  problems: {
    total: 3500,
    easy: 800,
    medium: 1200,
    hard: 1500
  },
  ranking: 1,
  // Compound index: {authUserId: 1, normalizedUsername: 1} unique
}
```

---

## 📝 Summary

✅ **Dashboard is working correctly**
✅ **User isolation verified at database level**
✅ **Privacy confirmed by demonstratePrivacy.ts script**

### To use dashboard:
1. Login or signup
2. Go to Search page
3. Add LeetCode users to track
4. View dashboard - shows YOUR tracked users only

### Security guarantees:
- Each user's data is isolated by `authUserId`
- JWT tokens prevent unauthorized access
- MongoDB compound indexes ensure data separation
- Cross-user queries return 0 results (verified)

---

## 🎓 Educational Example

**Scenario:** Two users tracking different coders

### User A (john_doe):
- Tracks: `tourist`, `Errichto`, `neal_wu`
- Dashboard shows: 3 profiles, combined stats for these 3 users
- Cannot see User B's tracked users

### User B (jane_smith):
- Tracks: `tmwilliamlin168`, `Um_nik`, `ksun48`
- Dashboard shows: 3 profiles, combined stats for these 3 users
- Cannot see User A's tracked users

### Same LeetCode User Tracked by Both:
- If both track `tourist`:
  - Each gets their own `TrackedUser` record
  - Both share same `User` data (LeetCode stats)
  - Database query: `TrackedUser.find({ authUserId: userA._id })` → Returns only User A's tracked users
  - Database query: `TrackedUser.find({ authUserId: userB._id })` → Returns only User B's tracked users

---

**Need help?** Check `TROUBLESHOOTING.md` or run verification scripts in `backend/src/scripts/`.
