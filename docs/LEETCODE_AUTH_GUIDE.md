# LeetCode Authentication Guide

## Problem: "Submission code not available - may be private or require authentication"

### Why This Happens

LeetCode's API has a **privacy restriction**: you can only view submission code for your own account. This is a security feature by LeetCode to protect users' solutions.

### Current Setup

Your `.env` file is configured with credentials for LeetCode user: **`Divi_10`**

```env
LEETCODE_SESSION=eyJhbGci...  (Token for user: Divi_10)
LEETCODE_CSRF_TOKEN=RPLY3OAnvavKw32kQ4WuCSeSvcUeOozCr9QQLpXNbMw3CYbW4WArF0ypUbRdSmaf
```

### What This Means

✅ **CAN VIEW:** Submissions from user `Divi_10`
❌ **CANNOT VIEW:** Submissions from other users (e.g., `Divyaprakash_123`, `Divyaprakash_10`, etc.)

### Solutions

#### Option 1: Use Matching LeetCode Account (Recommended)
Only track and view submissions from the same account (`Divi_10`) that your session token belongs to.

#### Option 2: Update Session Token
If you need to view submissions from a different user:

1. **Login to LeetCode** as the user whose submissions you want to view
2. **Get new session tokens:**
   - Open browser DevTools (F12)
   - Go to Application/Storage → Cookies → https://leetcode.com
   - Copy `LEETCODE_SESSION` value
   - Copy `csrftoken` value
3. **Provide credentials to the tracker (two options):**
    - **Per-user (recommended):**
       ```bash
       # Requires authentication; update credentials for a tracked user
       curl -X PATCH "http://localhost:5001/api/tracked-users/<Username>/auth" ^
          -H "Authorization: Bearer <your-app-token>" ^
          -H "Content-Type: application/json" ^
          -d "{\n  \"leetcodeSession\": \"<new-session-token>\",\n  \"leetcodeCsrfToken\": \"<new-csrf-token>\"\n}"
       ```
    - **Global fallback:** update `.env` for default credentials:
       ```env
       LEETCODE_SESSION=<new-session-token>
       LEETCODE_CSRF_TOKEN=<new-csrf-token>
       ```
4. **Restart backend server** if you changed `.env` (per-user updates take effect immediately)

#### Option 3: Multiple User Support (Advanced)
To track multiple users, you would need to:
- Store multiple session tokens
- Switch tokens based on which user's submissions are being viewed
- Implement user-specific authentication logic

### How to Get Your LeetCode Session Token

1. **Login to LeetCode** in your browser
2. **Open Developer Tools** (Press F12 or right-click → Inspect)
3. **Go to Application/Storage tab**
4. **Click Cookies** → `https://leetcode.com`
5. **Find and copy:**
   - `LEETCODE_SESSION` - Long JWT token
   - `csrftoken` - CSRF token
6. **Update your `.env` file**
7. **Restart the backend server**

### Current User Info

The session token in your `.env` belongs to:
- **Username:** `Divi_10`
- **Email:** `divibtech10@gmail.com`
- **User ID:** 1957590

### Testing

To verify your setup is working:

1. Make sure you're viewing submissions from user `Divi_10`
2. Check backend logs for successful API calls
3. If you see `{"data":{"submissionDetails":null}}`, the submission belongs to a different user

### Important Notes

⚠️ **Session tokens expire** - You may need to refresh them periodically (usually every few weeks)

⚠️ **Privacy by design** - This is a LeetCode security feature, not a bug in our application

⚠️ **Alternative** - Use LeetCode's public profiles to view publicly shared solutions

### Error Messages Explained

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Submission code not available" | Belongs to different user | Use correct session token |
| "May be private or require authentication" | Token doesn't match owner | Login as correct user |
| "submissionDetails: null" | API rejected request | Check authentication |

### Quick Fix Checklist

- [ ] Verify `LEETCODE_SESSION` in `.env` is set
- [ ] Verify `LEETCODE_CSRF_TOKEN` in `.env` is set
- [ ] (Recommended) Store per-user tokens via `PATCH /api/tracked-users/:username/auth`
- [ ] Confirm tokens belong to same user as submissions you're viewing
- [ ] Restart backend server after changing `.env`
- [ ] Check that tokens haven't expired
- [ ] Try viewing a submission you know you created

---

**Need Help?** Check the backend logs for detailed error messages when fetching submissions.
