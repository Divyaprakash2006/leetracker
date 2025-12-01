import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';

const dropEmailIndexes = async () => {
  try {
    const mongoUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/leetracker';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const collection = mongoose.connection.db?.collection('authusers');
    
    if (!collection) {
      console.error('❌ Could not access authusers collection');
      process.exit(1);
    }

    console.log('🔍 Checking current indexes...\n');
    const indexes = await collection.indexes();
    
    console.log('📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });
    console.log('');

    // Find and drop email-related indexes
    const emailIndexes = indexes.filter(idx => 
      idx.name && (
        idx.name.includes('email') || 
        idx.name.includes('provider') ||
        JSON.stringify(idx.key).includes('email')
      )
    );

    if (emailIndexes.length === 0) {
      console.log('✅ No email-related indexes found - database is clean!\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🗑️  Found email-related indexes to remove:');
    emailIndexes.forEach(idx => {
      console.log(`   - ${idx.name}`);
    });
    console.log('');

    // Drop each email-related index
    for (const index of emailIndexes) {
      if (index.name === '_id_') {
        console.log(`⏭️  Skipping _id_ index (system index)`);
        continue;
      }

      try {
        await collection.dropIndex(index.name);
        console.log(`✅ Dropped index: ${index.name}`);
      } catch (error: any) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log(`⚠️  Index ${index.name} already removed`);
        } else {
          console.error(`❌ Error dropping ${index.name}:`, error.message);
        }
      }
    }

    console.log('\n🔍 Verifying remaining indexes...\n');
    const remainingIndexes = await collection.indexes();
    
    console.log('📋 Remaining indexes:');
    remainingIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Email indexes cleanup complete!');
    console.log('💡 Only username-based authentication is now active\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropEmailIndexes();
