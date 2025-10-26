import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables FIRST before any other imports that use them
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

import { connectDB } from './config/database';
import User from './models/User';
import Solution from './models/Solution';
import { syncUserSolutions } from './services/leetcodeService';
import { startAutoSync } from './services/cronService';
import { solutionViewerService } from './services/solutionViewerService';
import solutionRoutes from './routes/solutionRoutes';
import solutionViewerRoutes from './routes/solutionViewerRoutes';
import trackedUserRoutes from './routes/trackedUserRoutes';

// Debug: Check if MONGODB_URI is loaded
console.log('🔍 Environment check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('   PORT:', process.env.PORT || '5000');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5173'
];

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const renderExternalUrl = process.env.RENDER_EXTERNAL_URL?.replace(/\/+$/, '');
if (renderExternalUrl) {
  defaultOrigins.push(renderExternalUrl);
}

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    try {
      const hostname = new URL(origin).hostname;
      if (/\.onrender\.com$/i.test(hostname)) {
        return callback(null, true);
      }
    } catch (error) {
      console.warn('⚠️ Invalid origin header detected:', origin, error);
      return callback(null, false);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Routes
app.use('/api/solutions/viewer', solutionViewerRoutes); // Must come before solutionRoutes to avoid route conflicts
app.use('/api/solution', solutionRoutes);
app.use('/api/tracked-users', trackedUserRoutes);

// Connect to MongoDB
connectDB();

// Start auto-sync scheduler
startAutoSync();

// Import GraphQL helpers
import { testLeetCodeAPI } from './config/axios';
import axiosInstance, { sendGraphQLQuery } from './config/axios';

// Helper function to calculate time ago
const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

// Helper function to calculate total estimated time spent
const calculateTotalTime = (dailyActivity: any[]): string => {
  const totalSubmissions = dailyActivity.reduce((sum, day) => sum + day.count, 0);
  const estimatedHours = Math.round(totalSubmissions * 0.5); // Estimate 30 min per problem
  if (estimatedHours < 24) return `${estimatedHours} hours`;
  const days = Math.floor(estimatedHours / 24);
  return `${days} days ${estimatedHours % 24} hours`;
};

// Helper function to calculate average problems per day
const calculateAveragePerDay = (total: number, days: number): string => {
  if (days === 0) return '0';
  return (total / days).toFixed(1);
};

// Helper function to get last solved date
const calculateLastSolved = (calendar: string | null): string => {
  if (!calendar) return 'Never';
  try {
    const calendarData = JSON.parse(calendar);
    const dates = Object.keys(calendarData)
      .filter(timestamp => calendarData[timestamp] > 0)
      .map(ts => parseInt(ts))
      .sort((a, b) => b - a); // Sort descending (newest first)
    
    if (dates.length === 0) return 'Never';
    
    const lastDate = new Date(dates[0] * 1000);
    return lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.error('Error calculating last solved date:', error);
    return 'Never';
  }
};

// Helper function to calculate solve rate
const calculateSolveRate = (problems: any): string => {
  const total = problems.easy + problems.medium + problems.hard;
  if (total === 0) return '0%';
  const hardRate = ((problems.hard / total) * 100).toFixed(1);
  return `${hardRate}% hard`;
};

// Helper function to calculate current streak
const calculateStreak = (calendar: any): { currentStreak: number; maxStreak: number; lastSolvedDate: string } => {
  if (!calendar) return { currentStreak: 0, maxStreak: 0, lastSolvedDate: 'Never' };
  
  try {
    const calendarData = JSON.parse(calendar);
    const dates = Object.keys(calendarData)
      .filter(timestamp => calendarData[timestamp] > 0)
      .map(ts => parseInt(ts))
      .sort((a, b) => b - a); // Sort descending (newest first)
    
    if (dates.length === 0) return { currentStreak: 0, maxStreak: 0, lastSolvedDate: 'Never' };
    
    const today = Math.floor(Date.now() / 1000);
    const oneDaySeconds = 86400;
    
    // Get all dates with accepted submissions, converted to local date strings
    const uniqueAcceptedDates = Array.from(new Set(dates.map(ts => {
      const date = new Date(ts * 1000);
      return date.toLocaleDateString('en-US');
    })));
    const acceptedDateSet = new Set(uniqueAcceptedDates);

    // Get today and yesterday in the same format
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const todayString = todayDate.toLocaleDateString('en-US');
    const yesterdayString = yesterdayDate.toLocaleDateString('en-US');

    // Calculate current streak
    let currentStreak = 0;
    let dayToCheck = todayDate;

    // Check if we solved today or yesterday to start the streak
    if (acceptedDateSet.has(todayString)) {
      currentStreak = 1;
      dayToCheck.setDate(dayToCheck.getDate() - 1); // Start checking from yesterday
    } else if (acceptedDateSet.has(yesterdayString)) {
      currentStreak = 1;
      dayToCheck = yesterdayDate;
      dayToCheck.setDate(dayToCheck.getDate() - 1); // Start checking from 2 days ago
    } else {
      return {
        currentStreak: 0,
        maxStreak: calculateMaxStreak(uniqueAcceptedDates),
        lastSolvedDate: new Date(dates[0] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    }

    // Continue checking previous days
    while (true) {
      const dateString = dayToCheck.toLocaleDateString('en-US');
      if (!acceptedDateSet.has(dateString)) {
        break;
      }
      currentStreak++;
      dayToCheck.setDate(dayToCheck.getDate() - 1);
    }

    // Calculate max streak
    const maxStreak = calculateMaxStreak(uniqueAcceptedDates);

    // Get last solved date
    const lastDate = new Date(dates[0] * 1000);
    const lastSolvedDate = lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return { currentStreak, maxStreak, lastSolvedDate };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, maxStreak: 0, lastSolvedDate: 'Never' };
  }
}

// Helper function to calculate max streak
const calculateMaxStreak = (acceptedDates: string[]): number => {
  if (acceptedDates.length === 0) return 0;
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  // Convert date strings to Date objects and sort them
  const sortedDates = acceptedDates
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

// GraphQL query to fetch user profile with detailed stats
const getUserQuery = (username: string) => ({
  query: `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          userAvatar
          countryName
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        badges {
          id
          displayName
          icon
        }
        upcomingBadges {
          name
          progress
        }
        activeBadge {
          id
          displayName
          icon
        }
        problemsSolvedBeatsStats {
          difficulty
          percentage
        }
        submissionCalendar
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
        topPercentage
      }
      recentAcSubmissionList(username: $username, limit: 20) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        runtime
        memory
      }
    }
  `,
  variables: { username }
});

// Utility function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main API endpoint with rate limiting
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    console.log(`🔍 Fetching data for user: ${username}`);
    
    // Add a small delay to handle rate limiting
    await delay(500);
    
    const query = getUserQuery(username).query;
    const variables = getUserQuery(username).variables;

    console.log('📤 Sending GraphQL query for user:', username);
    
    // Make request to LeetCode GraphQL API with retry logic
    let retries = 2;
    let leetcodeData = null;
    
    while (retries >= 0) {
      try {
        leetcodeData = await sendGraphQLQuery(query, variables);
        break;
      } catch (error: any) {
        if (error.response?.status === 429 || error.message.includes('rate')) {
          if (retries > 0) {
            console.log(`⏳ Rate limited, waiting before retry... (${retries} retries left)`);
            await delay(2000); // Wait 2 seconds before retry
            retries--;
            continue;
          }
        }
        throw error;
      }
    }
    
    if (!leetcodeData || !leetcodeData.data) {
      throw new Error('Received invalid response from LeetCode API');
    }

    const data = leetcodeData.data;
    console.log('📊 Data received for user:', username);
    
    // Check if user exists
    if (!data || !data.matchedUser) {
      console.log('❌ User not found in response');
      return res.status(404).json({ 
        error: 'User not found',
        message: `LeetCode user "${username}" does not exist` 
      });
    }

    const user = data.matchedUser;
    const contestRanking = data.userContestRanking;
    const recentSubmissions = data.recentAcSubmissionList || [];

    // Parse submission stats
    const problems = {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0
    };

    if (user.submitStats?.acSubmissionNum) {
      user.submitStats.acSubmissionNum.forEach((item: any) => {
        if (item.difficulty === 'Easy') problems.easy = item.count || 0;
        if (item.difficulty === 'Medium') problems.medium = item.count || 0;
        if (item.difficulty === 'Hard') problems.hard = item.count || 0;
      });
      problems.total = problems.easy + problems.medium + problems.hard;
    }

    // Parse submission calendar for daily activity
    const dailyActivity: any[] = [];
    if (user.submissionCalendar) {
      try {
        const calendar = JSON.parse(user.submissionCalendar);
        const today = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = today - (30 * 24 * 60 * 60);
        
        Object.entries(calendar).forEach(([timestamp, count]: [string, any]) => {
          const ts = parseInt(timestamp);
          if (ts >= thirtyDaysAgo) {
            dailyActivity.push({
              date: new Date(ts * 1000).toISOString().split('T')[0],
              count: count
            });
          }
        });
      } catch (e) {
        console.error('Error parsing submission calendar:', e);
      }
    }

    // Format response
    const result = {
      username: user.username,
      ranking: user.profile?.ranking || 'N/A',
      country: user.profile?.countryName || 'Unknown',
      avatar: user.profile?.userAvatar || '',
      contestRating: contestRanking?.rating ? Math.round(contestRanking.rating) : 'N/A',
      contestStats: {
        globalRanking: contestRanking?.globalRanking || 'N/A',
        attendedContests: contestRanking?.attendedContestsCount || 0,
        topPercentage: contestRanking?.topPercentage || 'N/A'
      },
      problems,
      dailyActivity: dailyActivity.sort((a, b) => a.date.localeCompare(b.date)),
      badges: {
        active: user.activeBadge || null,
        earned: user.badges || [],
        upcoming: user.upcomingBadges || []
      },
      recentSubmissions: recentSubmissions.slice(0, 20).map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        titleSlug: sub.titleSlug,
        timestamp: sub.timestamp,
        timeAgo: getTimeAgo(parseInt(sub.timestamp)),
        lang: sub.lang || 'Unknown',
        runtime: sub.runtime || 'N/A',
        memory: sub.memory || 'N/A',
        status: sub.statusDisplay || 'Accepted',
        problemUrl: `https://leetcode.com/problems/${sub.titleSlug}`,
        solutionUrl: `https://leetcode.com/problems/${sub.titleSlug}/solutions/`,
        submissionUrl: `https://leetcode.com/submissions/detail/${sub.id}/`
      })),
      streak: {
        currentStreak: calculateStreak(user.submissionCalendar).currentStreak,
        maxStreak: calculateStreak(user.submissionCalendar).maxStreak,
        lastSolvedDate: calculateLastSolved(user.submissionCalendar)
      },
      stats: {
        totalTime: calculateTotalTime(dailyActivity),
        averagePerDay: calculateAveragePerDay(problems.total, dailyActivity.length),
        solveRate: calculateSolveRate(problems)
      }
    };

    res.json(result);
  } catch (error: any) {
    console.error('❌ Error fetching LeetCode data:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('❌ No response received from LeetCode API');
      console.error('Request details:', error.request);
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'LeetCode user does not exist' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch data from LeetCode API',
      details: error.response?.data?.errors?.[0]?.message || error.message
    });
  }
});

