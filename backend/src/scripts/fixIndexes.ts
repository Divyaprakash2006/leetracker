import mongoose from 'mongoose';
import TrackedUser from '../models/TrackedUser';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';

async function fixIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = TrackedUser.collection;

    // List current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the problematic standalone normalizedUsername index
    console.log('\n🗑️  Dropping standalone normalizedUsername_1 index...');
    try {
      await collection.dropIndex('normalizedUsername_1');
      console.log('✅ Dropped normalizedUsername_1 index');
    } catch (error: any) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('ℹ️  Index normalizedUsername_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Ensure the compound index exists
    console.log('\n🔧 Ensuring compound index exists...');
    await collection.createIndex(
      { authUserId: 1, normalizedUsername: 1 },
      { unique: true, name: 'authUserId_1_normalizedUsername_1' }
    );
    console.log('✅ Compound index created/verified');

    // List indexes after fix
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.listIndexes().toArray();
    updatedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    console.log('\n✅ Index fix completed successfully!');
    console.log('\nYou can now add tracked users without duplicate key errors.');
    console.log('Multiple auth users can track the same LeetCode username.');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixIndexes();
