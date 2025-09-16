import { Router } from 'express';
import { requireEmailVerification, requireAgeVerification } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint - coming soon',
    data: req.user
  });
});

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Update user profile endpoint - coming soon'
  });
});

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get('/:userId', (req, res) => {
  res.json({
    success: true,
    message: 'Get user by ID endpoint - coming soon',
    data: { userId: req.params.userId }
  });
});

export default router;