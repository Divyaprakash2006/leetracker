# Copilot Instructions for leetracker

## MongoDB Connection
- This project is configured to connect ONLY to a local MongoDB instance (MongoDB Compass).
- Atlas and remote cluster support is removed; do not use `MONGODB_URI`.
- Set your connection string in `backend/.env` as:
  ```ini
  LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/leetracker
  ```
- The backend will always use `LOCAL_MONGODB_URI` or default to `mongodb://127.0.0.1:27017/leetracker` if unset.
- Ensure MongoDB is running locally before starting the backend.

## Quick Start
- Start MongoDB locally (use MongoDB Compass or run `mongod`).
- In `backend/.env`, confirm or set the local URI as above.
- Start backend:
  ```cmd
  cd backend
  npm install
  npm run dev
  ```

## Troubleshooting
- If you see `ECONNREFUSED 127.0.0.1:27017`, MongoDB is not running or the port is blocked.
- Use MongoDB Compass to verify the connection and database.

---
For all database operations, only local MongoDB is supported. Do not attempt to use Atlas or remote clusters.
