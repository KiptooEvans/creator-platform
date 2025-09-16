import { Router } from 'express';
import { requireEmailVerification } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/messages
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Messages endpoint - coming soon',
    data: []
  });
});

/**
 * @route   POST /api/v1/messages
 * @desc    Send new message
 * @access  Private
 */
router.post('/', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Send message endpoint - coming soon'
  });
});

export default router;