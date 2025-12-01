import dotenv from 'dotenv';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import https from 'https';

dotenv.config();

// LeetCode GraphQL API configuration
const LEETCODE_API = 'https://leetcode.com/graphql';

const leetcodeSession = process.env.LEETCODE_SESSION;
const leetcodeCsrfToken = process.env.LEETCODE_CSRF_TOKEN || process.env.LEETCODE_CSRFTOKEN;

const leetcodeCookieParts: string[] = [];
if (leetcodeSession) {
  leetcodeCookieParts.push(`LEETCODE_SESSION=${leetcodeSession}`);
}
if (leetcodeCsrfToken) {
  leetcodeCookieParts.push(`csrftoken=${leetcodeCsrfToken}`);
}

const leetcodeHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://leetcode.com/',
  Origin: 'https://leetcode.com',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'x-requested-with': 'XMLHttpRequest'
};

if (leetcodeCookieParts.length > 0) {
  leetcodeHeaders.Cookie = leetcodeCookieParts.join('; ');
}
if (leetcodeCsrfToken) {
  leetcodeHeaders['x-csrftoken'] = leetcodeCsrfToken;
}

if (!leetcodeSession) {
  console.warn('⚠️ LEETCODE_SESSION is not set. Authenticated LeetCode requests may fail.');
}

const leetcodeAxios: AxiosInstance = axios.create({
  baseURL: LEETCODE_API,
  timeout: 10000, // Reduced to 10 seconds for faster failures
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  headers: leetcodeHeaders,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    keepAliveMsecs: 30000, // Keep connections alive for 30s
    maxSockets: 100, // Increased for better concurrent handling
    maxFreeSockets: 10,
    timeout: 10000,
    scheduling: 'fifo' // First in, first out scheduling
  })
});

// General purpose axios instance
const axiosInstance: AxiosInstance = axios.create({
  timeout: 10000, // Reduced to 10 seconds
  maxRedirects: 3,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 10000,
    scheduling: 'fifo'
  })
});

// Add interceptors for better error handling and retry logic
const addErrorInterceptor = (instance: AxiosInstance) => {
  // Request interceptor for logging
  instance.interceptors.request.use(
    config => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor with retry logic
  instance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      // Retry logic for network errors or 429 rate limiting
      if (config && !config.__retryCount) {
        config.__retryCount = 0;
      }
      
      if (
        config && 
        config.__retryCount < 2 && 
        (error.code === 'ECONNRESET' || 
         error.code === 'ETIMEDOUT' ||
         error.response?.status === 429)
      ) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 1000; // Exponential backoff
        console.log(`🔄 Retry ${config.__retryCount}/2 after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(config);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.error('🔴 API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          code: error.code
        });
      }
      return Promise.reject(error);
    }
  );
};

addErrorInterceptor(axiosInstance);
addErrorInterceptor(leetcodeAxios);

// Helper to send GraphQL queries
interface GraphQLRequestOptions {
  referer?: string;
  sessionCookie?: string;
  csrfToken?: string;
  headers?: Record<string, string>;
}

export const sendGraphQLQuery = async (
  query: string,
  variables?: Record<string, any>,
  options: GraphQLRequestOptions = {}
) => {
  try {
    console.log('📡 Sending GraphQL query:', { query, variables });
    
    const requestHeaders: Record<string, string> = {};
    if (options.referer) {
      requestHeaders.Referer = options.referer;
    }

    if (options.sessionCookie || options.csrfToken) {
      const cookieParts: string[] = [];
      if (options.sessionCookie) {
        cookieParts.push(`LEETCODE_SESSION=${options.sessionCookie}`);
      }
      if (options.csrfToken) {
        cookieParts.push(`csrftoken=${options.csrfToken}`);
        requestHeaders['x-csrftoken'] = options.csrfToken;
      }
      if (cookieParts.length > 0) {
        requestHeaders.Cookie = cookieParts.join('; ');
      }
    }

    if (options.headers) {
      Object.assign(requestHeaders, options.headers);
    }

    const requestConfig: AxiosRequestConfig = {};
    if (Object.keys(requestHeaders).length > 0) {
      requestConfig.headers = requestHeaders;
    }
    
    const response = await leetcodeAxios.post(
      '',
      {
        query,
        variables
      },
      requestConfig
    );
    
    console.log('📥 Raw response:', JSON.stringify(response.data));
    
    if (response.data.errors) {
      console.error('🔴 GraphQL Errors:', response.data.errors);
      throw new Error(response.data.errors[0]?.message || 'Unknown GraphQL error');
    }
    
    return response.data;
  } catch (error: any) {
    const safeHeaders = { ...(error.config?.headers || {}) } as Record<string, unknown>;
    if (safeHeaders.Cookie) safeHeaders.Cookie = '[REDACTED]';
    if (safeHeaders.cookie) safeHeaders.cookie = '[REDACTED]';
    if (safeHeaders['x-csrftoken']) safeHeaders['x-csrftoken'] = '[REDACTED]';

    console.error('🔴 LeetCode API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: safeHeaders,
      }
    });
    throw error;
  }
};

// Helper to test LeetCode API connection
export const testLeetCodeAPI = async () => {
  const testQuery = `
    query testConnection($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
        }
      }
    }
  `;
  
  return sendGraphQLQuery(testQuery, { username: "test" });
};

export default axiosInstance;