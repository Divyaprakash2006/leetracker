import mongoose from 'mongoose';

const clearAllUsers = async () => {
  try {
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the AuthUser collection
    const authUsersCollection = mongoose.connection.collection('authusers');
    
    // Count before deletion
    const countBefore = await authUsersCollection.countDocuments();
    console.log(`📊 Current users in database: ${countBefore}`);
    
    if (countBefore > 0) {
      // Delete all users
      const result = await authUsersCollection.deleteMany({});
      console.log(`\n🗑️  Deleted ${result.deletedCount} users`);
      console.log('✅ All users cleared from database');
    } else {
      console.log('\nℹ️  Database is already empty - no users to delete');
    }

    // Verify deletion
    const countAfter = await authUsersCollection.countDocuments();
    console.log(`\n📊 Users remaining: ${countAfter}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAllUsers();
