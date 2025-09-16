import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    {
 *   username: string,
 *   email: string,
 *   password: string,
 *   confirmPassword: string,
 *   firstName: string,
 *   lastName: string,
 *   birthDate: string,
 *   accountType: 'fan' | 'creator',
 *   agreeToTerms: boolean
 * }
 */
router.post(
  '/register',
  AuthController.registerValidation,
  AuthController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 * @body    {
 *   email: string,
 *   password: string,
 *   rememberMe?: boolean
 * }
 */
router.post(
  '/login',
  AuthController.loginValidation,
  AuthController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT access token using refresh token
 * @access  Public
 * @body    {
 *   refreshToken: string
 * }
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 * @body    {
 *   refreshToken?: string
 * }
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email address with verification token
 * @access  Public
 * @body    {
 *   token: string
 * }
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @body    {
 *   email: string
 * }
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with reset token
 * @access  Public
 * @body    {
 *   token: string,
 *   newPassword: string,
 *   confirmPassword: string
 * }
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;