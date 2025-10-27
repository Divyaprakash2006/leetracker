import mongoose from 'mongoose';

export const connectDB = async () => {
  // Resolve MongoDB URI from env with sensible local fallback
  const envUri = process.env.MONGODB_URI?.trim();
  const localFallback = process.env.LOCAL_MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/leetracker';
  const usingLocalFallback = !envUri;
  const MONGODB_URI = usingLocalFallback ? localFallback : envUri!;
  
  try {
    console.log('🔍 Database config check:');
    console.log('   process.env.MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    console.log('   process.env.LOCAL_MONGODB_URI:', process.env.LOCAL_MONGODB_URI ? 'Found' : 'NOT FOUND');
    console.log('   Selected Mongo URI source:', usingLocalFallback ? 'local fallback' : 'MONGODB_URI env');
    console.log('   MONGODB_URI length:', MONGODB_URI.length);

    if (!MONGODB_URI || MONGODB_URI.trim() === '') {
      throw new Error('No MongoDB connection string available. Set MONGODB_URI or LOCAL_MONGODB_URI.');
    }

    if (usingLocalFallback) {
      console.warn('⚠️  MONGODB_URI not provided. Falling back to local MongoDB instance.');
      console.warn('   Update .env with MONGODB_URI to target Atlas or another cluster.');
    }

    console.log('🔄 Connecting to MongoDB...');
    const redactedUri = MONGODB_URI.includes('@')
      ? MONGODB_URI.replace(/:[^:@]+@/, ':****@')
      : MONGODB_URI;
    console.log('📍 URI:', redactedUri);
    
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

    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('🖥️  Local MongoDB Error - Please verify:');
      console.error('   1. MongoDB service is running locally (check MongoDB Compass or `mongod`)');
      console.error('   2. Connection string matches your local port (default 27017)');
      console.error('   3. No firewalls or VPNs are blocking localhost traffic');
      console.error('');
    }
    
    console.log('⚠️  Running without MongoDB - data will not persist');
  }
};

export default mongoose;
