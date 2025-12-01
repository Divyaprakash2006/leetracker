import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';

const checkUsers = async () => {
  try {
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await AuthUser.find({}).select('username name createdAt');
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('👥 User List:');
      console.log('═══════════════════════════════════════════════════════════');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Username: ${user.username}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
      });
      console.log('\n═══════════════════════════════════════════════════════════');
    } else {
      console.log('ℹ️  No users found in database');
    }

    // Check for a specific username
    const specificUsername = 'testuser';
    const existingUser = await AuthUser.findOne({ username: specificUsername });
    
    if (existingUser) {
      console.log(`\n⚠️  User with username "${specificUsername}" EXISTS:`);
      console.log('   Name:', existingUser.name);
      console.log('   Created:', existingUser.createdAt);
    } else {
      console.log(`\n✅ Username "${specificUsername}" is AVAILABLE for registration`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUsers();
