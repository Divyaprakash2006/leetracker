import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AuthUser from '../src/models/AuthUser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Please set it in backend/.env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = await AuthUser.find({}, { username: 1, name: 1, createdAt: 1 }).sort({ createdAt: 1 });
    console.log(`Found ${users.length} auth user(s):`);
    for (const user of users) {
      console.log(`- ${user.username} (${user.name}) created ${user.createdAt?.toISOString?.()}`);
    }
  } catch (error) {
    console.error('Failed to list auth users:', error);
  } finally {
    await mongoose.disconnect();
  }
})();
