import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables FIRST before any other imports that use them
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import axios from 'axios';

import { connectDB } from './config/database';
import User from './models/User';
import Solution from './models/Solution';
import TrackedUser from './models/TrackedUser';
import { syncUserSolutions } from './services/leetcodeService';
import { startAutoSync } from './services/cronService';
import { solutionViewerService } from './services/solutionViewerService';
import solutionRoutes from './routes/solutionRoutes';
import solutionViewerRoutes from './routes/solutionViewerRoutes';
import trackedUserRoutes from './routes/trackedUserRoutes';
import authRoutes from './routes/authRoutes';
import { authenticateToken, AuthRequest } from './middleware/auth';

// Debug: Check environment configuration
console.log('🔍 Environment check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'NOT SET ❌');
console.log('   PORT:', process.env.PORT || '5001');

// CommonJS __dirname is available directly
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
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

// Enable compression for faster responses
app.use(compression());

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
      if (/\.onrender\.com$/i.test(hostname) || /\.vercel\.app$/i.test(hostname)) {
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

// Session configuration (MemoryStore is sufficient for this app's stateless JWT auth)
const sessionConfig: any = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Suppress MemoryStore warning - we use JWT for auth, sessions are minimal
if (process.env.NODE_ENV === 'production') {
  sessionConfig.store = null as any;
}

app.use(session(sessionConfig));

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

// Serve frontend static files first (but API routes will take precedence)
if (fs.existsSync(frontendDistPath)) {
  console.log('🧱 Serving frontend from:', frontendDistPath);
  app.use(express.static(frontendDistPath));
} else {
  console.warn('⚠️ Frontend build directory not found at:', frontendDistPath);
}

// API Routes (these take precedence over static files)
app.use('/api/auth', authRoutes);
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

const findTrackedUserFor = async (authUserId: string, username: string) => {
  const normalizedUsername = username.trim().toLowerCase();
  return TrackedUser.findOne({ authUserId, normalizedUsername });
};

const ensureTrackedUserFor = async (authUserId: string, username: string) => {
  const trackedUser = await findTrackedUserFor(authUserId, username);
  if (!trackedUser) {
    const error = new Error(`User ${username} is not tracked by this account`);
    (error as any).statusCode = 404;
    throw error;
  }
  return trackedUser;
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

// Cache for user data with automatic cleanup
const userDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // Reduced to 3 minutes for fresher data
const MAX_CACHE_SIZE = 1000; // Maximum cache entries

// Clean up old cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of userDataCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userDataCache.delete(key);
      cleaned++;
    }
  }
  
  // If cache is still too large, remove oldest entries
  if (userDataCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(userDataCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, userDataCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => userDataCache.delete(key));
    cleaned += toRemove.length;
  }
  
  if (cleaned > 0 && process.env.NODE_ENV !== 'production') {
    console.log(`🧹 Cleaned ${cleaned} cache entries`);
  }
}, 5 * 60 * 1000);

