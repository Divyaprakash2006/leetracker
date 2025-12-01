# LeeTracker Authentication & Data Isolation

## Database Structure (Implemented ✅)

```
leetrackerDB
  ├── authusers (Main Users Table)
  │     ├── { _id: ObjectId("123"), name: "Divi", email: "divi@gmail.com", password: "hashed" }
  │     └── { _id: ObjectId("456"), name: "Sam", email: "sam@gmail.com", password: "hashed" }
  │
  ├── trackedusers (Per-User Tracked LeetCode Profiles)
  │     ├── { _id: ..., authUserId: ObjectId("123"), username: "john_doe", realName: "John" }
  │     ├── { _id: ..., authUserId: ObjectId("123"), username: "jane_smith", realName: "Jane" }
  │     └── { _id: ..., authUserId: ObjectId("456"), username: "bob_lee", realName: "Bob" }
  │
  ├── solutions (Per-User LeetCode Submissions)
  │     ├── { authUserId: ObjectId("123"), submissionId: "123456", username: "john_doe", code: "..." }
  │     ├── { authUserId: ObjectId("123"), submissionId: "123457", username: "jane_smith", code: "..." }
  │     └── { authUserId: ObjectId("456"), submissionId: "789012", username: "bob_lee", code: "..." }
  │
  └── users (Cached LeetCode Profile Data)
        ├── { authUserId: ObjectId("123"), username: "john_doe", ranking: 12345, problems: {...} }
        ├── { authUserId: ObjectId("123"), username: "jane_smith", ranking: 23456, problems: {...} }
        └── { authUserId: ObjectId("456"), username: "bob_lee", ranking: 34567, problems: {...} }
```

## Authentication Flow

### 1. Registration & Login
```typescript
// Registration
POST /api/auth/register
Body: { email: "divi@gmail.com", password: "secret123", name: "Divi" }
Response: { 
  success: true, 
  token: "jwt_token_here",
  user: { id: "123", email: "divi@gmail.com", name: "Divi" }
}

// Login
POST /api/auth/login
Body: { email: "divi@gmail.com", password: "secret123" }
Response: { 
  success: true, 
  token: "jwt_token_here",
  user: { id: "123", email: "divi@gmail.com", name: "Divi" }
}

// Frontend stores token
localStorage.setItem('auth_token', token);
```

### 2. Authenticated Requests
All subsequent requests include the JWT token:
```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

### 3. Backend Middleware Flow
```typescript
// 1. Extract token from header
const token = req.headers.authorization?.split(' ')[1];

// 2. Verify JWT and decode userId
const decoded = jwt.verify(token, JWT_SECRET);

// 3. Attach userId to request
req.userId = decoded.userId; // "123" for Divi

// 4. All DB queries use authUserId
TrackedUser.find({ authUserId: req.userId });
Solution.find({ authUserId: req.userId });
User.find({ authUserId: req.userId });
```

## Data Isolation Examples

### Example 1: Track a LeetCode User
```typescript
// Divi (userId: 123) tracks "john_doe"
POST /api/tracked-users
Headers: { Authorization: "Bearer divi_token" }
Body: { username: "john_doe", realName: "John" }

// Backend saves:
{
  _id: ObjectId("..."),
  authUserId: ObjectId("123"), // Divi's ID
  username: "john_doe",
  normalizedUsername: "john_doe",
  realName: "John",
  addedAt: Date.now()
}

// Sam (userId: 456) can ALSO track "john_doe" independently
POST /api/tracked-users
Headers: { Authorization: "Bearer sam_token" }
Body: { username: "john_doe", realName: "John Smith" }

// Backend saves a SEPARATE record:
{
  _id: ObjectId("..."),
  authUserId: ObjectId("456"), // Sam's ID
  username: "john_doe",
  normalizedUsername: "john_doe",
  realName: "John Smith",
  addedAt: Date.now()
}
```

### Example 2: Fetch Tracked Users
```typescript
// Divi requests tracked users
GET /api/tracked-users
Headers: { Authorization: "Bearer divi_token" }

// Backend query:
TrackedUser.find({ authUserId: "123" })

// Returns ONLY Divi's tracked users:
[
  { username: "john_doe", realName: "John" },
  { username: "jane_smith", realName: "Jane" }
]

// Sam requests tracked users
GET /api/tracked-users
Headers: { Authorization: "Bearer sam_token" }

// Backend query:
TrackedUser.find({ authUserId: "456" })

// Returns ONLY Sam's tracked users:
[
  { username: "bob_lee", realName: "Bob" }
]
```

### Example 3: Sync LeetCode Solutions
```typescript
// Divi syncs john_doe's solutions
POST /api/user/john_doe/sync
Headers: { Authorization: "Bearer divi_token" }

// Backend:
1. Verify john_doe is tracked by Divi
   TrackedUser.findOne({ authUserId: "123", normalizedUsername: "john_doe" })

2. Fetch solutions from LeetCode

3. Save solutions with Divi's authUserId
   Solution.create({
     authUserId: "123",
     normalizedUsername: "john_doe",
     submissionId: "123456",
     code: "...",
     ...
   })

// Sam syncs john_doe's solutions (if he also tracks john_doe)
POST /api/user/john_doe/sync
Headers: { Authorization: "Bearer sam_token" }

// Backend creates SEPARATE records:
   Solution.create({
     authUserId: "456", // Sam's ID
     normalizedUsername: "john_doe",
     submissionId: "123456",
     code: "...",
     ...
   })
```

### Example 4: View Solutions
```typescript
// Divi views john_doe's solutions
GET /api/user/john_doe/solutions
Headers: { Authorization: "Bearer divi_token" }

