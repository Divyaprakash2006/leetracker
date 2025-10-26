import Solution from '../models/Solution';
import { sendGraphQLQuery } from '../config/axios';

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

  async fetchSolution(submissionId: string) {
    try {
      // First, check if we already have this solution in the database
      console.log(`🔍 Checking if solution ${submissionId} exists in database`);
      const existingSolution = await Solution.findOne({ submissionId });
      if (existingSolution?.code) {
        console.log(`✅ Found solution ${submissionId} in database`);
        return {
          success: true,
          solution: existingSolution
        };
      }

      // If not in database, fetch from LeetCode
      console.log(`🌐 Fetching solution ${submissionId} from LeetCode API`);
      const query = this.getSubmissionDetailQuery(submissionId);
      const result = await sendGraphQLQuery(query.query, query.variables, {
        referer: `https://leetcode.com/submissions/detail/${submissionId}/`
      });

      const data = result.data?.submissionDetails;
      if (!data) {
        console.log(`⚠️ No submission details found for ${submissionId}`);
        return {
          success: false,
          message: 'No submission details found'
        };
      }

      if (!data.code) {
        console.log(`⚠️ No code found in submission ${submissionId}`);
        return {
          success: false,
          message: 'No code found in submission'
        };
      }

      const solutionUpdate = {
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

      console.log(`ℹ️ Solution ${submissionId} not cached; returning fetched data without caching`);
      return {
        success: true,
        solution: {
          submissionId,
          ...solutionUpdate
        }
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
