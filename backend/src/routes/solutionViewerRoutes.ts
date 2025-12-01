import express from 'express';
import { solutionViewerService } from '../services/solutionViewerService';
import TrackedUser from '../models/TrackedUser';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/:submissionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { submissionId } = req.params;
    const queryUsername = (req.query.username as string | undefined)?.trim();
    const authUserId = req.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required'
      });
    }
    console.log(`📝 Fetching solution for submission: ${submissionId}`);

    const normalizedUsername = queryUsername?.toLowerCase();
    const trackedUser = normalizedUsername
      ? await TrackedUser.findOne({ authUserId, normalizedUsername })
      : null;

    if (!trackedUser) {
      return res.status(403).json({
        success: false,
        error: 'not_tracked',
        message: 'Provide a tracked username to load this submission'
      });
    }
    
    const result = await solutionViewerService.fetchSolution(submissionId, {
      username: trackedUser.username,
      authUserId,
    });
    
    if (!result.success) {
      console.log(`❌ Failed to fetch solution: ${result.message}`);
      return res.status(404).json({
        success: false,
        error: 'Solution not found',
        message: result.message
      });
    }

    console.log(`✅ Successfully fetched solution for ${submissionId}`);
    res.json({
      success: true,
      solution: result.solution
    });
  } catch (error: any) {
    console.error('❌ Server error while fetching solution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch solution',
      message: error.message || 'Internal server error'
    });
  }
});

export default router;
