# LeetCode Tracker - Troubleshooting Guide

## "Failed to fetch data from LeetCode API" Error

This error typically means one of the following:

### 1. **Backend Not Receiving Request**
- Check if backend is running on port 5001
- Check browser DevTools Network tab to see if request is being sent
- Verify CORS is allowing requests

### 2. **LeetCode API Blocking Requests**
LeetCode may be blocking requests due to:
- Rate limiting (too many requests)
- Missing/incorrect headers
- IP blocking
- Session/authentication requirements

### 3. **Network/Firewall Issues**
- Check if you have internet connection
- Check if firewall is blocking outgoing requests to leetcode.com
- Try accessing https://leetcode.com in browser directly

## Debugging Steps

### Check Backend Connectivity
1. Open browser console (F12)
2. Go to http://localhost:3000
3. Try searching for a user
4. Check browser Network tab for the request to `/api/user/[username]`
5. Look at backend terminal for logs

### Check LeetCode API Access
1. Try the test endpoint: http://localhost:5001/api/test-leetcode
2. If it fails, LeetCode API is unreachable

### Check Backend Logs
Look for messages like:
- `🔍 Fetching data for user: [username]` - Request received
- `✅ Response received: 200` - LeetCode responded
- `❌ Error fetching LeetCode data:` - LeetCode API error

## Solutions

### Solution 1: Check Backend is Running
```bash
cd e:\tracker\backend
$env:PORT=5001
npm run dev
```

### Solution 2: Check Frontend Config
Edit `frontend/src/config/api.ts` and ensure:
```ts
const API_BASE_URL = 'http://localhost:5001';
```

### Solution 3: Try Different Username
- LeetCode usernames are case-sensitive
- Try a popular user like "awice" or "jianchao-li"
- Check the exact username format

### Solution 4: Wait and Retry
- LeetCode may rate-limit after multiple requests
- Wait 1-2 minutes and try again
- Try different usernames

### Solution 5: Check CORS in Backend
Ensure backend/src/index.ts has:
```ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true
}));
```

## Testing the API Manually

Open browser DevTools Console and run:
```javascript
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

If this returns `{status: 'Server is running'}`, the backend is working.

## Additional Resources

- LeetCode API Documentation: https://leetcode.com/graphql
- Axios Docs: https://axios-http.com/
- Express CORS: https://expressjs.com/en/resources/middleware/cors.html