// Backend query:
Solution.find({ 
  authUserId: "123", // Divi's ID
  normalizedUsername: "john_doe" 
})

// Returns ONLY solutions synced by Divi

// Sam views john_doe's solutions
GET /api/user/john_doe/solutions
Headers: { Authorization: "Bearer sam_token" }

// Backend query:
Solution.find({ 
  authUserId: "456", // Sam's ID
  normalizedUsername: "john_doe" 
})

// Returns ONLY solutions synced by Sam
```

### Example 5: Delete Tracked User
```typescript
// Divi deletes john_doe from his tracking list
DELETE /api/tracked-users/john_doe
Headers: { Authorization: "Bearer divi_token" }

// Backend:
1. Delete tracked user record
   TrackedUser.deleteOne({ authUserId: "123", normalizedUsername: "john_doe" })

2. Delete associated solutions
   Solution.deleteMany({ authUserId: "123", normalizedUsername: "john_doe" })

3. Delete cached profile data
   User.deleteMany({ authUserId: "123", normalizedUsername: "john_doe" })

// john_doe still remains in Sam's tracking list (separate data)
```

## Security Features

### 1. JWT Token Authentication
- ✅ All protected routes require valid JWT token
- ✅ Token contains userId (authUserId)
- ✅ Tokens expire after configured time

### 2. Data Isolation
- ✅ Every query includes `authUserId` filter
- ✅ Users can only access their own tracked users
- ✅ Users can only access their own solutions
- ✅ No cross-user data leakage

### 3. Authorization Checks
```typescript
// Example: Ensure user owns the tracked username
const trackedUser = await TrackedUser.findOne({ 
  authUserId: req.userId,
  normalizedUsername: username 
});

if (!trackedUser) {
  return res.status(403).json({
    success: false,
    message: "You don't have permission to access this user"
  });
}
```

### 4. Database Indexes for Security & Performance
```typescript
// Ensures each authUser can track same username independently
TrackedUserSchema.index({ authUserId: 1, normalizedUsername: 1 }, { unique: true });

// Fast queries for user-scoped data
SolutionSchema.index({ authUserId: 1, normalizedUsername: 1, timestamp: -1 });
UserSchema.index({ authUserId: 1, normalizedUsername: 1 }, { unique: true });
```

## Protected Routes

All routes below require `Authorization: Bearer <token>` header:

### User Management
- `GET /api/tracked-users` - List your tracked users
- `POST /api/tracked-users` - Add user to your tracking list
- `DELETE /api/tracked-users/:username` - Remove from your tracking list

### LeetCode Data
- `GET /api/user/:username` - Get LeetCode profile (if you track them)
- `GET /api/user/:username/stats` - Get stats (if you track them)
- `POST /api/user/:username/sync` - Sync solutions (if you track them)
- `GET /api/user/:username/solutions` - Get solutions (if you track them)

### Solutions
- `GET /api/solutions/:submissionId` - View solution code (if you synced it)
- `GET /api/solutions/viewer/:submissionId` - Solution viewer (if you synced it)

## Complete Flow Example

```typescript
// 1. Divi registers
POST /api/auth/register
Body: { email: "divi@gmail.com", password: "secret", name: "Divi" }
Response: { token: "divi_jwt_token", user: { id: "123", ... } }

// 2. Divi tracks john_doe
POST /api/tracked-users
Headers: { Authorization: "Bearer divi_jwt_token" }
Body: { username: "john_doe" }
// DB: { authUserId: "123", username: "john_doe" }

// 3. Divi syncs john_doe's solutions
POST /api/user/john_doe/sync
Headers: { Authorization: "Bearer divi_jwt_token" }
// DB: Creates solutions with authUserId: "123"

// 4. Divi views john_doe's solutions
GET /api/user/john_doe/solutions
Headers: { Authorization: "Bearer divi_jwt_token" }
// Returns: Solutions where authUserId = "123"

// 5. Sam logs in (different user)
POST /api/auth/login
Body: { email: "sam@gmail.com", password: "secret" }
Response: { token: "sam_jwt_token", user: { id: "456", ... } }

// 6. Sam tries to view john_doe's solutions
GET /api/user/john_doe/solutions
Headers: { Authorization: "Bearer sam_jwt_token" }
// Backend query: Solution.find({ authUserId: "456", normalizedUsername: "john_doe" })
// Returns: Empty array (Sam hasn't tracked john_doe yet)

// 7. Sam tracks john_doe independently
POST /api/tracked-users
Headers: { Authorization: "Bearer sam_jwt_token" }
Body: { username: "john_doe" }
// DB: { authUserId: "456", username: "john_doe" }

// 8. Sam syncs john_doe's solutions
POST /api/user/john_doe/sync
Headers: { Authorization: "Bearer sam_jwt_token" }
// DB: Creates NEW solutions with authUserId: "456"

// Now both Divi and Sam have separate copies of john_doe's data
```

## Summary

Your LeeTracker app follows the exact authentication pattern you referenced:

```
appDB
  ├── users (AuthUser collection)
  │     ├── Divi's account
  │     └── Sam's account
  │
  ├── todos (TrackedUser collection - per-user tracking lists)
  │     ├── Divi's tracked users
  │     └── Sam's tracked users
  │
  ├── solutions (per-user submissions)
  │     ├── Solutions synced by Divi
  │     └── Solutions synced by Sam
  │
  └── users (cached profiles per-user)
        ├── Profiles cached by Divi
        └── Profiles cached by Sam
```

✅ **Everything is working correctly!**
- Each user can only access their own data
- No data leakage between users
- Multiple users can track the same LeetCode username independently
- All routes are properly authenticated
- All queries are scoped by `authUserId`