// GraphQL query to fetch submission detail
const getSubmissionDetailQuery = (submissionId: string) => ({
  query: `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        runtime
        runtimeDisplay
        runtimePercentile
        runtimeDistribution
        memory
        memoryDisplay
        memoryPercentile
        memoryDistribution
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
          content
          difficulty
          categoryTitle
        }
        notes
        topicTags {
          name
          slug
        }
      }
    }
  `,
  variables: { submissionId: parseInt(submissionId) }
});

// Endpoint to fetch submission details with code
app.get('/api/submission/:submissionId', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    
    console.log(`Fetching submission details for ID: ${submissionId}`);

    // Try to fetch from LeetCode's submission detail page
    try {
      const query = getSubmissionDetailQuery(submissionId).query;
      const variables = getSubmissionDetailQuery(submissionId).variables;
      const result = await sendGraphQLQuery(query, variables);

      const data = result.data.submissionDetails;

      if (data && data.code) {
        const result = {
          submissionId,
          code: data.code,
          language: data.lang?.verboseName || data.lang?.name || 'Unknown',
          runtime: data.runtimeDisplay || data.runtime,
          runtimePercentile: data.runtimePercentile ? `${data.runtimePercentile.toFixed(2)}%` : 'N/A',
          memory: data.memoryDisplay || data.memory,
          memoryPercentile: data.memoryPercentile ? `${data.memoryPercentile.toFixed(2)}%` : 'N/A',
          timestamp: data.timestamp,
          timeAgo: getTimeAgo(data.timestamp),
          statusCode: data.statusCode,
          question: {
            id: data.question?.questionId,
            title: data.question?.title,
            titleSlug: data.question?.titleSlug,
            difficulty: data.question?.difficulty,
            category: data.question?.categoryTitle,
            problemUrl: `https://leetcode.com/problems/${data.question?.titleSlug}/`,
          },
          topicTags: data.topicTags?.map((tag: any) => tag.name) || [],
          notes: data.notes || '',
        };
        return res.json(result);
      }
    } catch (graphqlError) {
      console.log('⚠️ GraphQL fetch failed, trying solution viewer...');
    }

    // Try using solutionViewerService as fallback
    console.log(`🔄 Attempting to fetch using solutionViewerService for submission ${submissionId}...`);
    const solutionViewerResult = await solutionViewerService.fetchSolution(submissionId);
    
    if (solutionViewerResult.success && solutionViewerResult.solution) {
      console.log(`✅ Successfully fetched code for submission ${submissionId}`);
      return res.json({
        submissionId,
        code: solutionViewerResult.solution.code,
        language: solutionViewerResult.solution.language,
        message: 'Code retrieved from solution viewer'
      });
    }

    // If everything fails, return error
    console.log(`❌ All methods failed for submission ${submissionId}`);
    return res.json({
      submissionId,
      error: 'authentication_required',
      message: 'Submission code requires LeetCode authentication',
      iframeUrl: `https://leetcode.com/submissions/detail/${submissionId}/`,
      canEmbed: true
    });

  } catch (error: any) {
    console.error('Error fetching submission:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch submission details',
      message: error.response?.data?.errors?.[0]?.message || error.message,
      submissionId: req.params.submissionId
    });
  }
});

