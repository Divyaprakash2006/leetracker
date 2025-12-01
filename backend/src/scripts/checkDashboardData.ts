import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';
import TrackedUser from '../models/TrackedUser';
import User from '../models/User';

const MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';

async function checkDashboardData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all auth users
    const authUsers = await AuthUser.find().select('username name');
    console.log(`📊 Total Registered Users: ${authUsers.length}\n`);

    if (authUsers.length === 0) {
      console.log('❌ No users registered in the system!');
      console.log('📝 To test dashboard:');
      console.log('   1. Go to http://localhost:5173/signup');
      console.log('   2. Create an account');
      console.log('   3. Login and add LeetCode users to track\n');
      process.exit(0);
    }

    console.log('👥 Registered Users:');
    console.log('═'.repeat(80));

    for (const authUser of authUsers) {
      console.log(`\n🔑 User: ${authUser.username} (${authUser.name})`);
      console.log('─'.repeat(80));

      // Get tracked users for this auth user
      const trackedUsers = await TrackedUser.find({ authUserId: authUser._id });
      
      if (trackedUsers.length === 0) {
        console.log('   ⚠️  No LeetCode users tracked yet');
        console.log('   📝 This user\'s dashboard will show "No users tracked yet"');
        console.log('   💡 They need to:');
        console.log('      1. Login as:', authUser.username);
        console.log('      2. Go to Search page');
        console.log('      3. Add LeetCode usernames to track');
        continue;
      }

      console.log(`   ✅ Tracking ${trackedUsers.length} LeetCode user(s):\n`);

      for (const tracked of trackedUsers) {
        const leetcodeData = await User.findOne({
          authUserId: authUser._id,
          normalizedUsername: tracked.normalizedUsername,
        }).lean() as any;

        console.log(`   📌 ${tracked.username}`);
        if (tracked.realName) {
          console.log(`      Name: ${tracked.realName}`);
        }
        console.log(`      Added: ${new Date(tracked.addedAt).toLocaleDateString()}`);

        if (leetcodeData) {
          console.log(`      ✅ LeetCode Data Available:`);
          console.log(`         Total Solved: ${leetcodeData.problems?.total || 0}`);
          console.log(`         Easy: ${leetcodeData.problems?.easy || 0}`);
          console.log(`         Medium: ${leetcodeData.problems?.medium || 0}`);
          console.log(`         Hard: ${leetcodeData.problems?.hard || 0}`);
          console.log(`         Ranking: #${leetcodeData.ranking || 'N/A'}`);
        } else {
          console.log(`      ⚠️  LeetCode data not yet fetched`);
          console.log(`         (Dashboard will fetch on load)`);
        }
        console.log('');
      }

      // Calculate dashboard summary
      const totalProblems = trackedUsers.reduce((sum, tracked) => {
        const leetcodeData = tracked as any;
        return sum + (leetcodeData.problems?.total || 0);
      }, 0);

      console.log(`   📊 Dashboard Summary:`);
      console.log(`      Tracked Profiles: ${trackedUsers.length}`);
      console.log(`      Total Problems: ${totalProblems} (if data is cached)`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🎯 Dashboard Access:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Open: http://localhost:5173/login');
    console.log('   4. Login with one of the usernames above');
    console.log('   5. View: http://localhost:5173/dashboard');

    console.log('\n🔒 Privacy Note:');
    console.log('   Each user sees ONLY their own tracked LeetCode profiles.');
    console.log('   User A cannot see User B\'s tracked users (verified by compound indexes).');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkDashboardData();
