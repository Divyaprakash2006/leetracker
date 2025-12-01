# How to Import Environment Variables to Vercel

## Option 1: Via Vercel CLI (Fastest)

1. Install Vercel CLI (if not installed):
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link to your project:
```bash
cd e:\tracker
vercel link
```

4. Add environment variable (replace URL with your Render backend URL):
```bash
vercel env add VITE_API_URL production
```
When prompted, paste: `https://leetracker-backend.onrender.com`

5. Redeploy:
```bash
vercel --prod
```

---

## Option 2: Via Vercel Dashboard (Web Interface)

1. Go to: https://vercel.com/dashboard

2. Select your project (leetracker)

3. Click **Settings** (top navigation)

4. Click **Environment Variables** (left sidebar)

5. Click **Add Another** button

6. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://leetracker-backend.onrender.com` (your actual Render URL)
   - **Environment**: Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

7. Click **Save**

8. Go to **Deployments** tab

9. Find latest deployment → Click **"..."** → **Redeploy**

---

## Option 3: Import from .env file

Vercel doesn't support direct .env file import, but you can use this format:

1. Copy the content from `.env.vercel`:
```
VITE_API_URL=https://leetracker-backend.onrender.com
```

2. Go to Vercel Dashboard → Settings → Environment Variables

3. For each line:
   - Split by `=`
   - Left side = Variable Name
   - Right side = Variable Value

4. Add them one by one

---

## Verify Environment Variables

After adding, verify in Vercel:

```bash
vercel env ls
```

You should see:
```
VITE_API_URL  Production, Preview, Development
```

---

## Important Notes

⚠️ **MUST UPDATE**: Replace `https://leetracker-backend.onrender.com` with your actual Render backend URL

⚠️ **VITE_ Prefix**: All frontend environment variables MUST start with `VITE_` to be accessible in the React app

⚠️ **Redeploy Required**: Environment variable changes require redeployment to take effect

---

## Troubleshooting

**"Network Error" persists after adding env var:**
1. Verify the backend URL is correct (visit it in browser, should show your API)
2. Make sure you redeployed after adding the variable
3. Check browser console for actual error
4. Verify backend is accepting requests from your Vercel domain

**Can't find environment variables in Vercel:**
- Make sure you're in the correct project
- Check you have proper permissions (owner/admin)
- Try refreshing the dashboard

**Backend URL keeps showing localhost:**
- Clear browser cache
- Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Verify environment variable is set for "Production" environment
