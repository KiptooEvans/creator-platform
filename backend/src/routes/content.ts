import { Router } from 'express';
import { requireRole, requireAgeVerification } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/content
 * @desc    Get content feed
 * @access  Private
 */
router.get('/', requireAgeVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Content feed endpoint - coming soon',
    data: []
  });
});

/**
 * @route   POST /api/v1/content
 * @desc    Create new content
 * @access  Private (Creator only)
 */
router.post('/', requireRole('creator'), (req, res) => {
  res.json({
    success: true,
    message: 'Create content endpoint - coming soon'
  });
});

/**
 * @route   GET /api/v1/content/:contentId
 * @desc    Get content by ID
 * @access  Private
 */
router.get('/:contentId', requireAgeVerification, (req, res) => {
  res.json({
    success: true,
    message: 'Get content by ID endpoint - coming soon',
    data: { contentId: req.params.contentId }
  });
});

export default router;