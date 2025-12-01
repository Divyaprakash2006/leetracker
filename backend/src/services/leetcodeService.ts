import axios from 'axios';
import mongoose from 'mongoose';
import Solution from '../models/Solution';
import { solutionViewerService } from './solutionViewerService';

// Main sync function: fetch and store all solutions
export const syncUserSolutions = async (username: string, authUserId: string) => {
  try {
    if (!authUserId) {
      throw new Error('authUserId is required to sync solutions');
    }

    const normalizedUsername = username.trim().toLowerCase();
    const authObjectId = new mongoose.Types.ObjectId(authUserId);

    console.log(`\n Starting sync for user: ${username}`);

    // Fetch recent submissions
    console.log(' Fetching recent submissions...');
    const submissions = await fetchRecentSubmissions(username, 20);
    console.log(` Found ${submissions.length} recent submissions`);

    let savedCount = 0;
    let skippedCount = 0;

    for (const submission of submissions) {
      try {
        // Check if solution already exists
        const exists = await Solution.findOne({
          submissionId: submission.id,
          authUserId: authObjectId,
        });
        
        if (exists) {
          skippedCount++;
          console.log(`  Solution already exists: ${submission.title}`);

          if (!exists.code) {
            try {
              console.log(`   ↳ Missing code in cache. Fetching for ${submission.id}...`);
              const result = await solutionViewerService.fetchSolution(submission.id, {
                username,
                authUserId,
              });
              if (result.success) {
                console.log('     ✅ Code cached successfully');
              } else {
                console.log(`     ⚠️ Code unavailable: ${result.message}`);
              }
            } catch (codeError: any) {
              console.warn(`     ⚠️ Failed to fetch code for ${submission.id}:`, codeError.message);
            }
          }

          continue;
        }

        // Fetch problem details to get difficulty and other metadata
        let problemDetails = null;
        if (submission.titleSlug) {
          problemDetails = await fetchProblemDetails(submission.titleSlug);
          await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
        }

        // Create new solution entry with all available metadata
        const solution = new Solution({
          submissionId: submission.id,
          username,
          normalizedUsername,
          authUserId: authObjectId,
          problemName: submission.title,
          problemSlug: submission.titleSlug || '',
          problemUrl: submission.titleSlug ? `https://leetcode.com/problems/${submission.titleSlug}/` : '',
          difficulty: problemDetails?.difficulty || 'Medium',
          language: submission.lang || 'Unknown',
          code: '', // Will be filled if we can fetch it
          runtime: submission.runtime || 'N/A',
          memory: submission.memory || 'N/A',
          status: submission.statusDisplay || 'Accepted',
          timestamp: parseInt(submission.timestamp),
          submittedAt: new Date(parseInt(submission.timestamp) * 1000),
          tags: problemDetails?.topicTags?.map((tag: any) => tag.name) || []
        });
        await solution.save();

        savedCount++;
        console.log(` ✅ Solution saved: ${submission.title} (${submission.lang})`);

        // Try to fetch the actual code
        try {
          console.log(`   ↳ Attempting to fetch code for submission ${submission.id}...`);
          const result = await solutionViewerService.fetchSolution(submission.id, {
            username,
            authUserId,
          });
          if (result.success && result.solution) {
            // Update the solution with the code
            solution.code = result.solution.code || solution.code;
            solution.language = result.solution.language || solution.language;
            solution.runtime = result.solution.runtime || solution.runtime;
            solution.memory = result.solution.memory || solution.memory;
            await solution.save();
            console.log('     ✅ Code fetched and cached successfully');
          } else {
            console.log(`     ⚠️ Code unavailable (will show metadata only): ${result.message}`);
          }
        } catch (codeError: any) {
          console.warn(`     ⚠️ Failed to fetch code (metadata saved): ${codeError.message}`);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(` Error processing submission ${submission.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n Solution sync complete!`);
    console.log(`    Saved/Updated: ${savedCount} solutions`);
    console.log(`     Skipped: ${skippedCount} submissions`);

    return {
      success: true,
      savedCount,
      skippedCount,
      totalProcessed: submissions.length,
    };
  } catch (error: any) {
    console.error(` Solution sync failed for ${username}:`, error.message);
    throw error;
  }
};

// Helper function to fetch recent submissions with detailed info
async function fetchRecentSubmissions(username: string, limit: number) {
  try {
    const query = `
      query getRecentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          runtime
          memory
        }
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: { username, limit },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    return response.data.data.recentAcSubmissionList || [];
  } catch (error: any) {
    console.error(`Error fetching submissions for ${username}:`, error.message);
    throw error;
  }
}

// Helper function to fetch problem details (difficulty, etc.)
async function fetchProblemDetails(titleSlug: string) {
  try {
    const query = `
      query getProblemDetails($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          difficulty
          content
          topicTags {
            name
            slug
          }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: { titleSlug },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    return response.data.data.question;
  } catch (error: any) {
    console.error(`Error fetching problem details for ${titleSlug}:`, error.message);
    return null;
  }
}