// ============================================
// NEW MONGODB-BASED ENDPOINTS
// ============================================

// Sync user solutions - fetch from LeetCode and store in MongoDB
app.post('/api/user/:username/sync', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    console.log(`\n🔄 Sync request received for user: ${username}`);

    const result = await syncUserSolutions(username);

    res.json({
      success: true,
      message: `Successfully synced solutions for ${username}`,
      data: result,
    });
  } catch (error: any) {
    console.error('Sync error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to sync user solutions',
      message: error.message,
    });
  }
});

// Get all solutions for a user from MongoDB
app.get('/api/user/:username/solutions', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { difficulty, language, limit = 50, skip = 0 } = req.query;

    const query: any = { username };
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;

    const solutions = await Solution.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string));

    const total = await Solution.countDocuments(query);

    res.json({
      success: true,
      total,
      count: solutions.length,
      solutions,
    });
  } catch (error: any) {
    console.error('Error fetching solutions:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch solutions',
      message: error.message,
    });
  }
});

// Get user stats and profile from MongoDB
app.get('/api/user/:username/stats', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `User ${username} not found. Please sync first.`,
      });
    }

    // Get solution counts by difficulty
    const solutionCounts = await Solution.aggregate([
      { $match: { username } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: any = { Easy: 0, Medium: 0, Hard: 0 };
    solutionCounts.forEach((item) => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      user: {
        username: user.username,
        profileUrl: user.profileUrl,
        realName: user.realName,
        avatar: user.avatar,
        ranking: user.ranking,
        reputation: user.reputation,
        stats: user.stats,
        badges: user.badges,
        lastSync: user.lastSync,
      },
      storedSolutions: counts,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message,
    });
  }
});

