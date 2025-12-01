import crypto from 'crypto';
import mongoose from 'mongoose';
import AuthUser from '../models/AuthUser';

const USER_DB_PREFIX = 'user_';
const USER_DB_SUFFIX = '_db';

const createCandidateName = (normalizedUsername: string) => {
  const safeUsername = normalizedUsername.replace(/[^a-z0-9]/g, '');
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${USER_DB_PREFIX}${safeUsername}_${randomSuffix}${USER_DB_SUFFIX}`;
};

export const generateUniqueUserDatabaseName = async (
  normalizedUsername: string,
  maxAttempts = 5
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createCandidateName(normalizedUsername);
    const exists = await AuthUser.exists({ userDatabaseName: candidate });
    if (!exists) {
      return candidate;
    }
  }

  throw new Error('Failed to generate a unique database name for the user');
};

const ensureMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Cannot create user database.');
  }
  return uri;
};

export const createUserDatabase = async (dbName: string) => {
  const mongoUri = ensureMongoUri();
  const connection = await mongoose.createConnection(mongoUri, { dbName }).asPromise();

  try {
    await connection.collection('metadata').insertOne({
      initializedAt: new Date(),
      note: 'Initialized during user registration',
    });
  } catch (error) {
    throw error;
  } finally {
    await connection.close();
  }
};