// Main API endpoint with rate limiting and caching
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Check cache first
    const cached = userDataCache.get(username.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Returning cached data for ${username}`);
      return res.json(cached.data);
    }
    
    const query = getUserQuery(username).query;
    const variables = getUserQuery(username).variables;
    
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
            await delay(500 * (3 - retries)); // Progressive delay: 500ms, 1000ms
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
    
    // Check if user exists
    if (!data || !data.matchedUser) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: `User "${username}" does not exist on LeetCode`,
        suggestions: [
          'Check the username for typos',
          'Make sure the user exists on LeetCode',
          'Try searching for a different user'
        ]
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
      for (const item of user.submitStats.acSubmissionNum) {
        if (item.difficulty === 'Easy') problems.easy = item.count || 0;
        if (item.difficulty === 'Medium') problems.medium = item.count || 0;
        if (item.difficulty === 'Hard') problems.hard = item.count || 0;
      }
      problems.total = problems.easy + problems.medium + problems.hard;
    }

    // Parse submission calendar for daily activity
    const dailyActivity: any[] = [];
    if (user.submissionCalendar) {
      try {
        const calendar = JSON.parse(user.submissionCalendar);
        const today = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = today - (30 * 24 * 60 * 60);
        
        for (const timestamp in calendar) {
          const ts = parseInt(timestamp);
          if (ts >= thirtyDaysAgo) {
            dailyActivity.push({
              date: new Date(ts * 1000).toISOString().split('T')[0],
              count: calendar[timestamp]
            });
          }
        }
      } catch (e) {
        console.error('Error parsing submission calendar:', e);
      }
    }
    
    const streak = calculateStreak(user.submissionCalendar);

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
        currentStreak: streak.currentStreak,
        maxStreak: streak.maxStreak,
        lastSolvedDate: calculateLastSolved(user.submissionCalendar)
      },
      stats: {
        totalTime: calculateTotalTime(dailyActivity),
        solveRate: calculateSolveRate(problems)
      }
    };

    // Cache the result
    userDataCache.set(username.toLowerCase(), {
      data: result,
      timestamp: Date.now()
    });

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
    
    if (error.response?.status === 404 || error.message.includes('does not exist')) {
      return res.status(404).json({ 
        success: false,
        error: 'user_not_found',
        message: `User "${req.params.username}" does not exist on LeetCode`,
        suggestions: [
          'Check the username for typos',
          'Make sure the user exists on LeetCode',
          'Try searching for a different user'
        ]
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'server_error',
      message: 'Failed to fetch data from LeetCode API',
      details: error.response?.data?.errors?.[0]?.message || error.message,
      suggestions: [
        'Try again in a moment',
        'Check if LeetCode.com is accessible',
        'Verify your internet connection'
      ]
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
app.get('/api/submission/:submissionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const queryUsernameRaw = typeof req.query.username === 'string' ? req.query.username.trim() : undefined;
    const authUserId = req.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    console.log(`📝 Fetching submission details for ID: ${submissionId}${queryUsernameRaw ? ` (user: ${queryUsernameRaw})` : ''}`);

    const normalizedQuery = queryUsernameRaw?.toLowerCase();
    type TrackedUserLookup = Awaited<ReturnType<typeof findTrackedUserFor>>;
    let trackedUser: TrackedUserLookup = null;

    if (normalizedQuery && queryUsernameRaw) {
      trackedUser = await findTrackedUserFor(authUserId, queryUsernameRaw);
    }

    console.log('📂 Step 1: Checking database for cached solution...');
    let cachedSolution = await Solution.findOne({ submissionId, authUserId });

    if (!trackedUser && cachedSolution) {
      trackedUser = await findTrackedUserFor(authUserId, cachedSolution.username);
    }

    if (!trackedUser) {
      return res.status(403).json({
        success: false,
        error: 'not_tracked',
        message: 'Provide a tracked username to view this submission',
      });
    }

    const username = trackedUser.username;
    const normalizedUsername = trackedUser.normalizedUsername;

    if (cachedSolution?.code) {
      console.log(`✅ Found code in database for submission ${submissionId}`);
      return res.json({
        success: true,
        solution: {
          submissionId: cachedSolution.submissionId,
          code: cachedSolution.code,
          language: cachedSolution.language,
          runtime: cachedSolution.runtime,
          memory: cachedSolution.memory,
          status: cachedSolution.status,
          problemName: cachedSolution.problemName,
          problemSlug: cachedSolution.problemSlug,
          problemUrl: cachedSolution.problemUrl,
          difficulty: cachedSolution.difficulty,
          timestamp: cachedSolution.timestamp,
        },
      });
    }

    console.log('⚠️ No code in database, trying LeetCode API...');

    try {
      console.log('🌐 Step 2: Fetching from LeetCode GraphQL API...');
      const query = getSubmissionDetailQuery(submissionId).query;
      const variables = getSubmissionDetailQuery(submissionId).variables;
      const result = await sendGraphQLQuery(query, variables);

      console.log(`📥 Raw response:`, JSON.stringify(result));
      const data = result.data?.submissionDetails;

      if (!data) {
        console.log(`❌ No submission details found for ${submissionId}`);
        throw new Error('No submission details found');
      }

      if (data.code) {
        console.log(`✅ Successfully fetched code from LeetCode API`);
        const solutionData = {
          submissionId,
          code: data.code,
          language: data.lang?.verboseName || data.lang?.name || 'Unknown',
          runtime: data.runtimeDisplay || data.runtime,
          memory: data.memoryDisplay || data.memory,
          timestamp: data.timestamp,
          statusCode: data.statusCode,
          problemName: data.question?.title || 'Unknown',
          problemSlug: data.question?.titleSlug || '',
          problemUrl: data.question?.titleSlug ? `https://leetcode.com/problems/${data.question.titleSlug}/` : '',
          difficulty: data.question?.difficulty || 'Medium',
        };

        if (cachedSolution) {
          Object.assign(cachedSolution, {
            ...solutionData,
            username,
            normalizedUsername,
          });
          await cachedSolution.save();
          console.log('💾 Updated solution in database');
        } else {
          cachedSolution = await Solution.findOneAndUpdate(
            { submissionId, authUserId },
            {
              $set: {
                ...solutionData,
                username,
                normalizedUsername,
                authUserId,
              },
            },
            { upsert: true, new: true }
          );
          console.log('💾 Stored solution fetched from LeetCode in database');
        }

        return res.json({
          success: true,
          solution: solutionData,
        });
      }
    } catch (graphqlError: any) {
      console.log('⚠️ GraphQL fetch failed:', graphqlError.message);
    }

    console.log(`🔄 Step 3: Trying solutionViewerService for submission ${submissionId}...`);
    const solutionViewerResult = await solutionViewerService.fetchSolution(submissionId, {
      username,
      authUserId,
    });

    if (solutionViewerResult.success && solutionViewerResult.solution) {
      console.log(`✅ Successfully fetched code for submission ${submissionId}`);
      return res.json({
        success: true,
        solution: {
          submissionId,
          code: solutionViewerResult.solution.code,
          language: solutionViewerResult.solution.language,
          runtime: solutionViewerResult.solution.runtime,
          memory: solutionViewerResult.solution.memory,
          problemName: solutionViewerResult.solution.problemName,
          problemSlug: solutionViewerResult.solution.problemSlug,
          problemUrl: solutionViewerResult.solution.problemUrl,
          difficulty: solutionViewerResult.solution.difficulty,
        },
      });
    }

    if (queryUsernameRaw) {
      try {
        console.log(`🔁 Step 4: Running targeted sync for user ${username} to retrieve submission ${submissionId}...`);
        await syncUserSolutions(username, authUserId);
        cachedSolution = await Solution.findOne({ submissionId, authUserId });
        if (cachedSolution?.code) {
          console.log('✅ Code retrieved after sync');
          return res.json({
            success: true,
            solution: {
              submissionId,
              code: cachedSolution.code,
              language: cachedSolution.language,
              runtime: cachedSolution.runtime,
              memory: cachedSolution.memory,
              problemName: cachedSolution.problemName,
              problemSlug: cachedSolution.problemSlug,
              problemUrl: cachedSolution.problemUrl,
              difficulty: cachedSolution.difficulty,
            },
          });
        }
      } catch (syncError: any) {
        console.warn(`⚠️ Targeted sync failed: ${syncError.message}`);
      }
    }

    console.log(`❌ All methods failed for submission ${submissionId}`);
    return res.status(404).json({
      success: false,
      error: 'submission_not_accessible',
      message: 'This submission code is not available. It may be private or require authentication.',
      suggestions: [
        'Make sure you have synced this user\'s solutions first',
        'The submission may be from a private contest',
        'Try viewing the submission directly on LeetCode',
      ],
      submissionId,
      leetcodeUrl: `https://leetcode.com/submissions/detail/${submissionId}/`,
    });
  } catch (error: any) {
    console.error('❌ Error fetching submission:', error.message);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to fetch submission details',
      details: error.message,
      submissionId: req.params.submissionId,
    });
  }
});

