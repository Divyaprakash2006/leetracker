import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthUser from '../models/AuthUser';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    const userId = typeof decoded.userId === 'string' ? decoded.userId : String(decoded.userId);
    
    // Get user from database
    const user = await AuthUser.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = userId;
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      const userId = typeof decoded.userId === 'string' ? decoded.userId : String(decoded.userId);
      const user = await AuthUser.findById(userId).select('-password');
      
      if (user) {
        req.user = user;
        req.userId = userId;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
