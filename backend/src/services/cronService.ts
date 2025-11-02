import cron from 'node-cron';
import User from '../models/User';
import { syncUserSolutions } from '../services/leetcodeService';
import mongoose from 'mongoose';
import { resolveMongoUri } from '../config/database';

// Keeps track of sync attempts to prevent duplicate runs
let isSyncing = false;

// Helper to check database connection
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Database connection lost during auto-sync');
    try {
      const mongoUri = resolveMongoUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Database reconnected successfully');
    } catch (error) {
      console.error('❌ Failed to reconnect to database:', error);
      throw error;
    }
  }
};

// Helper to update user sync status
const updateUserSyncStatus = async (username: string, success: boolean, error?: string) => {
  try {
    await User.findOneAndUpdate(
      { username },
      { 
        $set: { 
          lastSync: new Date(),
          lastSyncStatus: success ? 'success' : 'failed',
          lastSyncError: error || null
        }
      }
    );
  } catch (updateError) {
    console.error(`❌ Failed to update sync status for ${username}:`, updateError);
  }
};

// Main auto-sync function
const performAutoSync = async () => {
  if (isSyncing) {
    console.log('⚠️ Auto-sync already in progress, skipping...');
    return;
  }

  isSyncing = true;
  console.log('\n⏰ Auto-sync triggered at', new Date().toLocaleString());

  try {
    // Ensure database connection is active
    await ensureDbConnection();

    // Get all users with autoSync enabled and not synced in last 23 hours
    const users = await User.find({ 
      autoSync: true,
      lastSync: { 
        $lt: new Date(Date.now() - 23 * 60 * 60 * 1000) 
      }
    });

    console.log(`📋 Found ${users.length} users eligible for auto-sync`);

    for (const user of users) {
      try {
        console.log(`\n🔄 Auto-syncing user: ${user.username}`);
        
        // Perform the sync
        const result = await syncUserSolutions(user.username);
        
        // Update sync status
        await updateUserSyncStatus(user.username, true);
        
        console.log(`✅ Auto-sync complete for ${user.username}`);
        console.log(`   💾 Saved/Updated: ${result.savedCount} solutions`);
        console.log(`   ⏭️  Skipped: ${result.skippedCount} solutions`);

        // Add delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error: any) {
        console.error(`❌ Auto-sync failed for ${user.username}:`, error.message);
        await updateUserSyncStatus(user.username, false, error.message);
        continue;
      }
    }

    console.log('\n✨ Auto-sync batch complete!');
  } catch (error: any) {
    console.error('❌ Auto-sync batch error:', error.message);
  } finally {
    isSyncing = false;
  }
};

// Start the auto-sync scheduler
export const startAutoSync = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', performAutoSync, {
    timezone: "UTC"
  });

  // Schedule cleanup of old sync data (30 days)
  cron.schedule('0 3 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Remove old error logs and sync statuses
      await User.updateMany(
        { lastSync: { $lt: thirtyDaysAgo } },
        { $unset: { lastSyncError: "" } }
      );
      
      console.log('🧹 Cleaned up old sync data');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  });

  console.log('⏰ Auto-sync scheduler started (runs daily at 2:00 AM UTC)');
  console.log('🧹 Cleanup scheduler started (runs daily at 3:00 AM UTC)');
};

// Function to manually trigger sync for testing
export const triggerManualSync = async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 Manually triggering auto-sync...');
    await performAutoSync();
  } else {
    console.log('⚠️ Manual sync only available in development mode');
  }
};
