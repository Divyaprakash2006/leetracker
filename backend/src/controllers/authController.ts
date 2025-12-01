import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser';
import { buildUserDatabaseName, createUserDatabase } from '../utils/userDatabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

const normalizeUsername = (value: string) => value.trim().toLowerCase();

const buildDefaultName = (username: string, providedName?: string) => {
  if (providedName && providedName.trim().length > 0) {
    return providedName.trim();
  }
  return username;
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password, name } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedUsername = normalizeUsername(username);

    const existingUser = await AuthUser.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userDatabaseName = buildUserDatabaseName(normalizedUsername);

    const user = new AuthUser({
      username: normalizedUsername,
      password: hashedPassword,
      name: buildDefaultName(normalizedUsername, name),
      userDatabaseName,
    });

    await user.save();

    try {
      await createUserDatabase(userDatabaseName);
    } catch (error) {
      await AuthUser.deleteOne({ _id: user._id });
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered and DB created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        userDatabaseName: user.userDatabaseName,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    const mongoDuplicate = error?.code === 11000;

    if (mongoDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    const normalizedUsername = normalizeUsername(username);

    const user = await AuthUser.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        userDatabaseName: user.userDatabaseName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await AuthUser.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        userDatabaseName: user.userDatabaseName,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const logoutUser = (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logout successful' });
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AuthUser.find({})
      .select('username name userDatabaseName createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users: users.map((user) => ({
        username: user.username,
        name: user.name,
        userDatabaseName: user.userDatabaseName,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const username = req.params.username?.toLowerCase().trim();

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const result = await AuthUser.deleteOne({ username });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: `User ${username} deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
