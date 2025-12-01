import mongoose from 'mongoose';
import TrackedUser from '../models/TrackedUser';

const fixTrackedUserIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('trackedusers');

    // List all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    // Drop the problematic single-field index if it exists
    try {
      await collection.dropIndex('normalizedUsername_1');
      console.log('\n✅ Dropped old normalizedUsername_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('\n⚠️  Index normalizedUsername_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Recreate indexes by syncing the model
    await TrackedUser.syncIndexes();
    console.log('✅ Recreated indexes from TrackedUser model');

    // List indexes again to confirm
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    console.log('\nℹ️  The compound index { authUserId: 1, normalizedUsername: 1 } allows');
    console.log('   multiple users to track the same LeetCode username.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
};

fixTrackedUserIndex();
