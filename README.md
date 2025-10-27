# LeetTrack – Real-Time LeetCode User Tracking System

A full-stack web application that tracks LeetCode user's coding activity in real-time.

## Features
- ✨ Search by LeetCode username or profile URL
- 👤 Display user profile with avatar
- 📊 Show solved problems (Easy, Medium, Hard)
- 🏆 Display ranking and contest rating
- 🌍 Show country and reputation
- ⚡ Real-time data fetching from LeetCode API

## Tech Stack
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **API**: LeetCode GraphQL API

## Installation & Setup

### Backend Setup
```bash
cd backend
npm install
$env:PORT=5001
npm run dev
```
Backend will run on http://localhost:5001

#### Configure MongoDB (Atlas or Local Compass)
Create a `.env` file inside the `backend/` folder with one of the following options:

**MongoDB Atlas (recommended for production)**
```ini
MONGODB_URI=mongodb+srv://<username>:<password>@cluster-url/myDatabase?retryWrites=true&w=majority
```

**Local MongoDB / MongoDB Compass**
```ini
# Optional: overrides are only used when MONGODB_URI is missing
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
```

If `MONGODB_URI` is not set the backend now falls back to `LOCAL_MONGODB_URI` (or `mongodb://127.0.0.1:27017/leetracker` by default) so you can connect directly to MongoDB Compass or a locally running `mongod` instance.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:3000

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Enter a LeetCode username or profile URL:
   - Username: `awice`
   - Or URL: `https://leetcode.com/u/awice/`
4. Click "Search" to fetch and display user data

## Troubleshooting

### "Failed to fetch data from LeetCode API" Error

This typically means one of the following:

#### 1. Backend Not Running
- Verify port 5001 is correct: `netstat -ano | findstr :5001`
- Start backend: `cd backend; $env:PORT=5001; npm run dev`

#### 2. LeetCode API Blocking
- Wait 1-2 minutes (rate limiting)
- Try a different username
- Check firewall allows outbound to leetcode.com

#### 3. Network Issues
- Test connectivity: `curl http://localhost:5001/health`
- Try manual test: `curl http://localhost:5001/api/test-leetcode`

### Debugging Steps

1. **Open Browser Console** (F12) to see detailed errors
2. **Check Backend Logs** for API response details
3. **Test API Manually** using the endpoints below

## API Endpoints

```
GET  http://localhost:5001/health                    - Health check
GET  http://localhost:5001/api/user/:username        - Fetch user data
GET  http://localhost:5001/api/test-leetcode         - Test LeetCode connectivity
GET  http://localhost:5001/api/user/:username/stats  - Get user statistics
```

### Response Format
```json
{
  "username": "kamyu104",
  "ranking": 12345,
  "country": "Taiwan",
  "reputation": 500,
  "avatar": "https://...",
  "contestRating": 2500,
  "problems": {
    "easy": 200,
    "medium": 150,
    "hard": 100,
    "total": 450
  }
}
```

## Test with Sample Users
- `kamyu104` - High-ranked competitive programmer
- `Divyaprakash_123` - Active user
- Your own LeetCode username!

## Project Structure
```
tracker/
├── backend/
│   ├── src/
│   │   └── index.ts       # Express server with GraphQL integration
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── App.tsx         # Main React component
    │   ├── main.tsx        # Entry point
    │   └── index.css       # Tailwind CSS
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## How It Works

1. **User Input**: User enters LeetCode username or URL
2. **Extract Username**: Frontend extracts username from URL if needed
3. **API Call**: Frontend sends request to backend `/api/user/:username`
4. **GraphQL Query**: Backend fetches data from LeetCode GraphQL API
5. **Format Response**: Backend processes and formats the data
6. **Display**: Frontend displays the formatted user statistics

## License
MIT
