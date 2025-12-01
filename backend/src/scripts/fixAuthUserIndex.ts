import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';

const fixAuthUserIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('authusers');

    // List all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the problematic index if it exists
    try {
      await collection.dropIndex('provider_1_providerId_1');
      console.log('\n✅ Dropped old provider_1_providerId_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('\n⚠️  Index provider_1_providerId_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Update all local users to have undefined providerId instead of null
    const result = await collection.updateMany(
      { provider: 'local', providerId: null },
      { $unset: { providerId: '' } }
    );
    console.log(`\n✅ Updated ${result.modifiedCount} local users to remove null providerId`);

    // Recreate indexes by syncing the model
    await AuthUser.syncIndexes();
    console.log('✅ Recreated indexes from AuthUser model');

    // List indexes again to confirm
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.sparse ? '(sparse)' : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
};

fixAuthUserIndex();
