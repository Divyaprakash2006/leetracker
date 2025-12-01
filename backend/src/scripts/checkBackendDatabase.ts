import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkBackendDatabase = async () => {
  try {
    // Connect using the same logic as the backend
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    
    console.log('🔍 Checking backend database connection...\n');
    console.log('Environment Variables:');
    console.log('  LOCAL_MONGODB_URI:', process.env.LOCAL_MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('\nConnection URI:', mongoUri.includes('mongodb+srv') ? 'Atlas (Cloud)' : 'Local (Compass)');
    console.log('Redacted URI:', mongoUri.replace(/:[^:@]+@/, ':****@'), '\n');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully');
    console.log('📦 Database name:', mongoose.connection.db?.databaseName || 'Unknown');
    console.log('🌐 Host:', mongoose.connection.host, '\n');

    // Check for users
    const users = await AuthUser.find({}).select('username name createdAt');
    console.log(`📊 Total users in this database: ${users.length}\n`);

    if (users.length > 0) {
      console.log('👥 Users found:');
      console.log('═══════════════════════════════════════════════════════════');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.name})`);
        console.log(`   Created: ${user.createdAt}`);
      });
      console.log('═══════════════════════════════════════════════════════════');
    } else {
      console.log('✅ Database is empty - ready for new registrations');
    }

    // Check specifically for a test username
    const specificUsername = 'testuser';
    const existingUser = await AuthUser.findOne({ username: specificUsername });
    
    console.log(`\n🔍 Checking for username: ${specificUsername}`);
    if (existingUser) {
      console.log(`   ❌ EXISTS in this database`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Created: ${existingUser.createdAt}`);
      console.log(`   User ID: ${existingUser._id}`);
    } else {
      console.log(`   ✅ AVAILABLE for registration`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBackendDatabase();
