import { Router } from 'express';
import { requireEmailVerification } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/payments
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Payment history endpoint - coming soon',
    data: []
  });
});

/**
 * @route   POST /api/v1/payments/tip
 * @desc    Send tip to creator
 * @access  Private
 */
router.post('/tip', requireEmailVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Send tip endpoint - coming soon'
  });
});

export default router;