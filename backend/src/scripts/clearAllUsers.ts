import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';
import TrackedUser from '../models/TrackedUser';
import User from '../models/User';
import Solution from '../models/Solution';

const MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';

const clearAllUsers = async () => {
  try {
    console.log('🗑️  Starting fresh database cleanup...\n');
    console.log('═'.repeat(80));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get counts before deletion
    const authUserCount = await AuthUser.countDocuments();
    const trackedUserCount = await TrackedUser.countDocuments();
    const userCount = await User.countDocuments();
    const solutionCount = await Solution.countDocuments();

    console.log('📊 Current Database State:');
    console.log(`   Auth Users (Accounts): ${authUserCount}`);
    console.log(`   Tracked Users: ${trackedUserCount}`);
    console.log(`   LeetCode User Data: ${userCount}`);
    console.log(`   Solutions: ${solutionCount}`);
    console.log(`   Total Records: ${authUserCount + trackedUserCount + userCount + solutionCount}`);
    console.log('');

    if (authUserCount === 0 && trackedUserCount === 0 && userCount === 0 && solutionCount === 0) {
      console.log('✅ Database is already empty. Nothing to clear.\n');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Warning
    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('   - All user accounts will be removed');
    console.log('   - All tracked users will be removed');
    console.log('   - All LeetCode data will be removed');
    console.log('   - All solutions will be removed');
    console.log('');
    console.log('🗑️  Deleting all data...\n');

    // Delete all collections
    const authResult = await AuthUser.deleteMany({});
    console.log(`✅ Deleted ${authResult.deletedCount} auth users (accounts)`);

    const trackedResult = await TrackedUser.deleteMany({});
    console.log(`✅ Deleted ${trackedResult.deletedCount} tracked users`);

    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} LeetCode user records`);

    const solutionResult = await Solution.deleteMany({});
    console.log(`✅ Deleted ${solutionResult.deletedCount} solutions`);

    // Verify deletion
    const finalAuthCount = await AuthUser.countDocuments();
    const finalTrackedCount = await TrackedUser.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalSolutionCount = await Solution.countDocuments();

    console.log('');
    console.log('📊 Final Database State:');
    console.log(`   Auth Users: ${finalAuthCount}`);
    console.log(`   Tracked Users: ${finalTrackedCount}`);
    console.log(`   LeetCode User Data: ${finalUserCount}`);
    console.log(`   Solutions: ${finalSolutionCount}`);
    console.log('');

    console.log('═'.repeat(80));
    console.log('✅ DATABASE CLEARED SUCCESSFULLY - FRESH PROJECT!');
    console.log('═'.repeat(80));
    console.log('');
    console.log('🎉 Your database is now completely fresh and ready!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Start your backend: cd backend && npm run dev');
    console.log('   2. Start your frontend: cd frontend && npm run dev');
    console.log('   3. Open: http://localhost:5173/signup');
    console.log('   4. Create your first account');
    console.log('   5. Start tracking LeetCode users!');
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error clearing database:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

clearAllUsers();