// ============================================
// NEW MONGODB-BASED ENDPOINTS
// ============================================

// Sync user solutions - fetch from LeetCode and store in MongoDB
app.post('/api/user/:username/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const authUserId = req.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    const trackedUser = await ensureTrackedUserFor(authUserId, username);
    console.log(`\n🔄 Sync request received for user: ${username}`);

    const result = await syncUserSolutions(trackedUser.username, authUserId);

    res.json({
      success: true,
      message: `Successfully synced solutions for ${username}`,
      data: result,
    });
  } catch (error: any) {
    console.error('Sync error:', error.message);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'not_tracked',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to sync user solutions',
      message: error.message,
    });
  }
});

// Get all solutions for a user from MongoDB
app.get('/api/user/:username/solutions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const { difficulty, language, limit = 50, skip = 0 } = req.query;

    const authUserId = req.userId;
    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    const trackedUser = await ensureTrackedUserFor(authUserId, username);
    const normalizedUsername = trackedUser.normalizedUsername;

    const query: any = { authUserId, normalizedUsername };
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;

    const solutions = await Solution.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    const total = await Solution.countDocuments(query);

    res.json({
      success: true,
      total,
      count: solutions.length,
      solutions,
    });
  } catch (error: any) {
    console.error('Error fetching solutions:', error.message);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'not_tracked',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch solutions',
      message: error.message,
    });
  }
});

