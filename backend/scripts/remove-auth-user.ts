import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AuthUser from '../src/models/AuthUser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const username = process.argv[2];

if (!username) {
  console.error('Usage: npx tsx scripts/remove-auth-user.ts <username>');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const result = await AuthUser.deleteOne({ username: username.toLowerCase() });
    if (result.deletedCount === 0) {
      console.log(`No user found with username ${username}`);
    } else {
      console.log(`User ${username} deleted successfully.`);
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
  } finally {
    await mongoose.disconnect();
  }
})();
