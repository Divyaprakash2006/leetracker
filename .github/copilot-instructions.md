# Copilot Instructions for leetracker

## MongoDB Connection
- This project uses ONLY MongoDB Atlas cloud connection.
- Local MongoDB is NOT supported - Atlas connection is required.
- Set your connection string in `backend/.env` as:
  ```ini
  MONGODB_URI=mongodb+srv://Divi_01:Divi123@cluster0.tpjds.mongodb.net/leetracker?retryWrites=true&w=majority&appName=Cluster0
  ```
- The backend will require `MONGODB_URI` environment variable.
- Ensure MongoDB Atlas Network Access allows connections (0.0.0.0/0 for development).

## Quick Start
- Ensure MongoDB Atlas Network Access allows your IP.
- In `backend/.env`, set the MongoDB Atlas connection string as above.
- Start backend:
  ```cmd
  cd backend
  npm install
  npm run dev
  ```

## Troubleshooting
- If you see connection errors, verify MongoDB Atlas Network Access allows 0.0.0.0/0.
- Use MongoDB Atlas dashboard to verify the connection string.

---
For all database operations, only MongoDB Atlas cloud connection is supported.