// Get user stats and profile from MongoDB
app.get('/api/user/:username/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const authUserId = req.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    const trackedUser = await ensureTrackedUserFor(authUserId, username);

    const user = await User.findOne({ authUserId, normalizedUsername: trackedUser.normalizedUsername });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `User ${username} not found. Please sync first.`,
      });
    }

    // Get solution counts by difficulty
    const solutionCounts = await Solution.aggregate([
      { $match: { authUserId: trackedUser.authUserId, normalizedUsername: trackedUser.normalizedUsername } },
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

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'not_tracked',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message,
    });
  }
});

// Manually add/update code for a submission
app.post('/api/solution/:submissionId/code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { code, username, problemName, language, difficulty } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const authUserId = req.userId;
    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'username_required',
        message: 'Username is required to associate code',
      });
    }

    const trackedUser = await ensureTrackedUserFor(authUserId, username);

    // Check if solution already exists
    let solution = await Solution.findOne({ submissionId, authUserId });

    if (solution) {
      // Update existing solution
      solution.code = code;
      solution.username = trackedUser.username;
      solution.normalizedUsername = trackedUser.normalizedUsername;
      await solution.save();
      console.log(`✅ Updated code for submission ${submissionId}`);
    } else {
      // Create new solution
      solution = new Solution({
        submissionId,
        username: trackedUser.username,
        normalizedUsername: trackedUser.normalizedUsername,
        authUserId: trackedUser.authUserId,
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

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'not_tracked',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save code',
      message: error.message,
    });
  }
});

// Get a single solution by ID
app.get('/api/solution/:submissionId/details', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const authUserId = req.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        error: 'auth_required',
        message: 'Authentication required',
      });
    }

    const solution = await Solution.findOne({ submissionId, authUserId });
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

// Catchall route for SPA - serve index.html for non-API routes
if (fs.existsSync(frontendDistPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // API-only mode (frontend deployed separately)
  app.get('*', (req, res) => {
    res.status(200).json({
      name: 'LeetCode Tracker API',
      version: '1.0.0',
      status: 'running',
      message: 'Backend API is operational. Frontend is deployed separately.',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        users: '/api/user/:username',
        solutions: '/api/solution/:id',
        trackedUsers: '/api/tracked-users'
      }
    });
  });
}

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 LeetCode Tracker Backend Server`);
  console.log(`📍 Server: ${process.env.RENDER_EXTERNAL_URL || `http://${HOST}:${PORT}`}`);
  console.log(`🌍 Host: ${HOST}`);
  console.log(`🔌 Port: ${PORT}`);
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