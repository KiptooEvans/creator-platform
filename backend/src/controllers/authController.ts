import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

import { config } from '../config/config';
import { DatabaseService } from '../services/DatabaseService';
import { RedisService } from '../services/RedisService';
import { User, ApiResponse, AuthTokens, JWTPayload } from '../types';
import { asyncHandler, createApiError } from '../middleware/errorHandler';

export class AuthController {
  // Register validation rules
  public static registerValidation = [
    body('username')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    body('firstName')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name is required'),
    body('lastName')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name is required'),
    body('accountType')
      .isIn(['fan', 'creator'])
      .withMessage('Account type must be fan or creator'),
    body('agreeToTerms')
      .isBoolean()
      .equals('true')
      .withMessage('You must agree to terms and conditions'),
  ];

  // Login validation rules
  public static loginValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  // Register new user
  public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => error.msg)
      };
      res.status(422).json(response);
      return;
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      accountType,
      birthDate
    } = req.body;

    // Check if user already exists
    const existingUserByEmail = await DatabaseService.getUserByEmail(email);
    if (existingUserByEmail) {
      throw createApiError('Email already registered', 409);
    }

    const existingUserByUsername = await DatabaseService.getUserByUsername(username);
    if (existingUserByUsername) {
      throw createApiError('Username already taken', 409);
    }

    // Validate age (must be 18+)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    if (age < 18) {
      throw createApiError('You must be at least 18 years old to register', 400);
    }

    // Hash password
    const saltRounds = config.bcryptRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      accountType,
      emailVerified: false,
      ageVerified: false,
      accountStatus: 'active' as const
    };

    const user = await DatabaseService.createUser(userData);

    // Generate email verification token
    const emailToken = uuidv4();
    await RedisService.set(
      `email_verification:${emailToken}`, 
      user.id, 
      24 * 3600 // 24 hours
    );

    // TODO: Send verification email
    console.log(`📧 Email verification token for ${email}: ${emailToken}`);

    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const { ...userResponse } = user;

    const response: ApiResponse<{ user: User; tokens: AuthTokens }> = {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: userResponse,
        tokens
      }
    };

    res.status(201).json(response);
  });

  // User login
  public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => error.msg)
      };
      res.status(422).json(response);
      return;
    }

    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      throw createApiError('Invalid email or password', 401);
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      throw createApiError('Account is suspended or banned', 403);
    }

    // Get password hash from database
    const passwordQuery = `SELECT password_hash FROM users WHERE id = $1`;
    const passwordResult = await DatabaseService.query(passwordQuery, [user.id]);
    
    if (passwordResult.rows.length === 0) {
      throw createApiError('Invalid email or password', 401);
    }

    const passwordHash = passwordResult.rows[0].password_hash;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw createApiError('Invalid email or password', 401);
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user, rememberMe);

    // Log user analytics
    await this.logUserAnalytics(user.id, 'login', req);

    const response: ApiResponse<{ user: User; tokens: AuthTokens }> = {
      success: true,
      message: 'Login successful',
      data: {
        user,
        tokens
      }
    };

    res.status(200).json(response);
  });

  // Refresh JWT token
  public static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createApiError('Refresh token is required', 401);
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as JWTPayload;
      
      // Check if refresh token exists in Redis
      const storedToken = await RedisService.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw createApiError('Invalid refresh token', 401);
      }

      // Get user
      const user = await DatabaseService.getUserById(decoded.userId);
      if (!user) {
        throw createApiError('User not found', 404);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      const response: ApiResponse<{ tokens: AuthTokens }> = {
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens }
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw createApiError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  });

  // User logout
  public static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (req.user && refreshToken) {
      // Remove refresh token from Redis
      await RedisService.del(`refresh_token:${req.user.id}`);
      
      // Log user analytics
      await this.logUserAnalytics(req.user.id, 'logout', req);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);
  });

  // Verify email
  public static verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
      throw createApiError('Verification token is required', 400);
    }

    // Get user ID from Redis
    const userId = await RedisService.get(`email_verification:${token}`);
    if (!userId) {
      throw createApiError('Invalid or expired verification token', 400);
    }

    // Update user's email verification status
    await DatabaseService.updateUser(userId, { emailVerified: true });

    // Remove verification token
    await RedisService.del(`email_verification:${token}`);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.status(200).json(response);
  });

  // Forgot password
  public static forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw createApiError('Email is required', 400);
    }

    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
      res.status(200).json(response);
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    await RedisService.set(
      `password_reset:${resetToken}`, 
      user.id, 
      3600 // 1 hour
    );

    // TODO: Send password reset email
    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    const response: ApiResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    res.status(200).json(response);
  });

  // Reset password
  public static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      throw createApiError('Token, new password, and confirmation are required', 400);
    }

    if (newPassword !== confirmPassword) {
      throw createApiError('Passwords do not match', 400);
    }

    // Validate password strength
    if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw createApiError('Password must be at least 8 characters with uppercase, lowercase, and number', 400);
    }

    // Get user ID from Redis
    const userId = await RedisService.get(`password_reset:${token}`);
    if (!userId) {
      throw createApiError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password in database
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    await DatabaseService.query(updateQuery, [hashedPassword, userId]);

    // Remove reset token
    await RedisService.del(`password_reset:${token}`);

    // Invalidate all existing refresh tokens for this user
    await RedisService.del(`refresh_token:${userId}`);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully'
    };

    res.status(200).json(response);
  });

  // Get current user
  public static getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw createApiError('User not authenticated', 401);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: req.user
    };

    res.status(200).json(response);
  });

  // Private helper methods
  private static async generateTokens(user: User, rememberMe: boolean = false): Promise<AuthTokens> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      accountType: user.accountType
    };

    // Generate access token (shorter expiry)
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    } as any);

    // Generate refresh token (longer expiry)
    const refreshTokenExpiry = rememberMe ? '30d' : config.jwtRefreshExpiresIn;
    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: refreshTokenExpiry
    } as any);

    // Store refresh token in Redis
    const ttl = rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600; // 30 days or 7 days
    await RedisService.set(`refresh_token:${user.id}`, refreshToken, ttl);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 3600 // 7 days in seconds
    };
  }

  private static async logUserAnalytics(
    userId: string, 
    eventType: string, 
    req: Request
  ): Promise<void> {
    try {
      const analyticsQuery = `
        INSERT INTO user_analytics (
          user_id, event_type, ip_address, user_agent, 
          country, device, browser, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;

      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';

      // Simple device/browser detection
      const device = this.detectDevice(userAgent);
      const browser = this.detectBrowser(userAgent);

      await DatabaseService.query(analyticsQuery, [
        userId,
        eventType,
        ipAddress,
        userAgent,
        null, // country - could be detected with IP geolocation service
        device,
        browser
      ]);
    } catch (error) {
      console.error('Failed to log user analytics:', error);
    }
  }

  private static detectDevice(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  private static detectBrowser(userAgent: string): string {
    if (/Chrome/.test(userAgent)) return 'chrome';
    if (/Firefox/.test(userAgent)) return 'firefox';
    if (/Safari/.test(userAgent)) return 'safari';
    if (/Edge/.test(userAgent)) return 'edge';
    return 'other';
  }
}