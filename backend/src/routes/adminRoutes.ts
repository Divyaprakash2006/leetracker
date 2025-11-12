import express, { Request, Response } from 'express';
import AuthUser from '../models/AuthUser';
import TrackedUser from '../models/TrackedUser';
import Solution from '../models/Solution';

const router = express.Router();

// DEVELOPMENT ONLY - Clear all test data
if (process.env.NODE_ENV === 'development') {
  
  // Get all auth users (for debugging)
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await AuthUser.find({})
        .select('email name provider createdAt')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: users.length,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          name: u.name,
          provider: u.provider,
          createdAt: u.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  });

  // Check if email exists
  router.post('/check-email', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await AuthUser.findOne({ email: normalizedEmail });

      res.json({
        success: true,
        exists: !!user,
        provider: user?.provider || null,
        createdAt: user?.createdAt || null,
        message: user
          ? `Email exists (registered with ${user.provider} on ${user.createdAt.toLocaleString()})`
          : 'Email available for registration',
      });
    } catch (error: any) {
      console.error('Error checking email:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  });

  // Delete user by email
  router.delete('/user/:email', async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const normalizedEmail = email.toLowerCase().trim();

      console.log('🗑️  Attempting to delete user:', normalizedEmail);

      // Find the user first
      const user = await AuthUser.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Delete the user
      await AuthUser.deleteOne({ email: normalizedEmail });

      console.log('✅ User deleted successfully');

      res.json({
        success: true,
        message: `User ${normalizedEmail} deleted successfully`,
        deletedUser: {
          email: user.email,
          name: user.name,
          provider: user.provider,
        },
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  });

  // Clear ALL auth users (DANGEROUS - use with caution)
  router.delete('/clear-all-users', async (req: Request, res: Response) => {
    try {
      const { confirm } = req.body;

      if (confirm !== 'DELETE_ALL_USERS') {
        return res.status(400).json({
          success: false,
          message: 'Please provide confirmation: { "confirm": "DELETE_ALL_USERS" }',
        });
      }

      console.log('🗑️  CLEARING ALL AUTH USERS...');

      const result = await AuthUser.deleteMany({});

      console.log(`✅ Deleted ${result.deletedCount} users`);

      res.json({
        success: true,
        message: `Deleted ${result.deletedCount} auth users`,
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      console.error('Error clearing users:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  });

  // Get database statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const [authUsersCount, trackedUsersCount, solutionsCount] = await Promise.all([
        AuthUser.countDocuments(),
        TrackedUser.countDocuments(),
        Solution.countDocuments(),
      ]);

      res.json({
        success: true,
        stats: {
          authUsers: authUsersCount,
          trackedUsers: trackedUsersCount,
          solutions: solutionsCount,
        },
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  });

  console.log('🔧 Admin routes enabled (development mode)');
} else {
  // Production - disable admin routes
  router.all('*', (req: Request, res: Response) => {
    res.status(403).json({
      success: false,
      message: 'Admin routes are only available in development mode',
    });
  });
}

export default router;
