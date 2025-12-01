# Fix for MongoDB Duplicate Key Error

## Problem
Error: `E11000 duplicate key error collection: leetracker.authusers index: provider_1_providerId_1 dup key: { provider: "local", providerId: null }`

This occurs because multiple local users have `providerId: null`, but the compound unique index requires unique combinations.

## Solution Applied

### 1. Updated AuthUser Model
- Changed `providerId` default from implicitly `null` to explicitly `undefined`
- Simplified the compound index to use `sparse: true` (which excludes documents where `providerId` is undefined/null)

### 2. Database Migration Required

Run the fix script to clean up existing data and indexes:

```cmd
cd backend
npx tsx src/scripts/fixAuthUserIndex.ts
```

This script will:
1. Drop the old problematic index `provider_1_providerId_1`
2. Update all local users to have `undefined` providerId (instead of `null`)
3. Recreate the proper sparse index
4. Display all indexes before and after for verification

### 3. Restart Backend

After running the fix script, restart your backend server:

```cmd
npm run dev
```

## Technical Explanation

**Why this happened:**
- MongoDB's unique indexes treat `null` as a value
- Multiple documents with `{ provider: "local", providerId: null }` violate the unique constraint
- The compound index `{ provider: 1, providerId: 1 }` was created without proper sparse configuration

**How we fixed it:**
- Using `sparse: true` makes the index ignore documents where the indexed field is `null` or `undefined`
- For local users, `providerId` is now `undefined` (field doesn't exist in the document)
- For OAuth users, `providerId` contains the provider's user ID
- The sparse unique index only enforces uniqueness on documents that have a `providerId` value

## Verification

After running the script, you should see:
```
✅ Dropped old provider_1_providerId_1 index
✅ Updated X local users to remove null providerId
✅ Recreated indexes from AuthUser model

📋 Updated indexes:
  - _id_: {"_id":1}
  - email_1: {"email":1}
  - provider_1_providerId_1: {"provider":1,"providerId":1} (sparse)
```

Now you can register multiple local users without encountering the duplicate key error.
