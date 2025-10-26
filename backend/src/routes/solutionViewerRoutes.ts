import express from 'express';
import { solutionViewerService } from '../services/solutionViewerService';

const router = express.Router();

router.get('/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    console.log(`📝 Fetching solution for submission: ${submissionId}`);
    
    const result = await solutionViewerService.fetchSolution(submissionId);
    
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
