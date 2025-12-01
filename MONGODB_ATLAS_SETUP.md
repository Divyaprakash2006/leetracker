# MongoDB Atlas Configuration for Production

## Your Current MongoDB Setup

**Connection String (Already Configured):**
```
mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
```

**Details:**
- Username: `Divi_01`
- Password: `Divi123`
- Cluster: `cluster0.tpjds.mongodb.net`
- Database: `leetracker`
- Region: `tpjds` (AWS/GCP/Azure region)

---

## Network Access Configuration (REQUIRED for Render/Railway)

### Step 1: Allow External Connections

1. Go to https://cloud.mongodb.com
2. Login with your account
3. Select your project containing **Cluster0**
4. Click **"Network Access"** in left sidebar (under Security section)

### Step 2: Add IP Whitelist

**Option A: Allow All (Easiest for Testing)**
1. Click **"Add IP Address"** button
2. Click **"Allow Access from Anywhere"** button
3. Confirm the `0.0.0.0/0` entry
4. Click **"Confirm"**
5. Wait 1-2 minutes for propagation

**Option B: Specific Render IPs (More Secure)**
1. Click **"Add IP Address"** button
2. Add these Render IP ranges one by one:
   - Check Render docs for current IP ranges
   - Or start with Option A first
3. Add description: "Render Backend"
4. Click **"Add Entry"**

### Step 3: Verify Database User

1. Click **"Database Access"** in left sidebar
2. Verify user `Divi_01` exists
3. Check "Built-in Role" is **"Atlas admin"** or **"Read and write to any database"**
4. If not, click "Edit" and update privileges

---

## Connection String Formats

### For Render/Railway Environment Variable
```env
LOCAL_MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
```

### If Password Has Special Characters
If your password contains special characters, URL encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `&` → `%26`

Example: Password `P@ss:123` becomes `P%40ss%3A123`

Your current password `Divi123` has no special characters ✅

---

## Testing Connection

### Test Locally First
1. Update `backend/.env`:
   ```env
   LOCAL_MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
   ```
2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Check console for: `✅ MongoDB Connected Successfully`

### Test from Render
1. After deploying to Render
2. Check logs in Render dashboard
3. Look for: `✅ MongoDB Connected Successfully`
4. If error: `MongoNetworkError`, check Network Access in Atlas

---

## Common Issues

### Issue: "Could not connect to any servers in your MongoDB Atlas cluster"
**Solution**: 
- Network Access not configured
- Go to Atlas → Network Access → Allow 0.0.0.0/0

### Issue: "Authentication failed"
**Solution**:
- Wrong username or password
- Verify Database Access in Atlas
- Check password doesn't have unencoded special characters

### Issue: "Connection timeout"
**Solution**:
- Network Access whitelist not updated yet (wait 2 minutes)
- Check MongoDB Atlas status page for outages

---

## Security Best Practices

✅ **Current Setup (Good for Development):**
- Network Access: `0.0.0.0/0` (allow all)
- Simple password without special characters
- Free tier (M0) cluster

⚠️ **For Production (Future):**
- Use IP whitelist instead of 0.0.0.0/0
- Use stronger password with special characters (URL encoded)
- Rotate passwords regularly
- Enable MongoDB Atlas audit logs
- Consider upgrading to M2+ tier for backups

---

## Quick Reference

**Atlas Dashboard**: https://cloud.mongodb.com
**Your Cluster**: Cluster0
**Database**: leetracker
**Connection Ready**: ✅ Yes, use the connection string above in Render

---

**After Network Access is configured, your Render backend will connect successfully!** 🚀
