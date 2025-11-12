import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser';
import passport from '../config/passport';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    console.log('📝 Registration attempt:', { email, name, hasPassword: !!password });

    // Validate input
    if (!email || !password || !name) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
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

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    console.log('🔍 Checking for existing user with email:', normalizedEmail);
    const existingUser = await AuthUser.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      console.log('❌ User already exists!');
      console.log('   Email:', normalizedEmail);
      console.log('   Provider:', existingUser.provider);
      console.log('   Name:', existingUser.name);
      console.log('   Created:', existingUser.createdAt);
      console.log('   User ID:', existingUser._id);
      
      // Provide more specific error message based on provider
      if (existingUser.provider !== 'local') {
        return res.status(400).json({
          success: false,
          message: `An account with this email already exists. Please sign in with ${existingUser.provider === 'google' ? 'Google' : 'GitHub'}.`,
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }
    
    console.log('✅ Email is available - proceeding with registration');

    console.log('🔐 Hashing password...');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('👤 Creating user...');
    // Create new user
    const user = new AuthUser({
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      provider: 'local',
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
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
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    if (error.code === 11000) {
      // Duplicate key error - email already exists
      console.error('Duplicate key error - email:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user has password (local provider)
    if (!user.password || user.provider !== 'local') {
      return res.status(401).json({
        success: false,
        message: 'Please use OAuth login (Google/GitHub) for this account',
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
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
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
        email: user.email,
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

// Development only - Check if email exists
if (process.env.NODE_ENV === 'development') {
  router.post('/check-email', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await AuthUser.findOne({ email: normalizedEmail });

      res.json({
        success: true,
        exists: !!existingUser,
        provider: existingUser?.provider || null,
        message: existingUser 
          ? `Email exists (registered with ${existingUser.provider})`
          : 'Email available',
      });
    } catch (error: any) {
      console.error('Check email error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });

  // Get all registered users (for debugging)
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await AuthUser.find({}).select('email name provider createdAt').sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: users.length,
        users: users.map(user => ({
          email: user.email,
          name: user.name,
          provider: user.provider,
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

  // Delete user by email (for testing)
  router.delete('/users/:email', async (req: Request, res: Response) => {
    try {
      const email = req.params.email.toLowerCase().trim();
      const result = await AuthUser.deleteOne({ email });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('🗑️  Deleted user:', email);

      res.json({
        success: true,
        message: `User ${email} deleted successfully`,
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });

  // Clear all test users (emails ending with @test.com or @example.com)
  router.post('/clear-test-users', async (req: Request, res: Response) => {
    try {
      const result = await AuthUser.deleteMany({
        $or: [
          { email: { $regex: '@test\\.com$', $options: 'i' } },
          { email: { $regex: '@example\\.com$', $options: 'i' } },
        ],
      });

      console.log('🗑️  Cleared test users:', result.deletedCount);

      res.json({
        success: true,
        message: `Cleared ${result.deletedCount} test user(s)`,
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      console.error('Clear test users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  });
}

// ============ PASSWORD RESET ROUTES ============

// Request password reset (generates reset token)
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔑 Password reset requested for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user
    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // Check if user has password (not OAuth user)
    if (user.provider !== 'local' || !user.password) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Password reset token generated');

    // In production, send email with reset link
    // For now, return the token (in production, only send via email)
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log('📧 Reset link:', resetLink);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link',
      // Remove these in production - only for testing
      resetToken,
      resetLink,
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔄 Password reset attempt');

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if it's a password reset token
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Find user
    const user = await AuthUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password',
    });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
  }
});

// ============ OAUTH ROUTES ============

// Google OAuth - Only enable if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Google OAuth - Initiate authentication
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // Google OAuth - Callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` }),
    (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }
    }
  );
} else {
  // Fallback route when Google OAuth is not configured
  router.get('/google', (req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
  });
  router.get('/google/callback', (req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
  });
}

// GitHub OAuth - Only enable if credentials are configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  // GitHub OAuth - Initiate authentication
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  // GitHub OAuth - Callback
  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=github_auth_failed` }),
    (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('GitHub callback error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }
    }
  );
} else {
  // Fallback route when GitHub OAuth is not configured
  router.get('/github', (req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
  });
  router.get('/github/callback', (req: Request, res: Response) => {
    res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
  });
}

export default router;
