import mongoose from 'mongoose';

export const resolveMongoUri = (): string => {
  // For cloud deployment (Render, Vercel, etc.), use LOCAL_MONGODB_URI with Atlas connection string
  const uri = process.env.LOCAL_MONGODB_URI?.trim();
  return uri && uri.length > 0 ? uri : 'mongodb://127.0.0.1:27017/leetracker';
};

export const connectDB = async () => {
  // Works with both local MongoDB Compass and cloud MongoDB Atlas
  const mongoUri = resolveMongoUri();

  try {
    console.log('🔍 Database config check:');
    console.log('   process.env.LOCAL_MONGODB_URI:', process.env.LOCAL_MONGODB_URI ? 'Found' : 'NOT FOUND');
    console.log('   Environment:', process.env.NODE_ENV || 'development');
    console.log('   Connection type:', mongoUri.includes('mongodb+srv') ? 'Cloud (Atlas)' : 'Local (Compass)');
    console.log('   mongoUri length:', mongoUri.length);

    if (!mongoUri || mongoUri.trim() === '') {
      throw new Error('No MongoDB connection string available. Set LOCAL_MONGODB_URI.');
    }

    console.log('🔄 Connecting to MongoDB...');
    const redactedUri = mongoUri.includes('@')
      ? mongoUri.replace(/:[^:@]+@/, ':****@')
      : mongoUri;
    console.log('📍 URI:', redactedUri);

    await mongoose.connect(mongoUri, {
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
      console.error('   1. Check database username and password');
      console.error('   2. For Atlas: Verify credentials in MongoDB Atlas dashboard');
      console.error('   3. For Compass: Ensure authentication is configured correctly');
      console.error('   4. Password special characters should be URL-encoded');
      console.error('');
    }

    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('');
      console.error('🌐 Network Error - Please verify:');
      console.error('   1. For Atlas: Check cluster hostname in connection string');
      console.error('   2. For Atlas: Verify IP whitelist includes 0.0.0.0/0 for Render');
      console.error('   3. For Compass: Ensure MongoDB service is running locally');
      console.error('   4. Check internet/network connection');
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
