import mongoose from 'mongoose';

export const connectDB = async () => {
  // Get MongoDB URI from environment at runtime (not at import time)
  const MONGODB_URI = process.env.MONGODB_URI || '';
  
  try {
    console.log('🔍 Database config check:');
    console.log('   process.env.MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    console.log('   MONGODB_URI length:', MONGODB_URI.length);
    
    if (!MONGODB_URI || MONGODB_URI.trim() === '') {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    
    await mongoose.connect(MONGODB_URI, {
      // Automatically create indexes for schemas
      autoIndex: true,
      // Automatically create collections
      autoCreate: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.db?.databaseName || 'Unknown');
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('');
      console.error('🔐 Authentication Error - Please verify:');
      console.error('   1. Username is correct: Check "Database Access" in MongoDB Atlas');
      console.error('   2. Password is correct: Try resetting password in Atlas');
      console.error('   3. Password is URL-encoded: Special chars like @ should be %40');
      console.error('   4. User has proper permissions: "Read and write to any database"');
      console.error('');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('');
      console.error('🌐 Network Error - Please verify:');
      console.error('   1. Cluster hostname is correct in connection string');
      console.error('   2. Network Access allows your IP: 0.0.0.0/0 for testing');
      console.error('   3. Internet connection is working');
      console.error('');
    }
    
    console.log('⚠️  Running without MongoDB - data will not persist');
  }
};

export default mongoose;
