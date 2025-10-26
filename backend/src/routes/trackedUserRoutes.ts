import express from 'express';
import { HydratedDocument } from 'mongoose';
import TrackedUser, { ITrackedUser } from '../models/TrackedUser';

const router = express.Router();

type TrackedUserLike = ITrackedUser | HydratedDocument<ITrackedUser>;

const formatTrackedUser = (trackedUser: TrackedUserLike) => {
  const data = typeof (trackedUser as HydratedDocument<ITrackedUser>).toObject === 'function'
    ? (trackedUser as HydratedDocument<ITrackedUser>).toObject()
    : (trackedUser as ITrackedUser);

  return {
    username: data.username,
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

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const normalized = username.toLowerCase();

  let trackedUser = await TrackedUser.findOne({ normalizedUsername: normalized });

    if (trackedUser) {
      if (trackedUser.username !== username) {
        trackedUser.username = username;
        trackedUser = await trackedUser.save();
      }

      return res.json({
        success: true,
        user: formatTrackedUser(trackedUser),
        message: 'User already tracked',
      });
    }

  trackedUser = await new TrackedUser({ username, addedAt: new Date() }).save();

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

    res.json({
      success: true,
      message: `Stopped tracking ${trackedUser.username}`,
      user: formatTrackedUser(trackedUser),
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
