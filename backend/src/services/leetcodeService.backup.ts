import axios from 'axios';
import puppeteer from 'puppeteer';
import User from '../models/User';
import Solution from '../models/Solution';

const LEETCODE_API = 'https://leetcode.com/graphql';

// GraphQL query to get user profile and stats
const getUserProfileQuery = (username: string) => `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
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

// GraphQL query to get recent submissions
const getRecentSubmissionsQuery = (username: string) => `
query getRecentSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
    lang
    runtime
    memory
  }
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
`;

// Fetch user profile and stats from LeetCode
export const fetchUserProfile = async (username: string) => {
  try {
    const response = await axios.post(
      LEETCODE_API,
      {
        query: getUserProfileQuery(username),
        variables: { username },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    const data = response.data.data.matchedUser;
    if (!data) {
      throw new Error('User not found');
    }

    // Calculate stats
    const stats = {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 0,
      acceptanceRate: 0,
    };

    data.submitStats.acSubmissionNum.forEach((stat: any) => {
      if (stat.difficulty === 'All') stats.totalSolved = stat.count;
      else if (stat.difficulty === 'Easy') stats.easySolved = stat.count;
      else if (stat.difficulty === 'Medium') stats.mediumSolved = stat.count;
      else if (stat.difficulty === 'Hard') stats.hardSolved = stat.count;
    });

    return {
      username: data.username,
      profileUrl: `https://leetcode.com/${data.username}/`,
      realName: data.profile.realName,
      avatar: data.profile.userAvatar,
      ranking: data.profile.ranking,
      reputation: data.profile.reputation,
      stats,
    };
  } catch (error: any) {
    console.error(`Error fetching user profile for ${username}:`, error.message);
    throw error;
  }
};

// Fetch recent submissions
export const fetchRecentSubmissions = async (username: string, limit: number = 20) => {
  try {
    const response = await axios.post(
      LEETCODE_API,
      {
        query: getRecentSubmissionsQuery(username),
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
};

// Scrape submission code using Puppeteer and capture screenshot
export const scrapeSubmissionCode = async (submissionId: string): Promise<string | null> => {
  let browser;
  try {
    console.log(`📸 Capturing screenshot for submission ${submissionId}...`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(`https://leetcode.com/submissions/detail/${submissionId}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if login is required
    const pageTitle = await page.title();
    if (pageTitle.includes('Login') || pageTitle.includes('Sign in')) {
      console.log(`⚠️  Submission ${submissionId} requires authentication`);
      return null;
    }

    // Try to find the code editor area and capture screenshot
    const element = await page.$('.monaco-editor');
    if (element) {
      const screenshotPath = `uploads/screenshots/${submissionId}.png` as const;
      await element.screenshot({ path: screenshotPath });
      const screenshotUrl = `/uploads/screenshots/${submissionId}.png`;
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      return screenshotUrl;
    }

    console.log(`⚠️  Code editor not found for submission ${submissionId}`);
    return null;
  } catch (error: any) {
    console.error(`❌ Error capturing screenshot for submission ${submissionId}:`, error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};
  let browser;
  try {
    console.log(`� Capturing screenshot for submission ${submissionId}...`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(`https://leetcode.com/submissions/detail/${submissionId}/`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if login is required
    const pageTitle = await page.title();
    if (pageTitle.includes('Login') || pageTitle.includes('Sign in')) {
      console.log(`⚠️  Submission ${submissionId} requires authentication`);
      return { code: null, screenshot: null };
    }

    // Try to find the code editor area
    const codeEditorExists = await page.$('.monaco-editor') !== null;
    
    let screenshot = null;
    if (codeEditorExists) {
      // Take screenshot of the code editor
      const element = await page.$('.monaco-editor');
      if (element) {
        const screenshotPath = `uploads/screenshots/${submissionId}.png` as const;
        await element.screenshot({ path: screenshotPath });
        screenshot = `/uploads/screenshots/${submissionId}.png`;
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
      }
    }

    // Extract code as text (backup)
    const code = await page.evaluate(() => {
      const monacoEditor = document.querySelector('.monaco-editor .view-lines');
      if (monacoEditor) {
        const lines = Array.from(monacoEditor.querySelectorAll('.view-line'));
        return lines.map((line: any) => line.textContent || '').join('\n');
      }
      return null;
    });

    return { code, screenshot };
  } catch (error: any) {
    console.error(`Error capturing submission ${submissionId}:`, error.message);
    return { code: null, screenshot: null };
  } finally {
    if (browser) await browser.close();
  }
};

// Get problem difficulty from problem API
const getProblemDifficulty = async (titleSlug: string): Promise<string> => {
  try {
    const query = `
      query getProblem($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          difficulty
          topicTags {
            name
          }
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_API,
      { query, variables: { titleSlug } },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    return response.data.data.question.difficulty || 'Medium';
  } catch (error) {
    console.error(`Error fetching difficulty for ${titleSlug}`);
    return 'Medium';
  }
};

// Main sync function: fetch and store all solutions
export const syncUserSolutions = async (username: string) => {
  try {
    console.log(`\n🔄 Starting sync for user: ${username}`);

    // 1. Fetch user profile
    console.log('📊 Fetching user profile...');
    const profileData = await fetchUserProfile(username);

    // 2. Update or create user in database
    const user = await User.findOneAndUpdate(
      { username },
      { ...profileData, lastSync: new Date() },
      { upsert: true, new: true }
    );
    console.log(`✅ User profile updated: ${user.stats.totalSolved} problems solved`);

    // 3. Fetch recent submissions
    console.log('📥 Fetching recent submissions...');
    const submissions = await fetchRecentSubmissions(username, 20);
    console.log(`📝 Found ${submissions.length} recent submissions`);

    // 4. Process each submission
    let savedCount = 0;
    let skippedCount = 0;

    for (const submission of submissions) {
      try {
        // Check if already exists
        const exists = await Solution.findOne({ submissionId: submission.id });
        if (exists) {
          skippedCount++;
          continue;
        }

        // Get problem difficulty
        const difficulty = await getProblemDifficulty(submission.titleSlug);

        // Try to scrape code and capture screenshot
        const { code, screenshot } = await scrapeSubmissionCode(submission.id);
        
        if (!code && !screenshot) {
          console.log(`⚠️  No code or screenshot available for ${submission.title} - skipping`);
          skippedCount++;
          continue;
        }

        // Save to database
        const solution = new Solution({
          submissionId: submission.id,
          username,
          problemName: submission.title,
          problemSlug: submission.titleSlug,
          problemUrl: `https://leetcode.com/problems/${submission.titleSlug}/`,
          difficulty,
          language: submission.lang,
          code,
          screenshot,
          runtime: submission.runtime || 'N/A',
          memory: submission.memory || 'N/A',
          status: 'Accepted',
          timestamp: parseInt(submission.timestamp),
          submittedAt: new Date(parseInt(submission.timestamp) * 1000),
          tags: [],
        });

        await solution.save();
        savedCount++;
        console.log(`✅ Saved: ${submission.title} (${difficulty})`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`❌ Error processing submission ${submission.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n✨ Sync complete!`);
    console.log(`   💾 Saved: ${savedCount} solutions`);
    console.log(`   ⏭️  Skipped: ${skippedCount} solutions`);

    return {
      success: true,
      savedCount,
      skippedCount,
      totalProcessed: submissions.length,
    };
  } catch (error: any) {
    console.error(`❌ Sync failed for ${username}:`, error.message);
    throw error;
  }
};