// Manually add/update code for a submission
app.post('/api/solution/:submissionId/code', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { code, username, problemName, language, difficulty } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    // Check if solution already exists
    let solution = await Solution.findOne({ submissionId });

    if (solution) {
      // Update existing solution
      solution.code = code;
      await solution.save();
      console.log(`✅ Updated code for submission ${submissionId}`);
    } else {
      // Create new solution
      solution = new Solution({
        submissionId,
        username: username || 'unknown',
        problemName: problemName || 'Unknown Problem',
        problemSlug: '',
        problemUrl: '',
        difficulty: difficulty || 'Medium',
        language: language || 'Unknown',
        code,
        runtime: 'N/A',
        memory: 'N/A',
        status: 'Accepted',
        timestamp: Date.now(),
        submittedAt: new Date(),
        tags: [],
      });
      await solution.save();
      console.log(`✅ Created new solution for submission ${submissionId}`);
    }

    res.json({
      success: true,
      message: 'Code saved successfully',
      solution,
    });
  } catch (error: any) {
    console.error('Error saving code:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to save code',
      message: error.message,
    });
  }
});

// Get a single solution by ID
app.get('/api/solution/:submissionId/details', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    const solution = await Solution.findOne({ submissionId });
    if (!solution) {
      return res.status(404).json({
        success: false,
        error: 'Solution not found',
        message: `Solution ${submissionId} not found in database`,
      });
    }

    res.json({
      success: true,
      solution,
    });
  } catch (error: any) {
    console.error('Error fetching solution:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch solution',
      message: error.message,
    });
  }
});

