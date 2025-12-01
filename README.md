# 🎯 LeetTracker - Personal LeetCode Progress Tracker

A full-stack web application for tracking multiple LeetCode users' progress with individual user accounts and private dashboards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

---

## ✨ Features

### 🔐 User Authentication
- **Secure Signup/Login** - Bcrypt password hashing + JWT tokens
- **Personal Dashboards** - Each user has their own private tracking space
- **Auto-redirect** - Seamless flow from signup/login to dashboard

### 📊 LeetCode Tracking
- **Track Multiple Users** - Monitor any LeetCode profile
- **Real-time Stats** - Problems solved (Easy/Medium/Hard), ranking, rating
- **Private Tracking Lists** - Your tracked users are only visible to you
- **Submission Viewer** - View code submissions with syntax highlighting
- **Analytics Dashboard** - Progress charts and statistics

### 🎨 User Interface
- **Modern Design** - Clean, responsive interface with Tailwind CSS
- **Dark Theme** - Eye-friendly dark mode
- **Mobile Responsive** - Works on all device sizes
- **Animated Backgrounds** - Beautiful gradient animations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB Compass** ([Download](https://www.mongodb.com/try/download/compass))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/leetracker.git
   cd leetracker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Setup MongoDB**
   - Install MongoDB Compass
   - Start MongoDB service (usually automatic)
   - Create database: `leetracker`

4. **Configure environment variables**
   
   Create `backend/.env`:
   ```env
   # MongoDB Configuration
   LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
   
   # JWT Secret (change this!)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the application**
   ```bash
   # Option 1: Use the startup script (Windows)
   start-all.bat

   # Option 2: Manual start
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📖 Usage Guide

### 1. Create Account
1. Go to `/signup`
2. Enter username, password, and name
3. Click "Sign Up"
4. **Auto-redirected** to your personal dashboard ✨

### 2. Track LeetCode Users
1. Click "Track now" button on dashboard
2. Enter any LeetCode username (e.g., `tourist`, `Errichto`)
3. Click "Track User"
4. View their stats on your dashboard!

### 3. View Analytics
- **Dashboard** - Top performers, summary stats
- **Users Page** - Full list of tracked users
- **Analytics** - Progress charts and trends
- **Submissions** - View code solutions

---

## 🏗️ Project Structure

```
leetracker/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Database & API configuration
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── scripts/        # Utility scripts
│   │   └── index.ts        # Server entry point
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, User)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── config/         # Frontend configuration
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
│
├── docs/                    # Documentation
├── start-all.bat           # Windows startup script
├── cleanup-for-github.ps1  # Cleanup script
└── README.md               # This file
```

---

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Bcrypt
- **API**: Axios for LeetCode GraphQL API

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

---

## 🔐 Security Features

✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Tokens** - Secure authentication  
✅ **Input Validation** - Server-side validation  
✅ **Data Isolation** - Users cannot see each other's data  
✅ **Environment Variables** - Sensitive data in .env  
✅ **CORS Protection** - Configured for security  

---

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register      - Create new account
POST /api/auth/login         - Login to account
GET  /api/auth/me            - Get current user
POST /api/auth/logout        - Logout
```

### Tracked Users
```
GET    /api/tracked-users              - Get all tracked users
POST   /api/tracked-users              - Add new tracked user
DELETE /api/tracked-users/:username    - Remove tracked user
PATCH  /api/tracked-users/:username/viewed - Update last viewed
```

### LeetCode Data
```
GET /api/user/:username              - Get user profile
GET /api/user/:username/stats        - Get user statistics
GET /api/user/:username/solutions    - Get user solutions
GET /api/user/:username/submissions  - Get submissions
```

### Utilities
```
GET /health                 - Health check
GET /api/test-leetcode      - Test LeetCode API
```

---

## 🧪 Testing

### Run Verification Scripts

```bash
cd backend

# Check current database state
npx tsx src/scripts/checkDashboardData.ts

# Verify user isolation
npx tsx src/scripts/verifyIsolatedUserTracking.ts

# Demonstrate privacy
npx tsx src/scripts/demonstratePrivacy.ts
```

### Test Accounts
After running `verifyIsolatedUserTracking.ts`:
- **alice_test** / password123
- **bob_test** / securepass456
- **charlie_test** / charlie789

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service or use MongoDB Compass

### Port Already in Use
```
Error: Port 5001 is already in use
```
**Solution**: 
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=5002
```

### LeetCode API Rate Limiting
```
Error: Failed to fetch from LeetCode API
```
**Solution**: Wait 1-2 minutes, try again with different username

### Frontend Not Loading
```
Cannot GET /
```
**Solution**: Ensure frontend is running on port 5173 (check terminal)

More troubleshooting: See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📝 Documentation

Comprehensive guides available in the `docs/` folder:

- **[QUICK_START.md](docs/QUICK_START.md)** - Quick setup guide
- **[DASHBOARD_GUIDE.md](docs/DASHBOARD_GUIDE.md)** - Dashboard usage
- **[AUTHENTICATION_GUIDE.md](docs/AUTHENTICATION_GUIDE.md)** - Auth system
- **[ISOLATED_TRACKING_VERIFIED.md](docs/ISOLATED_TRACKING_VERIFIED.md)** - Privacy verification
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LeetCode** - For providing the GraphQL API
- **MongoDB** - For the database solution
- **React Team** - For the amazing frontend framework
- **Tailwind CSS** - For the utility-first CSS framework

---

## 📧 Contact

**Project Maintainer**: Divyaprakash2006  
**Repository**: [github.com/Divyaprakash2006/leetracker](https://github.com/Divyaprakash2006/leetracker)

---

## 🌟 Support

If you found this project helpful, please give it a ⭐️ on GitHub!

---

**Made with ❤️ and lots of ☕**
