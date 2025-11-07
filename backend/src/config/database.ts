import mongoose from 'mongoose';
import { checkMongoConfig, getConnectionAdvice } from '../utils/checkMongoConfig';

export const resolveMongoUri = (): string => {
  // Get MongoDB URI from environment
  const uri = process.env.LOCAL_MONGODB_URI?.trim();
  
  // If no URI provided, default to local MongoDB
  if (!uri || uri.length === 0) {
    return 'mongodb://127.0.0.1:27017/leetracker';
  }
  
  // For production/cloud deployment, ensure using Atlas (mongodb+srv://)
  if (process.env.NODE_ENV === 'production' && !uri.includes('mongodb+srv://')) {
    console.warn('⚠️  WARNING: Production environment detected but not using Atlas connection!');
    console.warn('⚠️  Localhost MongoDB will NOT work on Render/Vercel/cloud platforms.');
    console.warn('⚠️  Please set LOCAL_MONGODB_URI to a MongoDB Atlas connection string.');
  }
  
  return uri;
};

export const connectDB = async () => {
  // Run diagnostics
  checkMongoConfig();
  
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

    // Get tailored advice based on the error
    const advice = getConnectionAdvice(error);
    if (advice.length > 0) {
      console.error('');
      console.error('📖 TROUBLESHOOTING ADVICE:');
      console.error('='.repeat(60));
      advice.forEach(line => console.error(line));
      console.error('='.repeat(60));
      console.error('');
      console.error('🔗 Full setup guide: See RENDER_SETUP.md in your repository');
      console.error('');
    }

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
