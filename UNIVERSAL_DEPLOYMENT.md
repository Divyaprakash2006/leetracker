# 🌍 Universal Deployment Commands (Fixed for LeetTracker)
Works on Windows / Linux / macOS / VPS / Local server

## 📋 Prerequisites

```bash
# Install Node.js (v18 or higher)
# Download from: https://nodejs.org

# Install PM2 globally
npm install -g pm2

# Install serve globally (for frontend)
npm install -g serve
```

---

## 🔧 Backend Deployment (TypeScript)

### Windows (PowerShell/CMD):
```bash
cd backend
npm install
pm2 start npm --name "leetracker-backend" -- start
pm2 save
pm2 status
```

### Linux/macOS:
```bash
cd backend
npm install
pm2 start npm --name "leetracker-backend" -- start
pm2 save
pm2 status
```

**Backend runs on:** `http://localhost:5001`

---

## 🎨 Frontend Deployment (Vite Build)

### Windows (PowerShell/CMD):
```bash
cd frontend
npm install
npm run build
serve -s dist -l 3000
```

### Linux/macOS:
```bash
cd frontend
npm install
npm run build
serve -s dist -l 3000
```

**Frontend runs on:** `http://localhost:3000`

---

## 🔥 Deploy Both on Same Server

### Option 1: Separate Terminals
**Terminal 1 (Backend):**
```bash
cd backend
npm install
pm2 start npm --name "leetracker-backend" -- start
pm2 save
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run build
pm2 start serve --name "leetracker-frontend" -- -s dist -l 3000
pm2 save
```

### Option 2: One-Line Deployment
```bash
cd backend && npm install && pm2 start npm --name "leetracker-backend" -- start && cd ../frontend && npm install && npm run build && pm2 start serve --name "leetracker-frontend" -- -s dist -l 3000 && pm2 save
```

---

## 🎯 PM2 Management Commands

| Action | Command |
|--------|---------|
| Restart backend | `pm2 restart leetracker-backend` |
| Restart frontend | `pm2 restart leetracker-frontend` |
| Stop backend | `pm2 stop leetracker-backend` |
| Stop frontend | `pm2 stop leetracker-frontend` |
| Monitor logs | `pm2 logs` |
| Backend logs only | `pm2 logs leetracker-backend` |
| Frontend logs only | `pm2 logs leetracker-frontend` |
| Show status | `pm2 status` |
| Restart all | `pm2 restart all` |
| Stop all | `pm2 stop all` |
| Delete process | `pm2 delete leetracker-backend` |

---

## 🌐 Access Your Application

After deployment:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

---

## 📝 Environment Variables

