import { Router } from 'express';
import { requireEmailVerification } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/subscriptions
 * @desc    Get user's subscriptions
 * @access  Private
 */
router.get('/', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'User subscriptions endpoint - coming soon',
    data: []
  });
});

/**
 * @route   POST /api/v1/subscriptions
 * @desc    Create new subscription
 * @access  Private
 */
router.post('/', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Create subscription endpoint - coming soon'
  });
});

export default router;