// ============================================
// END NEW ENDPOINTS
// ============================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// Test LeetCode API connectivity
app.get('/api/test-leetcode', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing LeetCode API connectivity...');
    
    // Test with a simple user query that doesn't require authentication
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
    
    const result = await sendGraphQLQuery(query, { username: 'test' });
    
    if (result.data?.matchedUser?.username) {
      console.log('✅ LeetCode API is reachable');
      res.json({ 
        status: 'LeetCode API is reachable ✅',
        message: 'Successfully connected to LeetCode',
        user: result.data.matchedUser.username
      });
    } else {
      // API responded but user not found - API is still working
      res.json({
        status: 'LeetCode API is reachable ✅',
        message: 'API connection successful (test user not found - expected)'
      });
    }
  } catch (error: any) {
    console.error('❌ LeetCode API test failed:', error);
    const errorDetail = error.response?.data?.errors?.[0]?.message || error.message;
    
    res.status(503).json({ 
      status: 'LeetCode API is NOT reachable ❌',
      error: errorDetail || 'Unknown error',
      message: 'Failed to connect to LeetCode API. Check your internet connection.',
      tips: [
        'Check if LeetCode.com is accessible',
        'Verify internet connection',
        'Try again in a moment (rate limiting)',
        'Check backend logs for more details'
      ]
    });
  }
});

if (fs.existsSync(frontendDistPath)) {
  console.log('🧱 Serving frontend from:', frontendDistPath);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend build directory not found at:', frontendDistPath);
}

app.listen(PORT, () => {
  console.log(`\n🚀 LeetCode Tracker Backend Server`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   GET  /api/user/:username - Legacy user data`);
  console.log(`   POST /api/user/:username/sync - Sync solutions to MongoDB`);
  console.log(`   GET  /api/user/:username/solutions - Get stored solutions`);
  console.log(`   GET  /api/user/:username/stats - Get user stats`);
  console.log(`   GET  /api/solution/:id/details - Get solution by ID`);
  console.log(`   GET  /health - Health check`);
  console.log(`\n⏰ Auto-sync: Enabled (daily at 2:00 AM)`);
  console.log(`💾 Database: MongoDB\n`);
});