import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { JWTPayload, ApiError } from '../types';
import { DatabaseService } from '../services/DatabaseService';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const error: ApiError = new Error('Access token is required') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    // Get user from database
    const user = await DatabaseService.getUserById(decoded.userId);
    
    if (!user) {
      const error: ApiError = new Error('User not found') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    // Check if user account is active
    if (user.accountStatus !== 'active') {
      const error: ApiError = new Error('Account is suspended or banned') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errors: [error.message]
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        errors: ['Please log in again']
      });
    }

    // Handle custom API errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ApiError;
      return res.status(apiError.statusCode).json({
        success: false,
        message: apiError.message,
        errors: [apiError.message]
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      errors: ['Internal server error']
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: ['User not authenticated']
      });
    }

    if (!roles.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errors: [`Required role: ${roles.join(' or ')}`]
      });
    }

    next();
  };
};

export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: ['User not authenticated']
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      errors: ['Please verify your email address']
    });
  }

  next();
};

export const requireAgeVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: ['User not authenticated']
    });
  }

  if (!req.user.ageVerified) {
    return res.status(403).json({
      success: false,
      message: 'Age verification required',
      errors: ['Please complete age verification']
    });
  }

  next();
};