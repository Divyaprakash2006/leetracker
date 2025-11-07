import express from 'express';
import { HydratedDocument } from 'mongoose';
import TrackedUser, { ITrackedUser } from '../models/TrackedUser';
import User from '../models/User';
import Solution from '../models/Solution';

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
  };
};

router.get('/', async (_req, res) => {
  try {
    const trackedUsers = await TrackedUser.find().sort({ addedAt: 1 });

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

router.post('/', async (req, res) => {
  try {
    const username: string = (req.body?.username || '').trim();
    const userId: string = (req.body?.userId || '').trim();
    const realName: string | undefined = req.body?.realName?.trim() || undefined;
    const addedBy: string | undefined = req.body?.addedBy?.trim() || undefined;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const effectiveUserId = userId || username;

    const normalized = username.toLowerCase();

    let trackedUser = await TrackedUser.findOne({ normalizedUsername: normalized });

    if (trackedUser) {
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
      if (addedBy && !trackedUser.addedBy) {
        trackedUser.addedBy = addedBy;
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
      addedBy,
      addedAt: new Date() 
    }).save();

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

router.delete('/', async (_req, res) => {
  try {
    const [trackedResult, userResult, solutionResult] = await Promise.all([
      TrackedUser.deleteMany({}),
      User.deleteMany({}),
      Solution.deleteMany({}),
    ]);

    const deletedCount = trackedResult.deletedCount ?? 0;
    const deletedUsers = userResult.deletedCount ?? 0;
    const deletedSolutions = solutionResult.deletedCount ?? 0;

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

router.delete('/:username', async (req, res) => {
  try {
    const username = (req.params.username || '').trim();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const normalized = username.toLowerCase();

    const trackedUser = await TrackedUser.findOne({ normalizedUsername: normalized });

    if (!trackedUser) {
      return res.status(404).json({
        success: false,
        message: `User ${username} was not being tracked`,
      });
    }

    await trackedUser.deleteOne();

    const [userDeleteResult, solutionDeleteResult] = await Promise.all([
      User.deleteMany({ username: trackedUser.username }),
      Solution.deleteMany({ username: trackedUser.username }),
    ]);

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

router.patch('/:username/viewed', async (req, res) => {
  try {
    const username = (req.params.username || '').trim().toLowerCase();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const trackedUser = await TrackedUser.findOneAndUpdate(
      { normalizedUsername: username },
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

export default router;