### Backend (.env):
Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=RADafFeyKYbojL3t1mzvs7pSGNPiVuI68wUEghB4
SESSION_SECRET=3RTu7QqPN5k9MzHYbnZh0KU1EOl8C6doaVLsBvwc
PORT=5001
NODE_ENV=production
LEETCODE_API_URL=https://leetcode.com/graphql
LEETCODE_SESSION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYXV0aF91c2VyX2lkIjoiMTUzNTg1MjEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjA4OWE0NzhlNDc2ZDIxYTljN2VmZjMxYmE3YTcxZDVhZTc3ODlkMmNlZTBiMzM4OTVmZmQyNDkyYjE3MzMxODgiLCJzZXNzaW9uX3V1aWQiOiI0N2JmY2Y1ZCIsImlkIjoxNTM1ODUyMSwiZW1haWwiOiJkaXZpeWFwcmFrYXNoMzJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJEaXZ5YXByYWthc2hfMTIzIiwidXNlcl9zbHVnIjoiRGl2eWFwcmFrYXNoXzEyMyIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9EaXZ5YXByYWthc2hfMTIzL2F2YXRhcl8xNzQ5NjQ3MDQwLnBuZyIsInJlZnJlc2hlZF9hdCI6MTc2NDQ5NTY2OSwiaXAiOiIyNDA5OjQwZjQ6MzA1ODo0ZDNjOjE3ODphMDI4OjM4OTc6NmM4MiIsImlkZW50aXR5IjoiM2M5ZmM3ZGRlYzliNTg4MjNjMWM5Njc1NmRiZDQ1ZDgiLCJkZXZpY2Vfd2l0aF9pcCI6WyI5YmY0MTgwMWIwNGRlZDlkZTQzZWJjNzNjNzFkOWZhZCIsIjI0MDk6NDBmNDozMDU4OjRkM2M6MTc4OmEwMjg6Mzg5Nzo2YzgyIl0sIl9zZXNzaW9uX2V4cGlyeSI6MTIwOTYwMH0.qQfTy03CnflG8CmhH3S0DwboIGBdsjpk6RkMkIBrDKs
LEETCODE_CSRF_TOKEN=FJ5PdAzDRzwwLL4MxZitg7dMCGi25UC5
```

### Frontend (.env):
Create `frontend/.env.production`:
```env
VITE_API_URL=http://localhost:5001
```

---

## 🚀 Production Deployment (VPS/Cloud)

### For VPS with Public IP:

1. **Update Backend CORS** (if needed):
   - Edit `backend/src/index.ts`
   - Add your domain to CORS origins

2. **Update Frontend API URL**:
   ```env
   # frontend/.env.production
   VITE_API_URL=http://your-server-ip:5001
   # OR
   VITE_API_URL=https://api.yourdomain.com
   ```

3. **Use Nginx as Reverse Proxy** (Optional):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5001;
       }
   }
   ```

---

## 💎 Why This is Best?

| Feature | Support |
|---------|---------|
| Works on Windows | ✅ |
| Works on Linux / Ubuntu | ✅ |
| Works on macOS | ✅ |
| Works on Local / Cloud / VPS | ✅ |
| Runs forever | ✅ PM2 keeps running |
| Auto-restart on crash | ✅ PM2 handles it |
| TypeScript support | ✅ Uses tsx/npm start |
| Easy to manage | ✅ PM2 commands |

---

## 🔧 Troubleshooting

### Backend not starting:
```bash
# Check logs
pm2 logs leetracker-backend

# Verify MongoDB connection
# Check backend/.env has MONGODB_URI

# Restart
pm2 restart leetracker-backend
```

### Frontend not building:
```bash
# Clear cache
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Port already in use:
```bash
# Windows - Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac - Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

---

## 📦 Quick Deploy Script

Create `deploy.sh` (Linux/Mac) or `deploy.bat` (Windows):

**Windows (deploy.bat):**
```batch
@echo off
echo Installing dependencies...
cd backend
call npm install
cd ../frontend
call npm install

echo Building frontend...
call npm run build

echo Starting services...
cd ../backend
call pm2 start npm --name "leetracker-backend" -- start
cd ../frontend
call pm2 start serve --name "leetracker-frontend" -- -s dist -l 3000

call pm2 save
call pm2 status

echo.
echo ✅ Deployment complete!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5001
```

**Linux/Mac (deploy.sh):**
```bash
#!/bin/bash
echo "Installing dependencies..."
cd backend
npm install
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Starting services..."
cd ../backend
pm2 start npm --name "leetracker-backend" -- start
cd ../frontend
pm2 start serve --name "leetracker-frontend" -- -s dist -l 3000

pm2 save
pm2 status

echo ""
echo "✅ Deployment complete!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
```

Make executable (Linux/Mac):
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✨ Summary (Only Final Commands)

```bash
# Install tools
npm install -g pm2 serve

# Deploy backend
cd backend && npm install && pm2 start npm --name "leetracker-backend" -- start

# Deploy frontend
cd ../frontend && npm install && npm run build && pm2 start serve --name "leetracker-frontend" -- -s dist -l 3000

# Save PM2 configuration
pm2 save

# View status
pm2 status
```

---

**Your app is now running 24/7!** 🚀
