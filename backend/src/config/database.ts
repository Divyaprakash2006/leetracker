import mongoose from 'mongoose';
import { checkMongoConfig, getConnectionAdvice } from '../utils/checkMongoConfig';

export const resolveMongoUri = (): string => {
  // Get MongoDB URI from environment - MUST be MongoDB Atlas for production
  const uri = process.env.MONGODB_URI?.trim();
  
  // No fallback to local - cloud only
  if (!uri || uri.length === 0) {
    throw new Error('MONGODB_URI environment variable is required. Please set MongoDB Atlas connection string.');
  }
  
  // Enforce Atlas connection (mongodb+srv://)
  if (!uri.includes('mongodb+srv://')) {
    throw new Error('Only MongoDB Atlas (mongodb+srv://) connections are supported. Local MongoDB is not available.');
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
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'NOT SET ❌');
    console.log('   Environment:', process.env.NODE_ENV || 'development');
    console.log('   Connection type: MongoDB Atlas (Cloud)');

    if (!mongoUri || mongoUri.trim() === '') {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    const redactedUri = mongoUri.replace(/:[^:@]+@/, ':****@');
    console.log('📍 URI:', redactedUri);

    await mongoose.connect(mongoUri, {
      // Connection pooling
      maxPoolSize: 50, // Maximum number of connections
      minPoolSize: 5,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      
      // Timeouts
      serverSelectionTimeoutMS: 10000, // Reduced from 30s to 10s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Reduced from 30s to 10s
      
      // Performance
      autoIndex: true, // Automatically create indexes
      autoCreate: true, // Automatically create collections
      
      // Reliability
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Write concern
      
      // Monitoring
      heartbeatFrequencyMS: 10000, // Check connection every 10s
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.db?.databaseName || 'Unknown');

    console.log('✅ MongoDB Atlas connected successfully');
    console.log('📦 Database:', mongoose.connection.db?.databaseName || 'leetracker');
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection error:', error.message);

    // Get tailored advice
    const advice = getConnectionAdvice(error);
    if (advice.length > 0) {
      console.error('');
      console.error('📖 TROUBLESHOOTING ADVICE:');
      console.error('='.repeat(60));
      advice.forEach(line => console.error(line));
      console.error('='.repeat(60));
    }

    console.error('');
    console.error('🔐 Required: MongoDB Atlas connection string');
    console.error('   Set MONGODB_URI environment variable to:');
    console.error('   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/leetracker');
    console.error('');

    // Exit on connection failure - don't run without database
    process.exit(1);
  }
};

export default mongoose;
