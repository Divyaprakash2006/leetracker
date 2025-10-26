import axios from 'axios';
import User from '../models/User';
import Solution from '../models/Solution';

// Main sync function: fetch and store all solutions
export const syncUserSolutions = async (username: string) => {
  try {
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
        const exists = await Solution.findOne({ submissionId: submission.id });
        
        if (exists) {
          skippedCount++;
          console.log(`  Solution already exists: ${submission.title}`);
          continue;
        }

        // Create new solution
        const solution = new Solution({
          submissionId: submission.id,
          username,
          problemName: submission.title,
          timestamp: parseInt(submission.timestamp),
          submittedAt: new Date(parseInt(submission.timestamp) * 1000)
        });
        await solution.save();

        savedCount++;
        console.log(` Solution saved for: ${submission.title}`);

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

// Helper function to fetch recent submissions
async function fetchRecentSubmissions(username: string, limit: number) {
  try {
    const query = `
      query getRecentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          timestamp
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
