import mongoose from 'mongoose';

const USER_DB_PREFIX = 'user_';
const USER_DB_SUFFIX = '_db';

export const buildUserDatabaseName = (normalizedUsername: string) =>
  `${USER_DB_PREFIX}${normalizedUsername}${USER_DB_SUFFIX}`;

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

export const ensureUserDatabase = async (normalizedUsername: string) => {
  const dbName = buildUserDatabaseName(normalizedUsername);
  await createUserDatabase(dbName);
  return dbName;
};
