import Solution from '../models/Solution';
import { sendGraphQLQuery } from '../config/axios';
import { resolveLeetCodeAuth } from '../utils/leetcodeAuth';

export class SolutionViewerService {
  private getSubmissionDetailQuery = (submissionId: string) => ({
    query: `
      query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          runtime
          runtimeDisplay
          memory
          memoryDisplay
          code
          timestamp
          statusCode
          user {
            username
            profile {
              realName
            }
          }
          lang {
            name
            verboseName
          }
          question {
            questionId
            title
            titleSlug
            difficulty
            content
            categoryTitle
          }
          topicTags {
            name
            slug
          }
        }
      }
    `,
    variables: { submissionId: parseInt(submissionId) }
  });

  async fetchSolution(submissionId: string, options: { username?: string; authUserId: string }) {
    try {
      if (!options.authUserId) {
        throw new Error('authUserId is required to fetch solution');
      }

      const normalizedUsernameHint = options.username?.toLowerCase().trim();

      // First, check if we already have this solution in the database
      console.log(`🔍 Checking if solution ${submissionId} exists in database`);
      const existingSolution = await Solution.findOne({ submissionId, authUserId: options.authUserId });
      if (existingSolution?.code) {
        console.log(`✅ Found solution ${submissionId} in database`);
        return {
          success: true,
          solution: existingSolution
        };
      }

      const effectiveUsername = options.username || existingSolution?.username;
      const auth = await resolveLeetCodeAuth(effectiveUsername);
      console.log(`🔐 Using LeetCode auth source: ${auth.source}${auth.username ? ` (${auth.username})` : ''}`);

      // If not in database, fetch from LeetCode
      console.log(`🌐 Fetching solution ${submissionId} from LeetCode API`);
      const query = this.getSubmissionDetailQuery(submissionId);
      const result = await sendGraphQLQuery(query.query, query.variables, {
        referer: `https://leetcode.com/submissions/detail/${submissionId}/`,
        sessionCookie: auth.session,
        csrfToken: auth.csrfToken
      });

      const data = result.data?.submissionDetails;
      if (!data) {
        console.log(`⚠️ No submission details found for ${submissionId}`);
        return {
          success: false,
          message: 'This submission is not available. It may be private or require authentication with the correct LeetCode account. Only your own submissions can be viewed unless credentials are provided.'
        };
      }

      if (!data.code) {
        console.log(`⚠️ No code found in submission ${submissionId}`);
        return {
          success: false,
          message: 'This submission exists but the code is not accessible. It may be private or you may not have permission to view it.'
        };
      }

      const solutionUpdate = {
        username: data.user?.username || effectiveUsername || 'unknown',
        code: data.code,
        language: data.lang?.verboseName || data.lang?.name || 'Unknown',
        runtime: data.runtimeDisplay || data.runtime,
        memory: data.memoryDisplay || data.memory,
        status: data.statusCode || 'Accepted',
        timestamp: data.timestamp,
        submittedAt: new Date(data.timestamp * 1000),
        problemName: data.question?.title || 'Unknown Problem',
        problemSlug: data.question?.titleSlug || '',
        problemUrl: data.question?.titleSlug ? `https://leetcode.com/problems/${data.question.titleSlug}/` : '',
        difficulty: data.question?.difficulty || 'Medium',
        tags: data.topicTags?.map((tag: any) => tag.name) || []
      };

      if (existingSolution) {
        console.log(`💾 Updating cached solution ${submissionId} with fetched code`);
        existingSolution.set(solutionUpdate);
        await existingSolution.save();

        return {
          success: true,
          solution: existingSolution
        };
      }

      console.log(`💾 Caching new solution ${submissionId} in database`);
      const newSolution = new Solution({
        submissionId,
        ...solutionUpdate,
        authUserId: options.authUserId,
        normalizedUsername: (solutionUpdate.username || normalizedUsernameHint || 'unknown').toLowerCase()
      });
      await newSolution.save();

      return {
        success: true,
        solution: newSolution
      };
    } catch (error: any) {
      console.error(`❌ Error fetching solution ${submissionId}:`, error);
      
      // Handle specific error cases
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 404) {
          return {
            success: false,
            message: 'Submission not found'
          };
        }
        if (error.response.status === 429) {
          return {
            success: false,
            message: 'Rate limited by LeetCode API'
          };
        }
      }

      return {
        success: false,
        message: error.message || 'Failed to fetch solution'
      };
    }
  }
}

export const solutionViewerService = new SolutionViewerService();
