import express from "express";
import Solution from "../models/Solution";
import TrackedUser from "../models/TrackedUser";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { solutionViewerService } from "../services/solutionViewerService";

const router = express.Router();

router.get(
  "/user/:username/solutions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { username } = req.params;
      const authUserId = req.userId;

      if (!authUserId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const normalizedUsername = username.trim().toLowerCase();
      const trackedUser = await TrackedUser.findOne({ authUserId, normalizedUsername });

      if (!trackedUser) {
        return res.status(404).json({
          success: false,
          message: `User ${username} is not tracked by this account`,
        });
      }

      const limit = Math.max(
        1,
        Math.min(parseInt((req.query.limit as string) ?? "100", 10) || 100, 5000)
      );
      const skip = Math.max(0, parseInt((req.query.skip as string) ?? "0", 10) || 0);

      const query = { authUserId, normalizedUsername };
      const [solutions, total] = await Promise.all([
        Solution.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        Solution.countDocuments(query),
      ]);

      return res.json({
        success: true,
        solutions,
        total,
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch solutions", error);
      return res.status(500).json({
        success: false,
        error: "fetch_failed",
        message: error.message || "Failed to fetch solutions",
      });
    }
  }
);

router.get(
  "/:submissionId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { submissionId } = req.params;
      const authUserId = req.userId;
      const queryUsername = (req.query.username as string | undefined)?.trim();

      if (!authUserId) {
        return res.status(401).json({
          success: false,
          error: "auth_required",
          message: "Authentication required",
        });
      }

      const solution = await Solution.findOne({ submissionId, authUserId });

      if (solution?.code) {
        return res.json({
          success: true,
          solution,
        });
      }

      const normalizedHint = queryUsername?.toLowerCase();
      let trackedUser = normalizedHint
        ? await TrackedUser.findOne({ authUserId, normalizedUsername: normalizedHint })
        : null;

      if (!trackedUser && solution?.normalizedUsername) {
        trackedUser = await TrackedUser.findOne({
          authUserId,
          normalizedUsername: solution.normalizedUsername,
        });
      }

      if (!trackedUser) {
        return res.status(403).json({
          success: false,
          error: "not_tracked",
          message: "Please provide a tracked username to view this submission.",
        });
      }

      const result = await solutionViewerService.fetchSolution(submissionId, {
        username: trackedUser.username,
        authUserId,
      });

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: "fetch_failed",
          message: result.message || "Failed to fetch solution",
        });
      }

      if (!result.solution?.code) {
        return res.status(404).json({
          success: false,
          error: "no_code",
          message: "The solution exists but contains no code.",
        });
      }

      return res.json({
        success: true,
        solution: result.solution,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching solution ${req.params.submissionId}`, error);
      return res.status(500).json({
        success: false,
        error: "unexpected",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

export default router;
