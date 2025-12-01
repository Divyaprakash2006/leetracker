import express from 'express';
import { HydratedDocument } from 'mongoose';
import TrackedUser, { ITrackedUser } from '../models/TrackedUser';
import User from '../models/User';
import Solution from '../models/Solution';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

type TrackedUserLike = ITrackedUser | HydratedDocument<ITrackedUser>;

const formatTrackedUser = (trackedUser: TrackedUserLike) => {
  const data = typeof (trackedUser as HydratedDocument<ITrackedUser>).toObject === 'function'
    ? (trackedUser as HydratedDocument<ITrackedUser>).toObject()
    : (trackedUser as ITrackedUser);

  return {
    username: data.username,
    userId: data.userId,
    realName: data.realName ?? null,
    addedBy: data.addedBy ?? null,
    addedAt: data.addedAt,
    lastViewedAt: data.lastViewedAt ?? null,
    notes: data.notes ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    hasLeetCodeAuth: Boolean(data.leetcodeSessionUpdatedAt),
  };
};

// Get all tracked users for the logged-in user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    
    console.log('📋 Fetching tracked users for authUser:', authUserId);
    
    const trackedUsers = await TrackedUser.find({ authUserId }).sort({ addedAt: 1 });

    console.log(`✅ Found ${trackedUsers.length} tracked users`);

    res.json({
      success: true,
      users: trackedUsers.map((user) => formatTrackedUser(user)),
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch tracked users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracked users',
      error: error.message,
    });
  }
});

// Add a new tracked user for the logged-in user
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    const authUserName = req.user?.name;
    
    const username: string = (req.body?.username || '').trim();
    const userId: string = (req.body?.userId || '').trim();
    const realName: string | undefined = req.body?.realName?.trim() || undefined;
    const leetcodeSession: string | undefined = req.body?.leetcodeSession?.trim() || undefined;
    const leetcodeCsrfToken: string | undefined = req.body?.leetcodeCsrfToken?.trim() || undefined;

    console.log('➕ Adding tracked user:', { username, authUserId, authUserName });

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const effectiveUserId = userId || username;
    const normalized = username.toLowerCase();

    // Check if this user is already tracked by this auth user
    let trackedUser = await TrackedUser.findOne({ 
      authUserId, 
      normalizedUsername: normalized 
    });

    if (trackedUser) {
      console.log('ℹ️  User already tracked by this auth user');
      // Update existing user
      if (trackedUser.username !== username) {
        trackedUser.username = username;
      }
      if (!trackedUser.userId || trackedUser.userId !== effectiveUserId) {
        trackedUser.userId = effectiveUserId;
      }
      if (realName && !trackedUser.realName) {
        trackedUser.realName = realName;
      }
      if (leetcodeSession || leetcodeCsrfToken) {
        if (leetcodeSession) {
          trackedUser.leetcodeSession = leetcodeSession;
          trackedUser.leetcodeSessionUpdatedAt = new Date();
        }
        if (leetcodeCsrfToken) {
          trackedUser.leetcodeCsrfToken = leetcodeCsrfToken;
        }
      }
      trackedUser = await trackedUser.save();

      return res.json({
        success: true,
        user: formatTrackedUser(trackedUser),
        message: 'User already tracked',
      });
    }

    // Create new tracked user
      trackedUser = await new TrackedUser({ 
        username, 
        userId: effectiveUserId, 
        realName,
        addedBy: authUserName,
        authUserId,
        addedAt: new Date(),
        leetcodeSession,
        leetcodeCsrfToken,
        leetcodeSessionUpdatedAt: leetcodeSession ? new Date() : undefined,
      }).save();

    console.log('✅ Tracked user created:', trackedUser._id);

    res.status(201).json({
      success: true,
      user: formatTrackedUser(trackedUser),
      message: 'User added to tracked list',
    });
  } catch (error: any) {
    console.error('❌ Failed to add tracked user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add tracked user',
      error: error.message,
    });
  }
});

// Delete all tracked users for the logged-in user
router.delete('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    
    console.log('🗑️  Deleting all tracked users for authUser:', authUserId);
    
    // Get all tracked users for this auth user
    const trackedUsers = await TrackedUser.find({ authUserId });
    const usernames = trackedUsers.map(tu => tu.username);
    const normalizedUsernames = trackedUsers.map(tu => tu.normalizedUsername);
    
    // Delete tracked users
    const trackedResult = await TrackedUser.deleteMany({ authUserId });
    
    // Delete associated LeetCode data for these users
    const [userResult, solutionResult] = await Promise.all([
      User.deleteMany({ authUserId, normalizedUsername: { $in: normalizedUsernames } }),
      Solution.deleteMany({ authUserId, normalizedUsername: { $in: normalizedUsernames } }),
    ]);

    const deletedCount = trackedResult.deletedCount ?? 0;
    const deletedUsers = userResult.deletedCount ?? 0;
    const deletedSolutions = solutionResult.deletedCount ?? 0;

    console.log(`✅ Deleted ${deletedCount} tracked users, ${deletedUsers} user records, ${deletedSolutions} solutions`);

    res.json({
      success: true,
      message:
        deletedCount === 0
          ? 'No tracked users to remove'
          : `Removed ${deletedCount} tracked user${deletedCount === 1 ? '' : 's'} and cleared associated records`,
      deletedCount,
      deletedUsers,
      deletedSolutions,
    });
  } catch (error: any) {
    console.error('❌ Failed to remove all tracked users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove all tracked users',
      error: error.message,
    });
  }
});

