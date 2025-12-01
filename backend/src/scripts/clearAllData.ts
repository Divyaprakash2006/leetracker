import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';
import TrackedUser from '../models/TrackedUser';
import User from '../models/User';
import Solution from '../models/Solution';

const clearAllData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    console.log('🗑️  CLEARING ALL DATA FROM DATABASE\n');
    console.log('═'.repeat(60));

    // Count documents before deletion
    const authUserCount = await AuthUser.countDocuments();
    const trackedUserCount = await TrackedUser.countDocuments();
    const userCount = await User.countDocuments();
    const solutionCount = await Solution.countDocuments();

    console.log('\n📊 Current database state:');
    console.log(`   Auth Users (login accounts): ${authUserCount}`);
    console.log(`   Tracked Users: ${trackedUserCount}`);
    console.log(`   LeetCode User Data: ${userCount}`);
    console.log(`   Solutions: ${solutionCount}`);
    console.log(`   Total documents: ${authUserCount + trackedUserCount + userCount + solutionCount}`);

    if (authUserCount + trackedUserCount + userCount + solutionCount === 0) {
      console.log('\n✅ Database is already empty - nothing to delete\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('\n🔥 Deleting all data...\n');

    // Delete all data from collections
    const [authResult, trackedResult, userResult, solutionResult] = await Promise.all([
      AuthUser.deleteMany({}),
      TrackedUser.deleteMany({}),
      User.deleteMany({}),
      Solution.deleteMany({}),
    ]);

    console.log('✅ Deletion complete:');
    console.log(`   ├─ Deleted ${authResult.deletedCount} auth users`);
    console.log(`   ├─ Deleted ${trackedResult.deletedCount} tracked users`);
    console.log(`   ├─ Deleted ${userResult.deletedCount} LeetCode user records`);
    console.log(`   └─ Deleted ${solutionResult.deletedCount} solutions`);

    // Verify deletion
    const remainingAuthUsers = await AuthUser.countDocuments();
    const remainingTrackedUsers = await TrackedUser.countDocuments();
    const remainingUsers = await User.countDocuments();
    const remainingSolutions = await Solution.countDocuments();

    console.log('\n📊 Database state after deletion:');
    console.log(`   Auth Users: ${remainingAuthUsers}`);
    console.log(`   Tracked Users: ${remainingTrackedUsers}`);
    console.log(`   LeetCode User Data: ${remainingUsers}`);
    console.log(`   Solutions: ${remainingSolutions}`);

    if (remainingAuthUsers + remainingTrackedUsers + remainingUsers + remainingSolutions === 0) {
      console.log('\n✅ SUCCESS! Database is now completely empty and ready for fresh users');
    } else {
      console.log('\n⚠️  WARNING: Some documents remain in the database');
    }

    console.log('\n═'.repeat(60));
    console.log('\n💡 You can now:');
    console.log('   1. Register new users at http://localhost:3000/signup');
    console.log('   2. Start fresh with clean data');
    console.log('   3. Each user will have their own isolated tracking');
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearAllData();
