import dotenv from 'dotenv';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

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
  timeout: 15000,
  headers: leetcodeHeaders
});

// General purpose axios instance
const axiosInstance: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// Add interceptors for better error handling
const addErrorInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      console.error('🔴 API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
};

addErrorInterceptor(axiosInstance);
addErrorInterceptor(leetcodeAxios);

// Helper to send GraphQL queries
interface GraphQLRequestOptions {
  referer?: string;
}

export const sendGraphQLQuery = async (
  query: string,
  variables?: Record<string, any>,
  options: GraphQLRequestOptions = {}
) => {
  try {
    console.log('📡 Sending GraphQL query:', { query, variables });
    
    const requestConfig: AxiosRequestConfig = {};
    if (options.referer) {
      requestConfig.headers = {
        ...(requestConfig.headers || {}),
        Referer: options.referer
      } as Record<string, string>;
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
    console.error('🔴 LeetCode API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
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