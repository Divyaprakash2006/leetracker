/**
 * Utility to check MongoDB configuration and provide helpful diagnostics
 */

export const checkMongoConfig = () => {
  const uri = process.env.LOCAL_MONGODB_URI?.trim();
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log('\n' + '='.repeat(60));
  console.log('🔍 MONGODB CONFIGURATION CHECK');
  console.log('='.repeat(60));

  // Check if URI is set
  if (!uri || uri.length === 0) {
    console.log('❌ LOCAL_MONGODB_URI: NOT SET');
    console.log('📝 Defaulting to: mongodb://127.0.0.1:27017/leetracker');
    console.log('⚠️  This will ONLY work for local development!');
  } else {
    console.log('✅ LOCAL_MONGODB_URI: Found');
  }

  // Check environment
  console.log(`📦 NODE_ENV: ${nodeEnv}`);

  // Detect connection type
  if (uri) {
    if (uri.includes('mongodb+srv://')) {
      console.log('🌍 Connection Type: Cloud (MongoDB Atlas)');
      console.log('✅ This will work on Render/Vercel/cloud platforms');
      
      // Check for common issues
      if (uri.includes('<password>')) {
        console.log('⚠️  WARNING: Connection string contains placeholder "<password>"');
        console.log('   Replace it with your actual password!');
      }
      
      if (uri.includes('@') && !uri.includes('?')) {
        console.log('⚠️  WARNING: Missing query parameters (e.g., ?retryWrites=true)');
      }

      // Check database name
      const dbMatch = uri.match(/\.net\/([^?]+)/);
      if (dbMatch && dbMatch[1]) {
        console.log(`📚 Database Name: ${dbMatch[1]}`);
      } else {
        console.log('⚠️  WARNING: Database name not specified in URI');
        console.log('   Add /leetracker before the query parameters (?)');
      }

    } else if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      console.log('💻 Connection Type: Local (MongoDB Compass/mongod)');
      
      if (nodeEnv === 'production') {
        console.log('');
        console.log('🚨 CRITICAL ERROR: Using localhost in production!');
        console.log('='.repeat(60));
        console.log('❌ Render/Vercel CANNOT connect to 127.0.0.1/localhost');
        console.log('');
        console.log('📖 Solution:');
        console.log('   1. Create a FREE MongoDB Atlas account');
        console.log('   2. Get your connection string (mongodb+srv://...)');
        console.log('   3. Set it in Render environment variables');
        console.log('');
        console.log('🔗 Quick guide: See RENDER_SETUP.md in your repository');
        console.log('='.repeat(60));
        console.log('');
      } else {
        console.log('✅ Local development - this is fine');
      }
    } else if (uri.includes('mongodb://') && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
      console.log('🌍 Connection Type: Remote MongoDB Server');
      console.log('✅ This should work on cloud platforms');
    } else {
      console.log('⚠️  Connection Type: Unknown/Invalid');
      console.log('   Check your LOCAL_MONGODB_URI format');
    }
  } else {
    // No URI set
    if (nodeEnv === 'production') {
      console.log('');
      console.log('🚨 CRITICAL ERROR: No database configuration in production!');
      console.log('='.repeat(60));
      console.log('❌ LOCAL_MONGODB_URI environment variable is not set');
      console.log('');
      console.log('📖 Solution:');
      console.log('   Set LOCAL_MONGODB_URI in Render environment variables');
      console.log('   Use MongoDB Atlas connection string:');
      console.log('   mongodb+srv://user:pass@cluster.mongodb.net/leetracker');
      console.log('');
      console.log('🔗 Full guide: See RENDER_SETUP.md');
      console.log('='.repeat(60));
      console.log('');
    }
  }

  console.log('='.repeat(60) + '\n');
};

export const getConnectionAdvice = (error: any): string[] => {
  const advice: string[] = [];
  const message = error.message || '';
  const code = error.code || '';

  if (code === 'ECONNREFUSED' || message.includes('ECONNREFUSED')) {
    advice.push('❌ Connection Refused Error');
    advice.push('');
    
    if (process.env.NODE_ENV === 'production') {
      advice.push('🚨 You are using localhost in production!');
      advice.push('   Render cannot connect to 127.0.0.1');
      advice.push('');
      advice.push('✅ Fix:');
      advice.push('   1. Set up MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
      advice.push('   2. Get connection string: mongodb+srv://...');
      advice.push('   3. Update LOCAL_MONGODB_URI in Render environment');
      advice.push('   4. Redeploy your service');
    } else {
      advice.push('💻 Local Development Issues:');
      advice.push('   1. Is MongoDB running? Check MongoDB Compass');
      advice.push('   2. Try: mongod (in terminal)');
      advice.push('   3. Check port 27017 is not blocked');
    }
  }

  if (message.includes('authentication failed') || message.includes('bad auth')) {
    advice.push('❌ Authentication Failed');
    advice.push('');
    advice.push('✅ Fix:');
    advice.push('   1. Check username and password in connection string');
    advice.push('   2. URL-encode special characters (@ → %40, # → %23)');
    advice.push('   3. Verify user exists in MongoDB Atlas Database Access');
    advice.push('   4. Ensure user has "Read and write to any database" role');
  }

  if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
    advice.push('❌ Host Not Found Error');
    advice.push('');
    advice.push('✅ Fix:');
    advice.push('   1. Check cluster hostname in connection string');
    advice.push('   2. Verify your MongoDB Atlas cluster is running');
    advice.push('   3. Check Network Access in Atlas (add 0.0.0.0/0)');
    advice.push('   4. Test connection string format');
  }

  if (message.includes('IP') || message.includes('not in whitelist')) {
    advice.push('❌ IP Address Not Whitelisted');
    advice.push('');
    advice.push('✅ Fix:');
    advice.push('   1. Go to MongoDB Atlas → Network Access');
    advice.push('   2. Click "Add IP Address"');
    advice.push('   3. Select "Allow Access from Anywhere" (0.0.0.0/0)');
    advice.push('   4. Click "Confirm"');
  }

  return advice;
};
