import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, name } = req.body;

    console.log('📝 Registration attempt:', { username, name, hasPassword: !!password });

    // Validate input
    if (!username || !password || !name) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide username, password, and name',
      });
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      console.log('❌ Invalid username format:', username);
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase().trim();

    // Check if user already exists
    console.log('🔍 Checking for existing user with username:', normalizedUsername);
    const existingUser = await AuthUser.findOne({ username: normalizedUsername });
    
    if (existingUser) {
      console.log('❌ User already exists!');
      console.log('   Username:', normalizedUsername);
      console.log('   Name:', existingUser.name);
      console.log('   Created:', existingUser.createdAt);
      console.log('   User ID:', existingUser._id);
      
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.',
      });
    }
    
    console.log('✅ Username is available - proceeding with registration');

    console.log('🔐 Hashing password...');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('👤 Creating user...');
    // Create new user
    const user = new AuthUser({
      username: normalizedUsername,
      password: hashedPassword,
      name: name.trim(),
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('🎟️  JWT token generated');

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to LeetCode Tracker.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    if (error.code === 11000) {
      // Duplicate key error - username already exists
      console.error('Duplicate key error - username:', error.keyValue);
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.',
      });
    }
    
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find user
    const user = await AuthUser.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await AuthUser.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Development only - Get all registered users (for debugging)
if (process.env.NODE_ENV === 'development') {
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await AuthUser.find({}).select('username name createdAt').sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: users.length,
        users: users.map(user => ({
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });

  // Delete user by username (for testing)
  router.delete('/users/:username', async (req: Request, res: Response) => {
    try {
      const username = req.params.username.toLowerCase().trim();
      const result = await AuthUser.deleteOne({ username });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('🗑️  Deleted user:', username);

      res.json({
        success: true,
        message: `User ${username} deleted successfully`,
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });
}



export default router;