// Delete a specific tracked user for the logged-in user
router.delete('/:username', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    const username = (req.params.username || '').trim();

    console.log('🗑️  Deleting tracked user:', { username, authUserId });

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const normalized = username.toLowerCase();

    const trackedUser = await TrackedUser.findOne({ 
      authUserId,
      normalizedUsername: normalized 
    });

    if (!trackedUser) {
      return res.status(404).json({
        success: false,
        message: `User ${username} was not being tracked by you`,
      });
    }

    await trackedUser.deleteOne();

    // Delete associated LeetCode data
    const [userDeleteResult, solutionDeleteResult] = await Promise.all([
      User.deleteMany({ authUserId, normalizedUsername: trackedUser.normalizedUsername }),
      Solution.deleteMany({ authUserId, normalizedUsername: trackedUser.normalizedUsername }),
    ]);

    console.log(`✅ Deleted tracked user and ${userDeleteResult.deletedCount} user records, ${solutionDeleteResult.deletedCount} solutions`);

    res.json({
      success: true,
      message: `Stopped tracking ${trackedUser.username} and removed related data`,
      user: formatTrackedUser(trackedUser),
      deletedUsers: userDeleteResult.deletedCount ?? 0,
      deletedSolutions: solutionDeleteResult.deletedCount ?? 0,
    });
  } catch (error: any) {
    console.error('❌ Failed to remove tracked user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove tracked user',
      error: error.message,
    });
  }
});

// Update last viewed time for a tracked user
router.patch('/:username/viewed', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    const username = (req.params.username || '').trim().toLowerCase();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const trackedUser = await TrackedUser.findOneAndUpdate(
      { authUserId, normalizedUsername: username },
      { $set: { lastViewedAt: new Date() } },
      { new: true }
    );

    if (!trackedUser) {
      return res.status(404).json({
        success: false,
        message: 'Tracked user not found',
      });
    }

    res.json({
      success: true,
      user: formatTrackedUser(trackedUser),
    });
  } catch (error: any) {
    console.error('❌ Failed to update tracked user view time:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracked user view time',
      error: error.message,
    });
  }
});

// Update LeetCode auth tokens for a tracked user
router.patch('/:username/auth', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const authUserId = req.userId;
    const usernameParam = (req.params.username || '').trim();

    if (!usernameParam) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const normalizedUsername = usernameParam.toLowerCase();

    const trackedUser = await TrackedUser.findOne({
      authUserId,
      normalizedUsername,
    }).select('+leetcodeSession +leetcodeCsrfToken');

    if (!trackedUser) {
      return res.status(404).json({
        success: false,
        message: `Tracked user ${usernameParam} not found`,
      });
    }

    const rawSession = req.body?.leetcodeSession;
    const rawCsrf = req.body?.leetcodeCsrfToken;
    const clearAuth = req.body?.clear === true;

    if (clearAuth) {
      trackedUser.leetcodeSession = undefined;
      trackedUser.leetcodeCsrfToken = undefined;
      trackedUser.leetcodeSessionUpdatedAt = undefined;
    } else {
      const sessionToken = typeof rawSession === 'string' ? rawSession.trim() : undefined;
      const csrfToken = typeof rawCsrf === 'string' ? rawCsrf.trim() : undefined;

      if (!sessionToken && !csrfToken && rawSession === undefined && rawCsrf === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Provide leetcodeSession, leetcodeCsrfToken, or set clear=true to remove credentials',
        });
      }

      if (sessionToken) {
        trackedUser.leetcodeSession = sessionToken;
        trackedUser.leetcodeSessionUpdatedAt = new Date();
      } else if (rawSession === '') {
        trackedUser.leetcodeSession = undefined;
        trackedUser.leetcodeSessionUpdatedAt = undefined;
      }

      if (csrfToken !== undefined) {
        trackedUser.leetcodeCsrfToken = csrfToken || undefined;
        trackedUser.leetcodeSessionUpdatedAt = trackedUser.leetcodeSession
          ? trackedUser.leetcodeSessionUpdatedAt ?? new Date()
          : trackedUser.leetcodeSessionUpdatedAt;
      }
    }

    await trackedUser.save();

    res.json({
      success: true,
      message: clearAuth ? 'LeetCode credentials removed' : 'LeetCode credentials updated',
      user: formatTrackedUser(trackedUser),
    });
  } catch (error: any) {
    console.error('❌ Failed to update LeetCode credentials:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update LeetCode credentials',
      error: error.message,
    });
  }
});

export default router;
