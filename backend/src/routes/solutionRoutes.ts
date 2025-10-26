import express from "express";
import Solution from "../models/Solution";
import { solutionViewerService } from "../services/solutionViewerService";

const router = express.Router();

router.get("/user/:username/solutions", async (req, res) => {
  try {
    const { username } = req.params;
    const solutions = await Solution.find({ username })
      .sort({ timestamp: -1 })
      .select("-screenshot");

    res.json({
      success: true,
      solutions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch solutions",
      message: error.message
    });
  }
});

router.get("/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    console.log(`🔍 Looking up solution: ${submissionId}`);

    // First try to get from database
    const solution = await Solution.findOne({ submissionId });
    if (solution?.code) {
      console.log(`✅ Found solution in database: ${submissionId}`);
      return res.json({
        success: true,
        solution
      });
    }

    // If not in database or no code, try to fetch
    console.log(`🌐 Fetching solution from LeetCode: ${submissionId}`);
    const result = await solutionViewerService.fetchSolution(submissionId);
    
    if (!result.success) {
      console.log(`❌ Failed to fetch solution: ${submissionId}`);
      return res.status(404).json({
        success: false,
        error: "Solution not found",
        message: result.message
      });
    }

    if (!result.solution?.code) {
      console.log(`⚠️ No code in solution: ${submissionId}`);
      return res.status(404).json({
        success: false,
        error: "No code found",
        message: "The solution exists but contains no code"
      });
    }

    console.log(`✅ Successfully fetched solution: ${submissionId}`);
    return res.json({
      success: true,
      solution: result.solution
    });
  } catch (error: any) {
    console.error(`❌ Error fetching solution: ${req.params.submissionId}`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch solution",
      message: error.message || "An unexpected error occurred"
    });
  }
});

export default router;
