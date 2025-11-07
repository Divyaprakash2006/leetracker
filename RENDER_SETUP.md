# 🚀 Quick Render Setup - MongoDB Configuration

## ⚠️ IMPORTANT: Localhost MongoDB Won't Work on Render!

Your backend is currently configured with:
```
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
```

**This will NOT work on Render** because:
- Render servers are in the cloud (AWS/Google Cloud)
- Your local computer (127.0.0.1) is not accessible from the cloud
- You'll see: `ECONNREFUSED 127.0.0.1:27017` error

---

## ✅ Solution: Use MongoDB Atlas (Free Cloud Database)

### Quick Setup (5 minutes):

#### 1. Create Free MongoDB Atlas Account
```
🌐 Go to: https://www.mongodb.com/cloud/atlas/register
✅ Sign up (free, no credit card required)
✅ Create a FREE M0 cluster (512MB storage)
```

#### 2. Configure Database Access
```
👤 Database Access → Add New Database User
   - Username: leetracker
   - Password: (auto-generate and SAVE IT!)
   - Role: Read and write to any database
```

#### 3. Configure Network Access
```
🌍 Network Access → Add IP Address
   - Click "Allow Access from Anywhere"
   - Adds: 0.0.0.0/0
   - This lets Render connect to your database
```

#### 4. Get Your Connection String
```
🔗 Database → Connect → Connect your application
   - Driver: Node.js
   - Copy connection string:
     mongodb+srv://leetracker:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   
   ✏️ Replace <password> with your actual password
   ✏️ Add /leetracker before the ?
   
   Final format:
   mongodb+srv://leetracker:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
```

#### 5. Update Render Environment Variables
```
🔧 Render Dashboard → Your Service → Environment
   
   Add/Update this variable:
   LOCAL_MONGODB_URI = mongodb+srv://leetracker:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
```

#### 6. Handle Special Characters in Password
If your password contains special characters, URL-encode them:

| Character | Replace With |
|-----------|--------------|
| @         | %40          |
| #         | %23          |
| $         | %24          |
| %         | %25          |
| :         | %3A          |
| /         | %2F          |

Example:
```
Password: Pass@123#
Encoded:  Pass%40123%23
```

---

## 🔍 Verify Your Setup

After updating the environment variable in Render, check your logs. You should see:

✅ **Success:**
```
🔍 Database config check:
   process.env.LOCAL_MONGODB_URI: Found
   Connection type: Cloud (Atlas)
🔄 Connecting to MongoDB...
✅ MongoDB connected successfully
📦 Database: leetracker
```

❌ **Still Using Localhost (Wrong):**
```
🔍 Database config check:
   Connection type: Local (Compass)
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

---

## 📋 Complete Environment Variables for Render

Set these in Render Dashboard → Environment:

```bash
NODE_ENV=production
PORT=5001
LOCAL_MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=your_leetcode_session_token
LEETCODE_CSRF_TOKEN=your_csrf_token
```

---

## 🆚 Comparison: Local vs Cloud Database

### Local Development (Your Computer)
```bash
# backend/.env
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
```
- ✅ Works locally
- ❌ Won't work on Render

### Cloud Deployment (Render)
```bash
# Render Environment Variables
LOCAL_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/leetracker
```
- ✅ Works on Render
- ✅ Also works locally!

---

## 💡 Pro Tip: Use Same Atlas DB Locally

You can use the same Atlas connection string in your local `.env` file:

**backend/.env:**
```bash
# Use Atlas for both local and production
LOCAL_MONGODB_URI=mongodb+srv://leetracker:password@cluster0.xxxxx.mongodb.net/leetracker?retryWrites=true&w=majority
```

Benefits:
- Same database everywhere
- No sync issues between local and production
- Easier testing

---

## 🆘 Still Having Issues?

### Error: "Authentication failed"
- ✅ Check username/password in Atlas
- ✅ Verify password is URL-encoded
- ✅ Confirm user has "Read and write" permissions

### Error: "ENOTFOUND" or "getaddrinfo"
- ✅ Check cluster hostname in connection string
- ✅ Verify Network Access includes 0.0.0.0/0
- ✅ Test connection string locally first

### Error: "ECONNREFUSED 127.0.0.1:27017"
- ❌ You're still using localhost!
- ✅ Update LOCAL_MONGODB_URI to Atlas connection string
- ✅ Redeploy on Render

---

## 🎯 Quick Action Steps

1. ☐ Create MongoDB Atlas account (2 min)
2. ☐ Create free cluster (2 min)
3. ☐ Add database user (30 sec)
4. ☐ Allow IP 0.0.0.0/0 (30 sec)
5. ☐ Copy connection string (10 sec)
6. ☐ Update Render environment variable (30 sec)
7. ☐ Trigger manual deploy on Render (10 sec)
8. ☐ Check logs for successful connection! ✅

**Total time: ~5 minutes**

---

Need help? Check `RENDER_DEPLOYMENT.md` for detailed step-by-step guide with screenshots!
